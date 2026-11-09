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

export type ProgressItem = LibraryItem & { season?: number; episode?: number; episodeName?: string };

const LIST_KEY = "cineflex:list";
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
    if (e.key === LIST_KEY || e.key === PROGRESS_KEY) cb();
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

/* ------------------------------------------------------------- progress */

export function useProgress() {
  return useSyncExternalStore(
    subscribe,
    () => read<ProgressItem>(PROGRESS_KEY),
    () => EMPTY as ProgressItem[],
  );
}

export function recordProgress(item: Omit<ProgressItem, "addedAt">) {
  const rest = read<ProgressItem>(PROGRESS_KEY).filter((i) => !same(i, item));
  write(PROGRESS_KEY, [{ ...item, addedAt: Date.now() }, ...rest].slice(0, MAX_PROGRESS));
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

export function removeFromList(id: number, type: MediaType) {
  write(
    LIST_KEY,
    read<LibraryItem>(LIST_KEY).filter((i) => !same(i, { id, type })),
  );
}
