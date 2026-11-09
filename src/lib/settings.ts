"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS, SETTINGS_KEY, normalizeAccent, type Settings } from "./settings-shared";

export { ACCENTS, AUDIO_LANGUAGES, DEFAULT_SETTINGS, type Settings } from "./settings-shared";

const listeners = new Set<() => void>();
let cached: { raw: string | null; value: Settings } | null = null;

function read(): Settings {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SETTINGS_KEY);
  } catch {
    return DEFAULT_SETTINGS;
  }
  if (cached && cached.raw === raw) return cached.value;
  let value = DEFAULT_SETTINGS;
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    value = { ...DEFAULT_SETTINGS, ...parsed, accent: normalizeAccent(parsed.accent) };
  } catch {
    /* corrupt: defaults */
  }
  cached = { raw, value };
  return value;
}

/** Push settings that live outside React (CSS variables, root classes) to the document. */
function applyToDocument(s: Settings) {
  const root = document.documentElement;
  root.style.setProperty("--accent", s.accent);
  root.classList.toggle("reduce-motion", s.reduceMotion);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SETTINGS_KEY) {
      applyToDocument(read());
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_SETTINGS);
}

export function getSettings(): Settings {
  return read();
}

export function updateSettings(patch: Partial<Settings>) {
  const next = { ...read(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    /* not persisted, still applied for this page */
    cached = { raw: null, value: next };
  }
  applyToDocument(next);
  listeners.forEach((l) => l());
}

export function resetSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    /* ignore */
  }
  applyToDocument(DEFAULT_SETTINGS);
  listeners.forEach((l) => l());
}
