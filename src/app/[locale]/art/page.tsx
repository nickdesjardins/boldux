import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, localizedUrl } from "@/lib/seo";
import { Img, imgSize } from "@/components/ui/Img";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ locale: string }> };

const EXAMPLES = [
  { key: "drawing", src: "/img/collections/skulls/art-skull-1-red.webp", light: true },
  { key: "tshirt", src: "/img/collections/skulls/tee-black-red-front.webp", light: false },
  { key: "hoodie", src: "/img/collections/skulls/hoodie-black-red-front.webp", light: false },
] as const;
const OG_IMAGE = "/img/collections/skulls/hoodie-black-red-duo.webp";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ locale: locale as Locale, href: "/art", title: t("art.title"), description: t("art.description"), image: absoluteUrl(OG_IMAGE), imageSize: imgSize(OG_IMAGE) });
}

export default async function ArtPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("art");
  const nav = await getTranslations("nav");
  const l = locale as Locale;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: nav("home"), url: localizedUrl(l, "/") }, { name: nav("art"), url: localizedUrl(l, "/art") }])} />
      <PageHeader eyebrow={t("eyebrow")} title={nav("art")} intro={t("intro")} crumbs={[{ label: nav("home"), href: "/" }, { label: nav("art") }]}>
        <Reveal delay={0.18}>
          <p className="lead mt-5 max-w-2xl">{t("vision")}</p>
        </Reveal>
      </PageHeader>

      <section className="container-x py-16 lg:py-24" aria-label={t("examplesLabel")}>
        <RevealGroup as="ul" className="grid gap-8 sm:grid-cols-3" stagger={0.08}>
          {EXAMPLES.map(({ key, src, light }) => (
            <RevealItem as="li" key={key}>
              <figure>
                <div className={`card relative aspect-[4/5] overflow-hidden rounded-2xl ${light ? "bg-[#ecebe7]" : ""}`}>
                  <Img src={src} alt={t(`examples.${key}.alt`)} sizes="(min-width: 640px) 33vw, 100vw" className="absolute inset-0 h-full w-full object-contain p-6 lg:p-8" />
                </div>
                <figcaption className="mt-4 font-display text-sm font-semibold text-muted">{t(`examples.${key}.caption`)}</figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
