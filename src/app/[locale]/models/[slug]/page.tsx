import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, localizedUrl } from "@/lib/seo";
import { site } from "@/config/site";
import { MODEL_SLUGS, MODEL_COVER, MODEL_ICON, isModelSlug, modelGallery } from "@/data/models";
import { Img, imgSize } from "@/components/ui/Img";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/home/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => MODEL_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  // Unknown slug: the page throws notFound(); give the client-rendered 404 the same title.
  if (!isModelSlug(slug)) return { title: { absolute: t("notFound.title") } };
  const tm = await getTranslations({ locale, namespace: "models.items" });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: "/models/[slug]", params: { slug } },
    title: t("model.title", { name: tm(`${slug}.name`) }),
    description: t("model.description", { description: tm(`${slug}.description`) }),
    image: absoluteUrl(MODEL_COVER[slug]),
    imageSize: imgSize(MODEL_COVER[slug]),
  });
}

export default async function ModelPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isModelSlug(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("models");
  const nav = await getTranslations("nav");
  const l = locale as Locale;
  const name = t(`items.${slug}.name`);
  const gallery = modelGallery(slug);
  const options = t(`items.${slug}.options`).split("·").map((s) => s.trim()).filter(Boolean);
  // The four families that follow this one in catalogue order, so every page suggests a different set.
  const position = MODEL_SLUGS.indexOf(slug);
  const related = Array.from({ length: Math.min(4, MODEL_SLUGS.length - 1) }, (_, k) => MODEL_SLUGS[(position + 1 + k) % MODEL_SLUGS.length]);
  const Icon = MODEL_ICON[slug];
  const url = localizedUrl(l, { pathname: "/models/[slug]", params: { slug } });

  // Catalogue entry, not a listing: no price or offers on purpose (every piece is quoted per project).
  // Catalogue entry, not a listing: every piece is quoted per project, so there is no public price.
  // Google requires offers/review/aggregateRating on Product, so this is modelled as a Service
  // (matching the Organization's makesOffer) with the customization options as an offer catalogue.
  const pageUrl = localizedUrl(l, { pathname: "/models/[slug]", params: { slug } });
  const product = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: `${name} – ${site.name}`,
    serviceType: locale === "fr" ? "Vêtements personnalisés" : "Custom apparel",
    description: t(`items.${slug}.description`),
    url: pageUrl,
    image: gallery.slice(0, 6).map((g) => absoluteUrl(g)),
    provider: { "@id": absoluteUrl("/#organization") },
    brand: { "@type": "Brand", name: site.name },
    areaServed: "CA",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: t("options"),
      itemListElement: options.map((o) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: o } })),
    },
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: nav("home"), url: localizedUrl(l, "/") },
            { name: nav("models"), url: localizedUrl(l, "/models") },
            { name, url },
          ]),
          product,
        ]}
      />
      <PageHeader
        eyebrow={t(`items.${slug}.short`)}
        title={name}
        intro={t(`items.${slug}.description`)}
        crumbs={[{ label: nav("home"), href: "/" }, { label: nav("models"), href: "/models" }, { label: name }]}
      >
        <Reveal delay={0.18} className="mt-9 flex flex-wrap items-center gap-4">
          <Button href="/contact" variant="primary">{t("cta")}</Button>
          <span className="font-display text-[0.62rem] uppercase tracking-[0.3em] text-dim">{t("images", { count: gallery.length })}</span>
        </Reveal>
      </PageHeader>

      <section className="container-x grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
        {/* Phones and tablets see the garments first; the options card docks beside them from lg up. */}
        <aside className="order-2 lg:order-1 lg:col-span-4">
          <div className="card p-7 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red/40 bg-red/10 text-red-bright">
                <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
              </span>
              <h2 className="display-sm text-white">{t("options")}</h2>
            </div>
            <ul className="mt-6 space-y-3">
              {options.map((o) => (
                <li key={o} className="flex items-start gap-3 text-sm text-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-red-bright" aria-hidden />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-line pt-6">
              <Link href="/models" className="inline-flex items-center gap-2 font-display text-[0.66rem] font-bold uppercase tracking-[0.22em] text-muted transition hover:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden /> {t("back")}
              </Link>
            </div>
          </div>
        </aside>
        <div className="order-1 lg:order-2 lg:col-span-8">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="eyebrow eyebrow-line">{t("gallery")}</h2>
            <span className="font-display text-[0.62rem] uppercase tracking-[0.3em] text-dim">{t("images", { count: gallery.length })}</span>
          </div>
          <GalleryGrid images={gallery} alt={name} />
        </div>
      </section>

      <section className="container-x py-10">
        <h2 className="eyebrow eyebrow-line mb-6">{t("related")}</h2>
        <RevealGroup as="ul" className="grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.06}>
          {related.map((s) => (
            <RevealItem as="li" key={s} className="group">
              <Link href={{ pathname: "/models/[slug]", params: { slug: s } }} className="card card-hover relative block aspect-square overflow-hidden focus-visible:border-red-bright">
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
                <Img
                  src={MODEL_COVER[s]}
                  alt={t(`items.${s}.name`)}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-focus-within:scale-105 product-shadow"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent p-4 pt-10">
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">{t(`items.${s}.name`)}</h3>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
      <CtaBand />
    </>
  );
}
