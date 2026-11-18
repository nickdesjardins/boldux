"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PROJECT_IDS, WALL, type ProjectId } from "@/data/portfolio";
import { Img, imgSize } from "@/components/ui/Img";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { fitFontSize, fitLines } from "@/lib/fit";
import { Lightbox, type LightboxImage } from "@/components/gallery/Lightbox";

type Filter = ProjectId | "all";

/** Tile shape from the image's real aspect ratio (manifest), so duos stay wide and caps stay compact. */
function tileClass(src: string, big?: boolean) {
  if (big) return "col-span-2 row-span-2 aspect-square";
  const { w, h } = imgSize(src);
  const r = w / h;
  if (r >= 1.3) return "col-span-2 aspect-[3/2]";
  if (r <= 0.85) return "aspect-[4/5]";
  return "aspect-square";
}

export function WorkShowcase() {
  const t = useTranslations("work");
  const tn = useTranslations("nav");
  const [filter, setFilter] = useState<Filter>("all");
  const [index, setIndex] = useState<number | null>(null);

  const tiles = useMemo(() => (filter === "all" ? WALL : WALL.filter((w) => w.project === filter)), [filter]);

  // Two-line title (chrome lead + red accent). Below lg it wraps, sized to the longest word;
  // from lg each half sits on its own line, sized so the longer half fits (long French runs).
  const titleLead = t("titleLead");
  const titleAccent = t("titleAccent");
  const titleStyle = {
    "--fs-sm": fitFontSize(`${titleLead} ${titleAccent}`, 5.2, 1.9),
    "--fs-lg": fitLines([titleLead, titleAccent], 5.2, 1.9),
  } as CSSProperties;

  const lightboxImages: LightboxImage[] = tiles.map((w, i) => ({
    src: w.src,
    alt: `${t(`projects.${w.project}.title`)} ${i + 1}`,
    caption: (
      <span>
        <strong className="font-display mr-2 uppercase tracking-[0.18em] text-fg">{t(`projects.${w.project}.title`)}</strong>
        <span className="font-display mr-2 text-[0.6rem] uppercase tracking-[0.24em] text-red-bright">{t(`projects.${w.project}.sector`)}</span>
        {t(`projects.${w.project}.story`)}
      </span>
    ),
  }));

  return (
    <section id="work" className="container-x relative scroll-mt-24 py-24 lg:py-32">
      {/* ambient glow: flat radial gradient instead of a blurred disc (no per-tile re-raster on scroll) */}
      <div aria-hidden className="pointer-events-none absolute -left-56 top-1/4 h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(closest-side,rgba(227,16,31,0.09),rgba(227,16,31,0.035)_45%,transparent)]" />
      <header className="@container relative">
        {/* index bar: eyebrow, rule, piece count */}
        <Reveal y={14}>
          <div className="flex items-center gap-4 sm:gap-6">
            <p className="eyebrow min-w-0">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-bright shadow-[0_0_10px_2px_rgba(255,47,63,0.55)]" />
              {t("eyebrow")}
            </p>
            <span aria-hidden className="hidden h-px min-w-12 flex-1 bg-gradient-to-r from-red/70 via-line-2 to-line sm:block" />
            <p className="font-display ml-auto shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-dim">
              {t.rich("pieces_count", { count: WALL.length, n: (c) => <span className="text-fg">{c}</span> })}
            </p>
          </div>
        </Reveal>
        {/* py on each line keeps accents (CRÉÉ) inside the gradient-clipped box */}
        <h2 className="display-lg fit-heading mt-8 leading-[0.9] lg:mt-10" style={titleStyle}>
          <Reveal as="span" delay={0.05} className="block py-[0.05em] text-chrome lg:whitespace-nowrap">
            {titleLead}
          </Reveal>{" "}
          <Reveal as="span" delay={0.15} className="block py-[0.05em] text-red-glow lg:whitespace-nowrap">
            {titleAccent}
          </Reveal>
        </h2>
      </header>

      {/* Project filter */}
      {/* one scrollable row on phones (long French labels), wrapping chips from md up */}
      <div className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:overflow-visible md:px-0" role="group" aria-label={t("sector")}>
        <button type="button" onClick={() => setFilter("all")} className={`chip shrink-0 whitespace-nowrap ${filter === "all" ? "chip-active" : ""}`} aria-pressed={filter === "all"}>
          {t("filterAll")}
        </button>
        {PROJECT_IDS.map((id) => (
          <button key={id} type="button" onClick={() => setFilter(id)} className={`chip shrink-0 whitespace-nowrap ${filter === id ? "chip-active" : ""}`} aria-pressed={filter === id}>
            {t(`projects.${id}.sector`)}
          </button>
        ))}
      </div>

      {/* Portfolio wall */}
      <RevealGroup key={filter} as="ul" className="mt-8 grid grid-flow-dense grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" stagger={0.04} amount={0.05}>
        {tiles.map((w, i) => (
          <RevealItem as="li" key={w.src} className={`group relative ${tileClass(w.src, w.big)}`}>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.focus({ preventScroll: true });
                setIndex(i);
              }}
              className="card card-hover absolute inset-0 block h-full w-full overflow-hidden text-left focus-visible:border-red-bright"
              aria-label={`${t("viewProject")}: ${t(`projects.${w.project}.title`)} ${i + 1}`}
            >
              <span aria-hidden className="absolute inset-0 block bg-[radial-gradient(ellipse_at_55%_42%,rgba(255,255,255,0.09),transparent_62%)]" />
              <Img
                src={w.src}
                alt={`${t(`projects.${w.project}.title`)} – ${t(`projects.${w.project}.sector`)}`}
                sizes={w.big ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-focus-within:scale-[1.06] sm:p-5"
              />
              <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-ink via-ink/75 to-transparent p-3 pt-10 sm:p-4">
                <span className="block font-display text-[0.55rem] font-bold uppercase tracking-[0.26em] text-red-bright">{t(`projects.${w.project}.sector`)}</span>
                <span className={`${w.big ? "display-sm" : "font-display text-[0.78rem] font-bold uppercase tracking-[0.1em]"} mt-0.5 block text-white`}>{t(`projects.${w.project}.title`)}</span>
              </span>
              <span aria-hidden className="absolute right-3 top-3 rounded-full border border-line-2 bg-ink/70 p-2 text-fg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                <Maximize2 className="h-3.5 w-3.5" />
              </span>
            </button>
          </RevealItem>
        ))}

        {/* CTA tile */}
        <RevealItem as="li" className="col-span-2 aspect-[3/2] md:aspect-auto md:min-h-[14rem]">
          <Link
            href="/contact"
            className="card card-hover group relative flex h-full flex-col justify-between overflow-hidden border-red/40 bg-gradient-to-br from-red/20 via-surface to-surface p-6 sm:p-7"
          >
            <span aria-hidden className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(227,16,31,0.32),rgba(227,16,31,0.12)_45%,transparent)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125" />
            <span className="eyebrow">{tn("quote")}</span>
            <span className="block">
              <span className="display-md block text-chrome">{t("ctaTitle")}</span>
              <span className="mt-3 inline-flex items-center gap-2 font-display text-[0.72rem] font-bold uppercase tracking-[0.24em] text-white">
                {tn("quote")} <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </span>
          </Link>
        </RevealItem>
      </RevealGroup>

      <Lightbox images={lightboxImages} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  );
}
