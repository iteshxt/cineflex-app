"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight, Play, Plus, Star } from "lucide-react";
import { genreNames } from "@/lib/genres";
import { tmdbImage } from "@/lib/image";
import { useInMyList } from "@/lib/library";
import { getSettings } from "@/lib/settings";
import { detailHref, watchHref } from "@/lib/routes";
import type { MediaItem } from "@/lib/types";

// Opens only once the cursor has rested on a poster this long, so sweeping across rows or
// scrolling past titles never triggers it.
const OPEN_DELAY = 700;
/** Movement (px) that counts as "still moving" and restarts the wait. */
const REST_TOLERANCE = 6;
const CLOSE_DELAY = 200; // grace period for crossing the gap from card to preview
const WIDTH = 400;
const EDGE = 12;
const EST_HEIGHT = 450;

type Pos = { left: number; top: number; centerY: number };
type Open = { pos: Pos; leaving: boolean };

/** The element the preview morphs out of: the poster image if marked, else the whole card. */
function sourceRect(anchor: HTMLElement) {
  return (
    anchor.querySelector("[data-preview-source]") ?? anchor
  ).getBoundingClientRect();
}

/**
 * Expand in place: centred over the hovered poster (kept on screen). The vertical position is
 * refined once the panel's real height is known.
 */
function place(r: DOMRect): Pos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const centerX = r.left + r.width / 2;
  const centerY = r.top + r.height / 2;
  const left = Math.min(Math.max(centerX - WIDTH / 2, EDGE), vw - WIDTH - EDGE);
  const top = Math.min(Math.max(centerY - EST_HEIGHT / 2, EDGE), vh - EST_HEIGHT - EDGE);
  return { left, top, centerY };
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Wraps a poster card. On mouse hover it opens a larger preview with details and actions,
 * expanding in place over the card. The preview morphs out of the poster (and back into it on close) and is
 * rendered in a portal so scroll containers can't clip it.
 */
export function HoverPreview({
  item,
  className,
  children,
}: {
  item: MediaItem;
  className?: string;
  children: React.ReactNode;
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState<Open | null>(null);

  /** Remove immediately (scroll, navigation, Escape). */
  const dismiss = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    setOpen(null);
  }, []);

  /** Animate back into the card after a short grace period. */
  const scheduleClose = () => {
    cancelPending();
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(
      () => setOpen((o) => (o ? { ...o, leaving: true } : null)),
      CLOSE_DELAY,
    );
  };

  const cancelClose = () => {
    clearTimeout(closeTimer.current);
    setOpen((o) => (o && o.leaving ? { ...o, leaving: false } : o));
  };

  const restPoint = useRef<{ x: number; y: number } | null>(null);

  const scrollWhileWaiting = useRef<(() => void) | undefined>(undefined);

  /** Stop waiting to open (pointer left, kept moving, or the page scrolled). */
  const cancelPending = useCallback(() => {
    clearTimeout(openTimer.current);
    restPoint.current = null;
    const listener = scrollWhileWaiting.current;
    if (listener) {
      window.removeEventListener("scroll", listener, true);
      window.removeEventListener("wheel", listener);
      scrollWhileWaiting.current = undefined;
    }
  }, []);

  const startWaiting = (x: number, y: number) => {
    cancelPending();
    restPoint.current = { x, y };
    // Any scroll while we wait means the viewer is browsing, not choosing.
    const listener = () => cancelPending();
    scrollWhileWaiting.current = listener;
    window.addEventListener("scroll", listener, { capture: true, passive: true });
    window.addEventListener("wheel", listener, { passive: true });
    openTimer.current = setTimeout(() => {
      cancelPending();
      if (anchor.current) setOpen({ pos: place(sourceRect(anchor.current)), leaving: false });
    }, OPEN_DELAY);
  };

  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !getSettings().hoverPreviews) return;
    cancelClose();
    startWaiting(e.clientX, e.clientY);
  };

  // The wait restarts while the cursor keeps moving: it only opens once it rests.
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || open) return;
    const p = restPoint.current;
    if (!p) return startWaiting(e.clientX, e.clientY);
    if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > REST_TOLERANCE) startWaiting(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("scroll", dismiss, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", dismiss);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", dismiss, { capture: true });
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);
  useLayoutEffect(
    () => () => {
      dismiss();
      cancelPending();
    },
    [dismiss, cancelPending],
  );

  // Stable callbacks so re-renders (e.g. toggling My List) don't restart the animations.
  const getSource = useCallback(() => (anchor.current ? sourceRect(anchor.current) : null), []);
  const onClosed = useCallback(() => setOpen(null), []);

  return (
    <div
      ref={anchor}
      className={className}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={scheduleClose}
      onClickCapture={dismiss}
    >
      {children}
      {open &&
        createPortal(
          <Preview
            item={item}
            pos={open.pos}
            leaving={open.leaving}
            source={getSource}
            onEnter={cancelClose}
            onLeave={scheduleClose}
            onClosed={onClosed}
            onNavigate={dismiss}
          />,
          document.body,
        )}
    </div>
  );
}

