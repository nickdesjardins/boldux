import { Reveal } from "@/components/motion/Reveal";
import { fitFontSize } from "@/lib/fit";

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
  // Long French words (e.g. "PROMOTIONNELS") must never overflow the gradient-clipped heading:
  // size the display type to the container's inline width.
  const fontSize = typeof title === "string" ? fitFontSize(title, size === "lg" ? 4.6 : 2.9, size === "lg" ? 1.9 : 1.5) : undefined;
  // w-full + min-w-0: a container-type element has no intrinsic width, so inside a flex row it would collapse.
  return (
    <div className={`@container w-full min-w-0 ${center ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && (
        <Reveal y={14} blur={false}>
          <p className={`eyebrow ${center ? "" : "eyebrow-line"} mb-5`}>{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 id={id} className={`${size === "lg" ? "display-lg" : "display-md"} text-chrome`} style={fontSize ? { fontSize } : undefined}>
          {title}
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
