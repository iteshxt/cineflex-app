import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import { tmdbImage } from "@/lib/image";
import { watchHref } from "@/lib/routes";
import type { CastMember, MovieDetail, ShowDetail } from "@/lib/types";
import { ListButton } from "./list-button";
import { Scroller } from "./scroller";

function runtimeLabel(min: number | null) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/** Backdrop that sits behind the whole detail page. */
export function Backdrop({ path }: { path: string | null }) {
  const src = tmdbImage(path, "w1280");
  return (
    <div className="absolute inset-x-0 top-0 h-[78svh] max-h-[880px] overflow-hidden" aria-hidden="true">
      {src && <Image src={src} alt="" fill priority sizes="100vw" className="object-cover object-[center_20%] fade-in" />}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-bg/20" />
    </div>
  );
}

export function DetailHeader({ item, playHref }: { item: MovieDetail | ShowDetail; playHref?: string }) {
  const poster = tmdbImage(item.poster, "w500");
  const meta = [
    item.year,
    item.type === "movie" ? runtimeLabel(item.runtime) : `${item.seasons.length} Season${item.seasons.length === 1 ? "" : "s"}`,
    item.type === "tv" && item.status === "Returning Series" ? "Ongoing" : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-end md:gap-10">
      {poster && (
        <div className="relative hidden aspect-[2/3] w-[230px] shrink-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10 md:block lg:w-[260px]">
          <Image src={poster} alt={`${item.title} poster`} fill priority sizes="260px" className="object-cover" />
        </div>
      )}
      <div className="min-w-0 max-w-2xl">
        {item.logo ? (
          <h1 className="mb-5">
            <Image
              src={tmdbImage(item.logo, "w500")!}
              alt={item.title}
              width={500}
              height={200}
              priority
              className="h-auto max-h-28 w-auto max-w-[min(440px,85vw)] object-contain object-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] md:max-h-32"
            />
          </h1>
        ) : (
          <h1 className="mb-4 text-4xl font-bold leading-[0.95] tracking-[-0.03em] md:text-6xl">{item.title}</h1>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
          {item.rating > 0 && (
            <span className="flex items-center gap-1 font-medium text-text">
              <Star className="size-3.5 fill-accent text-accent" />
              {item.rating.toFixed(1)}
            </span>
          )}
          {meta.map((m) => (
            <span key={m} className="flex items-center gap-2">
              <span className="text-faint">·</span>
              {m}
            </span>
          ))}
        </div>

        {item.genres.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {item.genres.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/${item.type === "movie" ? "movies" : "tv"}?genre=${g.id}`}
                  className="rounded-full bg-white/[0.07] px-2.5 py-1 text-xs text-muted backdrop-blur transition hover:bg-white/15 hover:text-text"
                >
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {item.tagline && <p className="mt-5 text-sm italic text-text/60">{item.tagline}</p>}
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-text/80">{item.overview}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href={playHref ?? watchHref(item)}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-text px-7 text-sm font-semibold text-black transition hover:bg-white active:scale-[0.98]"
          >
            <Play className="size-4 fill-black" />
            Watch Now
          </Link>
          <ListButton
            item={{ id: item.id, type: item.type, title: item.title, poster: item.poster, backdrop: item.backdrop, year: item.year }}
          />
          {item.trailerKey && (
            <a
              href={`https://www.youtube.com/watch?v=${item.trailerKey}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center rounded-full px-4 text-sm font-medium text-muted transition hover:text-text"
            >
              Trailer ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function Cast({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;
  return (
    <section className="py-4">
      <h2 className="mb-3 px-gutter text-lg font-semibold tracking-tight md:text-xl">Cast</h2>
      <Scroller className="gap-4">
        {cast.map((c) => {
          const src = tmdbImage(c.profile, "w185");
          return (
            <div key={c.id} className="w-[96px] shrink-0 snap-start text-center">
              <div className="relative mx-auto size-[84px] overflow-hidden rounded-full bg-surface ring-1 ring-line">
                {src ? (
                  <Image src={src} alt={c.name} fill sizes="84px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-lg font-semibold text-faint">
                    {c.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-tight">{c.name}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-faint">{c.character}</p>
            </div>
          );
        })}
      </Scroller>
    </section>
  );
}

export function DetailSkeleton() {
  return (
    <div className="px-gutter pt-[34svh]" aria-hidden="true">
      <div className="flex items-end gap-10">
        <div className="skeleton hidden aspect-[2/3] w-[260px] rounded-2xl md:block" />
        <div className="min-w-0 flex-1">
          <div className="skeleton h-16 w-80 max-w-full rounded-lg" />
          <div className="skeleton mt-5 h-3 w-48 rounded" />
          <div className="skeleton mt-6 h-3 w-[32rem] max-w-full rounded" />
          <div className="skeleton mt-2 h-3 w-[28rem] max-w-full rounded" />
          <div className="mt-7 flex gap-3">
            <div className="skeleton h-12 w-36 rounded-full" />
            <div className="skeleton h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
