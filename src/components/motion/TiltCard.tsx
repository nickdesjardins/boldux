"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useCallback, type MouseEvent } from "react";

/** Diameter (px) of the spotlight disc that follows the cursor. */
const SPOT = 720;
const SPRING = { stiffness: 220, damping: 22, mass: 0.6 } as const;

let reduceMotionQuery: MediaQueryList | null = null;
function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  reduceMotionQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  return reduceMotionQuery.matches;
}

/**
 * Card that tilts toward the cursor with a moving spotlight.
 *
 * Performance notes:
 * - Idle cards render `transform: none` (no perspective() in the element's own transform,
 *   no preserve-3d), so they are NOT permanent compositor layers. Perspective lives on the
 *   static wrapper and only matters while a tilt is live.
 * - The spotlight is a pre-painted radial-gradient disc moved with translate (transform only).
 *   The old version re-painted a gradient background on every mousemove.
 * - `will-change: transform` is only set on the disc while the pointer is over the card.
 * - Pass a `rounded-*` class in `className` so the spotlight clips to the card's corners.
 */
export function TiltCard({
  children,
  className,
  max = 8,
  spotlight = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  spotlight?: boolean;
}) {
  const rx = useSpring(0, SPRING);
  const ry = useSpring(0, SPRING);
  const sx = useMotionValue(-SPOT);
  const sy = useMotionValue(-SPOT);
  const willChange = useMotionValue<"auto" | "transform">("auto");

  const onMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion()) return;
      const r = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      ry.set((x / r.width - 0.5) * max * 2);
      rx.set((0.5 - y / r.height) * max * 2);
      sx.set(x - SPOT / 2);
      sy.set(y - SPOT / 2);
    },
    [max, rx, ry, sx, sy],
  );
  const onEnter = useCallback(() => willChange.set("transform"), [willChange]);
  const onLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
    willChange.set("auto");
  }, [rx, ry, willChange]);

  return (
    <div className={`group [perspective:1000px] ${className ?? ""}`} onMouseEnter={onEnter} onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div className="relative h-full rounded-[inherit]" style={{ rotateX: rx, rotateY: ry }}>
        {children}
        {spotlight && (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <motion.div
              className="absolute left-0 top-0 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.1),rgba(255,255,255,0.03)_45%,transparent)]"
              style={{ width: SPOT, height: SPOT, x: sx, y: sy, willChange }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
