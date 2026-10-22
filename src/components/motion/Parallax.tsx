import type { CSSProperties } from "react";

/** Keep parallax travel modest: large offsets look floaty and cost more compositing area. */
const MAX_SPEED = 90;

/**
 * Moves its children vertically as they travel through the viewport.
 *
 * Driven by a CSS scroll-driven animation (`animation-timeline: view()`, see globals.css
 * `.parallax-y`), so it runs on the compositor thread with zero JavaScript per scroll frame.
 * Browsers without scroll timelines simply render the children static.
 */
export function Parallax({ children, speed = 80, className }: { children: React.ReactNode; speed?: number; className?: string; rotate?: number }) {
  const s = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, speed));
  return (
    <div className={`parallax-y ${className ?? ""}`} style={{ "--parallax": `${s}px` } as CSSProperties}>
      {children}
    </div>
  );
}
