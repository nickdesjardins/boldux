"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { Globe } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const STATIC_PATHS = ["/", "/models", "/art", "/contact"] as const;
type StaticPath = (typeof STATIC_PATHS)[number];
type Href = StaticPath | { pathname: "/models/[slug]"; params: { slug: string } };

/** Switches language while staying on the same page (localized pathnames aware). */
export function LocaleSwitcher({ variant = "header" }: { variant?: "header" | "footer" }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const other: Locale = locale === "en" ? "fr" : "en";
  const label = other === "fr" ? "Français" : "English";

  // usePathname() returns the internal (unlocalized) pathname. Rebuild a typed href so
  // next-intl can localize it for the other locale; unknown pages fall back to home.
  let href: Href = "/";
  if (pathname.startsWith("/models/") && typeof params?.slug === "string") {
    href = { pathname: "/models/[slug]", params: { slug: params.slug } };
  } else if ((STATIC_PATHS as readonly string[]).includes(pathname)) {
    href = pathname as StaticPath;
  }

  if (variant === "footer") {
    return (
      <Link
        href={href}
        locale={other}
        hrefLang={other}
        className="inline-flex items-center gap-2 rounded-md border border-line-2 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-muted transition hover:border-red hover:text-white"
      >
        <Globe className="h-3.5 w-3.5" /> {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      locale={other}
      hrefLang={other}
      aria-label={label}
      className="font-display inline-flex items-center gap-1.5 rounded-md border border-line-2 px-2.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-muted transition hover:border-red hover:text-white"
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{other.toUpperCase()}</span>
    </Link>
  );
}
