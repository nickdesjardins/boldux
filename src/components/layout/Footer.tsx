import Image from "next/image";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";

function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Facebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 22v-8.2h2.8l.4-3.3h-3.2V8.4c0-.95.27-1.6 1.63-1.6h1.72V3.86c-.3-.04-1.32-.13-2.5-.13-2.48 0-4.17 1.51-4.17 4.29v2.46H7.4v3.3h2.8V22h3.3z" />
    </svg>
  );
}
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site } from "@/config/site";
import { MODEL_SLUGS } from "@/data/models";
import { LocaleSwitcher } from "./LocaleSwitcher";

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const models = await getTranslations("models.items");
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line bg-ink-2">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red/60 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-red/10 blur-[120px]" />
      <div className="container-x relative grid gap-14 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" className="inline-block" aria-label={site.name}>
            <Image src="/img/brand/logo.png" alt={site.name} width={200} height={126} className="h-auto w-44" />
          </Link>
          <p className="mt-6 font-display text-sm font-bold uppercase tracking-[0.3em] text-chrome">{t("tagline")}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">{t("about")}</p>
          <div className="mt-8 flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-dim">{t("social")}</span>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-line-2 p-2.5 text-muted transition hover:border-red hover:text-white">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full border border-line-2 p-2.5 text-muted transition hover:border-red hover:text-white">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="label text-fg">{t("navigation")}</p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li><Link className="transition hover:text-white" href="/">{nav("home")}</Link></li>
            <li><Link className="transition hover:text-white" href="/models">{nav("models")}</Link></li>
            <li><Link className="transition hover:text-white" href="/art">{nav("art")}</Link></li>
            <li><Link className="transition hover:text-white" href="/contact">{nav("contact")}</Link></li>
            <li>
              <a className="inline-flex items-center gap-1 transition hover:text-white" href={site.shopUrl} target="_blank" rel="noopener noreferrer">
                {nav("shop")} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="label text-fg">{t("modelsTitle")}</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-muted">
            {MODEL_SLUGS.map((slug) => (
              <li key={slug}>
                <Link className="transition hover:text-white" href={{ pathname: "/models/[slug]", params: { slug } }}>
                  {models(`${slug}.name`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="label text-fg">{t("contactTitle")}</p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-red-bright" />
              <a className="break-all transition hover:text-white" href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-bright" />
              <span>{t("madeIn")}</span>
            </li>
          </ul>
          <div className="mt-6">
            <LocaleSwitcher variant="footer" />
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. {t("rights")}
          </p>
          <p className="font-display uppercase tracking-[0.25em]">{locale === "fr" ? "Imaginer · Créer · Se démarquer" : "Imagine · Create · Stand out"}</p>
        </div>
      </div>
    </footer>
  );
}
