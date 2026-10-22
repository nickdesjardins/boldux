import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, localizedUrl } from "@/lib/seo";
import { site } from "@/config/site";
import { AERIAL, ARTWORKS, COLLECTIONS, COLLECTION_COVER, EYE_COLLECTION, PRINTS, type Artwork } from "@/data/collections";
import { Img } from "@/components/ui/Img";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { CtaBand } from "@/components/home/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ locale: string }> };

const PORTRAIT = "/img/art/artist.webp";
const PORTRAIT_ARTWORK = "/img/collections/warrior/art-warrior-red.webp";
const LEGACY_LOGO = "/img/brand/logo-legacy-red.png";
const OG_IMAGE = "/img/collections/skulls/hoodie-black-red-duo.webp";

/* Light "paper" tile for the dark-ink originals; the legacy logo lives on a dark tile. */
const PAPER = "bg-[#ecebe7]";

/**
 * Prints are transparent scans: black / red / blue / green ink reads on the paper tile,
 * but the white-ink editions (…-white.webp, …-white-yellow.webp) vanish on it,
 * so they are shown on a dark tile instead.
 */
const isWhiteInk = (src: string) => /-white(-[a-z]+)?\.[a-z0-9]+$/i.test(src);
const PRINTS_ON_PAPER = PRINTS.filter((p) => !isWhiteInk(p));
const PRINTS_ON_BLACK = PRINTS.filter(isWhiteInk);

/** "/img/collections/aerial/desert.webp" -> "desert" */
const stem = (src: string) => src.slice(src.lastIndexOf("/") + 1).replace(/\.[a-z0-9]+$/i, "");

type CollectionKey = Artwork | "aerial" | "eye";
type Row = { key: CollectionKey; garments: string[]; art: string[]; inspiration: string[] };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ locale: locale as Locale, href: "/art", title: t("art.title"), description: t("art.description"), image: absoluteUrl(OG_IMAGE) });
}

function garmentImages(artwork: Artwork) {
  const c = COLLECTIONS[artwork];
  const list: string[] = [];
  for (const cw of Object.values(c.tee)) if (cw.duo) list.push(cw.duo);
  for (const cw of Object.values(c.hoodie)) if (cw.duo) list.push(cw.duo);
  return list;
}

