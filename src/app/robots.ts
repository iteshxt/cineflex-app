import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Crawlers that bring no visitors (AI training/scraping and SEO tools). Title pages link to
 * each other without end, so letting these crawl means rendering pages nobody reads.
 */
const BLOCKED_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "CCBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "PerplexityBot",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "FacebookBot",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "Timpibot",
  "PetalBot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "BLEXBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Search engines: everything except the player, the API and URL variations
      // (filters, pages, seasons), which would multiply every page many times over.
      { userAgent: "*", allow: "/", disallow: ["/api/", "/watch/", "/*?"] },
      { userAgent: BLOCKED_BOTS, disallow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
