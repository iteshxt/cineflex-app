"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ListVideo, RotateCw, ShieldCheck, ShieldOff, X } from "lucide-react";
import { tmdbImage } from "@/lib/image";
import { recordProgress } from "@/lib/library";
import { updateSettings, useSettings } from "@/lib/settings";
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

const SANDBOX = "allow-scripts allow-same-origin allow-forms allow-presentation allow-orientation-lock";
const noopSubscribe = () => () => {};

const WIDE = "(min-width: 768px)";
const PLAYER_SCALE = { standard: 1, large: 1.15, larger: 1.3 } as const;
function subscribeWide(cb: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const epHref = (id: number, e: Ep) => `/watch/tv/${id}/${e.season}/${e.episode}`;

export function Player({ id, type, title, poster, backdrop, year, backHref, current, prev, next, episodes }: Props) {
  const router = useRouter();
  const [reloadKey, setReloadKey] = useState(0);
  const settings = useSettings();
  // Mount the frame only after hydration, once saved settings (accent, shield) are known,
  // so it doesn't load once with defaults and then reload.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const shield = settings.adShield;
  const toggleShield = () => updateSettings({ adShield: !shield });
  const [drawer, setDrawer] = useState(false);
  // seconds left before auto-advancing, "manual" when autoplay-next is off, null when hidden
  const [upNext, setUpNext] = useState<number | "manual" | null>(null);
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => true);
  // Scale the embed up so its own controls are larger. Phones keep 1:1 (already tight on space).
  const scale = wide ? (PLAYER_SCALE[settings.playerSize] ?? PLAYER_SCALE.large) : 1;

  const embed = {
    color: settings.accent,
    autoplay: settings.autoplay,
    title: current ? `${title} — S${current.season} E${current.episode}` : title,
    poster: tmdbImage(backdrop, "w1280"),
    lang: settings.audioLanguage,
    subtitleButton: settings.subtitleButton,
    settingsMenu: settings.playerSettingsMenu,
    showRelated: settings.showRelated,
  };
  const src =
    type === "movie"
      ? movieEmbedUrl(id, embed)
      : episodeEmbedUrl(id, current?.season ?? 1, current?.episode ?? 1, embed);

  // Next.js keeps visited pages alive (hidden) for back/forward. Reset transient UI when
  // this page is hidden so it doesn't come back with a drawer or countdown open.
  useLayoutEffect(
    () => () => {
      setDrawer(false);
      setUpNext(null);
    },
    [],
  );

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
      if (ev === "ended" && next) setUpNext(settings.autoplayNext ? 10 : "manual");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [save, next, settings.autoplayNext]);

  // Up-next countdown
  useEffect(() => {
    if (typeof upNext !== "number" || !next) return;
    if (upNext <= 0) {
      router.push(epHref(id, next));
      return;
    }
    const t = setTimeout(() => setUpNext((n) => (typeof n === "number" ? n - 1 : n)), 1000);
    return () => clearTimeout(t);
  }, [upNext, next, id, router]);

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

  const subtitle = current
    ? `S${current.season} · E${current.episode}${current.name ? ` — ${current.name}` : ""}`
    : [type === "movie" ? "Movie" : "Series", year].filter(Boolean).join(" · ");

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {hydrated && (
        <PlayerFrame
          key={`${src}-${reloadKey}-${shield}`}
          src={src}
          shield={shield}
          scale={scale}
          title={`${title}${current ? ` S${current.season}E${current.episode}` : ""}`}
        />
      )}

      {/* Floating frosted-glass controls, top centre: the embedded player keeps its own title at
          top-left and its server picker at top-right, so the centre is the one place that never
          overlaps. Always visible. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-3 pt-[max(12px,env(safe-area-inset-top))]">
        <div className="pointer-events-auto flex max-w-[min(680px,100%)] items-center gap-1 rounded-full bg-white/[0.08] p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_12px_40px_-8px_rgb(0_0_0/0.6)] ring-1 ring-white/15 backdrop-blur-2xl backdrop-saturate-150">
          <PillLink label="Back" href={backHref}>
            <ArrowLeft className="size-[18px]" />
          </PillLink>
          <div className="hidden min-w-0 px-2 sm:block">
            <p className="truncate text-sm font-semibold leading-tight">{title}</p>
            <p className="truncate text-[11px] leading-tight text-muted">{subtitle}</p>
          </div>
          <span className="mx-0.5 hidden h-6 w-px bg-white/10 sm:block" aria-hidden="true" />
          <PillButton
            label={shield ? "Ad shield on — blocking pop-ups and redirects. Turn off only if the video won't load." : "Ad shield off"}
            onClick={toggleShield}
            active={shield}
          >
            {shield ? <ShieldCheck className="size-[18px]" /> : <ShieldOff className="size-[18px]" />}
          </PillButton>
          <PillButton label="Reload player" onClick={() => setReloadKey((k) => k + 1)}>
            <RotateCw className="size-4" />
          </PillButton>
          {type === "tv" && (
            <>
              {prev ? (
                <PillLink label="Previous episode" href={epHref(id, prev)}>
                  <ChevronLeft className="size-5" />
                </PillLink>
              ) : null}
              {next ? (
                <PillLink label="Next episode" href={epHref(id, next)}>
                  <ChevronRight className="size-5" />
                </PillLink>
              ) : null}
              <PillButton label="Episodes" onClick={() => setDrawer(true)}>
                <ListVideo className="size-[18px]" />
              </PillButton>
            </>
          )}
        </div>
      </div>

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
          <p className="text-xs uppercase tracking-[0.16em] text-faint">
            {typeof upNext === "number" ? `Up next in ${upNext}s` : "Up next"}
          </p>
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

function IconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={`flex size-10 items-center justify-center rounded-full backdrop-blur transition hover:bg-white/20 ${
        active ? "bg-accent/15 text-accent" : "bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * The embed iframe. Its src is set imperatively so that when Next.js hides this page
 * (navigating away keeps it alive in an <Activity>), the cleanup can blank the frame and
 * actually stop playback instead of letting it run in the background.
 */
function PlayerFrame({ src, shield, scale, title }: { src: string; shield: boolean; scale: number; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useLayoutEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    frame.src = src;
    return () => {
      frame.src = "about:blank";
    };
  }, [src]);
  return (
    <iframe
      ref={ref}
      title={title}
      // Rendered smaller and scaled up so the player's own controls appear larger.
      // Browsers drop the transform in fullscreen, so fullscreen stays 1:1.
      className="absolute left-0 top-0 origin-top-left border-0"
      style={{ width: `${100 / scale}%`, height: `${100 / scale}%`, transform: scale === 1 ? undefined : `scale(${scale})` }}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      referrerPolicy="origin"
      // Ad shield: leaving out allow-popups / allow-top-navigation / allow-modals means
      // clicks inside the player can't open ad tabs, redirect this page, or show alerts.
      sandbox={shield ? SANDBOX : undefined}
    />
  );
}

const PILL =
  "flex size-10 shrink-0 items-center justify-center rounded-full text-text/90 transition hover:bg-white/[0.14] hover:text-text";

function PillButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={`${PILL} ${active ? "text-accent hover:text-accent" : ""}`}
    >
      {children}
    </button>
  );
}

function PillLink({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} title={label} className={PILL}>
      {children}
    </Link>
  );
}

export function PlayerSkeleton() {
  return <div className="fixed inset-0 z-50 bg-black" aria-busy="true" />;
}