function Preview({
  item,
  pos,
  leaving,
  source,
  onEnter,
  onLeave,
  onClosed,
  onNavigate,
}: {
  item: MediaItem;
  pos: Pos;
  leaving: boolean;
  source: () => DOMRect | null;
  onEnter: () => void;
  onLeave: () => void;
  onClosed: () => void;
  onNavigate: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  /**
   * A uniform zoom between the poster and the full card: scale = poster width / card width,
   * anchored at the poster's centre, so the card visibly grows out of (and back into) the
   * poster rather than stretching or fading.
   */
  const zoomFromCard = useCallback(() => {
    const el = ref.current;
    const from = source();
    if (!el || !from) return null;
    const to = el.getBoundingClientRect();
    return {
      scale: Math.min(1, from.width / to.width),
      origin: `${from.left + from.width / 2 - to.left}px ${from.top + from.height / 2 - to.top}px`,
    };
  }, [source]);

  // Enter: centre on the poster using the real height, then zoom up out of it.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = el.offsetHeight;
    const top = Math.min(Math.max(pos.centerY - h / 2, EDGE), Math.max(EDGE, window.innerHeight - h - EDGE));
    el.style.top = `${top}px`;
    if (prefersReducedMotion()) return;
    const zoom = zoomFromCard();
    if (!zoom) return;
    // The card opens on top of the poster, under the cursor. Ignore the pointer while it
    // animates so the poster never sees a "leave" it can't get back (no event fires when an
    // element moves under a still cursor), which would close the preview again.
    el.style.pointerEvents = "none";
    el.style.transformOrigin = zoom.origin;
    const anim = el.animate(
      [
        { transform: `scale(${zoom.scale})`, opacity: 0.85, borderRadius: "12px" },
        { transform: "scale(1)", opacity: 1, borderRadius: "20px" },
      ],
      { duration: 320, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.04)" },
    );
    anim.onfinish = anim.oncancel = () => {
      el.style.pointerEvents = "";
    };
  }, [pos.centerY, zoomFromCard]);

  // Leave: zoom back down into the poster, then unmount.
  useEffect(() => {
    if (!leaving) return;
    const el = ref.current;
    const zoom = zoomFromCard();
    if (!el || !zoom || prefersReducedMotion()) {
      onClosed();
      return;
    }
    el.style.pointerEvents = "none";
    el.style.transformOrigin = zoom.origin;
    const anim = el.animate(
      [
        { transform: "scale(1)", opacity: 1, borderRadius: "20px" },
        { transform: `scale(${zoom.scale})`, opacity: 0, borderRadius: "12px" },
      ],
      { duration: 220, easing: "cubic-bezier(0.4, 0, 0.7, 1)", fill: "forwards" },
    );
    anim.onfinish = onClosed;
    return () => anim.cancel();
  }, [leaving, zoomFromCard, onClosed]);

  const [inList, toggle] = useInMyList(item.id, item.type);
  const image =
    tmdbImage(item.backdrop, "w780") ?? tmdbImage(item.poster, "w500");
  const genres = genreNames(item.genreIds);

  const save = () =>
    toggle({ id: item.id, type: item.type, title: item.title, poster: item.poster, backdrop: item.backdrop, year: item.year });

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={item.title}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="fixed z-[60] origin-top-left overflow-hidden rounded-[20px] bg-surface shadow-[0_30px_90px_-12px_rgba(0,0,0,0.9)] ring-1 ring-white/10 will-change-transform"
      style={{ left: pos.left, top: pos.top, width: WIDTH }}
    >
      <div ref={inner}>
        {/* Artwork with the title set over it */}
        <Link href={detailHref(item)} onClick={onNavigate} className="relative block aspect-[16/9.5] bg-surface-2">
          {image && <Image src={image} alt="" fill sizes={`${WIDTH}px`} className="object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-text/90 backdrop-blur">
            {item.type === "movie" ? "Movie" : "Series"}
          </span>
          <p className="absolute inset-x-5 bottom-3 line-clamp-2 text-[22px] font-bold leading-[1.1] tracking-[-0.02em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {item.title}
          </p>
        </Link>

        <div className="px-5 pb-5 pt-3">
          {/* Actions: one wide primary button, square secondary ones */}
          <div className="flex items-stretch gap-2">
            <Link
              href={watchHref(item)}
              onClick={onNavigate}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-text text-sm font-semibold text-black transition hover:bg-white active:scale-[0.98]"
            >
              <Play className="size-4 fill-black" />
              Watch now
            </Link>
            <button
              type="button"
              onClick={save}
              aria-pressed={inList}
              aria-label={inList ? "Remove from My List" : "Add to My List"}
              title={inList ? "In My List" : "Add to My List"}
              className={`flex size-11 items-center justify-center rounded-full ring-1 transition hover:scale-105 active:scale-95 ${
                inList ? "bg-accent/15 text-accent ring-accent/40" : "text-text ring-white/25 hover:ring-white/60"
              }`}
            >
              <span key={String(inList)} className="pop-in">
                {inList ? <Check className="size-5" strokeWidth={2.5} /> : <Plus className="size-5" />}
              </span>
            </button>
            <Link
              href={detailHref(item)}
              onClick={onNavigate}
              aria-label="More details"
              title="More details"
              className="flex size-11 items-center justify-center rounded-full text-text ring-1 ring-white/25 transition hover:scale-105 hover:ring-white/60"
            >
              <ChevronRight className="size-5" />
            </Link>
          </div>

          {/* Meta */}
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            {item.rating > 0 && (
              <span className="flex items-center gap-1 font-semibold text-text">
                <Star className="size-3.5 fill-accent text-accent" />
                {item.rating.toFixed(1)}
              </span>
            )}
            {item.year && (
              <>
                {item.rating > 0 && <Dot />}
                <span>{item.year}</span>
              </>
            )}
            {genres.map((g) => (
              <span key={g} className="flex items-center gap-2">
                <Dot />
                {g}
              </span>
            ))}
          </p>

          {item.overview && <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-text/70">{item.overview}</p>}
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="size-1 rounded-full bg-white/25" aria-hidden="true" />;
}
