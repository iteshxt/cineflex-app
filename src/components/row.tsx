import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { PosterCard, PosterSkeleton } from "./cards";
import { Scroller } from "./scroller";

// Fewer, larger cards per screen: ~2.5 on phones, ~4 on laptops, ~6 on wide screens.
const CARD = "w-[150px] sm:w-[185px] lg:w-[215px] 2xl:w-[255px]";
/** Rows show a short, curated slice; the rest lives behind "See all". */
const ROW_LIMIT = 10;

export function RowHeader({ title, href, children }: { title: string; href?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4 px-gutter">
      <h2 className="text-lg font-semibold tracking-tight md:text-xl">
        {href ? (
          <Link href={href} className="group inline-flex items-center gap-1 hover:text-white">
            {title}
            <ChevronRight className="size-4 text-faint transition group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        ) : (
          title
        )}
      </h2>
      {children ??
        (href ? (
          <Link href={href} className="text-[13px] font-medium text-muted transition hover:text-accent">
            See all
          </Link>
        ) : null)}
    </div>
  );
}

export function Row({ title, items, href }: { title: string; items: MediaItem[]; href?: string }) {
  if (items.length === 0) return null;
  const shown = items.filter((i) => i.poster).slice(0, ROW_LIMIT);
  return (
    <section className="py-5">
      <RowHeader title={title} href={href} />
      <Scroller>
        {shown.map((item) => (
          <PosterCard key={`${item.type}-${item.id}`} item={item} className={CARD} />
        ))}
        {href && <SeeAllTile href={href} title={title} />}
      </Scroller>
    </section>
  );
}

function SeeAllTile({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} aria-label={`See all: ${title}`} className={`group block shrink-0 snap-start ${CARD}`}>
      <div className="flex aspect-[2/3] flex-col items-center justify-center gap-3 rounded-[10px] bg-surface ring-1 ring-line transition group-hover:bg-surface-2 group-hover:ring-accent/40">
        <span className="flex size-12 items-center justify-center rounded-full bg-white/[0.06] text-muted transition group-hover:bg-accent group-hover:text-accent-ink">
          <ArrowRight className="size-5" />
        </span>
        <span className="text-sm font-medium text-muted group-hover:text-text">See all</span>
      </div>
    </Link>
  );
}

export function RowSkeleton() {
  return (
    <section className="py-5" aria-hidden="true">
      <div className="skeleton mx-gutter mb-3 h-5 w-40 rounded" />
      <div className="flex gap-3 overflow-hidden px-gutter md:gap-5">
        {Array.from({ length: 9 }, (_, i) => (
          <PosterSkeleton key={i} className={CARD} />
        ))}
      </div>
    </section>
  );
}
