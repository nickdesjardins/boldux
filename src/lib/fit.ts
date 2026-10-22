/**
 * Fluid display sizing for headlines whose longest word must never be clipped
 * (French runs long: "PERSONNALISÉS", "PERSONNALISONS").
 *
 * Returns a CSS font-size that is `maxRem` on wide containers and shrinks with the
 * container's inline size (cqw units) so the longest word always fits on one line.
 * The parent element must establish a container (`@container` / container-type: inline-size).
 *
 * `glyph` is the average advance width of an uppercase Montserrat Black glyph in em,
 * including the heading's negative tracking; 0.76 is deliberately conservative.
 */
export function fitFontSize(text: string, maxRem: number, minRem = 2.2, glyph = 0.76): string {
  const longest = text
    .split(/\s+/)
    .reduce((m, w) => Math.max(m, w.length), 1);
  const cqw = (100 / (glyph * longest)).toFixed(2);
  return `clamp(${minRem}rem, ${cqw}cqw, ${maxRem}rem)`;
}
