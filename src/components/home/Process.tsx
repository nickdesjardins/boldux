import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function Process() {
  const t = useTranslations("process");
  const steps = [0, 1, 2, 3] as const;
  return (
    <section className="relative border-y border-line bg-ink-2 py-28 lg:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block grid-bg opacity-30" />
      <div className="container-x relative">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="center" />
        <RevealGroup as="ol" className="relative mt-16 grid gap-6 md:grid-cols-4" stagger={0.12}>
          <div aria-hidden className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-red/60 to-transparent md:block" />
          {steps.map((i) => (
            <RevealItem as="li" key={i} className="relative">
              <div className="flex items-center gap-4 md:flex-col md:items-start">
                <span className="relative z-10 inline-flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl border border-red/50 bg-ink font-display text-xl font-black text-red-bright shadow-glow-red">
                  0{i + 1}
                </span>
                <div className="md:mt-6">
                  <h3 className="display-sm text-white">{t(`steps.${i}.title`)}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{t(`steps.${i}.text`)}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
