import type { Metadata } from "next";
import { Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from "@/lib/seo";
import { site } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { Img } from "@/components/ui/Img";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ locale: locale as Locale, href: "/contact", title: t("contact.title"), description: t("contact.description") });
}

const ICON_WRAP = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red/40 bg-red/10 text-red-bright";

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const nav = await getTranslations("nav");
  const l = locale as Locale;

  const contactPage = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("title"),
    url: localizedUrl(l, "/contact"),
    mainEntity: { "@id": localizedUrl(l, "/") + "#organization" },
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: nav("home"), url: localizedUrl(l, "/") }, { name: nav("contact"), url: localizedUrl(l, "/contact") }]), contactPage]} />
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} crumbs={[{ label: nav("home"), href: "/" }, { label: nav("contact") }]} />

      <section className="container-x grid gap-8 py-14 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="min-w-0 lg:col-span-7">
          <Reveal>
            <ContactForm />
          </Reveal>
        </div>

        <aside className="min-w-0 space-y-5 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-5 lg:self-start">
          <Reveal delay={0.1}>
            <div className="card p-6 sm:p-7">
              <dl className="space-y-6">
                <div className="flex gap-4">
                  <span className={ICON_WRAP} aria-hidden>
                    <Mail className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    <dt className="label mb-1">{t("aside.emailTitle")}</dt>
                    <dd>
                      <a href={`mailto:${site.email}`} className="break-all text-lg font-semibold text-white transition hover:text-red-bright">
                        {site.email}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className={ICON_WRAP} aria-hidden>
                    <MapPin className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    <dt className="label mb-1">{t("aside.locationTitle")}</dt>
                    <dd className="text-lg font-semibold text-white">{t("aside.location")}</dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className={ICON_WRAP} aria-hidden>
                    <Clock className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    <dt className="label mb-1">{t("aside.hoursTitle")}</dt>
                    <dd className="text-lg font-semibold text-white">{t("aside.hours")}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <a href={site.shopUrl} target="_blank" rel="noopener noreferrer" className="card card-hover group relative block overflow-hidden p-6 sm:p-7">
              {/* Soft red glow as a gradient (no blur filter: it repaints on every hover frame) */}
              <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-radial from-red/25 via-red/8 via-45% to-transparent to-70%" />
              <div className="relative flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <h2 className="display-sm text-white">{t("aside.shopTitle")}</h2>
                  <p className="mt-2 text-sm text-muted">{t("aside.shopText")}</p>
                  <p className="mt-4 inline-flex items-center gap-2 font-display text-[0.68rem] font-bold uppercase tracking-[0.22em] text-red-bright">
                    {t("aside.shopCta")}
                    <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </p>
                </div>
                <Img
                  src="/img/collections/skulls/tee-black-red-front.webp"
                  alt=""
                  sizes="(min-width: 640px) 112px, 88px"
                  className="h-auto w-22 shrink-0 self-center product-shadow transition-transform duration-700 ease-out group-hover:scale-105 sm:w-28"
                />
              </div>
            </a>
          </Reveal>
        </aside>
      </section>
    </>
  );
}
