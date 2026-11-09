import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/image";
import { detailHref } from "@/lib/routes";
import type { MediaItem } from "@/lib/types";
import { HoverPreview } from "./hover-preview";

export function PosterCard({
  item,
  sizes = "(min-width: 1536px) 255px, (min-width: 1024px) 215px, 185px",
  className = "",
}: {
  item: MediaItem;
  sizes?: string;
  className?: string;
}) {
  const src = tmdbImage(item.poster, "w500");
  return (
    <div className={`shrink-0 snap-start ${className}`}>
      <HoverPreview item={item}>
        <Link href={detailHref(item)} className="group block">
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
              <div className="flex h-full items-center justify-center p-3 text-center text-sm text-muted">
                {item.title}
              </div>
            )}
          </div>
          <div className="mt-2 px-0.5">
            <p className="truncate text-[13px] font-medium text-text/90 group-hover:text-text">
              {item.title}
            </p>
            <p className="text-xs text-faint">
              {item.year || "—"} · {item.type === "movie" ? "Movie" : "Series"}
            </p>
          </div>
        </Link>
      </HoverPreview>
    </div>
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
