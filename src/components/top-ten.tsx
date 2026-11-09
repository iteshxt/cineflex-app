"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { tmdbImage } from "@/lib/image";
import type { MediaItem } from "@/lib/types";
import { RowHeader } from "./row";
import { Scroller } from "./scroller";

export function TopTen({ movies, shows }: { movies: MediaItem[]; shows: MediaItem[] }) {
  const [tab, setTab] = useState<"movie" | "tv">("movie");
  const items = (tab === "movie" ? movies : shows).slice(0, 10);
  if (movies.length === 0 && shows.length === 0) return null;

  return (
    <section className="py-4">
      <RowHeader title="Top 10 Today">
        <div role="tablist" aria-label="Top 10 type" className="flex rounded-full bg-surface p-1 text-[13px]">
          {(["movie", "tv"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3.5 py-1 transition-colors ${
                tab === t ? "bg-surface-2 text-text" : "text-faint hover:text-muted"
              }`}
            >
              {t === "movie" ? "Movies" : "Series"}
            </button>
          ))}
        </div>
      </RowHeader>
      <Scroller key={tab} className="gap-1 md:gap-2">
        {items.map((item, i) => {
          const src = tmdbImage(item.poster, "w342");
          return (
            <Link
              key={item.id}
              href={`/${item.type}/${item.id}`}
              className="group flex shrink-0 snap-start items-end"
              aria-label={`${i + 1}. ${item.title}`}
            >
              <span className="numeral -mr-4 select-none text-[120px] md:-mr-5 md:text-[168px]" aria-hidden="true">
                {i + 1}
              </span>
              <div className="relative aspect-[2/3] w-[118px] overflow-hidden rounded-[10px] bg-surface ring-1 ring-line md:w-[150px]">
                {src && (
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="150px"
                    className="object-cover transition duration-300 group-hover:scale-[1.03] group-hover:brightness-110"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </Scroller>
    </section>
  );
}
