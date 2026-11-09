"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, X } from "lucide-react";
import { tmdbImage } from "@/lib/image";
import { removeProgress, useProgress, type ProgressItem } from "@/lib/library";
import { watchHref } from "@/lib/routes";
import { RowHeader } from "./row";
import { Scroller } from "./scroller";

export function ContinueWatching({ title = "Continue Watching" }: { title?: string }) {
  const items = useProgress();
  if (items.length === 0) return null;
  return (
    <section className="py-4">
      <RowHeader title={title} />
      <Scroller>
        {items.map((item) => (
          <ProgressCard key={`${item.type}-${item.id}`} item={item} />
        ))}
      </Scroller>
    </section>
  );
}

export function ProgressCard({
  item,
  className = "w-[260px] shrink-0 snap-start md:w-[300px]",
}: {
  item: ProgressItem;
  className?: string;
}) {
  const src = tmdbImage(item.backdrop, "w780") ?? tmdbImage(item.poster, "w342");
  const label = item.type === "tv" && item.season ? `S${item.season} · E${item.episode}` : "Movie";
  return (
    <div className={`group relative ${className}`}>
      <Link href={watchHref(item)} className="block">
        <div className="relative aspect-video overflow-hidden rounded-[10px] bg-surface ring-1 ring-line">
          {src && (
            <Image src={src} alt="" fill sizes="300px" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black">
              <Play className="ml-0.5 size-5 fill-black" />
            </span>
          </span>
          <div className="absolute inset-x-3 bottom-2.5">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="truncate text-xs text-muted">
              {label}
              {item.episodeName ? ` — ${item.episodeName}` : ""}
            </p>
          </div>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Remove ${item.title} from Continue Watching`}
        onClick={() => removeProgress(item.id, item.type)}
        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-muted opacity-0 backdrop-blur transition hover:text-text focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
