import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MODEL_SLUGS, MODEL_COVER, MODEL_ALT } from "@/data/models";
import { Img } from "@/components/ui/Img";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function ModelsPreview() {
  const t = useTranslations("modelsPreview");
  const tm = useTranslations("models.items");
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">
      <div className="container-x flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
        <div className="shrink-0">
          <Button href="/models" variant="ghost">{t("cta")}</Button>
        </div>
      </div>
      <RevealGroup as="ul" className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 sm:px-8 lg:px-12 [scroll-padding-inline:1.25rem]" stagger={0.05} amount={0.1}>
        {MODEL_SLUGS.map((slug, i) => (
          <RevealItem as="li" key={slug} className="group w-[16rem] shrink-0 snap-start sm:w-[18rem]">
            <Link href={{ pathname: "/models/[slug]", params: { slug } }} className="card card-hover relative block aspect-[4/5] overflow-hidden">
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.09),transparent_60%)]" />
              <Img src={MODEL_COVER[slug]} alt={tm(`${slug}.name`)} sizes="288px" className="absolute inset-0 h-full w-full object-contain p-6 transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-0 product-shadow" />
              {MODEL_ALT[slug] && (
                <Img src={MODEL_ALT[slug]!} alt="" sizes="288px" className="absolute inset-0 h-full w-full object-contain p-6 opacity-0 transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-100 product-shadow" />
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink via-ink/70 to-transparent p-5 pt-14">
                <div>
                  <span className="font-display text-[0.58rem] tracking-[0.3em] text-dim">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="display-sm text-white">{tm(`${slug}.name`)}</h3>
                  <p className="text-xs text-muted">{tm(`${slug}.short`)}</p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-2 text-fg transition duration-500 group-hover:border-red group-hover:bg-red">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
