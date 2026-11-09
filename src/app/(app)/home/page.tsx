import Link from "next/link";
import { Suspense } from "react";
import { ContinueWatching } from "@/components/continue-watching";
import { Hero, HeroSkeleton } from "@/components/hero";
import { Row, RowHeader, RowSkeleton } from "@/components/row";
import { SetupNotice } from "@/components/setup-notice";
import { TopTen } from "@/components/top-ten";
import { COLLECTIONS, type CollectionSlug } from "@/lib/collections";
import { getGenres, getHeroItems, getTrending, hasTmdbKey } from "@/lib/tmdb";

export default function HomePage() {
  if (!hasTmdbKey()) return <SetupNotice />;
  return (
    <main className="pb-16">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
      <div className="relative z-10 -mt-6 space-y-2 md:-mt-12">
        <ContinueWatching />
        <Suspense fallback={<RowSkeleton />}>
          <TopTenSection />
        </Suspense>
        <Suspense fallback={<RowSkeleton />}>
          <Rows />
        </Suspense>
      </div>
    </main>
  );
}

async function HeroSection() {
  return <Hero items={await getHeroItems()} />;
}

async function TopTenSection() {
  const [movies, shows] = await Promise.all([getTrending("movie", "day"), getTrending("tv", "day")]);
  return <TopTen movies={movies} shows={shows} />;
}

async function Rows() {
  const slugs = Object.keys(COLLECTIONS) as CollectionSlug[];
  const lists = await Promise.all(slugs.map((slug) => COLLECTIONS[slug].fetch(1)));
  const [first, ...rest] = slugs;
  return (
    <>
      <Row title={COLLECTIONS[first].title} items={lists[0]} href={`/collection/${first}`} />
      <Suspense fallback={null}>
        <GenreStrip />
      </Suspense>
      {rest.map((slug, i) => (
        <Row key={slug} title={COLLECTIONS[slug].title} items={lists[i + 1]} href={`/collection/${slug}`} />
      ))}
    </>
  );
}

async function GenreStrip() {
  const genres = await getGenres("movie");
  if (genres.length === 0) return null;
  return (
    <section className="py-5">
      <RowHeader title="Browse by genre" href="/movies" />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-gutter">
        {genres.map((g) => (
          <Link
            key={g.id}
            href={`/movies?genre=${g.id}`}
            className="shrink-0 rounded-full bg-surface px-4 py-2 text-sm text-muted ring-1 ring-line transition hover:bg-surface-2 hover:text-text hover:ring-accent/40"
          >
            {g.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
