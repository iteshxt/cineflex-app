import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Backdrop, Cast, DetailHeader, DetailSkeleton } from "@/components/detail";
import { EpisodesPanel } from "@/components/episodes-panel";
import { ResumeLink } from "@/components/resume-link";
import { Row } from "@/components/row";
import { getSeason, getShow } from "@/lib/tmdb";

export async function generateMetadata({ params }: PageProps<"/tv/[id]">): Promise<Metadata> {
  const show = await getShow(Number((await params).id));
  return show ? { title: show.title, description: show.overview } : {};
}

export default function ShowPage({ params }: PageProps<"/tv/[id]">) {
  return (
    <main className="relative min-h-dvh pb-16">
      <Suspense fallback={<DetailSkeleton />}>
        {params.then(({ id }) => (
          <ShowContent id={Number(id)} />
        ))}
      </Suspense>
    </main>
  );
}

async function ShowContent({ id }: { id: number }) {
  if (!Number.isInteger(id) || id <= 0) notFound();
  const show = await getShow(id);
  if (!show) notFound();
  const first = show.seasons[0]?.number;
  const initialSeason = first != null ? await getSeason(id, first) : null;

  return (
    <>
      <Backdrop path={show.backdrop} />
      <div className="relative grid gap-10 px-gutter pt-[30svh] md:pt-[34svh] xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end xl:pt-[26svh]">
        <div>
          <DetailHeader item={show} />
          <ResumeLink showId={show.id} />
        </div>
        {show.seasons.length > 0 && (
          <section aria-label="Episodes">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-faint">Episodes</h2>
            <EpisodesPanel showId={show.id} seasons={show.seasons} initialSeason={initialSeason} />
          </section>
        )}
      </div>
      <div className="relative mt-14 space-y-2">
        <Cast cast={show.cast} />
        <Row title="More Like This" items={show.recommendations} />
      </div>
    </>
  );
}
