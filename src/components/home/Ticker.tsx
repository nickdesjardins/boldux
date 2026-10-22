import { useTranslations } from "next-intl";

/*
 * Marquee: one CSS keyframe animation (translate3d 0 -> -50%) on a composited track.
 * Each copy carries its own trailing gap (`pr-10`, no gap on the track itself) so the two
 * copies are exactly equal in width and the -50% loop point is seamless.
 */
export function Ticker() {
  const t = useTranslations("ticker");
  const items = t("items").split("·").map((s) => s.trim());
  const row = [...items, t("tail")];
  return (
    <div className="relative overflow-hidden border-y border-line bg-ink-2 py-5 mask-fade-x" aria-hidden>
      <div className="flex w-max animate-marquee whitespace-nowrap will-change-transform [backface-visibility:hidden] hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-10 pr-10">
            {row.map((item, i) => {
              const tail = i === row.length - 1;
              return (
                <span key={`${copy}-${i}`} className="flex items-center gap-10">
                  <span className={`font-display text-sm font-bold uppercase tracking-[0.34em] ${tail ? "text-red-glow" : "text-chrome"}`}>{item}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${tail ? "bg-red-bright" : "bg-red/70"}`} />
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
