"use client";

import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { promptInstall, useInstallState } from "@/lib/pwa";
import { LogoMark } from "./logo";

const KEY = "cineflex:install-dismissed";

function readDismissed() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** One-time, dismissible install offer shown when the browser reports the app is installable. */
export function InstallBanner() {
  const state = useInstallState();
  const pathname = usePathname();
  const stored = useSyncExternalStore(
    () => () => {},
    readDismissed,
    () => true,
  );
  const [dismissedNow, setDismissed] = useState(false);

  if (state !== "available" || stored || dismissedNow || pathname.startsWith("/watch")) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-label="Install CineFlex"
      className="menu-in fixed inset-x-3 bottom-[calc(max(14px,env(safe-area-inset-bottom))+84px)] z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-surface-2/95 p-3 pl-4 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl md:bottom-6 md:left-auto md:right-6 md:mx-0"
    >
      <LogoMark className="size-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Install CineFlex</p>
        <p className="text-xs text-muted">Full screen, from your home screen.</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          await promptInstall();
          dismiss();
        }}
        className="h-9 shrink-0 rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.97]"
      >
        Install
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Not now"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-faint hover:bg-white/5 hover:text-text"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
