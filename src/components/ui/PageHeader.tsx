import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { fitFontSize } from "@/lib/fit";

type Crumb = { label: string; href?: "/" | "/models" | "/art" | "/contact" };

export function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  const nav = useTranslations("nav");
  // Long French words ("PERSONNALISONS") must never overflow the gradient-clipped h1:
  // size the display type to the container's inline width.
  const fontSize = typeof title === "string" ? fitFontSize(title, 7.4, 2.2) : undefined;

  return (
    <header className="relative overflow-hidden border-b border-line pb-16 pt-[calc(var(--header-h)+4rem)] lg:pb-20 lg:pt-[calc(var(--header-h)+6rem)] grain">
      {/* ambient glow: flat radial gradient (a blurred disc is re-rasterised while scrolling) */}
      <div aria-hidden className="pointer-events-none absolute -left-56 -top-20 h-[52rem] w-[52rem] rounded-full bg-[radial-gradient(closest-side,rgba(227,16,31,0.13),rgba(227,16,31,0.05)_40%,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block grid-bg opacity-50" />
      <div className="container-x relative @container">
        {crumbs && crumbs.length > 0 && (
          <Reveal y={10}>
            <nav aria-label={nav("breadcrumb")} className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 font-display text-[0.62rem] font-bold uppercase tracking-[0.24em] text-dim">
                {crumbs.map((c, i) => {
                  const current = i === crumbs.length - 1;
                  return (
                    <li key={i} className="flex items-center gap-2">
                      {i > 0 && <ChevronRight aria-hidden className="h-3 w-3 shrink-0" />}
                      {c.href && !current ? (
                        <Link href={c.href} className="rounded-sm transition hover:text-white">
                          {c.label}
                        </Link>
                      ) : (
                        <span aria-current={current ? "page" : undefined} className="text-muted">
                          {c.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </Reveal>
        )}
        <Reveal y={14}>
          <p className="eyebrow eyebrow-line mb-5">{eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="display-xl text-chrome" style={fontSize ? { fontSize } : undefined}>
            {title}
          </h1>
        </Reveal>
        {intro && (
          <Reveal delay={0.12}>
            <p className="lead mt-7 max-w-2xl">{intro}</p>
          </Reveal>
        )}
        {children}
      </div>
    </header>
  );
}
