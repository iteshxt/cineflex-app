"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Info, Play, Star } from "lucide-react";
import { tmdbImage } from "@/lib/image";
import { detailHref, watchHref } from "@/lib/routes";
import { useSettings } from "@/lib/settings";
import type { MediaItem } from "@/lib/types";

type HeroItem = MediaItem & { logo: string | null };

const INTERVAL = 8000;

export function Hero({ items }: { items: HeroItem[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setPaused] = useState(false);
  const { heroAutoplay } = useSettings();
  const paused = hovered || !heroAutoplay;

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % items.length), INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, items.length]);

  if (items.length === 0) return null;
  const item = items[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative h-[72svh] min-h-[480px] w-full overflow-hidden md:h-[88svh] md:max-h-[920px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Backdrops are stacked and crossfaded so switching never flashes black. */}
      {items.map((it, i) => {
        const src = tmdbImage(it.backdrop, "w1280");
        return src ? (
          <Image
            key={it.id}
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover object-[center_20%] transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null;
      })}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/60 to-transparent md:via-bg/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-bg/30" />

      <div key={item.id} className="fade-in absolute inset-x-0 bottom-0 px-gutter pb-14 md:pb-24">
        <div className="max-w-xl">
          {item.logo ? (
            <h1 className="mb-5">
              <Image
                src={tmdbImage(item.logo, "w500")!}
                alt={item.title}
                width={500}
                height={200}
                priority
                className="h-auto max-h-28 w-auto max-w-[min(420px,80vw)] object-contain object-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] md:max-h-36"
              />
            </h1>
          ) : (
            <h1 className="mb-5 text-5xl font-bold leading-[0.95] tracking-[-0.03em] md:text-7xl">{item.title}</h1>
          )}

          <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
            {item.rating > 0 && (
              <span className="flex items-center gap-1 text-text">
                <Star className="size-3.5 fill-accent text-accent" />
                {item.rating.toFixed(1)}
              </span>
            )}
            <Dot />
            <span>{item.year}</span>
            <Dot />
            <span>{item.type === "movie" ? "Movie" : "Series"}</span>
          </p>
          <p className="mt-3 line-clamp-2 max-w-[60ch] text-[15px] leading-relaxed text-text/75 md:line-clamp-3">
            {item.overview}
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href={watchHref(item)}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-text px-6 text-sm font-semibold text-black transition hover:bg-white active:scale-[0.98]"
            >
              <Play className="size-4 fill-black" />
              Play
            </Link>
            <Link
              href={detailHref(item)}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-medium backdrop-blur-md transition hover:bg-white/20"
            >
              <Info className="size-4" />
              More info
            </Link>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-6 right-gutter flex gap-1.5 md:bottom-10">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              aria-label={`Show ${it.title}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="group py-2"
            >
              <span className="relative block h-[3px] w-7 overflow-hidden rounded-full bg-white/20 md:w-10">
                {i === index && (
                  <span
                    className="absolute inset-0 origin-left rounded-full bg-text"
                    style={{
                      animation: `hero-progress ${INTERVAL}ms linear both`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
                {i < index && <span className="absolute inset-0 rounded-full bg-white/50" />}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function Dot() {
  return <span className="text-faint">·</span>;
}

export function HeroSkeleton() {
  return (
    <section className="relative h-[72svh] min-h-[480px] md:h-[88svh] md:max-h-[920px]" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 px-gutter pb-14 md:pb-24">
        <div className="skeleton h-20 w-80 rounded-lg" />
        <div className="skeleton mt-6 h-3 w-48 rounded" />
        <div className="skeleton mt-4 h-3 w-[28rem] max-w-full rounded" />
        <div className="skeleton mt-2 h-3 w-96 max-w-full rounded" />
        <div className="mt-6 flex gap-3">
          <div className="skeleton h-11 w-28 rounded-full" />
          <div className="skeleton h-11 w-32 rounded-full" />
        </div>
      </div>
    </section>
  );
}
