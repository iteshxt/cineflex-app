"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bookmark, Clock, Pencil, Plus, Trash2, X } from "lucide-react";
import { tmdbImage } from "@/lib/image";
import {
  DEFAULT_LIST_ID,
  MAX_LIST_NAME,
  createList,
  deleteList,
  removeFromAnyList,
  renameList,
  useLists,
  useMyList,
  useProgress,
  type LibraryItem,
} from "@/lib/library";
import { detailHref } from "@/lib/routes";
import { ProgressCard } from "./continue-watching";
import { Select } from "./select";

type Tab = "list" | "watching";
type TypeFilter = "all" | "movie" | "tv";
type Sort = "added" | "title" | "year";

const GRID = "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 xl:grid-cols-5 2xl:grid-cols-6";

export function LibraryView() {
  const myList = useMyList();
  const lists = useLists();
  const progress = useProgress();
  const [tabChoice, setTab] = useState<Tab | null>(null);
  const [listChoice, setListId] = useState<string>(DEFAULT_LIST_ID);
  const [type, setType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<Sort>("added");

  const savedCount = myList.length + lists.reduce((n, l) => n + l.items.length, 0);
  // Default to whichever tab has something in it.
  const tab: Tab = tabChoice ?? (savedCount === 0 && progress.length > 0 ? "watching" : "list");

  // The selected list (falls back to My List if a list was deleted).
  const custom = lists.find((l) => l.id === listChoice);
  const listId = custom ? custom.id : DEFAULT_LIST_ID;
  const source = custom ? custom.items : myList;
  const items = source
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
          <TabButton active={tab === "list"} onClick={() => setTab("list")} count={savedCount}>
            Lists
          </TabButton>
          <TabButton active={tab === "watching"} onClick={() => setTab("watching")} count={progress.length}>
            Continue Watching
          </TabButton>
        </div>
        {tab === "list" && source.length > 0 && (
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
            <Select
              label="Sort"
              value={sort}
              onChange={setSort}
              align="right"
              options={[
                { value: "added", label: "Recently added" },
                { value: "title", label: "Title A–Z" },
                { value: "year", label: "Newest first" },
              ]}
            />
          </div>
        )}
      </div>

      <div className="px-gutter pt-6">
        {tab === "list" ? (
          <>
            <ListPicker
              selected={listId}
              onSelect={setListId}
              lists={[{ id: DEFAULT_LIST_ID, name: "My List", count: myList.length }, ...lists.map((l) => ({ id: l.id, name: l.name, count: l.items.length }))]}
            />
            {custom && <ListActions key={custom.id} id={custom.id} name={custom.name} onDeleted={() => setListId(DEFAULT_LIST_ID)} />}
            <div className="pt-6">
              {source.length === 0 ? (
                <Empty
                  icon={<Bookmark className="size-6" />}
                  title={custom ? `“${custom.name}” is empty` : "Your list is empty"}
                  body={
                    custom
                      ? "On any movie or series, open the ▾ next to My List and tick this list."
                      : "Tap My List on any movie or series to save it here for later."
                  }
                />
              ) : items.length === 0 ? (
                <p className="py-12 text-muted">Nothing in this list matches the filter.</p>
              ) : (
                <div className={GRID}>
                  {items.map((i) => (
                    <SavedCard key={`${i.type}-${i.id}`} item={i} listId={listId} listName={custom?.name ?? "My List"} />
                  ))}
                </div>
              )}
            </div>
          </>
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

/** Chips to switch between lists, plus inline creation of a new one. */
function ListPicker({
  lists,
  selected,
  onSelect,
}: {
  lists: { id: string; name: string; count: number }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  return (
    <div className="no-scrollbar -mx-gutter flex items-center gap-2 overflow-x-auto px-gutter pb-1">
      {lists.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => onSelect(l.id)}
          aria-pressed={selected === l.id}
          className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm ring-1 transition ${
            selected === l.id ? "bg-text font-medium text-black ring-transparent" : "bg-surface text-muted ring-line hover:text-text"
          }`}
        >
          {l.name}
          <span className={selected === l.id ? "text-black/50" : "text-faint"}>{l.count}</span>
        </button>
      ))}
      {creating ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const id = createList(name);
            if (id) {
              onSelect(id);
              setName("");
              setCreating(false);
            }
          }}
          className="flex shrink-0 items-center gap-1.5"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => !name.trim() && setCreating(false)}
            onKeyDown={(e) => e.key === "Escape" && setCreating(false)}
            maxLength={MAX_LIST_NAME}
            placeholder="List name"
            aria-label="New list name"
            className="h-9 w-40 rounded-full bg-surface px-4 text-sm outline-none ring-1 ring-accent/50 placeholder:text-faint"
          />
          <button type="submit" disabled={!name.trim()} className="h-9 rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink disabled:opacity-40">
            Create
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 border border-dashed border-white/20 text-sm text-muted transition hover:border-white/40 hover:text-text"
        >
          <Plus className="size-4" /> New list
        </button>
      )}
    </div>
  );
}

/** Rename / delete for a custom list. */
function ListActions({ id, name, onDeleted }: { id: string; name: string; onDeleted: () => void }) {
  const [mode, setMode] = useState<"idle" | "rename" | "delete">("idle");
  const [value, setValue] = useState(name);
  if (mode === "rename") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          renameList(id, value);
          setMode("idle");
        }}
        className="mt-4 flex items-center gap-2"
      >
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setMode("idle")}
          maxLength={MAX_LIST_NAME}
          aria-label="List name"
          className="h-9 w-56 rounded-full bg-surface px-4 text-sm outline-none ring-1 ring-accent/50"
        />
        <button type="submit" disabled={!value.trim()} className="h-9 rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink disabled:opacity-40">
          Save
        </button>
        <button type="button" onClick={() => setMode("idle")} className="h-9 rounded-full px-3 text-sm text-muted hover:text-text">
          Cancel
        </button>
      </form>
    );
  }
  return (
    <div className="mt-4 flex items-center gap-1 text-sm">
      {mode === "delete" ? (
        <>
          <span className="mr-2 text-muted">Delete “{name}”? Titles stay in your other lists.</span>
          <button
            type="button"
            onClick={() => {
              deleteList(id);
              onDeleted();
            }}
            className="h-8 rounded-full bg-red-500/90 px-3 font-medium text-white hover:bg-red-500"
          >
            Delete
          </button>
          <button type="button" onClick={() => setMode("idle")} className="h-8 rounded-full px-3 text-muted hover:text-text">
            Cancel
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setMode("rename")}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-muted transition hover:bg-white/[0.06] hover:text-text"
          >
            <Pencil className="size-3.5" /> Rename
          </button>
          <button
            type="button"
            onClick={() => setMode("delete")}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-muted transition hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="size-3.5" /> Delete list
          </button>
        </>
      )}
    </div>
  );
}

function SavedCard({ item, listId, listName }: { item: LibraryItem; listId: string; listName: string }) {
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
        onClick={() => removeFromAnyList(listId, item.id, item.type)}
        aria-label={`Remove ${item.title} from ${listName}`}
        title={`Remove from ${listName}`}
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
        href="/home"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-text px-6 text-sm font-semibold text-black hover:bg-white"
      >
        Browse titles
      </Link>
    </div>
  );
}
