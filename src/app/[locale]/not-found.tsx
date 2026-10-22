import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";

/**
 * Read by Next when a notFound() surfaces to this boundary, so the server-rendered 404
 * gets its own localized <title>. The key already ends in "| Boldux Art", hence `absolute`.
 * Next injects <meta name="robots" content="noindex"> on every 404 itself.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: { absolute: t("notFound.title") } };
}

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="container-x flex min-h-[80svh] flex-col items-center justify-center pt-[var(--header-h)] text-center">
      <p className="font-display text-[clamp(5rem,20vw,14rem)] font-black leading-none text-chrome">404</p>
      <h1 className="display-md mt-4 text-white">{t("title")}</h1>
      <p className="lead mt-4 max-w-md">{t("text")}</p>
      <div className="mt-10">
        <Button href="/" variant="primary">{t("cta")}</Button>
      </div>
    </section>
  );
}
