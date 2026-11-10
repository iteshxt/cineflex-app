"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { MediaType } from "./types";

export type LibraryItem = {
  id: number;
  type: MediaType;
  title: string;
  poster: string | null;
  backdrop: string | null;
  year?: string;
  addedAt: number;
};

export type ProgressItem = LibraryItem & {
  season?: number;
  episode?: number;
  episodeName?: string;
  /** Seconds watched into the title/episode (estimated from play/pause if the player doesn't report it). */
  position?: number;
  /** Total length in seconds, when known. */
  duration?: number;
};

const LIST_KEY = "cineflex:list";
const LISTS_KEY = "cineflex:lists";
const PROGRESS_KEY = "cineflex:progress";
const MAX_PROGRESS = 30;

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown[] }>();
const EMPTY: never[] = [];

function read<T>(key: string): T[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return EMPTY;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T[];
  let value: T[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    value = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    value = EMPTY;
  }
  cache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: state just won't persist */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LIST_KEY || e.key === LISTS_KEY || e.key === PROGRESS_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

const same = (a: { id: number; type: MediaType }, b: { id: number; type: MediaType }) =>
  a.id === b.id && a.type === b.type;

/* ----------------------------------------------------------------- list */

export function useMyList() {
  return useSyncExternalStore(
    subscribe,
    () => read<LibraryItem>(LIST_KEY),
    () => EMPTY as LibraryItem[],
  );
}

export function useInMyList(id: number, type: MediaType) {
  const list = useMyList();
  const inList = list.some((i) => same(i, { id, type }));
  const toggle = useCallback((item: Omit<LibraryItem, "addedAt">) => {
    const current = read<LibraryItem>(LIST_KEY);
    if (current.some((i) => same(i, item))) write(LIST_KEY, current.filter((i) => !same(i, item)));
    else write(LIST_KEY, [{ ...item, addedAt: Date.now() }, ...current]);
  }, []);
  return [inList, toggle] as const;
}

/* --------------------------------------------------------- custom lists */

/** A list the viewer created. "My List" (the default) is stored separately under LIST_KEY. */
export type UserList = { id: string; name: string; createdAt: number; items: LibraryItem[] };

export const DEFAULT_LIST_ID = "my-list";
export const MAX_LIST_NAME = 40;

export function useLists() {
  return useSyncExternalStore(
    subscribe,
    () => read<UserList>(LISTS_KEY),
    () => EMPTY as UserList[],
  );
}

const newId = () => `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, MAX_LIST_NAME);
}

/** Creates a list and returns its id (or null if the name is empty). */
export function createList(name: string, firstItem?: Omit<LibraryItem, "addedAt">): string | null {
  const n = cleanName(name);
  if (!n) return null;
  const id = newId();
  const items = firstItem ? [{ ...firstItem, addedAt: Date.now() }] : [];
  write(LISTS_KEY, [...read<UserList>(LISTS_KEY), { id, name: n, createdAt: Date.now(), items }]);
  return id;
}

export function renameList(id: string, name: string) {
  const n = cleanName(name);
  if (!n) return;
  write(
    LISTS_KEY,
    read<UserList>(LISTS_KEY).map((l) => (l.id === id ? { ...l, name: n } : l)),
  );
}

export function deleteList(id: string) {
  write(
    LISTS_KEY,
    read<UserList>(LISTS_KEY).filter((l) => l.id !== id),
  );
}

/** Adds or removes a title from any list, including the default "My List". */
export function toggleInList(listId: string, item: Omit<LibraryItem, "addedAt">) {
  if (listId === DEFAULT_LIST_ID) {
    const current = read<LibraryItem>(LIST_KEY);
    if (current.some((i) => same(i, item))) write(LIST_KEY, current.filter((i) => !same(i, item)));
    else write(LIST_KEY, [{ ...item, addedAt: Date.now() }, ...current]);
    return;
  }
  write(
    LISTS_KEY,
    read<UserList>(LISTS_KEY).map((l) => {
      if (l.id !== listId) return l;
      const has = l.items.some((i) => same(i, item));
      return { ...l, items: has ? l.items.filter((i) => !same(i, item)) : [{ ...item, addedAt: Date.now() }, ...l.items] };
    }),
  );
}

export function removeFromAnyList(listId: string, id: number, type: MediaType) {
  if (listId === DEFAULT_LIST_ID) return removeFromList(id, type);
  write(
    LISTS_KEY,
    read<UserList>(LISTS_KEY).map((l) => (l.id === listId ? { ...l, items: l.items.filter((i) => !same(i, { id, type })) } : l)),
  );
}

/** Ids of every list (default included) that contains the title. */
export function useListsContaining(id: number, type: MediaType): string[] {
  const mine = useMyList();
  const lists = useLists();
  const ids = lists.filter((l) => l.items.some((i) => same(i, { id, type }))).map((l) => l.id);
  return mine.some((i) => same(i, { id, type })) ? [DEFAULT_LIST_ID, ...ids] : ids;
}

/* ------------------------------------------------------------- progress */

export function useProgress() {
  return useSyncExternalStore(
    subscribe,
    () => read<ProgressItem>(PROGRESS_KEY),
    () => EMPTY as ProgressItem[],
  );
}

export function recordProgress(item: Omit<ProgressItem, "addedAt">) {
  const all = read<ProgressItem>(PROGRESS_KEY);
  const prev = all.find((i) => same(i, item));
  const rest = all.filter((i) => !same(i, item));
  // Keep the saved position when re-opening the same title/episode without a new one.
  const sameEpisode = prev && prev.season === item.season && prev.episode === item.episode;
  const merged: ProgressItem = {
    ...item,
    position: item.position ?? (sameEpisode ? prev.position : undefined),
    duration: item.duration ?? (sameEpisode ? prev.duration : undefined),
    addedAt: Date.now(),
  };
  write(PROGRESS_KEY, [merged, ...rest].slice(0, MAX_PROGRESS));
}

/** Saved position (seconds) to resume from, if it's worth resuming. */
export function getResumePosition(id: number, type: MediaType, season?: number, episode?: number): number {
  const p = read<ProgressItem>(PROGRESS_KEY).find((i) => same(i, { id, type }));
  if (!p?.position || p.season !== season || p.episode !== episode) return 0;
  if (p.position < 30) return 0; // barely started
  if (p.duration && p.position > p.duration - 90) return 0; // basically finished
  return Math.max(0, p.position - 5); // a few seconds of context
}

export function removeProgress(id: number, type: MediaType) {
  write(
    PROGRESS_KEY,
    read<ProgressItem>(PROGRESS_KEY).filter((i) => !same(i, { id, type })),
  );
}

export function getShowProgress(id: number): ProgressItem | undefined {
  return read<ProgressItem>(PROGRESS_KEY).find((i) => same(i, { id, type: "tv" }));
}

export function clearProgress() {
  write(PROGRESS_KEY, []);
}

export function clearList() {
  write(LIST_KEY, []);
}

export function clearCustomLists() {
  write(LISTS_KEY, []);
}

export function removeFromList(id: number, type: MediaType) {
  write(
    LIST_KEY,
    read<LibraryItem>(LIST_KEY).filter((i) => !same(i, { id, type })),
  );
}

/* ------------------------------------------------------- export / import */

const RECENT_SEARCHES_KEY = "cineflex:recent-searches";
const SETTINGS_STORAGE_KEY = "cineflex:settings";

export type LibraryBackup = {
  app: "cineflex";
  version: 1;
  exportedAt: string;
  list: LibraryItem[];
  lists?: UserList[];
  progress: ProgressItem[];
  settings?: unknown;
};

/** Everything a viewer would want to move to another device, as one JSON object. */
export function exportLibrary(): LibraryBackup {
  let settings: unknown;
  try {
    settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "null") ?? undefined;
  } catch {
    settings = undefined;
  }
  return {
    app: "cineflex",
    version: 1,
    exportedAt: new Date().toISOString(),
    list: read<LibraryItem>(LIST_KEY),
    lists: read<UserList>(LISTS_KEY),
    progress: read<ProgressItem>(PROGRESS_KEY),
    settings,
  };
}

const isItem = (x: unknown): x is LibraryItem =>
  !!x &&
  typeof x === "object" &&
  typeof (x as LibraryItem).id === "number" &&
  ((x as LibraryItem).type === "movie" || (x as LibraryItem).type === "tv") &&
  typeof (x as LibraryItem).title === "string";

/** Merge a backup into this device. Returns how many titles were added. */
export function importLibrary(data: unknown): { list: number; progress: number } {
  if (!data || typeof data !== "object" || (data as LibraryBackup).app !== "cineflex") {
    throw new Error("This file isn’t a CineFlex backup.");
  }
  const backup = data as LibraryBackup;
  const merge = <T extends LibraryItem>(key: string, incoming: unknown, max = Infinity) => {
    const current = read<T>(key);
    const fresh = (Array.isArray(incoming) ? incoming : []).filter(isItem) as T[];
    const added = fresh.filter((f) => !current.some((c) => same(c, f)));
    write(key, [...current, ...added].sort((a, b) => b.addedAt - a.addedAt).slice(0, max));
    return added.length;
  };
  const result = { list: merge<LibraryItem>(LIST_KEY, backup.list), progress: merge<ProgressItem>(PROGRESS_KEY, backup.progress, 30) };
  // Custom lists: merge by name, so importing twice doesn't duplicate them.
  if (Array.isArray(backup.lists)) {
    const current = read<UserList>(LISTS_KEY);
    for (const l of backup.lists) {
      if (!l || typeof l.name !== "string" || !Array.isArray(l.items)) continue;
      const items = l.items.filter(isItem);
      const existing = current.find((c) => c.name.toLowerCase() === l.name.toLowerCase());
      if (existing) {
        existing.items = [...existing.items, ...items.filter((i) => !existing.items.some((e) => same(e, i)))];
      } else {
        current.push({ id: newId(), name: cleanName(l.name) || "Imported list", createdAt: Date.now(), items });
      }
    }
    write(LISTS_KEY, [...current]);
  }
  if (backup.settings && typeof backup.settings === "object") {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(backup.settings));
    } catch {
      /* ignore */
    }
  }
  return result;
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    /* ignore */
  }
}

export function countRecentSearches(): number {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}