export default async function ArtPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("art");
  const nav = await getTranslations("nav");
  const l = locale as Locale;
  const pageUrl = localizedUrl(l, "/art");
  const [qOpen, qClose] = locale === "fr" ? ["« ", " »"] : ["“", "”"];

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/art#person"),
    name: site.founder,
    alternateName: "Boldux",
    jobTitle: t.has("jobTitle") ? t("jobTitle") : locale === "fr" ? "Artiste et designer" : "Artist and designer",
    description: t("intro"),
    image: absoluteUrl(PORTRAIT),
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    worksFor: { "@id": absoluteUrl("/#organization") },
    brand: { "@id": absoluteUrl("/#organization") },
    address: { "@type": "PostalAddress", addressRegion: "QC", addressCountry: "CA" },
    knowsLanguage: ["fr", "en"],
    sameAs: Object.values(site.social),
  };

  const collections: Row[] = [
    ...ARTWORKS.map((a) => ({ key: a, garments: garmentImages(a), art: COLLECTIONS[a].art, inspiration: [] })),
    { key: "aerial", garments: AERIAL.garments, art: [], inspiration: AERIAL.inspiration },
    { key: "eye", garments: EYE_COLLECTION, art: [LEGACY_LOGO], inspiration: [] },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: nav("home"), url: localizedUrl(l, "/") }, { name: nav("art"), url: pageUrl }]), person]} />
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} crumbs={[{ label: nav("home"), href: "/" }, { label: nav("art") }]} />

      {/* Artist story */}
      <section className="container-x grid items-start gap-14 py-20 lg:grid-cols-12 lg:gap-12 lg:py-28">
        <div className="min-w-0 lg:col-span-5">
          <Reveal>
            {/*
              The overlapping artwork sits inside this wrapper's bottom/right padding, so it
              never leaves the column (and never causes horizontal overflow on phones).
            */}
            <div className="relative mx-auto max-w-md pb-8 pr-4 sm:pb-10 sm:pr-8 lg:max-w-none">
              <div className="card overflow-hidden rounded-[2rem]">
                <Img src={PORTRAIT} alt={t("storyTitle")} sizes="(min-width: 1024px) 40vw, (min-width: 640px) 28rem, 100vw" className="h-auto w-full object-cover" />
              </div>
              <Parallax speed={-20} className="absolute bottom-0 right-0 w-32 sm:w-44 lg:w-52">
                <div className={`card rounded-2xl ${PAPER} p-3`}>
                  <Img src={PORTRAIT_ARTWORK} alt={`${t("collections.warrior.name")} – ${t("artworkLabel")}`} sizes="208px" className="h-auto w-full" />
                </div>
              </Parallax>
            </div>
          </Reveal>
        </div>
        <div className="min-w-0 lg:col-span-7 lg:pl-8">
          <Reveal>
            <h2 className="display-md text-chrome">{t("storyTitle")}</h2>
          </Reveal>
          <div className="mt-6 max-w-2xl space-y-5 text-base leading-relaxed text-muted lg:text-lg">
            {[0, 1, 2].map((i) => (
              <Reveal key={i} delay={0.05 * i}>
                <p>{t(`story.${i}`)}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <blockquote className="relative mt-10 max-w-2xl rounded-2xl border border-red/30 bg-red/5 p-7 pt-8">
              <Quote aria-hidden className="absolute -top-4 left-6 h-8 w-8 text-red-bright" />
              <p className="font-display text-lg font-semibold leading-snug text-white">
                {qOpen}
                {t("quote")}
                {qClose}
              </p>
              <footer className="mt-3 font-display text-[0.62rem] uppercase tracking-[0.3em] text-muted">— {t("quoteBy")}</footer>
            </blockquote>
          </Reveal>
          <Reveal delay={0.25} className="mt-8">
            <Button href={site.shopUrl} external variant="ghost" icon="external">{t("shopCta")}</Button>
          </Reveal>
        </div>
      </section>

      {/* Collections */}
      <section className="border-t border-line bg-ink-2 py-24 lg:py-32">
        <div className="container-x">
          <SectionHeading eyebrow={t("collectionsEyebrow")} title={t("collectionsTitle")} align="center" />
          <div className="mt-16 space-y-24 lg:mt-20 lg:space-y-32">
            {collections.map((c, idx) => {
              const flip = idx % 2 === 1;
              const name = t(`collections.${c.key}.name`);
              const isEye = c.key === "eye";
              const artLabel = isEye && t.has("logoLabel") ? t("logoLabel") : t("artworkLabel");
              return (
                <article key={c.key} id={c.key} className="grid scroll-mt-28 items-start gap-10 lg:grid-cols-12 lg:gap-12">
                  {/* Cover + story: half the row on lg so the copy never gets cramped, 5/12 from xl up */}
                  <div className={`min-w-0 lg:col-span-6 xl:col-span-5 ${flip ? "lg:order-2" : ""}`}>
                    <Reveal>
                      <div className="card relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,255,255,0.1),transparent_60%)]" />
                        <Img
                          src={COLLECTION_COVER[c.key]}
                          alt={name}
                          sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 50vw, 100vw"
                          className="absolute inset-0 h-full w-full object-contain p-6 sm:p-8 product-shadow"
                        />
                      </div>
                    </Reveal>
                    <div className="mt-7">
                      <Reveal y={10}>
                        <p className="eyebrow eyebrow-line">{t(`collections.${c.key}.tagline`)}</p>
                      </Reveal>
                      <Reveal delay={0.05}>
                        <h3 className="display-md mt-4 uppercase text-chrome">{name}</h3>
                      </Reveal>
                      <Reveal delay={0.1}>
                        <p className="lead mt-4 max-w-xl">{t(`collections.${c.key}.text`)}</p>
                      </Reveal>
                    </div>

                    {c.art.length > 0 && (
                      <div className="mt-8">
                        <p className="label">{artLabel}</p>
                        <RevealGroup as="ul" className="flex flex-wrap gap-3" stagger={0.06}>
                          {c.art.map((a) => (
                            <RevealItem as="li" key={a} className={isEye ? "w-48 sm:w-56" : "w-24 sm:w-28"}>
                              <div className={`card overflow-hidden rounded-xl ${isEye ? "flex aspect-[2/1] items-center bg-ink p-4" : `${PAPER} p-2`}`}>
                                <Img src={a} alt={`${name} – ${artLabel}`} sizes={isEye ? "224px" : "112px"} className="h-auto w-full" />
                              </div>
                            </RevealItem>
                          ))}
                        </RevealGroup>
                      </div>
                    )}

                    {c.inspiration.length > 0 && (
                      <div className="mt-8">
                        <p className="label">{t("inspirationLabel")}</p>
                        {/* 3 x 2 on phones, one 6-tile strip from sm up */}
                        <RevealGroup as="ul" className="grid grid-cols-3 gap-2 sm:grid-cols-6" stagger={0.05}>
                          {c.inspiration.map((a) => {
                            const key = `inspiration.${stem(a)}`;
                            return (
                              <RevealItem as="li" key={a}>
                                <div className="card aspect-[3/4] overflow-hidden rounded-lg">
                                  <Img src={a} alt={t.has(key) ? t(key) : ""} sizes="(min-width: 1280px) 7vw, (min-width: 640px) 12vw, 30vw" className="h-full w-full object-cover" />
                                </div>
                              </RevealItem>
                            );
                          })}
                        </RevealGroup>
                      </div>
                    )}
                  </div>

                  <div className={`min-w-0 lg:col-span-6 xl:col-span-7 ${flip ? "lg:order-1" : ""}`}>
                    <p className="label">{t("garmentsLabel")}</p>
                    <GalleryGrid images={c.garments} alt={name} cols={3} aspect="aspect-square" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prints */}
      <section className="container-x py-24 lg:py-32">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow={t("printsEyebrow")} title={t("printsTitle")} intro={t("printsText")} />
          <div className="shrink-0">
            <Button href={site.shopUrl} external variant="primary" icon="external">{t("shopCta")}</Button>
          </div>
        </div>
        <div className="mt-12">
          {t.has("printsOnPaper") && <p className="label">{t("printsOnPaper")}</p>}
          <GalleryGrid images={PRINTS_ON_PAPER} alt={t("printsTitle")} cols={4} aspect="aspect-[26/40]" light />
        </div>
        {PRINTS_ON_BLACK.length > 0 && (
          <div className="mt-10">
            {t.has("printsWhiteInk") && <p className="label">{t("printsWhiteInk")}</p>}
            <GalleryGrid images={PRINTS_ON_BLACK} alt={t("printsTitle")} cols={4} aspect="aspect-[26/40]" />
          </div>
        )}
      </section>

      <CtaBand title={t("bridgeTitle")} text={t("bridgeText")} primary={t("bridgeCta")} />
    </>
  );
}
