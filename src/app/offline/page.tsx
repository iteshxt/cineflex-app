import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { RetryButton } from "@/components/retry-button";

export const metadata: Metadata = { title: "Offline" };

/** Precached by the service worker and shown when a page can't be reached. */
export default function OfflinePage() {
  return (
    <main className="flex min-h-[80dvh] flex-col items-center justify-center px-gutter text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <WifiOff className="size-6" />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">You’re offline</h1>
      <p className="mt-2 max-w-sm text-muted">
        Cineflex needs a connection to load titles and play videos. Pages you visited recently may still open.
      </p>
      <RetryButton />
    </main>
  );
}
