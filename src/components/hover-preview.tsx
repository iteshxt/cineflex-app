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

const OPEN_DELAY = 450; // long enough that sweeping across a row doesn't flash previews
const CLOSE_DELAY = 200; // grace period for crossing the gap from card to preview
const WIDTH = 340;
const GAP = 14;
const EDGE = 12;
const EST_HEIGHT = 400;
const EASE = "cubic-bezier(0.2, 0.85, 0.25, 1)";

type Pos = { left: number; top: number };
type Open = { pos: Pos; leaving: boolean };

/** The element the preview morphs out of: the poster image if marked, else the whole card. */
function sourceRect(anchor: HTMLElement) {
  return (
    anchor.querySelector("[data-preview-source]") ?? anchor
  ).getBoundingClientRect();
}

/** Beside the card: right if it fits, else left, else centred over it (narrow screens). */
function place(r: DOMRect): Pos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left: number;
  if (r.right + GAP + WIDTH <= vw - EDGE) left = r.right + GAP;
  else if (r.left - GAP - WIDTH >= EDGE) left = r.left - GAP - WIDTH;
  else
    left = Math.min(
      Math.max(r.left + r.width / 2 - WIDTH / 2, EDGE),
      vw - WIDTH - EDGE,
    );
  const top = Math.min(Math.max(r.top, EDGE), vh - EST_HEIGHT - EDGE);
  return { left, top };
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Wraps a poster card. On mouse hover it opens a larger preview with details and actions
 * beside the card. The preview morphs out of the poster (and back into it on close) and is
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
    clearTimeout(openTimer.current);
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

  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !getSettings().hoverPreviews) return;
    cancelClose();
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => {
      if (anchor.current)
        setOpen({ pos: place(sourceRect(anchor.current)), leaving: false });
    }, OPEN_DELAY);
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
  useLayoutEffect(() => dismiss, [dismiss]);

  // Stable callbacks so re-renders (e.g. toggling My List) don't restart the animations.
  const getSource = useCallback(() => (anchor.current ? sourceRect(anchor.current) : null), []);
  const onClosed = useCallback(() => setOpen(null), []);

  return (
    <div
      ref={anchor}
      className={className}
      onPointerEnter={onEnter}
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

  /** Transform that makes the panel exactly cover the card it came from. */
  const fromCard = useCallback(() => {
    const el = ref.current;
    const from = source();
    if (!el || !from) return null;
    const to = el.getBoundingClientRect();
    return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
  }, [source]);

  // Enter: keep the panel on screen vertically, then morph out of the card.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = el.offsetHeight;
    const maxTop = window.innerHeight - h - EDGE;
    if (pos.top > maxTop) el.style.top = `${Math.max(EDGE, maxTop)}px`;
    if (prefersReducedMotion()) return;
    const start = fromCard();
    if (!start) return;
    el.animate(
      [
        { transform: start, opacity: 0.35, borderRadius: "10px" },
        { transform: "none", opacity: 1, borderRadius: "16px" },
      ],
      { duration: 340, easing: EASE },
    );
    // Content fades in once the panel is mostly open, so it's never seen stretched.
    inner.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      delay: 150,
      easing: "ease-out",
      fill: "backwards",
    });
  }, [pos.top, fromCard]);

  // Leave: morph back into the card, then unmount.
  useEffect(() => {
    if (!leaving) return;
    const el = ref.current;
    const end = fromCard();
    if (!el || !end || prefersReducedMotion()) {
      onClosed();
      return;
    }
    inner.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 110,
      fill: "forwards",
    });
    const anim = el.animate(
      [
        { transform: "none", opacity: 1, borderRadius: "16px" },
        { transform: end, opacity: 0, borderRadius: "10px" },
      ],
      {
        duration: 240,
        easing: "cubic-bezier(0.4, 0, 0.6, 1)",
        fill: "forwards",
      },
    );
    anim.onfinish = onClosed;
    return () => anim.cancel();
  }, [leaving, fromCard, onClosed]);

  const [inList, toggle] = useInMyList(item.id, item.type);
  const image =
    tmdbImage(item.backdrop, "w780") ?? tmdbImage(item.poster, "w500");
  const genres = genreNames(item.genreIds);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={item.title}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="fixed z-[60] origin-top-left overflow-hidden rounded-2xl bg-surface shadow-[0_24px_80px_-12px_rgba(0,0,0,0.85)] ring-1 ring-white/10 will-change-transform"
      style={{ left: pos.left, top: pos.top, width: WIDTH }}
    >
      <div ref={inner}>
        <Link
          href={detailHref(item)}
          onClick={onNavigate}
          className="relative block aspect-video bg-surface-2"
        >
          {image && (
            <Image
              src={image}
              alt=""
              fill
              sizes={`${WIDTH}px`}
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
          <p className="absolute inset-x-4 bottom-2 line-clamp-2 text-lg font-semibold leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {item.title}
          </p>
        </Link>

        <div className="space-y-3 p-4 pt-3">
          <div className="flex items-center gap-2">
            <Link
              href={watchHref(item)}
              onClick={onNavigate}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-text pl-3.5 pr-4 text-sm font-semibold text-black transition hover:scale-[1.03] hover:bg-white active:scale-[0.97]"
            >
              <Play className="size-4 fill-black" />
              Play
            </Link>
            <button
              type="button"
              onClick={() =>
                toggle({
                  id: item.id,
                  type: item.type,
                  title: item.title,
                  poster: item.poster,
                  backdrop: item.backdrop,
                  year: item.year,
                })
              }
              aria-pressed={inList}
              aria-label={inList ? "Remove from My List" : "Add to My List"}
              title={inList ? "In My List" : "Add to My List"}
              className={`flex size-9 items-center justify-center rounded-full ring-1 transition hover:scale-105 active:scale-95 ${
                inList
                  ? "bg-accent/15 text-accent ring-accent/40"
                  : "text-text ring-white/25 hover:ring-white/60"
              }`}
            >
              <span key={String(inList)} className="pop-in">
                {inList ? (
                  <Check className="size-4" strokeWidth={2.5} />
                ) : (
                  <Plus className="size-4" />
                )}
              </span>
            </button>
            <Link
              href={detailHref(item)}
              onClick={onNavigate}
              aria-label="Details"
              title="Details"
              className="ml-auto flex size-9 items-center justify-center rounded-full text-text ring-1 ring-white/25 transition hover:scale-105 hover:ring-white/60"
            >
              <ChevronRight className="size-4 rotate-90" />
            </Link>
          </div>

          <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
            {item.rating > 0 && (
              <span className="flex items-center gap-1 font-medium text-text">
                <Star className="size-3.5 fill-accent text-accent" />
                {item.rating.toFixed(1)}
              </span>
            )}
            {item.year && <span>{item.year}</span>}
            <span className="rounded border border-white/20 px-1 text-[11px] leading-4">
              {item.type === "movie" ? "Movie" : "Series"}
            </span>
          </p>

          {genres.length > 0 && (
            <p className="text-[13px] text-text/80">
              {genres.map((g, i) => (
                <span key={g}>
                  {i > 0 && <span className="mx-1.5 text-faint">•</span>}
                  {g}
                </span>
              ))}
            </p>
          )}

          {item.overview && (
            <p className="line-clamp-3 text-[13px] leading-relaxed text-muted">
              {item.overview}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
