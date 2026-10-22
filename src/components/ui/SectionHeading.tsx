import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { fitFontSize, fitLines, splitSentences } from "@/lib/fit";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  size = "lg",
  className = "",
  id,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  size?: "lg" | "md";
  className?: string;
  id?: string;
}) {
  const center = align === "center";
  const maxRem = size === "lg" ? 4.6 : 2.9;
  const minRem = size === "lg" ? 1.9 : 1.5;

  // Display type is sized to the container's inline width (container-query units) so long
  // French words ("PROMOTIONNELS") never overflow the gradient-clipped heading.
  // Titles made of 2-4 short sentences ("One artwork. Any garment. Any colour.") get one
  // sentence per line from lg up, sized to the longest sentence; below lg they wrap naturally.
  const sentences = typeof title === "string" ? splitSentences(title) : [];
  const perLine = sentences.length >= 2 && sentences.length <= 4 && sentences.every((s) => s.length <= 26);
  const style: CSSProperties | undefined =
    typeof title === "string"
      ? ({
          "--fs-sm": fitFontSize(title, maxRem, minRem),
          "--fs-lg": perLine ? fitLines(sentences, maxRem, minRem) : fitFontSize(title, maxRem, minRem),
        } as CSSProperties)
      : undefined;

  // w-full + min-w-0: a container-type element has no intrinsic width, so inside a flex row it would collapse.
  return (
    <div className={`@container w-full min-w-0 ${center ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && (
        <Reveal y={14}>
          <p className={`eyebrow ${center ? "" : "eyebrow-line"} mb-5`}>{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 id={id} className={`${size === "lg" ? "display-lg" : "display-md"} fit-heading text-chrome ${perLine ? "" : "text-balance"}`} style={style}>
          {perLine
            ? sentences.map((s, i) => (
                <span key={i} className="lg:block lg:whitespace-nowrap">
                  {s}
                  {i < sentences.length - 1 ? " " : ""}
                </span>
              ))
            : title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.12}>
          <p className="lead mt-6">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
