import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { routing } from "@/i18n/routing";

export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ file: `${locale}.png` }));
}

const COPY = {
  en: { tagline: "THE ART OF STANDING OUT.", a: "CUSTOM", b: "APPAREL", sub: "DESIGN · CONCEPTION · PRODUCTION", lead: "Unique creations for businesses, teams & private labels" },
  fr: { tagline: "L'ART DE SE DÉMARQUER.", a: "VÊTEMENTS", b: "PERSONNALISÉS", sub: "DESIGNS · CONCEPTION · FABRICATION", lead: "Des créations uniques pour entreprises et marques privées" },
} as const;

/** Montserrat Black as TTF (Satori needs TTF/OTF/WOFF, not WOFF2). A plain UA makes Google serve TTF. */
async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Montserrat:wght@900", {
      headers: { "User-Agent": "curl/8.0" },
    }).then((r) => r.text());
    const url = css.match(/url\((https:[^)]+\.(?:ttf|otf|woff))\)/)?.[1] ?? css.match(/url\((https:[^)]+)\)/)?.[1];
    if (!url || url.endsWith(".woff2")) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

/** Satori cannot decode WebP: convert the studio photo to JPEG with sharp. */
async function loadStudio(): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    const buf = await sharp(path.join(process.cwd(), "public", "img", "hero", "studio.webp")).resize(720, 630, { fit: "cover", position: "right" }).jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

const abs = (left: number, top: number, w: number, h: number) => ({ position: "absolute" as const, left, top, width: w, height: h });

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const locale = file.replace(/\.png$/, "") as keyof typeof COPY;
  const c = COPY[locale] ?? COPY.en;
  const fr = locale === "fr";

  const [logo, studio, font] = await Promise.all([
    readFile(path.join(process.cwd(), "public", "img", "brand", "logo.png")).then((b) => `data:image/png;base64,${b.toString("base64")}`),
    loadStudio(),
    loadFont(),
  ]);

  const family = font ? "Montserrat" : "sans-serif";

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", background: "#07070a", position: "relative", overflow: "hidden", fontFamily: family, color: "#fff" }}>
        {studio && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={studio} alt="" width={720} height={630} style={{ ...abs(480, 0, 720, 630), objectFit: "cover" }} />
        )}
        {/* left-to-right darkening so the type always sits on near-black */}
        <div style={{ ...abs(0, 0, 1200, 630), display: "flex", background: "linear-gradient(90deg, #07070a 0%, #07070a 40%, rgba(7,7,10,0.9) 52%, rgba(7,7,10,0.35) 72%, rgba(7,7,10,0.05) 100%)" }} />
        <div style={{ ...abs(0, 380, 1200, 250), display: "flex", background: "linear-gradient(180deg, rgba(7,7,10,0) 0%, rgba(7,7,10,0.75) 100%)" }} />
        <div style={{ ...abs(-140, -160, 560, 560), display: "flex", borderRadius: 999, background: "rgba(227,16,31,0.22)", filter: "blur(90px)" }} />

        <div style={{ ...abs(72, 56, 640, 540), display: "flex", flexDirection: "column" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" width={200} height={126} style={{ width: 200, height: 126, objectFit: "contain" }} />
          <div style={{ marginTop: 30, fontSize: 17, letterSpacing: 8, color: "#cfd2d7", whiteSpace: "nowrap" }}>{c.tagline}</div>
          <div style={{ marginTop: 10, width: 140, height: 3, background: "#e3101f", display: "flex" }} />
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", fontSize: fr ? 76 : 92, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3 }}>
            <div style={{ whiteSpace: "nowrap" }}>{c.a}</div>
            <div style={{ whiteSpace: "nowrap", color: "#ff2f3f" }}>{c.b}</div>
          </div>
          <div style={{ marginTop: 22, fontSize: 16, letterSpacing: 5, color: "#f4f4f6", whiteSpace: "nowrap" }}>{c.sub}</div>
          <div style={{ marginTop: 14, fontSize: 19, lineHeight: 1.35, color: "#b8b8c2", width: 560 }}>{c.lead}</div>
        </div>

        <div style={{ ...abs(960, 574, 200, 30), display: "flex", justifyContent: "flex-end", fontSize: 15, letterSpacing: 5, color: "#cfd2d7", whiteSpace: "nowrap" }}>BOLDUX.CA</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: font ? [{ name: "Montserrat", data: font, weight: 900, style: "normal" }] : undefined,
    },
  );
}
