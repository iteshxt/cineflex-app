"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight, Play, Plus, Star } from "lucide-react";
import { genreNames } from "@/lib/genres";
import { tmdbImage } from "@/lib/image";
import { useInMyList } from "@/lib/library";
import { detailHref, watchHref } from "@/lib/routes";
import type { MediaItem } from "@/lib/types";

const OPEN_DELAY = 480; // long enough that sweeping across a row doesn't flash previews
const CLOSE_DELAY = 140; // grace period for moving the pointer from card to preview
const WIDTH = 340;
const EST_HEIGHT = 390;

type Box = { left: number; top: number; originX: number; originY: number };

/**
 * Wraps a poster card. On mouse hover it opens a larger preview with details and
 * actions, positioned over the card in a portal so scroll containers can't clip it.
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
  const [box, setBox] = useState<Box | null>(null);

  const close = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    setBox(null);
  }, []);

  const scheduleClose = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setBox(null), CLOSE_DELAY);
  };

  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => {
      const el = anchor.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cx = r.left + r.width / 2;
      const left = Math.min(Math.max(cx - WIDTH / 2, 12), vw - WIDTH - 12);
      const top = Math.min(Math.max(r.top + r.height / 2 - EST_HEIGHT / 2, 12), vh - EST_HEIGHT - 12);
      // Grow out of the card's centre so it feels attached to it.
      setBox({ left, top, originX: cx - left, originY: r.top + r.height / 2 - top });
    }, OPEN_DELAY);
  };

  // Close on scroll/resize (the card moves), Escape, and when the page is hidden by navigation.
  useEffect(() => {
    if (!box) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, { capture: true, passive: true });
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [box, close]);
  useLayoutEffect(() => close, [close]);

  return (
    <div ref={anchor} className={className} onPointerEnter={onEnter} onPointerLeave={scheduleClose} onClickCapture={close}>
      {children}
      {box &&
        createPortal(
          <Preview
            item={item}
            box={box}
            onEnter={() => clearTimeout(closeTimer.current)}
            onLeave={scheduleClose}
            onNavigate={close}
          />,
          document.body,
        )}
    </div>
  );
}

function Preview({
  item,
  box,
  onEnter,
  onLeave,
  onNavigate,
}: {
  item: MediaItem;
  box: Box;
  onEnter: () => void;
  onLeave: () => void;
  onNavigate: () => void;
}) {
  const [inList, toggle] = useInMyList(item.id, item.type);
  const image = tmdbImage(item.backdrop, "w780") ?? tmdbImage(item.poster, "w500");
  const genres = genreNames(item.genreIds);

  return (
    <div
      role="dialog"
      aria-label={item.title}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="preview-in fixed z-[60] overflow-hidden rounded-2xl bg-surface shadow-[0_24px_80px_-12px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
      style={{
        left: box.left,
        top: box.top,
        width: WIDTH,
        transformOrigin: `${box.originX}px ${box.originY}px`,
      }}
    >
      <Link href={detailHref(item)} onClick={onNavigate} className="relative block aspect-video bg-surface-2">
        {image && <Image src={image} alt="" fill sizes={`${WIDTH}px`} className="object-cover" />}
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
              toggle({ id: item.id, type: item.type, title: item.title, poster: item.poster, backdrop: item.backdrop, year: item.year })
            }
            aria-pressed={inList}
            aria-label={inList ? "Remove from My List" : "Add to My List"}
            title={inList ? "In My List" : "Add to My List"}
            className={`flex size-9 items-center justify-center rounded-full ring-1 transition hover:scale-105 active:scale-95 ${
              inList ? "bg-accent/15 text-accent ring-accent/40" : "text-text ring-white/25 hover:ring-white/60"
            }`}
          >
            <span key={String(inList)} className="pop-in">
              {inList ? <Check className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" />}
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

        {item.overview && <p className="line-clamp-3 text-[13px] leading-relaxed text-muted">{item.overview}</p>}
      </div>
    </div>
  );
}
