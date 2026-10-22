import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "@/config/site";

type Href = Parameters<typeof getPathname>[0]["href"];

export function absoluteUrl(path: string) {
  const base = site.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localizedUrl(locale: Locale, href: Href) {
  return absoluteUrl(getPathname({ locale, href }));
}

/** Builds the per-locale metadata with canonical + hreflang alternates. */
export function buildMetadata(opts: {
  locale: Locale;
  href: Href;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}): Metadata {
  const { locale, href, title, description, image, noIndex } = opts;
  const canonical = localizedUrl(locale, href);
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l === "en" ? "en-CA" : "fr-CA"] = localizedUrl(l, href);
  }
  languages["x-default"] = localizedUrl(routing.defaultLocale, href);
  const ogImage = image ?? absoluteUrl(`/og/${locale}.png`);

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      alternateLocale: locale === "fr" ? ["en_CA"] : ["fr_CA"],
      type: opts.type ?? "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  };
}

export function organizationJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": absoluteUrl("/#organization"),
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: absoluteUrl("/img/brand/logo.png"),
    image: absoluteUrl("/img/hero/concept-full.webp"),
    email: site.email,
    founder: { "@type": "Person", "@id": absoluteUrl("/art#person"), name: site.founder },
    foundingDate: site.foundingDate,
    address: { "@type": "PostalAddress", addressRegion: "QC", addressCountry: "CA" },
    areaServed: ["CA"],
    sameAs: Object.values(site.social),
    knowsLanguage: ["en", "fr"],
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    description:
      locale === "fr"
        ? "Design, conception et fabrication de vêtements personnalisés pour entreprises, équipes et marques privées."
        : "Design, conception and production of custom clothing for businesses, teams and private labels.",
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: locale === "fr" ? "Vêtements personnalisés" : "Custom apparel" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: locale === "fr" ? "Vêtements corporatifs" : "Corporate apparel" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: locale === "fr" ? "Marque privée" : "Private label clothing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: locale === "fr" ? "Design graphique de vêtements" : "Apparel graphic design" } },
    ],
  };
}

export function websiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: site.url,
    name: site.name,
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
