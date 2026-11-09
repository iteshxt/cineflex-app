"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Clock, Info, Loader2, Play, Search, Star, TrendingUp, X } from "lucide-react";
import { tmdbImage } from "@/lib/image";
import { detailHref, watchHref } from "@/lib/routes";
import type { MediaItem } from "@/lib/types";
import { PosterCard } from "./cards";

const GRID = "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 xl:grid-cols-5 2xl:grid-cols-6";

/* -------------------------------------------------------- recent searches */

const RECENT_KEY = "cineflex:recent-searches";
const recentListeners = new Set<() => void>();
let recentCache: { raw: string | null; value: string[] } = { raw: null, value: [] };

function readRecent(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(RECENT_KEY);
  } catch {
    return recentCache.value;
  }
  if (raw === recentCache.raw) return recentCache.value;
  let value: string[] = [];
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    value = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    /* ignore */
  }
  recentCache = { raw, value };
  return value;
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  recentListeners.forEach((l) => l());
}

function addRecent(q: string) {
  const next = [q, ...readRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8);
  writeRecent(next);
}

const EMPTY: string[] = [];
function useRecent() {
  return useSyncExternalStore(
    (cb) => {
      recentListeners.add(cb);
      return () => void recentListeners.delete(cb);
    },
    readRecent,
    () => EMPTY,
  );
}

/* ------------------------------------------------------------------ view */

export function SearchView({ suggestions }: { suggestions: MediaItem[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [results, setResults] = useState<MediaItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const recent = useRecent();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const q = query.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false });
      if (!q) {
        setResults(null);
        setFailed(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data: MediaItem[] = await res.json();
        setResults(data);
        setFailed(false);
        if (data.length > 0 && q.length >= 2) addRecent(q);
      } catch {
        if (!ctrl.signal.aborted) setFailed(true);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, router, attempt]);

  const all = results ?? [];
  const counts = {
    all: all.length,
    movie: all.filter((r) => r.type === "movie").length,
    tv: all.filter((r) => r.type === "tv").length,
  };
  const shown = all.filter((r) => filter === "all" || r.type === filter);
  const [top, ...rest] = shown;
  const q = query.trim();

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <h1 className="sr-only">Search</h1>
        <div className="group relative">
          <Search className="pointer-events-none absolute left-6 top-1/2 size-6 -translate-y-1/2 text-faint transition group-focus-within:text-accent" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Movies, series, anything…"
            aria-label="Search movies and series"
            enterKeyHint="search"
            className="h-16 w-full rounded-full bg-surface pl-16 pr-16 text-lg shadow-2xl shadow-black/40 outline-none ring-1 ring-line transition placeholder:text-faint focus:bg-surface-2 focus:ring-2 focus:ring-accent/60 md:h-[72px] md:text-xl [&::-webkit-search-cancel-button]:hidden"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 className="size-5 animate-spin text-faint" />
            ) : query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="flex size-9 items-center justify-center rounded-full text-faint transition hover:bg-white/5 hover:text-text"
              >
                <X className="size-5" />
              </button>
            ) : (
              <kbd className="hidden rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-faint ring-1 ring-line md:block">
                /
              </kbd>
            )}
          </div>
        </div>
      </div>

      {!q && (
        <div className="mx-auto mt-10 max-w-6xl space-y-12">
          {recent.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-faint">
                  <Clock className="size-4" /> Recent
                </h2>
                <button type="button" onClick={() => writeRecent([])} className="text-xs text-muted hover:text-text">
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setQuery(r)}
                    className="rounded-full bg-surface px-4 py-2 text-sm text-muted ring-1 ring-line transition hover:bg-surface-2 hover:text-text"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </section>
          )}
          {suggestions.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-faint">
                <TrendingUp className="size-4" /> Popular right now
              </h2>
              <div className={GRID}>
                {suggestions.map((item) => (
                  <PosterCard key={`${item.type}-${item.id}`} item={item} sizes="(min-width: 1280px) 16vw, 33vw" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {q && (
        <div className="mx-auto mt-8 max-w-6xl">
          {results && (
            <div className="mb-8 flex justify-center">
              <div role="tablist" aria-label="Filter results" className="flex rounded-full bg-surface p-1 ring-1 ring-line">
                {(["all", "movie", "tv"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="tab"
                    aria-selected={filter === f}
                    onClick={() => setFilter(f)}
                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] transition-colors ${
                      filter === f ? "bg-text font-medium text-black" : "text-muted hover:text-text"
                    }`}
                  >
                    {f === "all" ? "All" : f === "movie" ? "Movies" : "Series"}
                    <span className={filter === f ? "text-black/50" : "text-faint"}>{counts[f]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {failed ? (
            <p className="text-center text-muted">
              Search isn’t responding right now.{" "}
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className="text-accent hover:underline">
                Try again
              </button>
            </p>
          ) : results && shown.length === 0 && !loading ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium">No matches for “{q}”</p>
              <p className="mt-1 text-sm text-muted">Check the spelling, or try the original title.</p>
            </div>
          ) : top ? (
            <div className="space-y-10">
              <TopResult item={top} />
              {rest.length > 0 && (
                <div className={GRID}>
                  {rest.map((item) => (
                    <PosterCard key={`${item.type}-${item.id}`} item={item} sizes="(min-width: 1280px) 16vw, 33vw" />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

function TopResult({ item }: { item: MediaItem }) {
  const backdrop = tmdbImage(item.backdrop, "w1280");
  const poster = tmdbImage(item.poster, "w342");
  return (
    <section aria-label="Top result" className="relative overflow-hidden rounded-3xl bg-surface ring-1 ring-line">
      {backdrop && (
        <Image src={backdrop} alt="" fill sizes="(min-width: 1280px) 1150px, 100vw" className="object-cover opacity-40" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-surface/30" />
      <div className="relative flex gap-5 p-5 md:gap-8 md:p-8">
        {poster && (
          <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/10 md:w-36">
            <Image src={poster} alt="" fill sizes="144px" className="object-cover" />
          </div>
        )}
        <div className="flex min-w-0 flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Top result</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-4xl">{item.title}</h2>
          <p className="mt-2 flex items-center gap-2 text-[13px] text-muted">
            {item.rating > 0 && (
              <span className="flex items-center gap-1 text-text">
                <Star className="size-3.5 fill-accent text-accent" />
                {item.rating.toFixed(1)}
              </span>
            )}
            <span>{item.year || "—"}</span>
            <span className="text-faint">·</span>
            <span>{item.type === "movie" ? "Movie" : "Series"}</span>
          </p>
          {item.overview && (
            <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-text/70 md:text-[15px]">{item.overview}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={watchHref(item)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-text px-5 text-sm font-semibold text-black transition hover:bg-white"
            >
              <Play className="size-4 fill-black" /> Play
            </Link>
            <Link
              href={detailHref(item)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-medium backdrop-blur transition hover:bg-white/20"
            >
              <Info className="size-4" /> Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
