import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/search-view";
import { getTrending } from "@/lib/tmdb";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <main className="px-gutter pb-16 pt-10 md:pt-16">
      <Suspense>
        <SearchWithSuggestions />
      </Suspense>
    </main>
  );
}

async function SearchWithSuggestions() {
  const trending = (await getTrending("all", "day")).filter((i) => i.poster).slice(0, 12);
  return <SearchView suggestions={trending} />;
}
