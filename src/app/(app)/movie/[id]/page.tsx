import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Backdrop, Cast, DetailHeader, DetailSkeleton } from "@/components/detail";
import { Row } from "@/components/row";
import { getMovie } from "@/lib/tmdb";

export async function generateMetadata({ params }: PageProps<"/movie/[id]">): Promise<Metadata> {
  const movie = await getMovie(Number((await params).id));
  return movie ? { title: movie.title, description: movie.overview } : {};
}

export default function MoviePage({ params }: PageProps<"/movie/[id]">) {
  return (
    <main className="relative min-h-dvh pb-16">
      <Suspense fallback={<DetailSkeleton />}>
        {params.then(({ id }) => (
          <MovieContent id={Number(id)} />
        ))}
      </Suspense>
    </main>
  );
}

async function MovieContent({ id }: { id: number }) {
  if (!Number.isInteger(id) || id <= 0) notFound();
  const movie = await getMovie(id);
  if (!movie) notFound();

  return (
    <>
      <Backdrop path={movie.backdrop} />
      <div className="relative px-gutter pt-[30svh] md:pt-[34svh]">
        <DetailHeader item={movie} />
      </div>
      <div className="relative mt-12 space-y-2">
        <Cast cast={movie.cast} />
        <Row title="More Like This" items={movie.recommendations} />
      </div>
    </>
  );
}
