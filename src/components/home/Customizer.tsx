"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ARTWORKS, COLLECTIONS, SWATCH, collectionImage, colourways, type Artwork, type Garment, type View } from "@/data/collections";
import { Img } from "@/components/ui/Img";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

export function Customizer() {
  const t = useTranslations("customize");
  const [artwork, setArtwork] = useState<Artwork>("skulls");
  const [garment, setGarment] = useState<Garment>("tee");
  const [cw, setCw] = useState<string>(() => colourways("skulls", "tee")[0]);
  const [view, setView] = useState<View>("duo");

  const cws = useMemo(() => colourways(artwork, garment), [artwork, garment]);
  const colourway = cws.includes(cw) ? cw : cws[0];
  const src = collectionImage(artwork, garment, colourway, view);
  const art = COLLECTIONS[artwork].art[0];

  const pick = (a: Artwork, g: Garment) => {
    setArtwork(a);
    setGarment(g);
    const list = colourways(a, g);
    if (!list.includes(cw)) setCw(list[0]);
  };

  return (
    <section className="relative overflow-hidden border-y border-line bg-ink-2 py-28 lg:py-36">
      <div aria-hidden className="pointer-events-none absolute right-[-16%] top-[-10%] h-[56rem] w-[56rem] rounded-full bg-[radial-gradient(closest-side,rgba(227,16,31,0.11),rgba(227,16,31,0.05)_40%,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block grid-bg opacity-40" />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

          <Reveal delay={0.15} className="mt-10 space-y-7">
            <div>
              <p className="label">{t("artwork")}</p>
              <div className="flex flex-wrap gap-2">
                {ARTWORKS.map((a) => (
                  <button key={a} type="button" onClick={() => pick(a, garment)} className={`chip ${a === artwork ? "chip-active" : ""}`} aria-pressed={a === artwork}>
                    {t(`artworks.${a}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label">{t("garment")}</p>
              <div className="flex flex-wrap gap-2">
                {(["tee", "hoodie"] as Garment[]).map((g) => (
                  <button key={g} type="button" onClick={() => pick(artwork, g)} className={`chip ${g === garment ? "chip-active" : ""}`} aria-pressed={g === garment}>
                    {t(g)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label">{t("colourway")}</p>
              <div className="flex flex-wrap gap-2">
                {cws.map((c) => {
                  const sw = SWATCH[c] ?? ["#333", "#eee"];
                  return (
                    <button key={c} type="button" onClick={() => setCw(c)} className={`chip inline-flex items-center gap-2 ${c === colourway ? "chip-active" : ""}`} aria-pressed={c === colourway}>
                      <span className="relative inline-block h-3.5 w-3.5 overflow-hidden rounded-full ring-1 ring-white/20">
                        <span className="absolute inset-0" style={{ background: sw[0] }} />
                        <span className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]" style={{ background: sw[1] }} />
                      </span>
                      {t(`colours.${c}`)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["duo", "front", "back"] as View[]).map((v) => (
                <button key={v} type="button" onClick={() => setView(v)} className={`chip rounded-md ${v === view ? "chip-active" : ""}`} aria-pressed={v === view}>
                  {v === "duo" ? t("both") : v === "front" ? t("front") : t("back")}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-10 border-t border-line pt-8">
            <p className="text-sm text-muted">{t("note")}</p>
            <div className="mt-5">
              <Button href="/contact" variant="primary">{t("cta")}</Button>
            </div>
          </Reveal>
        </div>

        <div className="relative lg:col-span-7">
          <Reveal x={30} y={0} className="relative">
            <div className="card relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_55%,rgba(255,255,255,0.1),rgba(16,16,20,0)_60%)]">
              <div aria-hidden className="absolute inset-0 hidden md:block grid-bg opacity-70" />
              <AnimatePresence mode="popLayout">
                {src && (
                  <motion.div
                    key={src}
                    className="absolute inset-0 p-6 sm:p-10"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Img src={src} alt={`${t(`artworks.${artwork}`)} – ${t(garment)} – ${t(`colours.${colourway}`)}`} sizes="(min-width: 1024px) 58vw, 100vw" className="h-full w-full object-contain" priority={false} />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* artwork thumb */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={art}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.35 }}
                  className="glass-lite absolute left-4 top-4 flex items-center gap-3 rounded-xl p-2 pr-4"
                >
                  <span className="relative block h-14 w-12 overflow-hidden rounded-md bg-[#ecebe7]">
                    <Img src={art} alt="" sizes="48px" className="h-full w-full object-contain p-1" />
                  </span>
                  <span>
                    <span className="font-display block text-[0.58rem] uppercase tracking-[0.25em] text-dim">{t("artwork")}</span>
                    <span className="font-display block text-xs font-bold uppercase tracking-[0.12em] text-fg">{t(`artworks.${artwork}`)}</span>
                  </span>
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <span className="glass-lite rounded-full px-3 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.2em] text-fg">{t(garment)}</span>
                <span className="glass-lite rounded-full px-3 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.2em] text-fg">{t(`colours.${colourway}`)}</span>
              </div>
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-x-6 -bottom-10 h-20 bg-[radial-gradient(closest-side,rgba(227,16,31,0.3),transparent)]" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
