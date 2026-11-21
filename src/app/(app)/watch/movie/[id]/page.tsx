import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Player, PlayerSkeleton } from "@/components/player";
import { getMovie, parseId, PLACEHOLDER_ID } from "@/lib/tmdb";

// See PLACEHOLDER_ID: lets each title page be cached after its first visit.
export function generateStaticParams() {
  return [{ id: PLACEHOLDER_ID }];
}

export async function generateMetadata({ params }: PageProps<"/watch/movie/[id]">): Promise<Metadata> {
  const id = parseId((await params).id);
  const movie = id ? await getMovie(id) : null;
  return movie ? { title: `Watch ${movie.title}` } : {};
}

export default function WatchMoviePage({ params }: PageProps<"/watch/movie/[id]">) {
  return (
    <Suspense fallback={<PlayerSkeleton />}>
      {params.then(({ id }) => (
        <WatchMovie id={Number(id)} />
      ))}
    </Suspense>
  );
}

async function WatchMovie({ id }: { id: number }) {
  if (!Number.isInteger(id) || id <= 0) notFound();
  const movie = await getMovie(id);
  if (!movie) notFound();
  return (
    <Player
      id={movie.id}
      type="movie"
      title={movie.title}
      poster={movie.poster}
      backdrop={movie.backdrop}
      year={movie.year}
      backHref={`/movie/${movie.id}`}
      overview={movie.overview}
      rating={movie.rating}
      genres={movie.genres.map((g) => g.name)}
      related={movie.recommendations}
      runtimeMinutes={movie.runtime}
    />
  );
}
