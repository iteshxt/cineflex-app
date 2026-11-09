/** Browse filter definitions, shared by the server page and the client filter bar. */

export type Filters = {
  sort: "popular" | "top" | "new";
  genre?: number;
  decade?: number;
  rating?: number;
  lang?: string;
};

export type Option = { value: string | number | undefined; label: string };

export const SORT_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "top", label: "Top rated" },
  { value: "new", label: "Newest" },
] as const;

export const DECADES: Option[] = [2020, 2010, 2000, 1990, 1980, 1970].map((d) => ({ value: d, label: `${d}s` }));
export const RATINGS: Option[] = [8, 7, 6].map((r) => ({ value: r, label: `${r}+ ★` }));
export const LANGUAGES: Option[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ko", label: "Korean" },
  { value: "ja", label: "Japanese" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
];

export function filtersHref(base: string, f: Filters) {
  const q = new URLSearchParams();
  if (f.sort !== "popular") q.set("sort", f.sort);
  if (f.genre) q.set("genre", String(f.genre));
  if (f.decade) q.set("decade", String(f.decade));
  if (f.rating) q.set("rating", String(f.rating));
  if (f.lang) q.set("lang", f.lang);
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

const SORTS = new Set(["popular", "top", "new"]);

/** Parse and validate browse filters from URL search params. */
export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters & { page: number } {
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const num = (k: string) => {
    const n = Number(str(k));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const decade = num("decade");
  const rating = num("rating");
  const lang = str("lang");
  return {
    sort: SORTS.has(str("sort") ?? "") ? (str("sort") as Filters["sort"]) : "popular",
    genre: num("genre"),
    decade: DECADES.some((d) => d.value === decade) ? decade : undefined,
    rating: RATINGS.some((r) => r.value === rating) ? rating : undefined,
    lang: lang && /^[a-z]{2}$/.test(lang) ? lang : undefined,
    page: Math.min(num("page") ?? 1, 50),
  };
}
