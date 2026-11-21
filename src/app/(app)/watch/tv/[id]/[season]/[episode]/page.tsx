import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EpisodesPanel } from "@/components/episodes-panel";
import { Player, PlayerSkeleton } from "@/components/player";
import { getSeason, getShow, parseId, PLACEHOLDER_ID } from "@/lib/tmdb";

type Params = PageProps<"/watch/tv/[id]/[season]/[episode]">["params"];

// See PLACEHOLDER_ID: lets each episode page be cached after its first visit.
export function generateStaticParams() {
  return [{ id: PLACEHOLDER_ID, season: "1", episode: "1" }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id: rawId, season, episode } = await params;
  const id = parseId(rawId);
  const show = id ? await getShow(id) : null;
  return show ? { title: `${show.title} S${season}E${episode}` } : {};
}

export default function WatchEpisodePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PlayerSkeleton />}>
      {params.then(({ id, season, episode }) => (
        <WatchEpisode id={Number(id)} season={Number(season)} episode={Number(episode)} />
      ))}
    </Suspense>
  );
}

async function WatchEpisode({ id, season, episode }: { id: number; season: number; episode: number }) {
  if (!(id > 0) || ![id, season, episode].every((n) => Number.isInteger(n) && n >= 0)) notFound();
  const [show, seasonData] = await Promise.all([getShow(id), getSeason(id, season)]);
  if (!show) notFound();

  const ep = seasonData?.episodes.find((e) => e.number === episode);
  const { prev, next } = await getEpisodeNav(id, season, episode);

  return (
    <Player
      key={`${season}-${episode}`}
      id={show.id}
      type="tv"
      title={show.title}
      poster={show.poster}
      backdrop={show.backdrop}
      year={show.year}
      backHref={`/tv/${show.id}`}
      current={{ season, episode, name: ep?.name }}
      prev={prev}
      next={next}
      overview={ep?.overview || show.overview}
      rating={show.rating}
      genres={show.genres.map((g) => g.name)}
      related={show.recommendations}
      runtimeMinutes={ep?.runtime ?? show.episodeRuntime}
      episodes={
        <EpisodesPanel
          showId={show.id}
          seasons={show.seasons}
          initialSeason={seasonData}
          current={{ season, episode }}
          compact
        />
      }
    />
  );
}

type EpisodeRef = { season: number; episode: number; name?: string };

/**
 * Previous and next episode. "Next" skips episodes that haven't aired, which depends on today's
 * date, so the result is cached for a few hours rather than computed on every request.
 */
async function getEpisodeNav(id: number, season: number, episode: number): Promise<{ prev: EpisodeRef | null; next: EpisodeRef | null }> {
  "use cache";
  cacheLife("hours");
  const [show, seasonData] = await Promise.all([getShow(id), getSeason(id, season)]);
  if (!show) return { prev: null, next: null };

  const episodes = seasonData?.episodes ?? [];
  const idx = episodes.findIndex((e) => e.number === episode);
  const today = new Date().toISOString().slice(0, 10);
  const aired = (e?: { airDate: string | null }) => !!e && (!e.airDate || e.airDate <= today);

  // Previous: earlier episode in this season, else last episode of the previous season.
  let prev: EpisodeRef | null = null;
  if (idx > 0) prev = { season, episode: episodes[idx - 1].number, name: episodes[idx - 1].name };
  else {
    const prevSeason = show.seasons.filter((s) => s.number < season).at(-1);
    if (prevSeason) prev = { season: prevSeason.number, episode: prevSeason.episodeCount };
  }

  // Next: following aired episode in this season, else first episode of the next season.
  let next: EpisodeRef | null = null;
  const following = idx >= 0 ? episodes[idx + 1] : undefined;
  if (following) {
    if (aired(following)) next = { season, episode: following.number, name: following.name };
  } else {
    const nextSeason = show.seasons.find((s) => s.number > season);
    if (nextSeason) {
      const ns = await getSeason(id, nextSeason.number).catch(() => null);
      const first = ns?.episodes[0];
      if (first && aired(first)) next = { season: nextSeason.number, episode: first.number, name: first.name };
    }
  }
  return { prev, next };
}
