import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "@/config/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { MotionProviders } from "@/components/motion/Providers";
import { JsonLd } from "@/components/seo/JsonLd";
import "../globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("home.title"), template: `%s | ${site.name}` },
    description: t("home.description"),
    applicationName: site.name,
    authors: [{ name: site.name }],
    creator: site.name,
    formatDetection: { email: false, address: false, telephone: false },
    icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  };
}

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html lang={locale === "fr" ? "fr-CA" : "en-CA"} className={`${montserrat.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-ink text-fg">
        <NextIntlClientProvider>
          <MotionProviders>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-red focus:px-4 focus:py-2 focus:text-white"
          >
            {t("skip")}
          </a>
          <JsonLd data={[organizationJsonLd(locale as Locale), websiteJsonLd(locale as Locale)]} />
          <SmoothScroll />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          </MotionProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
