import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, Play, RotateCw, Search, ShieldCheck } from "lucide-react";
import { InstallCta } from "@/components/install-cta";
import { SiteHeader } from "@/components/site-header";
import { tmdbImage } from "@/lib/image";
import { detailHref } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { getTrending } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

export const metadata: Metadata = {
  title: { absolute: "CineFlex — Movies & series, beautifully simple" },
  alternates: { canonical: "/" },
};

const FAQ = [
  { q: "Is CineFlex free?", a: "Yes. There’s no subscription and nothing to sign up for." },
  {
    q: "Where do the videos come from?",
    a: "CineFlex doesn’t host any video. It shows titles from TMDB and plays them through a third-party embedded player.",
  },
  { q: "Is my data stored anywhere?", a: "Only in your own browser. My List, history and settings never leave your device." },
];

const EXTRAS = ["No account needed", "Installs like an app", "Your own accent color", "Spoiler protection", "Works on any screen"];

const CONTAINER = "mx-auto w-full max-w-6xl";

export default function LandingPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden px-gutter">
        <Suspense fallback={null}>
          <PosterWall />
        </Suspense>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_60%,transparent_0%,var(--bg)_75%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/85 to-bg/30" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-bg to-transparent" />

        <SiteHeader overlay />

        <div className={`${CONTAINER} flex flex-1 items-center pb-20 pt-28`}>
          <div className="max-w-2xl">
            <h1 className="fade-in text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[88px]">
              Movies &amp; series,
              <br />
              <span className="text-accent">beautifully</span> simple.
            </h1>
            <p className="fade-in mt-6 max-w-lg text-lg leading-relaxed text-text/70">
              Discover what’s trending, find anything in seconds and press play. A calm, clutter-free home for everything you
              want to watch.
            </p>
            <div className="fade-in mt-9 flex flex-wrap gap-3">
              <Link
                href="/home"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-text px-6 text-sm font-semibold text-black transition hover:bg-white active:scale-[0.98]"
              >
                <Play className="size-4 fill-black" />
                Start watching
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <InstallCta />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ showcase */}
      <Suspense fallback={<Showcase items={[]} />}>
        <ShowcaseWithArt />
      </Suspense>

      {/* ------------------------------------------------------------ trending */}
      <Suspense fallback={null}>
        <TrendingStrip />
      </Suspense>

      {/* ----------------------------------------------------------------- faq */}
      <section className="px-gutter py-20 md:py-28" aria-labelledby="faq">
        <div className={`${CONTAINER} grid gap-10 md:grid-cols-[1fr_1.4fr]`}>
          <div>
            <h2 id="faq" className="text-3xl font-bold tracking-[-0.035em] md:text-4xl">
              Good to know
            </h2>
            <Link href="/faq" className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent">
              All questions <ArrowRight className="size-4" />
            </Link>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-6">
                <dt className="text-lg font-medium tracking-tight">{q}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ----------------------------------------------------------------- cta */}
      <section className="px-gutter pb-24">
        <div className={`${CONTAINER} flex flex-col items-start justify-between gap-6 border-t border-line pt-14 md:flex-row md:items-center`}>
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.035em] md:text-4xl">Ready when you are.</h2>
            <p className="mt-2 text-muted">{SITE.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/home"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-text px-6 text-sm font-semibold text-black transition hover:bg-white"
            >
              <Play className="size-4 fill-black" />
              Start watching
            </Link>
            <InstallCta />
          </div>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------- hero art */

/** Slowly drifting, tilted wall of trending posters behind the hero. Decorative only. */
async function PosterWall() {
  const items = (await getTrending("all", "week")).filter((i) => i.poster).slice(0, 18);
  if (items.length < 6) return null;
  const columns = [0, 1, 2, 3, 4, 5].map((c) => items.filter((_, i) => i % 6 === c));
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
      <div className="absolute -right-[10%] -top-[20%] flex h-[140%] w-[90%] rotate-[-10deg] gap-4 opacity-55 md:w-[70%]">
        {columns.map((col, c) => (
          <div
            key={c}
            className="poster-drift flex min-w-0 flex-1 flex-col gap-4"
            style={{ animationDuration: `${60 + c * 9}s`, animationDirection: c % 2 ? "reverse" : "normal" }}
          >
            {[...col, ...col].map((item, i) => (
              <div key={`${item.id}-${i}`} className="relative aspect-[2/3] w-full shrink-0 overflow-hidden rounded-xl">
                <Image src={tmdbImage(item.poster, "w342")!} alt="" fill sizes="200px" className="object-cover" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- showcase */

async function ShowcaseWithArt() {
  const items = (await getTrending("all", "day")).filter((i) => i.poster && i.backdrop);
  return <Showcase items={items} />;
}

/**
 * Three moments of using the app, each shown with a small mock of the real UI built from
 * live artwork — rather than a grid of generic feature cards.
 */
function Showcase({ items }: { items: MediaItem[] }) {
  const [a, b, c, d, e, f] = items;
  return (
    <section className="px-gutter py-16 md:py-24" aria-label="How CineFlex works">
      <div className={`${CONTAINER} space-y-24 md:space-y-32`}>
        <Moment
          index="01"
          title="Find it in seconds."
          body="Type a few letters and results appear as you go — movies and series together, with the best match up front. Or filter by genre, decade, rating and language."
          visual={<SearchMock items={[a, b, c, d].filter(Boolean)} />}
        />
        <Moment
          flip
          index="02"
          title="Play without the pop-ups."
          body="The player is sandboxed, so a stray click can’t open ad tabs or whisk you off to another site. Leave the player and it stops — no audio playing in the background."
          visual={<PlayerMock item={b ?? a} />}
        />
        <Moment
          index="03"
          title="Right where you left off."
          body="CineFlex remembers the episode you were on and keeps your list — on your device, with no account to make."
          visual={<ReturnMock items={[c, d, e, f].filter(Boolean)} />}
        />

        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
          {EXTRAS.map((x, i) => (
            <span key={x} className="flex items-center gap-3">
              {i > 0 && <span className="size-1 rounded-full bg-faint" aria-hidden="true" />}
              {x}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

function Moment({
  index,
  title,
  body,
  visual,
  flip = false,
}: {
  index: string;
  title: string;
  body: string;
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div className={flip ? "md:order-2" : ""}>
        <p className="font-mono text-sm text-faint">{index}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-[44px] md:leading-[1.05]">{title}</h2>
        <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted">{body}</p>
      </div>
      <div className={flip ? "md:order-1" : ""} aria-hidden="true">
        {visual}
      </div>
    </div>
  );
}

function Art({ path, size, className = "" }: { path: string | null | undefined; size: "w342" | "w780"; className?: string }) {
  const src = tmdbImage(path, size);
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {src && <Image src={src} alt="" fill sizes={size === "w342" ? "160px" : "560px"} className="object-cover" />}
    </div>
  );
}

function SearchMock({ items }: { items: MediaItem[] }) {
  // Show a partly typed, meaningful word from the top title (e.g. "Odys" for "The Odyssey").
  const word = items[0]?.title.split(/[\s:,-]+/).find((w) => w.length > 3 && !/^(the|and|with|from)$/i.test(w)) ?? "Dune";
  const query = word.slice(0, Math.max(3, Math.ceil(word.length * 0.6)));
  return (
    <div className="rounded-3xl bg-surface p-5 ring-1 ring-line md:p-6">
      <div className="flex h-12 items-center gap-3 rounded-full bg-surface-2 px-5 ring-2 ring-accent/50">
        <Search className="size-5 text-accent" />
        <span className="text-[15px]">
          {query}
          <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-text" />
        </span>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-3">
        {(items.length ? items : Array.from({ length: 4 }, () => undefined)).slice(0, 4).map((it, i) => (
          <div key={i}>
            <Art
              path={it?.poster}
              size="w342"
              className={`aspect-[2/3] rounded-xl ${i === 0 ? "ring-2 ring-accent" : "opacity-70"}`}
            />
            <div className={`mt-2 h-2 rounded-full ${i === 0 ? "w-4/5 bg-white/30" : "w-3/5 bg-white/10"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerMock({ item }: { item?: MediaItem }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-black ring-1 ring-line">
      <Art path={item?.backdrop} size="w780" className="absolute inset-0 opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/50" />
      <div className="absolute inset-x-0 top-0 flex items-center gap-2.5 p-4">
        <span className="flex size-8 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <ArrowLeft className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item?.title ?? "Now playing"}</span>
        <span className="flex h-8 items-center gap-1.5 rounded-full bg-accent/20 px-3 text-xs font-medium text-accent ring-1 ring-accent/40">
          <ShieldCheck className="size-3.5" /> Ad shield on
        </span>
        <span className="hidden size-8 items-center justify-center rounded-full bg-white/15 backdrop-blur sm:flex">
          <RotateCw className="size-3.5" />
        </span>
      </div>
      <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl">
        <Play className="ml-0.5 size-6 fill-black" />
      </span>
      <div className="absolute inset-x-4 bottom-4 h-1 overflow-hidden rounded-full bg-white/20">
        <div className="h-full w-[38%] rounded-full bg-accent" />
      </div>
    </div>
  );
}

function ReturnMock({ items }: { items: MediaItem[] }) {
  const [one, two, ...list] = items;
  return (
    <div className="relative rounded-3xl bg-surface p-5 ring-1 ring-line md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">Continue watching</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[one, two].map((it, i) => (
          <div key={i} className="relative">
            <Art path={it?.backdrop} size="w780" className="aspect-video rounded-xl" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/85 to-transparent" />
            <div className="absolute inset-x-3 bottom-2">
              <p className="truncate text-xs font-semibold">{it?.title ?? "—"}</p>
              <p className="text-[11px] text-muted">{it?.type === "tv" ? `S1 · E${i === 0 ? 4 : 7}` : "Movie"}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-faint">My list</p>
      <div className="mt-4 flex">
        {(list.length ? list : [undefined, undefined]).slice(0, 2).map((it, i) => (
          <Art
            key={i}
            path={it?.poster}
            size="w342"
            className={`aspect-[2/3] w-20 rounded-lg ring-2 ring-surface ${i > 0 ? "-ml-6 rotate-6" : "-rotate-3"}`}
          />
        ))}
        <span className="-ml-4 flex aspect-[2/3] w-20 rotate-12 items-center justify-center rounded-lg bg-surface-2 text-sm text-muted ring-2 ring-surface">
          +12
        </span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- trending */

async function TrendingStrip() {
  const items = (await getTrending("all", "day")).filter((i) => i.backdrop).slice(0, 8);
  if (items.length === 0) return null;
  return (
    <section className="py-10" aria-labelledby="trending">
      <div className={`${CONTAINER} flex items-end justify-between px-gutter xl:px-0`}>
        <h2 id="trending" className="text-3xl font-bold tracking-[-0.035em] md:text-4xl">
          Trending today
        </h2>
        <Link href="/home" className="hidden items-center gap-1.5 text-sm text-muted transition hover:text-accent sm:inline-flex">
          Browse everything <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-2 xl:px-[max(var(--gutter),calc((100vw-72rem)/2))]">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={detailHref(item)}
            className="group relative aspect-video w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl bg-surface ring-1 ring-line md:w-[380px]"
          >
            <Image
              src={tmdbImage(item.backdrop, "w780")!}
              alt=""
              fill
              sizes="380px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <div className="absolute inset-x-4 bottom-3">
              <p className="truncate font-semibold">{item.title}</p>
              <p className="text-xs text-muted">
                {item.year} · {item.type === "movie" ? "Movie" : "Series"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
