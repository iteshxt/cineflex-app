"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListVideo,
  Maximize2,
  Minimize2,
  RotateCw,
  ShieldCheck,
  ShieldOff,
  Star,
  X,
} from "lucide-react";
import { tmdbImage } from "@/lib/image";
import { getResumePosition, recordProgress, removeProgress } from "@/lib/library";
import { updateSettings, useSettings } from "@/lib/settings";
import {
  episodeEmbedUrl,
  movieEmbedUrl,
  parsePlayerMessage,
} from "@/lib/vidcore";
import type { MediaItem, MediaType } from "@/lib/types";
import { Scroller } from "./scroller";

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
  /** Series only: episode list rendered in the drawer and the sheet */
  episodes?: React.ReactNode;
  /** Length in minutes (from TMDB), used for the resume bar until the player reports one. */
  runtimeMinutes?: number | null;
  /** Shown in the sheet that slides up over the player */
  overview?: string;
  rating?: number;
  genres?: string[];
  related?: MediaItem[];
};

const SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-presentation allow-orientation-lock";
const noopSubscribe = () => () => {};

const WIDE = "(min-width: 768px)";
const PLAYER_SCALE = { standard: 1, large: 1.15, larger: 1.3 } as const;
function subscribeWide(cb: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const epHref = (id: number, e: Ep) =>
  `/watch/tv/${id}/${e.season}/${e.episode}`;

export function Player({
  id,
  type,
  title,
  poster,
  backdrop,
  year,
  backHref,
  current,
  prev,
  next,
  episodes,
  overview,
  rating,
  genres = [],
  related = [],
  runtimeMinutes,
}: Props) {
  const router = useRouter();
  const [reloadKey, setReloadKey] = useState(0);
  const settings = useSettings();
  // Mount the frame only after hydration, once saved settings (accent, shield) are known,
  // so it doesn't load once with defaults and then reload.
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const shield = settings.adShield;
  const toggleShield = () => updateSettings({ adShield: !shield });
  const [drawer, setDrawer] = useState(false);

  // Auto-hiding controls. Pointer movement over the video happens inside the embed's frame
  // and never reaches this page, so the pill reappears from a hover zone at the top centre,
  // when hovered, or while the video is paused.
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const holdControls = useRef(false); // hovered, focused or paused
  const scheduleHide = useCallback((delay = 2500) => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!holdControls.current) setControlsVisible(false);
    }, delay);
  }, []);
  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);
  useEffect(() => {
    scheduleHide(3500);
    return () => clearTimeout(hideTimer.current);
  }, [scheduleHide]);
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const onChange = () => {
      const el = document.fullscreenElement;
      // The embed's own fullscreen button makes its iframe the fullscreen element, which
      // would hide our controls and sheet. Swap it for our page-level fullscreen instead.
      // This relies on the click's user activation; if the browser refuses, the embed's
      // fullscreen simply stays as it was.
      if (el && root.current && el !== root.current && root.current.contains(el)) {
        void document
          .exitFullscreen()
          .then(() => root.current?.requestFullscreen())
          .catch(() => {});
        return;
      }
      setFullscreen(el === root.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  /** Our fullscreen covers the whole CineFlex player page, so the sheet still works in it. */
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen?.().catch(() => {});
  };
  const showSheet = () =>
    sheet.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const hideSheet = () =>
    root.current?.scrollTo({ top: 0, behavior: "smooth" });
  // seconds left before auto-advancing, "manual" when autoplay-next is off, null when hidden
  const [upNext, setUpNext] = useState<number | "manual" | null>(null);
  const wide = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
  // Scale the embed up so its own controls are larger. Phones keep 1:1 (already tight on space).
  const scale = wide
    ? (PLAYER_SCALE[settings.playerSize] ?? PLAYER_SCALE.large)
    : 1;

  // Where to start: the saved position for this title/episode (read once, on the client).
  const [startAt, setStartAt] = useState(() =>
    typeof window === "undefined" ? 0 : getResumePosition(id, type, current?.season, current?.episode),
  );

  const embed = {
    startAt,
    color: settings.accent,
    autoplay: settings.autoplay,
    title: current
      ? `${title} — S${current.season} E${current.episode}`
      : title,
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

  const save = useCallback(
    (position?: number, duration?: number) => {
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
        position: position === undefined ? undefined : Math.floor(position),
        duration: duration === undefined ? undefined : Math.floor(duration),
      });
    },
    [id, type, title, poster, backdrop, year, current?.season, current?.episode, current?.name],
  );

  // Playback position. VidCore only reports play/pause/ended, so position is the time spent
  // playing since the start point, unless an event carries the real time (then that wins).
  // Seeking inside the player isn't visible to us, so the estimate can drift if you skip around.
  const position = useRef(startAt);
  const playingSince = useRef<number | null>(null);
  const duration = useRef(runtimeMinutes ? runtimeMinutes * 60 : undefined);
  const currentPosition = useCallback(
    () => position.current + (playingSince.current ? (Date.now() - playingSince.current) / 1000 : 0),
    [],
  );
  /** Reload the embed at the current position. */
  const reloadPlayer = useCallback(() => {
    position.current = currentPosition();
    playingSince.current = null;
    setStartAt(Math.max(0, Math.floor(position.current) - 3));
    setReloadKey((k) => k + 1);
  }, [currentPosition]);

  const checkpoint = useCallback(() => {
    if (playingSince.current === null) return;
    save(currentPosition(), duration.current);
  }, [save, currentPosition]);
  useEffect(() => {
    const t = setInterval(checkpoint, 15000);
    const onHide = () => checkpoint();
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      clearInterval(t);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [checkpoint]);
  // Leaving the player (Next hides the page): store where we got to.
  useLayoutEffect(
    () => () => {
      checkpoint();
      playingSince.current = null;
    },
    [checkpoint],
  );

  // Opening the player counts as starting it: VidCore autoplays, and its play event may not arrive
  // (e.g. mobile autoplay restrictions), so record immediately and refresh on play.
  useEffect(() => {
    save();
  }, [save]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const msg = parsePlayerMessage(e);
      if (!msg) return;
      if (msg.duration) duration.current = msg.duration;
      if (msg.type === "play") {
        if (msg.time !== undefined) position.current = msg.time;
        playingSince.current = Date.now();
        save(position.current, duration.current);
        holdControls.current = false;
        scheduleHide(1500);
      }
      if (msg.type === "pause") {
        position.current = msg.time ?? currentPosition();
        playingSince.current = null;
        save(position.current, duration.current);
        holdControls.current = true;
        setControlsVisible(true);
      }
      if (msg.type === "ended") {
        playingSince.current = null;
        // Finished: movies leave Continue Watching; episodes keep their place for "next".
        if (type === "movie") removeProgress(id, "movie");
        else save(duration.current ?? currentPosition(), duration.current);
        if (next) setUpNext(settings.autoplayNext ? 10 : "manual");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [save, next, settings.autoplayNext, scheduleHide, currentPosition, type, id]);

  // Up-next countdown
  useEffect(() => {
    if (typeof upNext !== "number" || !next) return;
    if (upNext <= 0) {
      router.push(epHref(id, next));
      return;
    }
    const t = setTimeout(
      () => setUpNext((n) => (typeof n === "number" ? n - 1 : n)),
      1000,
    );
    return () => clearTimeout(t);
  }, [upNext, next, id, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      revealControls();
      if (e.key === "Escape") {
        if (drawer) setDrawer(false);
        else if (upNext !== null) setUpNext(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer, upNext, revealControls]);

  const subtitle = current
    ? `S${current.season} · E${current.episode}${current.name ? ` — ${current.name}` : ""}`
    : [type === "movie" ? "Movie" : "Series", year].filter(Boolean).join(" · ");

  return (
    // The page scrolls on its own: the video is pinned (sticky) and a sheet with details and
    // related titles slides up over it. Scrolling over the video chains through to here.
    <div
      ref={root}
      className="no-scrollbar fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        {hydrated && (
          <PlayerFrame
            key={`${src}-${reloadKey}-${shield}`}
            src={src}
            shield={shield}
            scale={scale}
            title={`${title}${current ? ` S${current.season}E${current.episode}` : ""}`}
            // An ad link replaced the player inside the frame: put the player back where we
            // were. Skipped when the player may legitimately move to related titles.
            onHijacked={settings.showRelated ? undefined : reloadPlayer}
          />
        )}

        {/* Floating frosted-glass controls, top centre: the embedded player keeps its own title at
          top-left and its server picker at top-right, so the centre is the one place that never
          overlaps. Always visible. */}
        {/* Movement over the video happens inside the embed's frame and never reaches this
            page. So while the controls are hidden, a transparent layer covers the player: the
            first move or tap lands here and brings the controls back, then the layer steps
            aside so the video works normally until the controls hide again. */}
        {!controlsVisible && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1] cursor-default"
            onPointerMove={revealControls}
            onPointerDown={revealControls}
            onWheel={revealControls}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex justify-center px-3 pt-[max(12px,env(safe-area-inset-top))]">
          <div
            onPointerEnter={() => {
              holdControls.current = true;
              setControlsVisible(true);
            }}
            onPointerLeave={() => {
              holdControls.current = false;
              scheduleHide();
            }}
            onFocus={() => {
              holdControls.current = true;
              setControlsVisible(true);
            }}
            onBlur={() => {
              holdControls.current = false;
              scheduleHide();
            }}
            className={`flex max-w-[min(680px,100%)] items-center gap-1 rounded-full bg-white/[0.08] p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_12px_40px_-8px_rgb(0_0_0/0.6)] ring-1 ring-white/15 backdrop-blur-2xl backdrop-saturate-150 transition duration-300 ease-out ${
              controlsVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
            }`}
          >
            <PillLink label="Back" href={backHref}>
              <ArrowLeft className="size-[18px]" />
            </PillLink>
            <div className="hidden min-w-0 px-2 sm:block">
              <p className="truncate text-sm font-semibold leading-tight">
                {title}
              </p>
              <p className="truncate text-[11px] leading-tight text-muted">
                {subtitle}
              </p>
            </div>
            <span
              className="mx-0.5 hidden h-6 w-px bg-white/10 sm:block"
              aria-hidden="true"
            />
            <PillButton
              label={
                shield
                  ? "Ad shield on — blocking pop-ups and redirects. Turn off only if the video won't load."
                  : "Ad shield off"
              }
              onClick={toggleShield}
              active={shield}
            >
              {shield ? (
                <ShieldCheck className="size-[18px]" />
              ) : (
                <ShieldOff className="size-[18px]" />
              )}
            </PillButton>
            <PillButton
              label="Reload player"
              onClick={reloadPlayer}
            >
              <RotateCw className="size-4" />
            </PillButton>
            <PillButton
              label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
            >
              {fullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </PillButton>
            <PillButton label="More like this" onClick={showSheet}>
              <LayoutGrid className="size-4" />
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
      </div>

      <PlayerSheet
        ref={sheet}
        title={title}
        subtitle={subtitle}
        overview={overview}
        rating={rating}
        genres={genres}
        related={related}
        episodes={type === "tv" ? episodes : undefined}
        onClose={hideSheet}
      />

      {/* Episodes drawer */}
      {episodes && (
        <>
          <div
            className={`fixed inset-0 z-20 bg-black/50 transition-opacity ${drawer ? "opacity-100" : "pointer-events-none opacity-0"}`}
            onClick={() => setDrawer(false)}
          />
          <aside
            aria-label="Episodes"
            aria-hidden={!drawer}
            inert={!drawer}
            className={`fixed inset-y-0 right-0 z-30 flex w-full max-w-md flex-col bg-bg/95 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out md:p-5 ${
              drawer ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-faint">
                Episodes
              </h2>
              <IconButton
                label="Close episodes"
                onClick={() => setDrawer(false)}
              >
                <X className="size-4" />
              </IconButton>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">{episodes}</div>
          </aside>
        </>
      )}

      {/* Up next */}
      {upNext !== null && next && (
        <div className="fixed bottom-24 right-4 z-20 w-72 rounded-2xl bg-bg/90 p-4 shadow-2xl ring-1 ring-line backdrop-blur-xl md:right-8">
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
function PlayerFrame({
  src,
  shield,
  scale,
  title,
  onHijacked,
}: {
  src: string;
  shield: boolean;
  scale: number;
  title: string;
  /** The frame loaded a second page (e.g. an ad link replaced the player). */
  onHijacked?: () => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  // Counts page loads after we point the frame at the player. The player app itself never
  // reloads the frame, so a second load means something (typically an invisible ad link the
  // provider lays over the video) navigated the frame away from the player.
  const loads = useRef(-1);
  useLayoutEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    loads.current = 0;
    frame.src = src;
    return () => {
      loads.current = -1;
      frame.src = "about:blank";
    };
  }, [src]);
  const onLoad = () => {
    if (loads.current < 0) return; // initial about:blank, or after we blanked it
    loads.current += 1;
    if (loads.current > 1) {
      loads.current = -1;
      onHijacked?.();
    }
  };
  return (
    <iframe
      ref={ref}
      title={title}
      // Rendered smaller and scaled up so the player's own controls appear larger.
      // Browsers drop the transform in fullscreen, so fullscreen stays 1:1.
      className="absolute left-0 top-0 origin-top-left border-0"
      style={{
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transform: scale === 1 ? undefined : `scale(${scale})`,
      }}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      referrerPolicy="origin"
      // Ad shield: leaving out allow-popups / allow-top-navigation / allow-modals means
      // clicks inside the player can't open ad tabs, redirect this page, or show alerts.
      sandbox={shield ? SANDBOX : undefined}
      onLoad={onLoad}
    />
  );
}

type SheetProps = {
  title: string;
  subtitle: string;
  overview?: string;
  rating?: number;
  genres: string[];
  related: MediaItem[];
  episodes?: React.ReactNode;
  onClose: () => void;
  ref: React.Ref<HTMLElement>;
};

/** Frosted sheet below the pinned player; scrolling brings it up over the video. */
function PlayerSheet({
  title,
  subtitle,
  overview,
  rating,
  genres,
  related,
  episodes,
  onClose,
  ref,
}: SheetProps) {
  const items = related.filter((r) => r.backdrop).slice(0, 14);
  return (
    <section
      ref={ref}
      aria-label="Details and more like this"
      className="relative z-10 rounded-t-[28px] bg-bg/80 px-gutter pb-10 pt-3 shadow-[0_-24px_60px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/10 backdrop-blur-2xl backdrop-saturate-150"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Back to the player"
        className="group mx-auto flex flex-col items-center gap-1 px-6 py-1 text-faint transition hover:text-text"
      >
        <span className="h-1 w-10 rounded-full bg-white/20 transition group-hover:bg-white/40" />
        <ChevronDown className="size-4" />
      </button>

      <div className="mt-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted">
          {rating ? (
            <span className="flex items-center gap-1 text-text">
              <Star className="size-3.5 fill-accent text-accent" />
              {rating.toFixed(1)}
            </span>
          ) : null}
          <span>{subtitle}</span>
          {genres.length > 0 && (
            <span className="text-faint">· {genres.join(", ")}</span>
          )}
        </p>
        {overview && <p className="mt-3 line-clamp-3 max-w-3xl leading-relaxed text-text/75">{overview}</p>}

        {episodes && (
          <div className="mt-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-faint">Episodes</h3>
            <div className="flex max-h-[360px] max-w-3xl flex-col">{episodes}</div>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-faint">More like this</h3>
            {/* Full-bleed row: ~3.5 cards on desktop (~2.2 on phones). Arrows on hover, swipe on touch. */}
            <div className="-mx-gutter @container">
              <Scroller>
                {items.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="w-[calc((100cqw-2*var(--gutter)-12px)/2.2)] shrink-0 snap-start md:w-[calc((100cqw-2*var(--gutter)-60px)/3.5)]"
                  >
                    <RelatedCard item={item} />
                  </div>
                ))}
              </Scroller>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Landscape card for the player sheet: backdrop, title and year, links to the title page. */
function RelatedCard({ item }: { item: MediaItem }) {
  return (
    <Link href={`/${item.type}/${item.id}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface ring-1 ring-white/10">
        <Image
          src={tmdbImage(item.backdrop, "w780")!}
          alt=""
          fill
          sizes="(min-width: 768px) 30vw, 45vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute inset-x-3 bottom-2.5">
          <p className="truncate text-sm font-semibold md:text-[15px]">{item.title}</p>
          <p className="text-xs text-muted">
            {item.year || "—"} · {item.type === "movie" ? "Movie" : "Series"}
            {item.rating > 0 ? ` · ★ ${item.rating.toFixed(1)}` : ""}
          </p>
        </div>
      </div>
    </Link>
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

function PillLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} aria-label={label} title={label} className={PILL}>
      {children}
    </Link>
  );
}

export function PlayerSkeleton() {
  return <div className="fixed inset-0 z-50 bg-black" aria-busy="true" />;
}
