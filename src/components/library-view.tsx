"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bookmark, Clock, X } from "lucide-react";
import { tmdbImage } from "@/lib/image";
import { removeFromList, useMyList, useProgress, type LibraryItem } from "@/lib/library";
import { detailHref } from "@/lib/routes";
import { ProgressCard } from "./continue-watching";

type Tab = "list" | "watching";
type TypeFilter = "all" | "movie" | "tv";
type Sort = "added" | "title" | "year";

const GRID = "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 xl:grid-cols-5 2xl:grid-cols-6";

export function LibraryView() {
  const list = useMyList();
  const progress = useProgress();
  const [tabChoice, setTab] = useState<Tab | null>(null);
  const [type, setType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<Sort>("added");

  // Default to whichever tab has something in it.
  const tab: Tab = tabChoice ?? (list.length === 0 && progress.length > 0 ? "watching" : "list");

  const items = list
    .filter((i) => type === "all" || i.type === type)
    .toSorted((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "year"
          ? (b.year ?? "").localeCompare(a.year ?? "")
          : b.addedAt - a.addedAt,
    );

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-gutter">
        <div role="tablist" aria-label="Library sections" className="flex gap-6">
          <TabButton active={tab === "list"} onClick={() => setTab("list")} count={list.length}>
            My List
          </TabButton>
          <TabButton active={tab === "watching"} onClick={() => setTab("watching")} count={progress.length}>
            Continue Watching
          </TabButton>
        </div>
        {tab === "list" && list.length > 0 && (
          <div className="flex items-center gap-2 pb-3">
            <Segmented
              label="Type"
              value={type}
              onChange={setType}
              options={[
                ["all", "All"],
                ["movie", "Movies"],
                ["tv", "Series"],
              ]}
            />
            <select
              aria-label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-9 rounded-full bg-surface px-3 text-[13px] text-muted outline-none ring-1 ring-line hover:text-text"
            >
              <option value="added">Recently added</option>
              <option value="title">Title A–Z</option>
              <option value="year">Newest first</option>
            </select>
          </div>
        )}
      </div>

      <div className="px-gutter pt-8">
        {tab === "list" ? (
          list.length === 0 ? (
            <Empty
              icon={<Bookmark className="size-6" />}
              title="Your list is empty"
              body="Tap My List on any movie or series to save it here for later."
            />
          ) : items.length === 0 ? (
            <p className="py-12 text-muted">Nothing in your list matches this filter.</p>
          ) : (
            <div className={GRID}>
              {items.map((i) => (
                <SavedCard key={`${i.type}-${i.id}`} item={i} />
              ))}
            </div>
          )
        ) : progress.length === 0 ? (
          <Empty
            icon={<Clock className="size-6" />}
            title="Nothing in progress"
            body="Titles you start watching appear here so you can pick up where you left off."
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {progress.map((p) => (
              <ProgressCard key={`${p.type}-${p.id}`} item={p} className="w-full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SavedCard({ item }: { item: LibraryItem }) {
  const src = tmdbImage(item.poster, "w342");
  return (
    <div className="group relative">
      <Link href={detailHref(item)} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-surface ring-1 ring-line">
          {src && (
            <Image
              src={src}
              alt={item.title}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 640px) 25vw, 33vw"
              className="object-cover transition duration-300 group-hover:scale-[1.03] group-hover:brightness-110"
            />
          )}
        </div>
        <p className="mt-2 truncate px-0.5 text-[13px] font-medium text-text/90">{item.title}</p>
        <p className="px-0.5 text-xs text-faint">
          {item.year || "—"} · {item.type === "movie" ? "Movie" : "Series"}
        </p>
      </Link>
      <button
        type="button"
        onClick={() => removeFromList(item.id, item.type)}
        aria-label={`Remove ${item.title} from My List`}
        title="Remove from My List"
        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-muted opacity-0 backdrop-blur transition hover:bg-black/80 hover:text-text focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative flex items-center gap-2 pb-3 text-[15px] font-medium transition-colors ${
        active ? "text-text" : "text-faint hover:text-muted"
      }`}
    >
      {children}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[11px] ${active ? "bg-accent text-accent-ink" : "bg-white/[0.06] text-faint"}`}
      >
        {count}
      </span>
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />}
    </button>
  );
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-surface p-1 ring-1 ring-line">
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`rounded-full px-3 py-1 text-[13px] transition-colors ${
            value === v ? "bg-surface-2 text-text" : "text-faint hover:text-muted"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Empty({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">{icon}</span>
      <p className="mt-5 text-lg font-medium">{title}</p>
      <p className="mt-1 text-[15px] text-muted">{body}</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-text px-6 text-sm font-semibold text-black hover:bg-white"
      >
        Browse titles
      </Link>
    </div>
  );
}
