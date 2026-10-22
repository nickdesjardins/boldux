import { defineRouting } from "next-intl/routing";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // English lives at "/", French at "/fr/..."
  localePrefix: "as-needed",
  // Detect the browser language (Accept-Language) and the NEXT_LOCALE cookie:
  // a visitor with a French browser hitting "/" is redirected to "/fr".
  localeDetection: true,
  localeCookie: { name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365 },
  alternateLinks: true,
  pathnames: {
    "/": "/",
    "/models": { en: "/models", fr: "/modeles" },
    "/models/[slug]": { en: "/models/[slug]", fr: "/modeles/[slug]" },
    "/art": { en: "/art", fr: "/art" },
    "/contact": { en: "/contact", fr: "/contact" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
