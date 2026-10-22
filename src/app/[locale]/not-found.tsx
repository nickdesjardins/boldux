import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

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
