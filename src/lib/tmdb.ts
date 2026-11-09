import "server-only";
import { cacheLife } from "next/cache";
import type {
  CastMember,
  Episode,
  Genre,
  MediaItem,
  MediaType,
  MovieDetail,
  Season,
  ShowDetail,
} from "./types";

// Overridable so restricted networks can route through a proxy.
const BASE = (process.env.TMDB_API_BASE || "https://api.themoviedb.org/3").replace(/\/$/, "");

export function hasTmdbKey() {
  return Boolean(process.env.TMDB_API_KEY);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Params = Record<string, string | number | undefined>;

/**
 * Returns null when TMDB says the resource doesn't exist (4xx).
 * Throws on transient failures (429, 5xx, network) so they are never cached;
 * the nearest error boundary offers a retry.
 */
async function tmdbStrict<T = any>(path: string, params: Params = {}): Promise<T | null> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;

  const url = new URL(BASE + path);
  const headers: Record<string, string> = { accept: "application/json" };
  // v4 read-access tokens are JWTs; v3 keys are short hex strings.
  if (key.startsWith("eyJ")) headers.authorization = `Bearer ${key}`;
  else url.searchParams.set("api_key", key);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));

  const ATTEMPTS = 3;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      // Time out stalled connections instead of hanging the page stream.
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
      if (res.ok) return (await res.json()) as T;
      if (res.status !== 429 && res.status < 500) return null;
      if (attempt === ATTEMPTS) console.warn(`[tmdb] ${res.status} ${path}`);
    } catch (err) {
      if (attempt === ATTEMPTS) console.warn(`[tmdb] network error ${path}:`, (err as Error).message, String((err as { cause?: unknown }).cause ?? ""));
    }
    if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, 300 * attempt));
  }
  throw new Error(`TMDB is unavailable (${path})`);
}

/** Lenient variant for lists and rows: a failed row renders empty instead of failing the page. */
async function tmdb<T = any>(path: string, params: Params = {}): Promise<T | null> {
  try {
    return await tmdbStrict<T>(path, params);
  } catch {
    return null;
  }
}

function toItem(r: any, fallbackType?: MediaType): MediaItem | null {
  const type: MediaType | undefined = r.media_type === "movie" || r.media_type === "tv" ? r.media_type : fallbackType;
  if (!type) return null;
  const date: string = (type === "movie" ? r.release_date : r.first_air_date) ?? "";
  return {
    id: r.id,
    type,
    title: (type === "movie" ? r.title : r.name) ?? "Untitled",
    overview: r.overview ?? "",
    poster: r.poster_path ?? null,
    backdrop: r.backdrop_path ?? null,
    year: date.slice(0, 4),
    rating: Math.round((r.vote_average ?? 0) * 10) / 10,
    genreIds: r.genre_ids ?? (r.genres ?? []).map((g: Genre) => g.id),
  };
}

function toItems(results: any[] | undefined, type?: MediaType): MediaItem[] {
  return (results ?? []).map((r) => toItem(r, type)).filter((x): x is MediaItem => x !== null);
}

function pickLogo(images: any): string | null {
  const logos: any[] = images?.logos ?? [];
  const en = logos.find((l) => l.iso_639_1 === "en") ?? logos.find((l) => !l.iso_639_1) ?? null;
  return en?.file_path ?? null;
}

function pickTrailer(videos: any): string | null {
  const list: any[] = videos?.results ?? [];
  const v =
    list.find((x) => x.site === "YouTube" && x.type === "Trailer" && x.official) ??
    list.find((x) => x.site === "YouTube" && x.type === "Trailer");
  return v?.key ?? null;
}

function toCast(credits: any): CastMember[] {
  return ((credits?.cast ?? []) as any[]).slice(0, 16).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character ?? "",
    profile: c.profile_path ?? null,
  }));
}

/* ---------------------------------------------------------------- lists */

export async function getTrending(
  type: MediaType | "all",
  window: "day" | "week" = "day",
  page = 1,
): Promise<MediaItem[]> {
  "use cache";
  const data = await tmdb(`/trending/${type}/${window}`, { page });
  if (data) cacheLife("hours");
  else cacheLife("seconds");
  return toItems(data?.results, type === "all" ? undefined : type);
}

export type ListName = "popular" | "top_rated" | "now_playing" | "upcoming" | "on_the_air" | "airing_today";

export async function getList(type: MediaType, list: ListName, page = 1): Promise<MediaItem[]> {
  "use cache";
  const data = await tmdb(`/${type}/${list}`, { page });
  if (data) cacheLife("hours");
  else cacheLife("seconds");
  return toItems(data?.results, type);
}

export type Sort = "popular" | "top" | "new";

const SORTS: Record<MediaType, Record<Sort, string>> = {
  movie: { popular: "popularity.desc", top: "vote_average.desc", new: "primary_release_date.desc" },
  tv: { popular: "popularity.desc", top: "vote_average.desc", new: "first_air_date.desc" },
};

export type DiscoverOptions = {
  genre?: number;
  sort?: Sort;
  page?: number;
  /** Decade start year, e.g. 2010 for 2010–2019. */
  decade?: number;
  /** Minimum TMDB rating, 0–10. */
  minRating?: number;
  /** ISO 639-1 original language, e.g. "hi", "ko". */
  language?: string;
};

