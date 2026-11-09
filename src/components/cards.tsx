import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { tmdbImage } from "@/lib/image";
import { detailHref } from "@/lib/routes";
import type { MediaItem } from "@/lib/types";

export function PosterCard({ item, sizes = "180px", className = "" }: { item: MediaItem; sizes?: string; className?: string }) {
  const src = tmdbImage(item.poster, "w342");
  return (
    <Link href={detailHref(item)} className={`group block shrink-0 snap-start ${className}`}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-surface ring-1 ring-line">
        {src ? (
          <Image
            src={src}
            alt={item.title}
            fill
            sizes={sizes}
            className="object-cover transition duration-300 ease-out group-hover:scale-[1.03] group-hover:brightness-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-sm text-muted">{item.title}</div>
        )}
        {item.rating > 0 && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[11px] font-medium backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
            <Star className="size-3 fill-accent text-accent" />
            {item.rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <p className="truncate text-[13px] font-medium text-text/90 group-hover:text-text">{item.title}</p>
        <p className="text-xs text-faint">
          {item.year || "—"} · {item.type === "movie" ? "Movie" : "Series"}
        </p>
      </div>
    </Link>
  );
}

export function PosterSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`shrink-0 ${className}`}>
      <div className="skeleton aspect-[2/3] rounded-[10px]" />
      <div className="skeleton mt-2 h-3 w-3/4 rounded" />
      <div className="skeleton mt-1.5 h-2.5 w-1/3 rounded" />
    </div>
  );
}
