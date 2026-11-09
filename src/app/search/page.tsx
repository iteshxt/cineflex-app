import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/search-view";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <main className="px-gutter pb-16 pt-10 md:pt-14">
      <Suspense>
        <SearchView />
      </Suspense>
    </main>
  );
}