export async function discover(type: MediaType, opts: DiscoverOptions = {}): Promise<MediaItem[]> {
  "use cache";
  const sort = opts.sort ?? "popular";
  const today = new Date().toISOString().slice(0, 10);
  const dateKey = type === "movie" ? "primary_release_date" : "first_air_date";
  const from = opts.decade ? `${opts.decade}-01-01` : undefined;
  const decadeEnd = opts.decade ? `${opts.decade + 9}-12-31` : undefined;
  // Never list unreleased titles under "Newest", even within the current decade.
  const to = sort === "new" ? [decadeEnd, today].filter(Boolean).sort()[0] : decadeEnd;
  // Strict: a network failure must not look like "no titles match these filters".
  const data = await tmdbStrict(`/discover/${type}`, {
    sort_by: SORTS[type][sort],
    with_genres: opts.genre,
    with_original_language: opts.language,
    page: opts.page ?? 1,
    include_adult: "false",
    [`${dateKey}.gte`]: from,
    [`${dateKey}.lte`]: to,
    "vote_average.gte": opts.minRating,
    // Keep rankings meaningful: enough votes for "top" and rating filters.
    "vote_count.gte": sort === "top" ? 300 : opts.minRating ? 50 : sort === "new" ? 10 : undefined,
  });
  cacheLife("hours");
  return toItems(data?.results, type);
}

export async function getGenres(type: MediaType): Promise<Genre[]> {
  "use cache";
  const data = await tmdb<{ genres: Genre[] }>(`/genre/${type}/list`);
  if (data) cacheLife("days");
  else cacheLife("seconds");
  return data?.genres ?? [];
}

/** Hero items: trending, with backdrop and logo. */
export async function getHeroItems(): Promise<(MediaItem & { logo: string | null })[]> {
  "use cache";
  cacheLife("hours");
  const items = (await getTrending("all", "day")).filter((i) => i.backdrop && i.overview).slice(0, 6);
  return Promise.all(
    items.map(async (i) => {
      const imgs = await tmdb(`/${i.type}/${i.id}/images`, { include_image_language: "en,null", language: undefined });
      return { ...i, logo: pickLogo(imgs) };
    }),
  );
}

/* --------------------------------------------------------------- detail */

const APPEND = { append_to_response: "images,credits,recommendations,videos", include_image_language: "en,null" };

export async function getMovie(id: number): Promise<MovieDetail | null> {
  "use cache";
  const r = await tmdbStrict(`/movie/${id}`, APPEND);
  if (r) cacheLife("hours");
  else cacheLife("minutes");
  if (!r) return null;
  const base = toItem(r, "movie")!;
  return {
    ...base,
    type: "movie",
    logo: pickLogo(r.images),
    genres: r.genres ?? [],
    tagline: r.tagline ?? "",
    cast: toCast(r.credits),
    recommendations: toItems(r.recommendations?.results, "movie").filter((x) => x.poster),
    trailerKey: pickTrailer(r.videos),
    runtime: r.runtime || null,
  };
}

export async function getShow(id: number): Promise<ShowDetail | null> {
  "use cache";
  const r = await tmdbStrict(`/tv/${id}`, APPEND);
  if (r) cacheLife("hours");
  else cacheLife("minutes");
  if (!r) return null;
  const base = toItem(r, "tv")!;
  return {
    ...base,
    type: "tv",
    logo: pickLogo(r.images),
    genres: r.genres ?? [],
    tagline: r.tagline ?? "",
    cast: toCast(r.credits),
    recommendations: toItems(r.recommendations?.results, "tv").filter((x) => x.poster),
    trailerKey: pickTrailer(r.videos),
    status: r.status ?? "",
    episodeRuntime: r.episode_run_time?.[0] ?? null,
    seasons: ((r.seasons ?? []) as any[])
      .filter((s) => s.season_number > 0 && s.episode_count > 0)
      .map((s) => ({
        number: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        poster: s.poster_path ?? null,
        year: (s.air_date ?? "").slice(0, 4),
      })),
  };
}

export async function getSeason(id: number, season: number): Promise<Season | null> {
  "use cache";
  const r = await tmdbStrict(`/tv/${id}/season/${season}`);
  if (r) cacheLife("hours");
  else cacheLife("minutes");
  if (!r) return null;
  return {
    number: r.season_number,
    name: r.name,
    episodes: ((r.episodes ?? []) as any[]).map(
      (e): Episode => ({
        number: e.episode_number,
        season: e.season_number,
        name: e.name,
        overview: e.overview ?? "",
        still: e.still_path ?? null,
        runtime: e.runtime ?? null,
        airDate: e.air_date ?? null,
      }),
    ),
  };
}

/* --------------------------------------------------------------- search */

export async function searchMulti(query: string): Promise<MediaItem[]> {
  "use cache";
  const q = query.trim();
  // Strict: a network failure must not look like "no results".
  const data = q ? await tmdbStrict(`/search/multi`, { query: q, include_adult: "false" }) : null;
  cacheLife("minutes");
  return toItems(data?.results).filter((i) => i.poster);
}
