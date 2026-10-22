import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localizedUrl } from "@/lib/seo";
import { MODEL_SLUGS } from "@/data/models";

type Href = Parameters<typeof localizedUrl>[1];

function entry(href: Href, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l === "en" ? "en-CA" : "fr-CA"] = localizedUrl(l, href);
  languages["x-default"] = localizedUrl("en", href);
  return routing.locales.map((l) => ({
    url: localizedUrl(l, href),
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...entry("/", 1, "weekly"),
    ...entry("/models", 0.9, "weekly"),
    ...entry("/art", 0.8, "monthly"),
    ...entry("/contact", 0.7, "yearly"),
    ...MODEL_SLUGS.flatMap((slug) => entry({ pathname: "/models/[slug]", params: { slug } }, 0.8, "monthly")),
  ];
}
