import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/lib/collections";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" | "yearly") => ({
    url: `${SITE.url}${path}`,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/home", 0.9, "daily"),
    page("/movies", 0.8, "daily"),
    page("/tv", 0.8, "daily"),
    page("/search", 0.5, "monthly"),
    ...Object.keys(COLLECTIONS).map((slug) => page(`/collection/${slug}`, 0.6, "daily")),
    page("/about", 0.5, "monthly"),
    page("/faq", 0.5, "monthly"),
    page("/developer", 0.4, "monthly"),
    page("/contact", 0.4, "yearly"),
    ...["/privacy", "/terms", "/cookies", "/disclaimer", "/dmca", "/legal"].map((p) => page(p, 0.2, "yearly")),
  ];
}
