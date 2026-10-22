"use client";

import { MotionConfig } from "motion/react";

/**
 * Global motion settings. `reducedMotion="never"` lets Motion disable transform-based
 * animations for visitors who prefer reduced motion, while keeping server and client
 * markup identical (no render-time branching, hence no hydration mismatch).
 */
export function MotionProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="never" transition={{ ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </MotionConfig>
  );
}
