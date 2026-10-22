"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertTriangle, Send, Loader2 } from "lucide-react";
import {
  contactSchema,
  firstErrorField,
  flattenErrors,
  MESSAGE_MAX,
  normalizeErrors,
  PROJECT_TYPES,
  QUANTITIES,
  type ContactErrorCode,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const locale = useLocale() as "en" | "fr";
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const sendingRef = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [message, setMessage] = useState("");

  const id = (f: string) => `${uid}-${f}`;
  const errId = (f: ContactField) => `${uid}-err-${f}`;
  const statusId = `${uid}-status`;
  const errorText = (code: ContactErrorCode) => t(code, { max: MESSAGE_MAX });

  const focusField = (form: HTMLFormElement | null, f: ContactField) => {
    const el = form?.elements.namedItem(f);
    if (el instanceof HTMLElement) el.focus();
  };

  /** Shows the errors and moves focus to the first invalid field (visual order). */
  function showErrors(form: HTMLFormElement, next: ContactErrors) {
    setErrors(next);
    const first = firstErrorField(next);
    if (first) focusField(form, first);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sendingRef.current) return; // double submit (Enter key, double click)
    const form = e.currentTarget;
    const fd = new FormData(form);
    const str = (k: string) => {
      const v = fd.get(k);
      return typeof v === "string" ? v : "";
    };
    const raw = {
      name: str("name"),
      email: str("email"),
      company: str("company"),
      phone: str("phone"),
      projectType: str("projectType"),
      quantity: str("quantity"),
      message: str("message"),
      consent: fd.get("consent") === "on",
      website: str("website"),
      locale,
    };
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      setStatus("idle");
      showErrors(form, flattenErrors(parsed.error));
      return;
    }

    setErrors({});
    setStatus("sending");
    sendingRef.current = true;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(20_000) : undefined,
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: unknown };
      if (res.ok && json.ok) {
        form.reset();
        setMessage("");
        setStatus("success");
      } else {
        // 422 carries field codes; rate_limited / not_configured / send_failed show the generic text.
        const fields = res.status === 422 ? normalizeErrors(json.fields) : {};
        setStatus("error");
        if (firstErrorField(fields)) showErrors(form, fields);
      }
    } catch {
      setStatus("error");
    } finally {
      sendingRef.current = false;
    }
  }

  function sendAnother() {
    setErrors({});
    setStatus("idle");
    requestAnimationFrame(() => focusField(formRef.current, "name"));
  }

  const invalid = (f: ContactField) => (errors[f] ? true : undefined);
  const describedBy = (f: ContactField) => (errors[f] ? errId(f) : undefined);
  const err = (f: ContactField) => {
    const code = errors[f];
    return code ? (
      <p id={errId(f)} className="mt-1.5 text-xs text-red-bright">
        {errorText(code)}
      </p>
    ) : null;
  };

  const sending = status === "sending";
  const success = status === "success";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="card relative p-6 sm:p-9" aria-describedby={statusId}>
      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[inherit] bg-ink/95 p-8 text-center"
            role="status"
          >
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}>
              <CheckCircle2 className="h-16 w-16 text-red-bright" strokeWidth={1.4} />
            </motion.div>
            <p className="display-sm mt-6 max-w-sm text-white">{t("success")}</p>
            <button type="button" onClick={sendAnother} autoFocus className="btn btn-ghost mt-8">
              {/* "sendAnother" is a new key; fall back to the submit label rather than ever showing a key path */}
              {t.has("sendAnother") ? t("sendAnother") : t("submit")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <fieldset disabled={sending} inert={success} className="m-0 min-w-0 border-0 p-0">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={id("name")} className="label">{t("name")} *</label>
            <input id={id("name")} name="name" autoComplete="name" required className="field" aria-invalid={invalid("name")} aria-describedby={describedBy("name")} />
            {err("name")}
          </div>
          <div>
            <label htmlFor={id("email")} className="label">{t("email")} *</label>
            <input id={id("email")} name="email" type="email" inputMode="email" autoComplete="email" required className="field" aria-invalid={invalid("email")} aria-describedby={describedBy("email")} />
            {err("email")}
          </div>
          <div>
            <label htmlFor={id("company")} className="label">{t("company")}</label>
            <input id={id("company")} name="company" autoComplete="organization" className="field" aria-invalid={invalid("company")} aria-describedby={describedBy("company")} />
            {err("company")}
          </div>
          <div>
            <label htmlFor={id("phone")} className="label">{t("phone")}</label>
            <input id={id("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" aria-invalid={invalid("phone")} aria-describedby={describedBy("phone")} />
            {err("phone")}
          </div>
          <div>
            <label htmlFor={id("projectType")} className="label">{t("projectType")} *</label>
            <select id={id("projectType")} name="projectType" required defaultValue="" className="field" aria-invalid={invalid("projectType")} aria-describedby={describedBy("projectType")}>
              <option value="" disabled>—</option>
              {PROJECT_TYPES.map((p) => (
                <option key={p} value={p}>{t(`projectTypes.${p}`)}</option>
              ))}
            </select>
            {err("projectType")}
          </div>
          <div>
            <label htmlFor={id("quantity")} className="label">{t("quantity")} *</label>
            <select id={id("quantity")} name="quantity" required defaultValue="" className="field" aria-invalid={invalid("quantity")} aria-describedby={describedBy("quantity")}>
              <option value="" disabled>—</option>
              {QUANTITIES.map((q) => (
                <option key={q} value={q}>{t(`quantities.${q}`)}</option>
              ))}
            </select>
            {err("quantity")}
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor={id("message")} className="label">{t("message")} *</label>
              <span className={`font-display text-[0.6rem] tracking-[0.2em] tabular-nums ${message.length > MESSAGE_MAX ? "text-red-bright" : "text-dim"}`}>
                {message.length}/{MESSAGE_MAX}
              </span>
            </div>
            <textarea
              id={id("message")}
              name="message"
              rows={6}
              required
              className="field resize-y"
              placeholder={t("messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-invalid={invalid("message")}
              aria-describedby={describedBy("message")}
            />
            {err("message")}
          </div>
          {/* Honeypot: hidden from humans and assistive tech, bots fill it */}
          <div className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor={id("website")}>Website</label>
            <input id={id("website")} name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={id("consent")} className="flex cursor-pointer items-start gap-3 text-sm text-muted">
              <input id={id("consent")} type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-red" aria-invalid={invalid("consent")} aria-describedby={describedBy("consent")} />
              <span>{t("consent")} *</span>
            </label>
            {err("consent")}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={sending} aria-busy={sending || undefined} className="btn btn-solid disabled:cursor-wait disabled:opacity-70">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            <span>{sending ? t("sending") : t("submit")}</span>
          </button>
          <div id={statusId} aria-live="polite" className="text-sm">
            {status === "error" && (
              <span className="inline-flex items-start gap-2 text-red-bright">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {t("error")}
              </span>
            )}
          </div>
        </div>
      </fieldset>
    </form>
  );
}
