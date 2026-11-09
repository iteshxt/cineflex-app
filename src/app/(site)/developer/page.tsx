import type { Metadata } from "next";
import { ArrowUpRight, Globe, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import { LogoMark } from "@/components/logo";
import { SiteHeader } from "@/components/site-header";
import { DEVELOPER, SITE, type Product } from "@/lib/site";

export const metadata: Metadata = {
  title: "Developer",
  description: `CineFlex is built by ${DEVELOPER.name}. Other products: ${DEVELOPER.products.map((p) => p.name).join(", ")}.`,
};

const LINKS = [
  { icon: Globe, label: "iteshxt.me", href: DEVELOPER.website },
  { icon: GithubIcon, label: "GitHub", href: DEVELOPER.github },
  { icon: LinkedinIcon, label: "LinkedIn", href: DEVELOPER.linkedin },
  { icon: Mail, label: "Email", href: `mailto:${DEVELOPER.email}` },
];

const STATUS_STYLE: Record<Product["status"], string> = {
  Live: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  Beta: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  "In development": "bg-white/10 text-muted ring-white/15",
};

export default function DeveloperPage() {
  const [featured, ...rest] = DEVELOPER.products;
  return (
    <>
      <SiteHeader />
      <main className="px-gutter pb-24 pt-10 md:pt-16">
        <div className="mx-auto max-w-6xl">
          {/* Maker */}
          <section className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-muted">CineFlex is designed and built by</p>
              <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] md:text-6xl">{DEVELOPER.name}</h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-text/70">
                I make focused products that respect the people using them — fast, private by default, and free of clutter.
                Here’s what else I’m building.
              </p>
            </div>
            <nav aria-label="Elsewhere" className="flex flex-wrap gap-2">
              {LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-sm text-muted ring-1 ring-line transition hover:bg-surface-2 hover:text-text"
                >
                  <Icon className="size-4" />
                  {label}
                </a>
              ))}
            </nav>
          </section>

          {/* Products */}
          <section aria-label="Products" className="mt-16 space-y-5">
            <ProductCard product={featured} large />
            <div className="grid gap-5 md:grid-cols-2">
              {rest.map((p) => (
                <ProductCard key={p.name} product={p} />
              ))}
            </div>
          </section>

          {/* This product */}
          <section className="mt-5 flex flex-col gap-6 rounded-[28px] bg-surface p-6 ring-1 ring-line md:flex-row md:items-center md:p-8">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-bg ring-1 ring-line">
              <LogoMark className="size-9" />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight">CineFlex</h2>
              <p className="mt-1 text-muted">The app you’re using — movies and series, beautifully simple.</p>
            </div>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 self-start rounded-full bg-white/[0.06] px-4 text-sm font-medium ring-1 ring-white/10 transition hover:bg-white/10 md:self-auto"
            >
              <GithubIcon className="size-4" /> Source
            </a>
          </section>

          <p className="mt-10 text-sm text-faint">
            More work at{" "}
            <a href={DEVELOPER.website} target="_blank" rel="noreferrer" className="text-muted hover:text-accent">
              iteshxt.me
            </a>
            .
          </p>
        </div>
      </main>
    </>
  );
}

/** A product card with generated cover art (no screenshots needed). */
function ProductCard({ product: p, large = false }: { product: Product; large?: boolean }) {
  const primary = p.url ?? p.repo;
  return (
    <article
      className={`group relative isolate overflow-hidden rounded-[28px] bg-surface ring-1 ring-line transition hover:ring-white/15 ${
        large ? "grid md:grid-cols-[1.1fr_1fr]" : "flex flex-col"
      }`}
    >
      <Cover product={p} large={large} />
      <div className={`flex flex-1 flex-col p-6 ${large ? "md:p-10" : "md:p-8"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${STATUS_STYLE[p.status]}`}>{p.status}</span>
          {p.org && <span className="text-xs text-faint">by {p.org}</span>}
        </div>
        <h2 className={`mt-4 font-bold tracking-[-0.035em] ${large ? "text-4xl md:text-5xl" : "text-3xl"}`}>{p.name}</h2>
        <p className="mt-2 text-lg text-text/80">{p.tagline}</p>
        <p className="mt-3 leading-relaxed text-muted">{p.description}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <li key={t} className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-muted ring-1 ring-line">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-2 pt-7">
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-text px-4 text-sm font-semibold text-black transition hover:bg-white"
            >
              Visit {p.name} <ArrowUpRight className="size-4" />
            </a>
          )}
          {p.repo && (
            <a
              href={p.repo}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 transition ${
                p.url ? "bg-white/[0.06] ring-white/10 hover:bg-white/10" : "bg-text text-black ring-transparent hover:bg-white"
              }`}
            >
              <GithubIcon className="size-4" /> {p.url ? "Source" : "View on GitHub"}
            </a>
          )}
        </div>
      </div>
      {primary && (
        <a href={primary} target="_blank" rel="noreferrer" aria-label={`Open ${p.name}`} className="absolute inset-0 -z-10" />
      )}
    </article>
  );
}

/** Abstract cover: the product's initial over a soft glow in its hue, with a fine grid. */
function Cover({ product: p, large }: { product: Product; large: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${large ? "min-h-56 md:min-h-full" : "h-48"}`}
      style={{
        background: `radial-gradient(120% 90% at 20% 100%, ${p.hue}55, transparent 60%), radial-gradient(80% 80% at 100% 0%, ${p.hue}26, transparent 70%), var(--surface-2)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 0.25) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.25) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(circle at 70% 40%, black, transparent 75%)",
        }}
      />
      <span
        className={`absolute -bottom-[0.18em] right-6 select-none font-bold leading-none tracking-[-0.08em] transition-transform duration-500 group-hover:-translate-y-2 ${
          large ? "text-[220px]" : "text-[160px]"
        }`}
        style={{ color: "transparent", WebkitTextStroke: `1.5px ${p.hue}aa` }}
      >
        {p.name[0]}
      </span>
      <span className="absolute left-6 top-6 rounded-full bg-black/30 px-3 py-1 text-xs font-medium backdrop-blur" style={{ color: p.hue }}>
        {p.name}
      </span>
    </div>
  );
}
