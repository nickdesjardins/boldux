"use client";

import { motion, type Variants } from "motion/react";
import type { ComponentPropsWithoutRef, ElementType } from "react";

/*
 * Scroll reveals animate ONLY opacity + transform (compositor-friendly).
 * - No filter/blur animations: they force full repaints of large subtrees and stutter on scroll.
 * - No permanent `will-change`: Motion runs these tweens through WAAPI and adds/removes
 *   will-change itself while an animation is live. A static will-change on every revealed
 *   block kept dozens of GPU layers alive for the whole session (memory + compositing cost),
 *   which is exactly what made scrolling stutter on mid-range laptops.
 */

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  /** kept for API compatibility; blur is intentionally never animated */
  blur?: boolean;
  once?: boolean;
  amount?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "article" | "figure" | "header" | "p" | "h1" | "h2" | "h3";
};

const EASE = [0.16, 1, 0.3, 1] as const;
/** Start a little before the element is fully in view, but never for elements still well below the fold. */
const VIEWPORT_MARGIN = "0px 0px -8% 0px";

/** Fade + slide in when the element enters the viewport. */
export function Reveal({ children, delay = 0, duration = 0.8, y = 24, x = 0, once = true, amount = 0.2, className, as = "div" }: RevealProps) {
  const M = motion[as] as ElementType;
  const variants: Variants = {
    hidden: { opacity: 0, y, x },
    show: { opacity: 1, y: 0, x: 0, transition: { duration, delay, ease: EASE } },
  };
  return (
    <M className={className} initial="hidden" whileInView="show" viewport={{ once, amount, margin: VIEWPORT_MARGIN }} variants={variants}>
      {children}
    </M>
  );
}

/** Staggers direct children (each child should be a <RevealItem />). */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delay = 0,
  amount = 0.15,
  as = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
  as?: "div" | "ul" | "ol" | "section";
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">) {
  const M = motion[as] as ElementType;
  return (
    <M
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: VIEWPORT_MARGIN }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </M>
  );
}

export function RevealItem({
  children,
  className,
  y = 22,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  as?: "div" | "li" | "article" | "figure";
}) {
  const M = motion[as] as ElementType;
  return (
    <M
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
      }}
    >
      {children}
    </M>
  );
}
