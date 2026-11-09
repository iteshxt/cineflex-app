import { Suspense } from "react";
import { ContinueWatching } from "@/components/continue-watching";
import { Hero, HeroSkeleton } from "@/components/hero";
import { Row, RowSkeleton } from "@/components/row";
import { SetupNotice } from "@/components/setup-notice";
import { TopTen } from "@/components/top-ten";
import { discover, getHeroItems, getList, getTrending, hasTmdbKey } from "@/lib/tmdb";

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
  const [trendingWeek, popularTv, nowPlaying, topMovies, topTv, scifi, animation, crime] = await Promise.all([
    getTrending("all", "week"),
    getList("tv", "popular"),
    getList("movie", "now_playing"),
    getList("movie", "top_rated"),
    getList("tv", "top_rated"),
    discover("movie", { genre: 878 }),
    discover("movie", { genre: 16 }),
    discover("tv", { genre: 80 }),
  ]);
  return (
    <>
      <Row title="Trending This Week" items={trendingWeek} />
      <Row title="New in Theaters" items={nowPlaying} href="/movies?sort=new" />
      <Row title="Popular Series" items={popularTv} href="/tv" />
      <Row title="Critically Acclaimed Films" items={topMovies} href="/movies?sort=top" />
      <Row title="Sci-Fi Worlds" items={scifi} href="/movies?genre=878" />
      <Row title="Binge-worthy Series" items={topTv} href="/tv?sort=top" />
      <Row title="Animated" items={animation} href="/movies?genre=16" />
      <Row title="Crime Series" items={crime} href="/tv?genre=80" />
    </>
  );
}
