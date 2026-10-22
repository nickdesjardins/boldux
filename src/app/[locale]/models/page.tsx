import type { Metadata } from "next";
import { ArrowRight, Images } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from "@/lib/seo";
import { MODEL_SLUGS, MODEL_COVER, MODEL_ALT, MODEL_ICON, MODEL_FEATURED, modelGallery, type ModelSlug } from "@/data/models";
import { Img } from "@/components/ui/Img";
import { PageHeader } from "@/components/ui/PageHeader";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/home/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ locale: string }> };

/**
 * Bento balance. Featured tiles are 2 × 2 at lg and full-width at sm. With 12 models that alone
 * leaves 3 holes at lg (3 × 4 + 9 = 21 cells) and 1 at sm (3 × 2 + 9 = 15). Three landscape covers
 * therefore get a wide 2 × 1 tile: lg 3 × 4 + 3 × 2 + 6 = 24 cells (6 full rows), sm 3 × 2 + 1 × 2 + 8 = 16
 * (8 full rows). `grid-flow-dense` on the grid guards the remaining edge cases.
 */
const WIDE_TILE: Partial<Record<ModelSlug, string>> = {
  "long-sleeves": "lg:col-span-2",
  caps: "lg:col-span-2",
  sweatshirts: "sm:col-span-2",
};

const IMG_TRANSITION = "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ locale: locale as Locale, href: "/models", title: t("models.title"), description: t("models.description") });
}

export default async function ModelsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("models");
  const nav = await getTranslations("nav");
  const l = locale as Locale;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("title"),
    itemListElement: MODEL_SLUGS.map((slug, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t(`items.${slug}.name`),
      url: localizedUrl(l, { pathname: "/models/[slug]", params: { slug } }),
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: nav("home"), url: localizedUrl(l, "/") }, { name: nav("models"), url: localizedUrl(l, "/models") }]), itemList]} />
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} crumbs={[{ label: nav("home"), href: "/" }, { label: nav("models") }]}>
        <p className="mt-6 font-display text-[0.62rem] uppercase tracking-[0.3em] text-dim">{t("count", { count: MODEL_SLUGS.length })}</p>
      </PageHeader>

      <section className="container-x py-16 lg:py-24">
        <RevealGroup as="ul" className="grid auto-rows-[18rem] grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {MODEL_SLUGS.map((slug, i) => {
            const Icon = MODEL_ICON[slug];
            const featured = MODEL_FEATURED.includes(slug);
            const wide = WIDE_TILE[slug];
            const count = modelGallery(slug).length;
            const name = t(`items.${slug}.name`);
            const sizes = featured || wide === "sm:col-span-2" ? "(min-width: 1024px) 50vw, 100vw" : wide ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";
            const alt = MODEL_ALT[slug];
            return (
              <RevealItem as="li" key={slug} className={`group relative ${featured ? "sm:col-span-2 lg:row-span-2" : (wide ?? "")}`}>
                <Link href={{ pathname: "/models/[slug]", params: { slug } }} className="card card-hover relative block h-full overflow-hidden focus-visible:border-red-bright">
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.09),transparent_60%)]" />
                  <Img
                    src={MODEL_COVER[slug]}
                    alt={name}
                    sizes={sizes}
                    priority={i < 2}
                    className={`absolute inset-0 h-full w-full object-contain p-7 ${IMG_TRANSITION} group-hover:scale-105 ${alt ? "group-hover:opacity-0 group-focus-within:opacity-0" : ""}`}
                  />
                  {alt && (
                    // Decorative hover swap: same box as the cover, cross-faded so there is no gap between the two.
                    <Img
                      src={alt}
                      alt=""
                      aria-hidden
                      sizes={sizes}
                      className={`absolute inset-0 h-full w-full object-contain p-7 opacity-0 ${IMG_TRANSITION} group-hover:scale-105 group-hover:opacity-100 group-focus-within:opacity-100`}
                    />
                  )}
                  <div className="absolute left-5 top-5 flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line-2 bg-ink/60 text-red-bright">
                      <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden />
                    </span>
                    <span className="font-display text-[0.6rem] tracking-[0.3em] text-dim">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-ink/60 px-2.5 py-1 font-display text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted">
                    <Images className="h-3 w-3" aria-hidden /> {count}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink via-ink/75 to-transparent p-6 pt-16">
                    <div>
                      <h2 className={`${featured ? "display-md" : "display-sm"} text-white`}>{name}</h2>
                      <p className="mt-1 text-xs text-muted sm:text-sm">{t(`items.${slug}.blurb`)}</p>
                    </div>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-2 text-fg transition duration-500 group-hover:border-red group-hover:bg-red group-focus-within:border-red group-focus-within:bg-red">
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>
      <CtaBand />
    </>
  );
}
