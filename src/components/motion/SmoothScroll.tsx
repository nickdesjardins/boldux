"use client";

import { useEffect } from "react";

/**
 * Inertial scrolling (Lenis) is OFF by default; native scrolling is used instead.
 *
 * Why: Lenis drives the scroll position from JavaScript on every frame and intercepts wheel
 * events with a non-passive listener. That moves scrolling from the compositor thread to the
 * main thread, so any busy frame (React hydration, image decode, reveal animations starting,
 * Motion's scroll handlers) becomes a visible hitch in the scroll itself. On Windows laptops
 * in Chrome, where wheel ticks are coarse and Chrome already applies its own wheel smoothing,
 * this is what read as "janky". Native scrolling stays smooth even when the main thread is
 * busy, and `html { scroll-behavior: smooth }` still eases anchor links.
 *
 * To bring Lenis back, set NEXT_PUBLIC_SMOOTH_SCROLL=1 (tuned: lerp 0.12, no syncTouch,
 * autoRaf, skipped for touch pointers and reduced-motion users, destroyed on unmount).
 */
const ENABLE_LENIS = process.env.NEXT_PUBLIC_SMOOTH_SCROLL === "1";

export function SmoothScroll() {
  useEffect(() => {
    if (!ENABLE_LENIS) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // native scrolling feels better on touch

    let lenis: { destroy(): void } | undefined;
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ autoRaf: true, lerp: 0.12, wheelMultiplier: 1, smoothWheel: true, syncTouch: false });
    });
    return () => {
      cancelled = true;
      lenis?.destroy();
    };
  }, []);
  return null;
}
