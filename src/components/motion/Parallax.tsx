"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/** Keep parallax travel modest: large offsets look floaty and cost more compositing area. */
const MAX_SPEED = 90;

/**
 * Moves its children vertically on scroll. `speed` in px over the element's visible range.
 * Transform-only and promoted to its own compositor layer (`will-change: transform`) so the
 * subtree (often a drop-shadowed image) is rasterised once and only moved afterwards.
 */
export function Parallax({
  children,
  speed = 80,
  className,
  rotate = 0,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  rotate?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const s = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, speed));
  const y = useTransform(scrollYProgress, [0, 1], [s, -s]);
  const r = useTransform(scrollYProgress, [0, 1], [-rotate, rotate]);
  return (
    <motion.div ref={ref} style={{ y, rotate: r, willChange: "transform" }} className={className}>
      {children}
    </motion.div>
  );
}
