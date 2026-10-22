import { Lightbulb, PenTool, Cog, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

const ITEMS = [
  { key: "design", icon: Lightbulb },
  { key: "conception", icon: PenTool },
  { key: "production", icon: Cog },
  { key: "privateLabel", icon: Tag },
] as const;

export function Services() {
  const t = useTranslations("services");
  return (
    <section id="services" className="container-x relative scroll-mt-24 py-28 lg:py-36">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
        </div>
        <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:col-span-7" stagger={0.1}>
          {ITEMS.map((it, i) => (
            <RevealItem as="li" key={it.key} className="group">
              <div className="card card-hover relative h-full overflow-hidden p-7">
                <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(227,16,31,0.28),rgba(227,16,31,0.1)_45%,transparent)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-red/40 bg-red/10 text-red-bright transition duration-500 group-hover:bg-red group-hover:text-white">
                    <it.icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span className="font-display text-[0.62rem] font-bold tracking-[0.3em] text-dim">0{i + 1}</span>
                </div>
                <h3 className="display-sm mt-6 text-white">{t(`items.${it.key}.title`)}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{t(`items.${it.key}.text`)}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
      <Reveal className="mt-16 lg:mt-20">
        <blockquote className="relative border-l-2 border-red pl-6 lg:ml-[41.666%]">
          <p className="display-md max-w-3xl font-bold normal-case tracking-normal text-fg/90">{t("statement")}</p>
        </blockquote>
      </Reveal>
    </section>
  );
}
