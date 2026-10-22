import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";

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
  // "nav.breadcrumb" is a new key (see newMessages); the fallback only serves until it lands.
  const breadcrumbLabel = nav.has("breadcrumb") ? nav("breadcrumb") : "Breadcrumb";

  return (
    <header className="relative overflow-hidden border-b border-line pb-16 pt-[calc(var(--header-h)+4rem)] lg:pb-20 lg:pt-[calc(var(--header-h)+6rem)] grain">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-red/12 blur-[150px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
      <div className="container-x relative">
        {crumbs && crumbs.length > 0 && (
          <Reveal y={10} blur={false}>
            <nav aria-label={breadcrumbLabel} className="mb-8">
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
        <Reveal y={14} blur={false}>
          <p className="eyebrow eyebrow-line mb-5">{eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="display-xl max-w-5xl text-chrome">{title}</h1>
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
