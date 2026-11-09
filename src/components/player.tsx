"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ListVideo, RotateCw, X } from "lucide-react";
import { recordProgress } from "@/lib/library";
import { episodeEmbedUrl, movieEmbedUrl, parsePlayerEvent } from "@/lib/vidcore";
import type { MediaType } from "@/lib/types";

type Ep = { season: number; episode: number; name?: string };

type Props = {
  id: number;
  type: MediaType;
  title: string;
  poster: string | null;
  backdrop: string | null;
  year?: string;
  backHref: string;
  /** Series only */
  current?: Ep;
  prev?: Ep | null;
  next?: Ep | null;
  /** Series only: episode list rendered in the drawer */
  episodes?: React.ReactNode;
};

const epHref = (id: number, e: Ep) => `/watch/tv/${id}/${e.season}/${e.episode}`;

export function Player({ id, type, title, poster, backdrop, year, backHref, current, prev, next, episodes }: Props) {
  const router = useRouter();
  const [reloadKey, setReloadKey] = useState(0);
  const [chrome, setChrome] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [upNext, setUpNext] = useState<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const src =
    type === "movie" ? movieEmbedUrl(id) : episodeEmbedUrl(id, current?.season ?? 1, current?.episode ?? 1);

  const save = useCallback(() => {
    recordProgress({
      id,
      type,
      title,
      poster,
      backdrop,
      year,
      season: current?.season,
      episode: current?.episode,
      episodeName: current?.name,
    });
  }, [id, type, title, poster, backdrop, year, current?.season, current?.episode, current?.name]);

  // Opening the player counts as starting it: VidCore autoplays, and its play event may not arrive
  // (e.g. mobile autoplay restrictions), so record immediately and refresh on play.
  useEffect(() => {
    save();
  }, [save]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const ev = parsePlayerEvent(e);
      if (ev === "play") save();
      if (ev === "ended" && next) setUpNext(10);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [save, next]);

  // Up-next countdown
  useEffect(() => {
    if (upNext === null || !next) return;
    if (upNext <= 0) {
      router.push(epHref(id, next));
      return;
    }
    const t = setTimeout(() => setUpNext((n) => (n === null ? null : n - 1)), 1000);
    return () => clearTimeout(t);
  }, [upNext, next, id, router]);

  // Auto-hide the top bar. Mouse events over the iframe don't reach us, so the bar
  // shows when the pointer is over our own chrome/edges and hides after a pause.
  const poke = useCallback(() => {
    setChrome(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setChrome(false), 3000);
  }, []);
  useEffect(() => {
    hideTimer.current = setTimeout(() => setChrome(false), 3000);
    return () => clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawer) setDrawer(false);
        else if (upNext !== null) setUpNext(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer, upNext]);

  const show = chrome || drawer;

  return (
    <div className="fixed inset-0 z-50 bg-black" onMouseMove={poke}>
      <iframe
        key={`${src}-${reloadKey}`}
        src={src}
        title={`${title}${current ? ` S${current.season}E${current.episode}` : ""}`}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="origin"
      />

      {/* Hover strip that brings the bar back without covering the player controls */}
      <div className="absolute inset-x-0 top-0 h-16" onMouseEnter={poke} />

      <header
        onMouseEnter={poke}
        className={`absolute inset-x-0 top-0 flex items-center gap-3 bg-gradient-to-b from-black/80 to-transparent px-4 pb-10 pt-4 transition-opacity duration-300 md:px-6 ${
          show ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Link
          href={backHref}
          aria-label="Back"
          className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold md:text-base">{title}</p>
          {current && (
            <p className="truncate text-xs text-muted">
              S{current.season} · E{current.episode}
              {current.name ? ` — ${current.name}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <IconButton label="Reload player" onClick={() => setReloadKey((k) => k + 1)}>
            <RotateCw className="size-4" />
          </IconButton>
          {type === "tv" && (
            <>
              {prev ? (
                <IconLink label="Previous episode" href={epHref(id, prev)}>
                  <ChevronLeft className="size-5" />
                </IconLink>
              ) : null}
              {next ? (
                <IconLink label="Next episode" href={epHref(id, next)}>
                  <ChevronRight className="size-5" />
                </IconLink>
              ) : null}
              <IconButton label="Episodes" onClick={() => setDrawer(true)}>
                <ListVideo className="size-4" />
              </IconButton>
            </>
          )}
        </div>
      </header>

      {/* Episodes drawer */}
      {episodes && (
        <>
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity ${drawer ? "opacity-100" : "pointer-events-none opacity-0"}`}
            onClick={() => setDrawer(false)}
          />
          <aside
            aria-label="Episodes"
            aria-hidden={!drawer}
            inert={!drawer}
            className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bg/95 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out md:p-5 ${
              drawer ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-faint">Episodes</h2>
              <IconButton label="Close episodes" onClick={() => setDrawer(false)}>
                <X className="size-4" />
              </IconButton>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">{episodes}</div>
          </aside>
        </>
      )}

      {/* Up next */}
      {upNext !== null && next && (
        <div className="absolute bottom-24 right-4 w-72 rounded-2xl bg-bg/90 p-4 shadow-2xl ring-1 ring-line backdrop-blur-xl md:right-8">
          <p className="text-xs uppercase tracking-[0.16em] text-faint">Up next in {upNext}s</p>
          <p className="mt-1 truncate text-sm font-medium">
            S{next.season} · E{next.episode}
            {next.name ? ` — ${next.name}` : ""}
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href={epHref(id, next)}
              className="flex-1 rounded-full bg-text py-2 text-center text-sm font-semibold text-black hover:bg-white"
            >
              Play now
            </Link>
            <button
              type="button"
              onClick={() => setUpNext(null)}
              className="rounded-full bg-white/10 px-4 text-sm hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20"
    >
      {children}
    </button>
  );
}

function IconLink({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20"
    >
      {children}
    </Link>
  );
}

export function PlayerSkeleton() {
  return <div className="fixed inset-0 z-50 bg-black" aria-busy="true" />;
}
