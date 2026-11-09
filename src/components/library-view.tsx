"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useMyList, useProgress } from "@/lib/library";
import { PosterCard } from "./cards";
import { ContinueWatching } from "./continue-watching";

const GRID = "grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:gap-x-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8";

export function LibraryView() {
  const list = useMyList();
  const progress = useProgress();

  if (list.length === 0 && progress.length === 0) {
    return (
      <div className="mx-gutter mt-16 max-w-md">
        <Bookmark className="size-6 text-accent" />
        <p className="mt-4 text-lg font-medium">Nothing saved yet</p>
        <p className="mt-1 text-[15px] text-muted">
          Add titles with <span className="text-text">My List</span> on any movie or series, and what you watch shows
          up here to continue later. It’s stored in this browser only.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-text px-6 text-sm font-semibold text-black hover:bg-white"
        >
          Browse titles
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <ContinueWatching />
      {list.length > 0 && (
        <section className="px-gutter py-4">
          <h2 className="mb-4 text-lg font-semibold tracking-tight md:text-xl">My List</h2>
          <div className={GRID}>
            {list.map((i) => (
              <PosterCard
                key={`${i.type}-${i.id}`}
                item={{ ...i, overview: "", year: i.year ?? "", rating: 0, genreIds: [] }}
                sizes="(min-width: 1280px) 16vw, (min-width: 640px) 25vw, 33vw"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
