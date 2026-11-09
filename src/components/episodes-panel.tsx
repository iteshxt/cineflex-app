"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ChevronDown, EyeOff, Play } from "lucide-react";
import { tmdbImage } from "@/lib/image";
import { useProgress } from "@/lib/library";
import { useSettings } from "@/lib/settings";
import type { Season, SeasonSummary } from "@/lib/types";

type Props = {
  showId: number;
  seasons: SeasonSummary[];
  initialSeason: Season | null;
  /** Highlight this episode (used in the player drawer). */
  current?: { season: number; episode: number };
  compact?: boolean;
};

export function EpisodesPanel({ showId, seasons, initialSeason, current, compact = false }: Props) {
  const progress = useProgress().find((p) => p.type === "tv" && p.id === showId);
  const [picked, setSeasonNo] = useState<number | null>(null);
  const [cache, setCache] = useState<Record<number, Season>>(initialSeason ? { [initialSeason.number]: initialSeason } : {});
  const defaults = useSettings();
  const [spoilerChoice, setSpoilerSafe] = useState<boolean | null>(null);
  const spoilerSafe = spoilerChoice ?? defaults.spoilerProtection;
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState<number | null>(null);

  // Until the viewer picks a season, open the one they were last watching (detail page only).
  const lastSeason = progress?.season;
  const seasonNo =
    picked ??
    (!current && lastSeason && seasons.some((s) => s.number === lastSeason)
      ? lastSeason
      : (initialSeason?.number ?? seasons[0]?.number ?? 1));
  const error = failed === seasonNo;

  useEffect(() => {
    if (cache[seasonNo]) return;
    let cancelled = false;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/tv/${showId}/season/${seasonNo}`);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Season;
        if (!cancelled) setCache((c) => ({ ...c, [seasonNo]: data }));
      } catch {
        if (!cancelled) setFailed(seasonNo);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [seasonNo, showId, cache]);

  const season = cache[seasonNo];
  const watchedUpTo =
    progress?.season != null && progress.episode != null ? progress.season * 10000 + progress.episode : -1;

  return (
    <div className={`flex min-h-0 flex-col ${compact ? "" : "rounded-2xl bg-surface/70 p-4 ring-1 ring-line backdrop-blur-xl md:p-5"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <select
            aria-label="Season"
            value={seasonNo}
            onChange={(e) => setSeasonNo(Number(e.target.value))}
            className="appearance-none rounded-full bg-surface-2 py-2 pl-4 pr-9 text-sm font-medium ring-1 ring-line outline-none hover:bg-white/10"
          >
            {seasons.map((s) => (
              <option key={s.number} value={s.number}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        </div>
        <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-muted">
          <EyeOff className="size-4" />
          <span className="hidden sm:inline">Spoiler protection</span>
          <input
            type="checkbox"
            checked={spoilerSafe}
            onChange={(e) => setSpoilerSafe(e.target.checked)}
            className="peer sr-only"
          />
          <span className="relative h-5 w-9 rounded-full bg-surface-2 ring-1 ring-line transition peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-accent after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-text after:transition peer-checked:after:translate-x-4 peer-checked:after:bg-black" />
        </label>
      </div>

      <ol
        className={`thin-scrollbar mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 ${
          compact ? "" : "max-h-[min(440px,48svh)]"
        } ${pending ? "opacity-60" : ""}`}
      >
        {error && <li className="p-4 text-sm text-muted">Couldn’t load this season. Try another or reload.</li>}
        {!season &&
          !error &&
          Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex gap-3 p-2">
              <div className="skeleton aspect-video w-32 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2 py-1">
                <div className="skeleton h-3 w-2/3 rounded" />
                <div className="skeleton h-2.5 w-full rounded" />
              </div>
            </li>
          ))}
        {season?.episodes.map((ep) => {
          const isCurrent = current?.season === ep.season && current.episode === ep.number;
          const watched = ep.season * 10000 + ep.number <= watchedUpTo;
          const hide = spoilerSafe && !watched && !isCurrent;
          const aired = !ep.airDate || new Date(ep.airDate) <= new Date();
          const still = tmdbImage(ep.still, "w300");
          return (
            <li key={ep.number}>
              <Link
                href={`/watch/tv/${showId}/${ep.season}/${ep.number}`}
                aria-current={isCurrent ? "true" : undefined}
                className={`group flex gap-3 rounded-xl p-2 transition-colors ${
                  isCurrent ? "bg-white/10" : "hover:bg-white/5"
                } ${aired ? "" : "pointer-events-none opacity-50"}`}
              >
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-surface-2 md:w-36">
                  {still && (
                    <Image
                      src={still}
                      alt=""
                      fill
                      sizes="144px"
                      className={`object-cover transition ${hide ? "scale-110 blur-lg" : ""}`}
                    />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="size-6 fill-white text-white" />
                  </span>
                  {watched && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-accent" />}
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`truncate text-sm font-medium ${isCurrent ? "text-accent" : ""}`}>
                      {ep.number}. {ep.name}
                    </p>
                    {ep.runtime ? <span className="shrink-0 text-xs text-faint">{ep.runtime}m</span> : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {!aired
                      ? `Airs ${new Date(ep.airDate!).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
                      : hide
                        ? "Hidden to avoid spoilers."
                        : ep.overview || "No description yet."}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
