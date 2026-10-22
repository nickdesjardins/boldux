"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Images } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PROJECTS, type Project } from "@/data/portfolio";
import { Img } from "@/components/ui/Img";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { Lightbox, type LightboxImage } from "@/components/gallery/Lightbox";

const SIZE: Record<Project["size"], string> = {
  xl: "md:col-span-2 md:row-span-2",
  tall: "md:row-span-2",
  wide: "md:col-span-2",
  sm: "",
};

export function WorkShowcase() {
  const t = useTranslations("work");
  const tn = useTranslations("nav");
  const [active, setActive] = useState<{ project: Project; index: number } | null>(null);

  const lightboxImages: LightboxImage[] = active
    ? active.project.images.map((src, i) => ({
        src,
        alt: `${t(`projects.${active.project.id}.title`)} ${i + 1}`,
        caption: (
          <span>
            <strong className="font-display mr-2 uppercase tracking-[0.18em] text-fg">{t(`projects.${active.project.id}.title`)}</strong>
            {t(`projects.${active.project.id}.story`)}
          </span>
        ),
      }))
    : [];

  return (
    <section id="work" className="container-x relative scroll-mt-24 py-28 lg:py-36">
      {/* ambient glow: flat radial gradient instead of a blurred disc (no per-tile re-raster on scroll) */}
      <div aria-hidden className="pointer-events-none absolute -left-56 top-1/4 h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(closest-side,rgba(227,16,31,0.09),rgba(227,16,31,0.035)_45%,transparent)]" />
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

      <RevealGroup className="mt-14 grid auto-rows-[15rem] grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[16rem]" stagger={0.07}>
        {PROJECTS.map((p) => (
          <RevealItem key={p.id} className={`${SIZE[p.size]} min-h-[15rem]`}>
            <TiltCard className="group relative h-full rounded-[1.25rem]" max={5}>
              <button
                type="button"
                onClick={(e) => {
                  // Safari does not focus a clicked button; make sure the lightbox can hand focus back here.
                  e.currentTarget.focus({ preventScroll: true });
                  setActive({ project: p, index: 0 });
                }}
                className="card card-hover relative block h-full w-full overflow-hidden text-left"
                aria-label={`${t("viewProject")}: ${t(`projects.${p.id}.title`)}`}
              >
                {/* only phrasing content inside a <button>: spans, no div/h3 */}
                <span aria-hidden className="absolute inset-0 block bg-[radial-gradient(ellipse_at_60%_40%,rgba(255,255,255,0.09),transparent_60%)]" />
                <Img
                  src={p.cover}
                  alt={t(`projects.${p.id}.title`)}
                  sizes={p.size === "xl" ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
                  className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07] product-shadow"
                />
                <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-ink via-ink/80 to-transparent p-5 pt-16">
                  <span className="block font-display text-[0.6rem] font-bold uppercase tracking-[0.28em] text-red-bright">{t(`projects.${p.id}.sector`)}</span>
                  <span className="display-sm mt-1.5 block text-white">{t(`projects.${p.id}.title`)}</span>
                  <span className="mt-1 block text-xs text-muted">{t(`projects.${p.id}.pieces`)}</span>
                </span>
                <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-ink/70 px-3 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.2em] text-fg opacity-0 transition duration-500 group-hover:opacity-100">
                  <Images className="h-3.5 w-3.5" /> {p.images.length}
                </span>
              </button>
            </TiltCard>
          </RevealItem>
        ))}

        {/* CTA tile */}
        <RevealItem className="md:col-span-2 min-h-[15rem]">
          <Link
            href="/contact"
            className="card card-hover group relative flex h-full flex-col justify-between overflow-hidden border-red/40 bg-gradient-to-br from-red/20 via-surface to-surface p-7"
          >
            <div aria-hidden className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(227,16,31,0.32),rgba(227,16,31,0.12)_45%,transparent)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125" />
            <p className="eyebrow">{tn("quote")}</p>
            <div>
              <p className="display-md text-chrome">{t("ctaTitle")}</p>
              <p className="mt-3 inline-flex items-center gap-2 font-display text-[0.72rem] font-bold uppercase tracking-[0.24em] text-white">
                {tn("quote")} <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </p>
            </div>
          </Link>
        </RevealItem>
      </RevealGroup>

      <Lightbox
        images={lightboxImages}
        index={active ? active.index : null}
        onClose={() => setActive(null)}
        onIndex={(i) => active && setActive({ ...active, index: i })}
      />
    </section>
  );
}
