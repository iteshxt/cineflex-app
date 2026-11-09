import type { Metadata } from "next";
import { Suspense } from "react";
import { Browse, BrowseSkeleton } from "@/components/browse";
import { SetupNotice } from "@/components/setup-notice";
import { hasTmdbKey } from "@/lib/tmdb";

export const metadata: Metadata = { title: "Series" };

export default function Page({ searchParams }: PageProps<"/tv">) {
  if (!hasTmdbKey()) return <SetupNotice />;
  return (
    <main className="px-gutter pb-16 pt-10 md:pt-14">
      <h1 className="text-3xl font-bold tracking-[-0.03em] md:text-4xl">Series</h1>
      <div className="mt-4">
        <Suspense fallback={<BrowseSkeleton />}>
          <Browse type="tv" searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
