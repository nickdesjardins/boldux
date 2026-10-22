import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { WorkShowcase } from "@/components/home/WorkShowcase";
import { Customizer } from "@/components/home/Customizer";
import { Services } from "@/components/home/Services";
import { ModelsPreview } from "@/components/home/ModelsPreview";
import { Process } from "@/components/home/Process";
import { ArtTeaser } from "@/components/home/ArtTeaser";
import { CtaBand } from "@/components/home/CtaBand";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const md = buildMetadata({ locale: locale as Locale, href: "/", title: t("home.title"), description: t("home.description") });
  // Home keeps the full brand title (no template suffix)
  return { ...md, title: { absolute: t("home.title") } };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Ticker />
      <WorkShowcase />
      <Services />
      <ModelsPreview />
      <Customizer />
      <Process />
      <ArtTeaser />
      <CtaBand />
    </>
  );
}
