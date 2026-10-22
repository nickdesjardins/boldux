import { useTranslations } from "next-intl";
import { site } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export function CtaBand({ title, text, primary, secondary }: { title?: string; text?: string; primary?: string; secondary?: string }) {
  const t = useTranslations("cta");
  return (
    <section className="container-x py-10">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-red/40 bg-gradient-to-br from-red-deep/40 via-surface to-ink p-10 text-center sm:p-16 lg:p-24 grain">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[44rem] w-[72rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,16,31,0.22),rgba(227,16,31,0.08)_45%,transparent)]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="display-lg text-white">{title ?? t("title")}</h2>
            <p className="lead mx-auto mt-6 max-w-2xl text-fg/85">{text ?? t("text")}</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact" variant="light" size="lg">{primary ?? t("button")}</Button>
              <a href={`mailto:${site.email}`} className="btn btn-ghost border-white/30">
                {secondary ?? t("secondary")}
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
