"use client";

import { useSyncExternalStore } from "react";

/** Chrome/Edge/Samsung Internet event fired when the app is installable. Not in lib.dom yet. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallState = "unsupported" | "available" | "installed";

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Call once on startup (from the root layout) so the prompt event isn't missed. */
export function initPwa() {
  if (typeof window === "undefined" || (window as Window & { __cineflexPwa?: boolean }).__cineflexPwa) return;
  (window as Window & { __cineflexPwa?: boolean }).__cineflexPwa = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // we show our own button instead of the mini-infobar
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    emit();
  });

  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      /* install still works without offline support */
    });
  }
}

function getState(): InstallState {
  if (installed || isStandalone()) return "installed";
  return deferred ? "available" : "unsupported";
}

export function useInstallState() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => void listeners.delete(cb);
    },
    getState,
    () => "unsupported" as InstallState,
  );
}

/** Opens the browser's install dialog. Returns true if the user accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const e = deferred;
  await e.prompt();
  const { outcome } = await e.userChoice;
  deferred = null; // the event can only be used once
  if (outcome === "accepted") installed = true;
  emit();
  return outcome === "accepted";
}
