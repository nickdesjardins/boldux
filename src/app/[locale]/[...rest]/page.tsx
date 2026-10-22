import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

/**
 * The browser client-renders the 404 from this page's payload, whose <title> comes from
 * this metadata; without it the title would revert to the home title once JS runs.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: { absolute: t("notFound.title") } };
}

/** Catch-all so unknown paths within a locale render the localized not-found page. */
export default function CatchAll() {
  notFound();
}
