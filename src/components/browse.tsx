import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { filtersHref, parseFilters } from "@/lib/filters";
import { discover, getGenres } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";
import { PosterCard, PosterSkeleton } from "./cards";
import { FilterBar } from "./filter-bar";

const GRID = "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 xl:grid-cols-5 2xl:grid-cols-6";

export async function Browse({
  type,
  searchParams,
}: {
  type: MediaType;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page, ...filters } = parseFilters(await searchParams);
  const base = type === "movie" ? "/movies" : "/tv";
  const opts = {
    genre: filters.genre,
    sort: filters.sort,
    decade: filters.decade,
    minRating: filters.rating,
    language: filters.lang,
  };

  // Two TMDB pages (40 titles) per Cineflex page.
  const [genres, a, b] = await Promise.all([
    getGenres(type),
    discover(type, { ...opts, page: page * 2 - 1 }),
    discover(type, { ...opts, page: page * 2 }),
  ]);
  const seen = new Set<number>();
  const items = [...a, ...b].filter((i) => i.poster && !seen.has(i.id) && seen.add(i.id));
  const pageHref = (p: number) => {
    const h = filtersHref(base, filters);
    return p > 1 ? `${h}${h.includes("?") ? "&" : "?"}page=${p}` : h;
  };

  return (
    <>
      <div className="sticky top-0 z-20 -mx-gutter mb-6 bg-bg/85 px-gutter py-3 backdrop-blur-xl">
        <FilterBar base={base} filters={filters} genres={genres} />
      </div>
      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg font-medium">No titles match these filters.</p>
          <Link href={filtersHref(base, { sort: filters.sort })} className="mt-2 inline-block text-sm text-accent hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <div className={GRID}>
            {items.map((item) => (
              <PosterCard key={item.id} item={item} sizes="(min-width: 1280px) 16vw, (min-width: 640px) 25vw, 33vw" />
            ))}
          </div>
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
            {page > 1 ? (
              <PageLink href={pageHref(page - 1)}>
                <ChevronLeft className="size-4" /> Previous
              </PageLink>
            ) : null}
            <span className="px-3 text-sm text-faint">Page {page}</span>
            {b.length > 0 && page < 50 ? (
              <PageLink href={pageHref(page + 1)}>
                Next <ChevronRight className="size-4" />
              </PageLink>
            ) : null}
          </nav>
        </>
      )}
    </>
  );
}

function PageLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-surface px-4 text-sm ring-1 ring-line transition hover:bg-surface-2 hover:ring-accent/40"
    >
      {children}
    </Link>
  );
}

export function BrowseSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mb-6 flex gap-2 py-3">
        <div className="skeleton h-9 w-64 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
      </div>
      <div className={GRID}>
        {Array.from({ length: 18 }, (_, i) => (
          <PosterSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
