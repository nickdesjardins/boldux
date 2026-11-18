import { NextResponse, type NextRequest } from "next/server";
import { contactSchema, flattenErrors } from "@/lib/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_BODY_BYTES = 32 * 1024;
const SEND_TIMEOUT_MS = 15_000;

/* Every response is uncacheable. */
function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

/* Very small in-memory rate limit: 5 submissions / 10 min / IP (per server instance). Never throws. */
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  try {
    const now = Date.now();
    const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (list.length >= LIMIT) return true;
    list.push(now);
    if (hits.size > 5000 && !hits.has(ip)) hits.clear();
    hits.set(ip, list);
    return false;
  } catch {
    return false;
  }
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip")?.trim() || "unknown";
  // Keep it printable and short: it ends up in the email body.
  return first.replace(/[^0-9a-fA-F.:]/g, "").slice(0, 64) || "unknown";
}

/** Reads at most `max` bytes; returns null when the body is larger. */
async function readBody(req: NextRequest, max: number): Promise<string | null> {
  const reader = req.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const LABELS: Record<"en" | "fr", Record<string, string>> = {
  en: {
    subject: "New project request",
    name: "Name",
    email: "Email",
    company: "Company / brand",
    phone: "Phone",
    projectType: "Project type",
    quantity: "Quantity",
    message: "Project",
    corporate: "Corporate collection / team apparel",
    privateLabel: "Private label / new clothing brand",
    merch: "Merch / event clothing",
    art: "Boldux Art collection or prints",
    other: "Other",
    q1: "1 to 10 pieces",
    q2: "10 to 50 pieces",
    q3: "50 to 200 pieces",
    q4: "200+ pieces",
    q5: "Not sure yet",
    sentFrom: "Sent from the bolduxart.com contact form",
  },
  fr: {
    subject: "Nouvelle demande de projet",
    name: "Nom",
    email: "Courriel",
    company: "Entreprise / marque",
    phone: "Téléphone",
    projectType: "Type de projet",
    quantity: "Quantité",
    message: "Projet",
    corporate: "Collection corporative / vêtements d'équipe",
    privateLabel: "Marque privée / nouvelle marque de vêtements",
    merch: "Merch / vêtements d'événement",
    art: "Collection ou impressions Boldux Art",
    other: "Autre",
    q1: "1 à 10 pièces",
    q2: "10 à 50 pièces",
    q3: "50 à 200 pièces",
    q4: "200 pièces et plus",
    q5: "Pas encore décidé",
    sentFrom: "Envoyé depuis le formulaire de contact de bolduxart.com",
  },
};

/* HTML-escape anything interpolated in the HTML body. */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/* Header-safe: no CR/LF/NUL/tab (header injection) and no angle brackets (mailbox spoofing). */
const headerSafe = (s: string) => s.replace(/[\r\n\0\t<>]/g, " ").replace(/\s+/g, " ").trim();
/* Address part: a validated email never contains these, strip anyway. */
const addressSafe = (s: string) => s.replace(/[\s<>"',;\\()]/g, "");

type ResendResponse = {
  id?: string;
  name?: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) return json({ ok: false, error: "unsupported_media_type" }, 415);

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413);

  let body: unknown;
  try {
    const raw = await readBody(req, MAX_BODY_BYTES);
    if (raw === null) return json({ ok: false, error: "payload_too_large" }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ ok: false, error: "invalid_json" }, 400);

  // Honeypot filled in: pretend success and drop silently, before validation so the bot
  // learns nothing from field errors.
  const trap = (body as Record<string, unknown>).website;
  if (typeof trap === "string" ? trap.trim() !== "" : trap != null) return json({ ok: true });

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, error: "validation", fields: flattenErrors(parsed.error) }, 422);
  const data = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_SENDER;
  const to = process.env.CONTACT_TO ?? "boldux.ca@gmail.com";
  if (!apiKey || !sender) {
    console.error("[contact] RESEND_API_KEY or RESEND_SENDER is not configured");
    return json({ ok: false, error: "not_configured" }, 500);
  }

  const L = LABELS[data.locale];
  const projectType = L[data.projectType] ?? data.projectType;
  const quantity = L[`q${data.quantity}`] ?? data.quantity;
  const name = headerSafe(data.name);
  const company = data.company ? headerSafe(data.company) : "";
  const email = addressSafe(data.email);
  const subject = headerSafe(`${L.subject} — ${name}${company ? ` (${company})` : ""}`).slice(0, 200);

  const rows: [string, string][] = [
    [L.name, data.name],
    [L.email, data.email],
    [L.company, data.company || "—"],
    [L.phone, data.phone || "—"],
    [L.projectType, projectType],
    [L.quantity, quantity],
  ];
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", `${L.message}:`, data.message, "", `— ${L.sentFrom} (${data.locale}, ip ${ip})`].join("\n");
  const html = `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#0b0b0f;color:#f4f4f6;padding:32px">
  <div style="max-width:640px;margin:0 auto;background:#15151c;border:1px solid #2a2a33;border-radius:16px;padding:32px">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#ff2f3f">Boldux Art</p>
    <h1 style="margin:0 0 24px;font-size:22px;color:#fff">${esc(L.subject)}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="padding:8px 0;color:#9a9aa3;width:40%;vertical-align:top">${esc(k)}</td><td style="padding:8px 0;color:#f4f4f6">${esc(v)}</td></tr>`).join("")}
    </table>
    <h2 style="margin:24px 0 8px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#9a9aa3">${esc(L.message)}</h2>
    <p style="white-space:pre-wrap;line-height:1.6;margin:0;color:#f4f4f6">${esc(data.message)}</p>
    <p style="margin:32px 0 0;font-size:11px;color:#6d6d78">${esc(L.sentFrom)} · ${esc(data.locale)} · ${esc(ip)}</p>
  </div></body></html>`;

  const payload = {
    from: sender,
    to: [to],
    subject,
    text,
    html,
    reply_to: email,
  };

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    const result = (await res.json().catch(() => ({}))) as ResendResponse | null;
    // Resend returns an email ID when the message is accepted for delivery.
    if (!res.ok || typeof result?.id !== "string" || !result.id.trim()) {
      console.error("[contact] Resend error", res.status, JSON.stringify(result).slice(0, 2000));
      return json({ ok: false, error: "send_failed" }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error("[contact] Resend request failed", err instanceof Error ? err.message : err);
    return json({ ok: false, error: "send_failed" }, 502);
  }
}
