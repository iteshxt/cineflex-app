import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { PosterCard, PosterSkeleton } from "./cards";
import { Scroller } from "./scroller";

const CARD = "w-[132px] sm:w-[156px] lg:w-[176px]";

export function RowHeader({ title, href, children }: { title: string; href?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4 px-gutter">
      <h2 className="text-lg font-semibold tracking-tight md:text-xl">
        {href ? (
          <Link href={href} className="group inline-flex items-center gap-1 hover:text-white">
            {title}
            <ChevronRight className="size-4 text-faint transition group-hover:translate-x-0.5 group-hover:text-text" />
          </Link>
        ) : (
          title
        )}
      </h2>
      {children}
    </div>
  );
}

export function Row({ title, items, href }: { title: string; items: MediaItem[]; href?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="py-4">
      <RowHeader title={title} href={href} />
      <Scroller>
        {items.map((item) => (
          <PosterCard key={`${item.type}-${item.id}`} item={item} className={CARD} />
        ))}
      </Scroller>
    </section>
  );
}

export function RowSkeleton() {
  return (
    <section className="py-4" aria-hidden="true">
      <div className="skeleton mx-gutter mb-3 h-5 w-40 rounded" />
      <div className="flex gap-3 overflow-hidden px-gutter md:gap-4">
        {Array.from({ length: 9 }, (_, i) => (
          <PosterSkeleton key={i} className={CARD} />
        ))}
      </div>
    </section>
  );
}
