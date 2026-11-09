"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { PosterCard } from "./cards";

const GRID = "grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:gap-x-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8";

export function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [results, setResults] = useState<MediaItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false });
      if (!q) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        setResults(await res.json());
        setFailed(false);
      } catch {
        if (!ctrl.signal.aborted) setFailed(true);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, router, attempt]);

  const shown = (results ?? []).filter((r) => filter === "all" || r.type === filter);

  return (
    <>
      <div className="relative max-w-3xl">
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-faint" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies and series"
          aria-label="Search movies and series"
          className="h-14 w-full rounded-full bg-surface pl-14 pr-14 text-lg outline-none ring-1 ring-line transition placeholder:text-faint focus:ring-white/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {loading ? (
          <Loader2 className="absolute right-5 top-1/2 size-5 -translate-y-1/2 animate-spin text-faint" />
        ) : query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-faint hover:bg-white/5 hover:text-text"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      {results && (
        <div className="mt-6 flex gap-1" role="tablist" aria-label="Filter results">
          {(["all", "movie", "tv"] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                filter === f ? "bg-text font-medium text-black" : "text-muted hover:bg-white/5 hover:text-text"
              }`}
            >
              {f === "all" ? "All" : f === "movie" ? "Movies" : "Series"}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {failed && query.trim() ? (
          <p className="text-muted">
            Search isn’t responding right now.{" "}
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="text-text underline underline-offset-4">
              Try again
            </button>
          </p>
        ) : results === null ? (
          <p className="text-muted">Find a title by name — results appear as you type.</p>
        ) : shown.length === 0 && !loading ? (
          <p className="text-muted">No matches for “{query.trim()}”.</p>
        ) : (
          <div className={GRID}>
            {shown.map((item) => (
              <PosterCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
