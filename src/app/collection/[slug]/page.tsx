import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { PosterCard, PosterSkeleton } from "@/components/cards";
import { COLLECTIONS, getCollectionItems, isCollection } from "@/lib/collections";

const GRID = "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 xl:grid-cols-5 2xl:grid-cols-6";

export function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/collection/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return isCollection(slug) ? { title: COLLECTIONS[slug].title, description: COLLECTIONS[slug].blurb } : {};
}

export default async function CollectionPage({ params }: PageProps<"/collection/[slug]">) {
  const { slug } = await params;
  if (!isCollection(slug)) notFound();
  const { title, blurb } = COLLECTIONS[slug];

  return (
    <main className="px-gutter pb-16 pt-10 md:pt-14">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-text">
        <ArrowLeft className="size-4" /> Home
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-4xl">{title}</h1>
      <p className="mt-2 text-muted">{blurb}</p>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className={GRID}>
              {Array.from({ length: 18 }, (_, i) => (
                <PosterSkeleton key={i} />
              ))}
            </div>
          }
        >
          <Items slug={slug} />
        </Suspense>
      </div>
    </main>
  );
}

async function Items({ slug }: { slug: keyof typeof COLLECTIONS }) {
  const items = await getCollectionItems(slug);
  if (items.length === 0) return <p className="py-16 text-muted">Couldn’t load this list right now. Try again shortly.</p>;
  return (
    <div className={GRID}>
      {items.map((item) => (
        <PosterCard key={`${item.type}-${item.id}`} item={item} sizes="(min-width: 1280px) 16vw, (min-width: 640px) 25vw, 33vw" />
      ))}
    </div>
  );
}
