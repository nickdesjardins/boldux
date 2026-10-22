import { useTranslations } from "next-intl";
import { site } from "@/config/site";
import { Img } from "@/components/ui/Img";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";

export function ArtTeaser() {
  const t = useTranslations("artTeaser");
  return (
    <section className="container-x relative overflow-visible py-28 lg:py-36">
      <div className="grid items-center gap-14 lg:grid-cols-12">
        <div className="order-2 lg:order-1 lg:col-span-6">
          <div className="relative mx-auto h-[30rem] w-full max-w-xl sm:h-[34rem]">
            <Parallax speed={40} className="absolute left-0 top-6 w-[52%]">
              <Reveal x={-30} y={0}>
                <div className="card overflow-hidden rounded-2xl bg-[#ecebe7] p-4">
                  <Img src="/img/collections/skulls/art-skull-1-red.webp" alt={t("alt.skulls")} sizes="300px" className="h-auto w-full" />
                </div>
              </Reveal>
            </Parallax>
            <Parallax speed={-50} className="absolute right-0 top-0 w-[46%]">
              <Reveal delay={0.1} x={30} y={0}>
                <div className="card overflow-hidden rounded-2xl bg-[#ecebe7] p-4">
                  <Img src="/img/collections/music/art-music.webp" alt={t("alt.music")} sizes="280px" className="h-auto w-full" />
                </div>
              </Reveal>
            </Parallax>
            <Parallax speed={70} className="absolute bottom-0 right-[12%] w-[44%]">
              <Reveal delay={0.2}>
                <div className="card overflow-hidden rounded-2xl p-4">
                  <Img src="/img/collections/warrior/hoodie-white-red-front.webp" alt={t("alt.warriorHoodie")} sizes="260px" className="h-auto w-full" />
                </div>
              </Reveal>
            </Parallax>
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,16,31,0.16),rgba(227,16,31,0.06)_45%,transparent)]" />
          </div>
        </div>
        <div className="order-1 lg:order-2 lg:col-span-6">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("text")} />
          <Reveal delay={0.2} className="mt-9 flex flex-wrap gap-4">
            <Button href="/art" variant="primary">{t("cta1")}</Button>
            <Button href={site.shopUrl} external variant="ghost" icon="external">{t("cta2")}</Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
