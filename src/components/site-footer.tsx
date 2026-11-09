"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_LINKS, DEVELOPER, LEGAL_LINKS, SITE, SITE_LINKS } from "@/lib/site";
import { LogoMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-gutter pb-10 pt-14 text-sm">
      <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Link href="/" className="inline-flex items-center gap-2">
            <LogoMark className="size-7" />
            <span className="text-[17px] font-semibold tracking-[-0.035em]">CineFlex</span>
          </Link>
          <p className="mt-3 leading-relaxed text-muted">{SITE.tagline} No sign-up, no clutter.</p>
        </div>
        <FooterCol title="Watch" links={APP_LINKS} />
        <FooterCol title="CineFlex" links={SITE_LINKS} />
        <FooterCol title="Legal" links={LEGAL_LINKS} />
      </div>

      <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs text-faint md:flex-row md:items-start md:justify-between">
        <p className="max-w-2xl leading-relaxed">
          CineFlex does not host any video. Titles, artwork and metadata are provided by{" "}
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-muted hover:underline">
            TMDB
          </a>
          ; this product uses the TMDB API but is not endorsed or certified by TMDB. Playback is provided by a third-party
          embed. See the{" "}
          <Link href="/disclaimer" className="underline-offset-2 hover:text-muted hover:underline">
            disclaimer
          </Link>
          .
        </p>
        <p className="shrink-0">
          © 2026 CineFlex · Built by{" "}
          <a href={DEVELOPER.website} target="_blank" rel="noreferrer" className="text-muted hover:text-accent">
            {DEVELOPER.name}
          </a>
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-muted transition-colors hover:text-text">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Footer inside the app shell: hidden on the full-screen player. */
export function AppFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/watch")) return null;
  return (
    <div className="mt-16">
      <SiteFooter />
    </div>
  );
}
