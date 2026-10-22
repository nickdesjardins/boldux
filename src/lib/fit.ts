/**
 * Fluid display sizing for headlines whose longest unit must never be clipped
 * (French runs long: "PERSONNALISÉS", "PERSONNALISONS").
 *
 * Returns a CSS font-size that is `maxRem` on wide containers and shrinks with the
 * container's inline size (cqw units) so the longest unit always fits on one line.
 * The parent element must establish a container (`@container` / container-type: inline-size).
 *
 * `glyph` is the average advance width of an uppercase Montserrat Black glyph in em,
 * including the heading's negative tracking; 0.76 is deliberately conservative.
 */
export function fitFontSize(text: string, maxRem: number, minRem = 2.2, glyph = 0.76): string {
  const longest = text
    .split(/\s+/)
    .reduce((m, w) => Math.max(m, w.length), 1);
  return fitUnits(longest, maxRem, minRem, glyph);
}

/** Same idea, but every entry of `lines` must fit on one line (sentence-per-line headings). */
export function fitLines(lines: string[], maxRem: number, minRem = 1.6, glyph = 0.72): string {
  const longest = lines.reduce((m, l) => Math.max(m, l.trim().length), 1);
  return fitUnits(longest, maxRem, minRem, glyph);
}

/** Splits a title into sentences ("One artwork. Any garment." -> 2 lines). */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function fitUnits(chars: number, maxRem: number, minRem: number, glyph: number): string {
  const cqw = (100 / (glyph * chars)).toFixed(2);
  return `clamp(${minRem}rem, ${cqw}cqw, ${maxRem}rem)`;
}
