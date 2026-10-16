import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { "es-PE": `${SITE_URL}/es`, en: `${SITE_URL}/en` };
  return (["es", "en"] as const).map((lang) => ({
    url: `${SITE_URL}/${lang}`,
    changeFrequency: "monthly",
    priority: lang === "es" ? 1 : 0.9,
    alternates: { languages },
  }));
}
