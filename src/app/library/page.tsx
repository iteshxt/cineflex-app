import type { Metadata } from "next";
import Link from "next/link";
import { Settings } from "lucide-react";
import { LibraryView } from "@/components/library-view";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  return (
    <main className="pb-16 pt-10 md:pt-14">
      <div className="flex items-center justify-between px-gutter">
        <h1 className="text-3xl font-bold tracking-[-0.03em] md:text-4xl">Library</h1>
        {/* Settings lives in the desktop rail; on mobile it's reached from here. */}
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex size-11 items-center justify-center rounded-full bg-surface text-muted ring-1 ring-line transition hover:text-text md:hidden"
        >
          <Settings className="size-5" />
        </Link>
      </div>
      <p className="mt-2 px-gutter text-muted">Your saved titles and what you’re watching. Stored in this browser.</p>
      <LibraryView />
    </main>
  );
}
