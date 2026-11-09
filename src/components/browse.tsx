import Link from "next/link";
import { discover, getGenres, type Sort } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";
import { PosterCard, PosterSkeleton } from "./cards";

const SORTS: { key: Sort; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "top", label: "Top rated" },
  { key: "new", label: "Newest" },
];

const GRID = "grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:gap-x-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8";

export async function Browse({
  type,
  searchParams,
}: {
  type: MediaType;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const genre = Number(sp.genre) || undefined;
  const sort: Sort = SORTS.some((s) => s.key === sp.sort) ? (sp.sort as Sort) : "popular";
  const base = type === "movie" ? "/movies" : "/tv";
  const href = (g: number | undefined, s: Sort) => {
    const q = new URLSearchParams();
    if (g) q.set("genre", String(g));
    if (s !== "popular") q.set("sort", s);
    const str = q.toString();
    return str ? `${base}?${str}` : base;
  };

  const [genres, page1, page2] = await Promise.all([
    getGenres(type),
    discover(type, { genre, sort, page: 1 }),
    discover(type, { genre, sort, page: 2 }),
  ]);
  const seen = new Set<number>();
  const items = [...page1, ...page2].filter((i) => !seen.has(i.id) && seen.add(i.id));

  return (
    <>
      <div className="sticky top-0 z-20 -mx-gutter mb-6 space-y-3 bg-bg/85 px-gutter py-3 backdrop-blur-xl">
        <nav aria-label="Sort" className="flex gap-1">
          {SORTS.map((s) => (
            <Link
              key={s.key}
              href={href(genre, s.key)}
              aria-current={s.key === sort ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                s.key === sort ? "bg-text font-medium text-black" : "text-muted hover:bg-white/5 hover:text-text"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Genres" className="no-scrollbar -mx-gutter flex gap-1.5 overflow-x-auto px-gutter">
          <GenreChip href={href(undefined, sort)} active={!genre} label="All" />
          {genres.map((g) => (
            <GenreChip key={g.id} href={href(g.id, sort)} active={genre === g.id} label={g.name} />
          ))}
        </nav>
      </div>
      {items.length === 0 ? (
        <p className="py-24 text-center text-muted">Nothing here yet. Try another genre.</p>
      ) : (
        <div className={GRID}>
          {items.map((item) => (
            <PosterCard key={item.id} item={item} sizes="(min-width: 1280px) 16vw, (min-width: 640px) 25vw, 33vw" />
          ))}
        </div>
      )}
    </>
  );
}

function GenreChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full px-3 py-1 text-xs ring-1 transition-colors ${
        active ? "bg-accent/15 text-accent ring-accent/40" : "text-muted ring-line hover:bg-white/5 hover:text-text"
      }`}
    >
      {label}
    </Link>
  );
}

export function BrowseSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mb-6 space-y-3 py-3">
        <div className="skeleton h-8 w-64 rounded-full" />
        <div className="skeleton h-6 w-full max-w-2xl rounded-full" />
      </div>
      <div className={GRID}>
        {Array.from({ length: 18 }, (_, i) => (
          <PosterSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
