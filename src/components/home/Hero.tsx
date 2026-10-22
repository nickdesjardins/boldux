"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "motion/react";
import { Lightbulb, PenTool, Cog, Shirt, ArrowRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import { fitFontSize } from "@/lib/fit";

const ease = [0.16, 1, 0.3, 1] as const;

/*
 * Performance notes (the owner reported janky animations):
 * - Everything that moves is transform/opacity only. No filter animations in the entrance.
 * - The two scroll-linked layers (background + content) carry `will-change: transform`, so
 *   they are composited once and only moved/faded by the GPU while scrolling.
 * - The ambient red glows are radial gradients, not `filter: blur()` discs: a 46rem blurred
 *   element is re-rasterised tile by tile while scrolling, a gradient is a flat paint.
 *   They also sit OUTSIDE the parallaxed layer so they never re-raster with it.
 * - Floating cards: the Motion entrance lives on an outer element and the infinite CSS
 *   float on an inner one, so the two transforms do not fight over the same property.
 */

function Word({ text, delay, className }: { text: string; delay: number; className?: string }) {
  return (
    // Reveal mask: padding keeps accents (É) and the last glyph's right bearing inside the clip box.
    <span className="-mt-[0.14em] block overflow-hidden pb-[0.08em] pr-[0.08em] pt-[0.14em]">
      <motion.span
        className={`block ${className ?? ""}`}
        initial={{ y: "110%", rotate: 3 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ duration: 1.1, delay, ease }}
      >
        {text}
      </motion.span>
    </span>
  );
}

const FLOATERS = [
  { src: "/img/collections/music/hoodie-black-red-front.webp", w: 150, pos: "right-[6%] top-[14%]", float: "animate-float", delay: 0.9 },
  { src: "/img/models/caps/snapback-1.webp", w: 120, pos: "right-[30%] top-[48%]", float: "animate-float-slow", delay: 1.15 },
  { src: "/img/collections/warrior/tee-white-red-front.webp", w: 140, pos: "right-[2%] bottom-[8%]", float: "animate-float", delay: 1.35 },
];

const GLOW_L = "bg-[radial-gradient(closest-side,rgba(227,16,31,0.15),rgba(227,16,31,0.07)_38%,rgba(227,16,31,0.02)_68%,transparent)]";
const GLOW_R = "bg-[radial-gradient(closest-side,rgba(227,16,31,0.1),rgba(227,16,31,0.045)_40%,transparent)]";

export function Hero() {
  const t = useTranslations("hero");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  // Long French words ("PERSONNALISÉS") must never be clipped by the reveal mask:
  // size the headline to the column width (container-query units).
  const headlineSize = fitFontSize(`${t("titleA")} ${t("titleB")}`, 7.4, 2);
  const strip = [
    { icon: Lightbulb, title: t("strip.0.title"), sub: t("strip.0.sub") },
    { icon: PenTool, title: t("strip.1.title"), sub: t("strip.1.sub") },
    { icon: Cog, title: t("strip.2.title"), sub: t("strip.2.sub") },
    { icon: Shirt, title: t("strip.3.title"), sub: t("strip.3.sub") },
  ];

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      {/* Studio background: transform-only parallax layer, no filters inside */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 -z-10 will-change-transform">
        <div className="absolute inset-y-0 right-0 w-full lg:w-[64%]">
          <Image
            src="/img/hero/studio.webp"
            alt={t("imageAlt")}
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 64vw, 100vw"
            className="object-cover object-[62%_center] opacity-60 lg:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20 lg:via-ink/35 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/60" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent lg:w-56" />
        </div>
      </motion.div>

      {/* Ambient light (static gradients, outside the parallax layer) */}
      <div aria-hidden className={`pointer-events-none absolute -left-[18rem] top-[-24%] -z-10 h-[64rem] w-[64rem] rounded-full ${GLOW_L}`} />
      <div aria-hidden className={`pointer-events-none absolute right-[2%] top-[18%] -z-10 h-[42rem] w-[42rem] rounded-full ${GLOW_R}`} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-60" />
      {/* diagonal red accent */}
      <motion.div
        aria-hidden
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.4, delay: 0.3, ease }}
        className="pointer-events-none absolute left-[55%] top-0 -z-10 hidden h-[140%] w-px origin-top -rotate-[18deg] bg-gradient-to-b from-red/0 via-red/70 to-red/0 lg:block"
      />

      {/* Content: composited layer, moved + faded on scroll */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x relative flex flex-1 flex-col justify-center pb-16 pt-[calc(var(--header-h)+2.5rem)] will-change-transform"
      >
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="@container min-w-0 lg:col-span-7 xl:col-span-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease }}>
              <Image src="/img/brand/logo.png" alt="Boldux Art" width={300} height={189} priority className="h-auto w-48 drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] sm:w-60 lg:w-64" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease }}
              className="font-display mt-8 flex items-center gap-4 text-[0.7rem] font-bold uppercase tracking-[0.42em] text-chrome sm:text-xs"
            >
              <span>{t("tagline")}</span>
            </motion.p>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.4, ease }} className="red-line mt-3 w-40 origin-left" />

            <h1 className="display-xl mt-7" style={{ fontSize: headlineSize }}>
              <Word text={t("titleA")} delay={0.35} className="text-white" />
              <Word text={t("titleB")} delay={0.47} className="text-red-glow" />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease }}
              className="font-display mt-6 flex flex-wrap items-center gap-x-3 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-fg/90 sm:text-xs"
            >
              {t("pillars").split("·").map((p, i) => (
                <span key={i} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden className="h-3.5 w-px bg-red" />}
                  {p.trim()}
                </span>
              ))}
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.85, ease }} className="lead mt-6 max-w-lg text-fg/80">
              {t("lead")}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.98, ease }} className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/contact" className="btn btn-primary group/btn">
                <span>{t("cta1")}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:translate-x-1" />
              </Link>
              <Link href="/models" className="btn btn-ghost">
                {t("cta2")}
              </Link>
            </motion.div>
          </div>

          {/* Floating product cards (desktop only) */}
          <div className="relative hidden h-[34rem] lg:col-span-5 lg:block xl:col-span-6" aria-hidden>
            {FLOATERS.map((f) => (
              <motion.div
                key={f.src}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.2, delay: f.delay, ease }}
                className={`absolute ${f.pos}`}
              >
                <div className={`glass-lite rounded-2xl p-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ${f.float}`}>
                  <Image src={f.src} alt="" width={f.w} height={f.w} sizes="160px" priority className="product-shadow" style={{ width: f.w, height: "auto" }} />
                </div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="glass-lite absolute bottom-[26%] left-[6%] flex items-center gap-3 rounded-full py-2 pl-2 pr-4"
            >
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-red-bright" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-bright" />
              </span>
              <span className="font-display text-[0.62rem] font-bold uppercase tracking-[0.22em] text-fg/90">{t("badge")}</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.a
        href="#work"
        aria-label={t("scroll")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-28 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-dim lg:flex"
      >
        <span className="font-display text-[0.58rem] uppercase tracking-[0.3em]">{t("scroll")}</span>
        <ChevronDown className="h-4 w-4 animate-scroll-hint" />
      </motion.a>

      {/* Pillars strip (in normal flow, below the content; never overlaps) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, ease }}
        className="relative border-t border-line bg-ink/85"
      >
        <div className="container-x grid grid-cols-2 lg:grid-cols-4">
          {strip.map((s, i) => (
            <div key={i} className={`flex items-center gap-4 py-5 ${i > 0 ? "lg:border-l lg:border-red/50" : ""} ${i % 2 === 1 ? "border-l border-red/40 lg:border-l" : ""} ${i < 2 ? "border-b border-line lg:border-b-0" : ""} pl-4 lg:justify-center lg:pl-0`}>
              <s.icon className="h-7 w-7 shrink-0 text-red-bright" strokeWidth={1.5} />
              <div>
                <p className="font-display text-[0.8rem] font-black uppercase tracking-[0.2em] text-white">{s.title}</p>
                <p className="font-display text-[0.62rem] uppercase tracking-[0.2em] text-muted">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
