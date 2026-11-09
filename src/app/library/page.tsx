import type { Metadata } from "next";
import { LibraryView } from "@/components/library-view";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  return (
    <main className="pb-16 pt-10 md:pt-14">
      <h1 className="px-gutter text-3xl font-bold tracking-[-0.03em] md:text-4xl">Library</h1>
      <p className="mt-2 px-gutter text-muted">Your saved titles and what you’re watching. Stored in this browser.</p>
      <LibraryView />
    </main>
  );
}
