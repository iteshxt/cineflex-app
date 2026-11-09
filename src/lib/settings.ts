"use client";

import { useSyncExternalStore } from "react";

import { DEFAULT_SETTINGS, SETTINGS_KEY, type Settings } from "./settings-shared";

export { ACCENTS, DEFAULT_SETTINGS, type Settings } from "./settings-shared";

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
    value = { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    /* corrupt: defaults */
  }
  cached = { raw, value };
  return value;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SETTINGS_KEY) {
      applyAccent(read().accent);
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function applyAccent(hex: string) {
  document.documentElement.style.setProperty("--accent", hex);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_SETTINGS);
}

export function updateSettings(patch: Partial<Settings>) {
  const next = { ...read(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    /* not persisted, still applied for this page */
    cached = { raw: null, value: next };
  }
  if (patch.accent) applyAccent(patch.accent);
  listeners.forEach((l) => l());
}

export function resetSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    /* ignore */
  }
  applyAccent(DEFAULT_SETTINGS.accent);
  listeners.forEach((l) => l());
}
