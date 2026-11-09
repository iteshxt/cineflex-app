import "server-only";
import { getList, getTrending } from "./tmdb";
import type { MediaItem } from "./types";

/** Curated lists shown as rows on the home page, each with a full "See all" page. */
export const COLLECTIONS = {
  trending: {
    title: "Trending This Week",
    blurb: "What everyone is watching right now.",
    fetch: (page: number) => getTrending("all", "week", page),
  },
  "in-theaters": {
    title: "New in Theaters",
    blurb: "Films currently on the big screen.",
    fetch: (page: number) => getList("movie", "now_playing", page),
  },
  "popular-series": {
    title: "Popular Series",
    blurb: "The shows with the most buzz.",
    fetch: (page: number) => getList("tv", "popular", page),
  },
  "acclaimed-films": {
    title: "Critically Acclaimed Films",
    blurb: "The highest-rated movies of all time.",
    fetch: (page: number) => getList("movie", "top_rated", page),
  },
  "binge-worthy": {
    title: "Binge-worthy Series",
    blurb: "Top-rated shows worth clearing a weekend for.",
    fetch: (page: number) => getList("tv", "top_rated", page),
  },
} satisfies Record<string, { title: string; blurb: string; fetch: (page: number) => Promise<MediaItem[]> }>;

export type CollectionSlug = keyof typeof COLLECTIONS;

export function isCollection(slug: string): slug is CollectionSlug {
  return Object.hasOwn(COLLECTIONS, slug);
}

/** Fetch several TMDB pages and de-duplicate (lists shift slightly between pages). */
export async function getCollectionItems(slug: CollectionSlug, pages = 3): Promise<MediaItem[]> {
  const results = await Promise.all(Array.from({ length: pages }, (_, i) => COLLECTIONS[slug].fetch(i + 1)));
  const seen = new Set<string>();
  return results.flat().filter((i) => {
    const k = `${i.type}-${i.id}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return Boolean(i.poster);
  });
}
