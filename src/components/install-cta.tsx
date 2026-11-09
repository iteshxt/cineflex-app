"use client";

import Link from "next/link";
import { Check, Download } from "lucide-react";
import { promptInstall, useInstallState } from "@/lib/pwa";

/** "Install the app" button: opens the browser's install dialog when available, else explains how. */
export function InstallCta({ className = "" }: { className?: string }) {
  const state = useInstallState();
  const base = `inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold ring-1 transition ${className}`;

  if (state === "installed") {
    return (
      <span className={`${base} text-muted ring-white/15`}>
        <Check className="size-4 text-accent" /> Installed
      </span>
    );
  }
  if (state === "available") {
    return (
      <button type="button" onClick={() => void promptInstall()} className={`${base} bg-white/[0.06] ring-white/15 backdrop-blur hover:bg-white/10`}>
        <Download className="size-4" /> Install the app
      </button>
    );
  }
  return (
    <Link href="/faq#install" className={`${base} bg-white/[0.06] ring-white/15 backdrop-blur hover:bg-white/10`}>
      <Download className="size-4" /> Install the app
    </Link>
  );
}
