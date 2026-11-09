"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Home, Library, Search, Settings, Tv, type LucideIcon } from "lucide-react";
import { LogoMark } from "./logo";

type Item = { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean };

const MAIN: Item[] = [
  { href: "/search", label: "Search", icon: Search, match: (p) => p.startsWith("/search") },
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" || p.startsWith("/collection") },
  { href: "/movies", label: "Movies", icon: Clapperboard, match: (p) => p.startsWith("/movie") },
  { href: "/tv", label: "Series", icon: Tv, match: (p) => p === "/tv" || p.startsWith("/tv/") },
  { href: "/library", label: "Library", icon: Library, match: (p) => p.startsWith("/library") },
];

const SETTINGS: Item = { href: "/settings", label: "Settings", icon: Settings, match: (p) => p.startsWith("/settings") };

export function Nav() {
  const pathname = usePathname();
  return <NavView pathname={pathname} />;
}

/** Rendered with an empty pathname as the Suspense fallback while the route is unknown. */
export function NavView({ pathname }: { pathname: string }) {
  if (pathname.startsWith("/watch")) return null;

  return (
    <>
      {/* Desktop rail */}
      <nav
        aria-label="Primary"
        className="fixed inset-y-0 left-0 z-40 hidden w-rail flex-col items-center bg-gradient-to-r from-bg via-bg/80 to-transparent py-6 md:flex"
      >
        <Link href="/" aria-label="Cineflex home" className="transition-transform hover:scale-105">
          <LogoMark className="size-10" />
        </Link>
        <ul className="my-auto flex flex-col gap-3">
          {MAIN.map((item) => (
            <li key={item.href}>
              <RailLink item={item} active={item.match(pathname)} />
            </li>
          ))}
        </ul>
        <RailLink item={SETTINGS} active={SETTINGS.match(pathname)} />
      </nav>

      {/* Mobile floating pill */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(14px,env(safe-area-inset-bottom))] md:hidden"
      >
        <ul className="flex items-center gap-1 rounded-full bg-surface/85 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-2xl">
          {[...MAIN, SETTINGS].map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`flex size-12 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-accent text-accent-ink" : "text-muted active:bg-white/10"
                  }`}
                >
                  <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.85} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

function RailLink({ item, active }: { item: Item; active: boolean }) {
  const { href, label, icon: Icon } = item;
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`group relative flex size-14 items-center justify-center rounded-2xl transition-colors ${
        active ? "bg-white/[0.08] text-text" : "text-faint hover:bg-white/5 hover:text-text"
      }`}
    >
      <Icon className="size-6" strokeWidth={active ? 2.1 : 1.75} />
      {active && <span className="absolute -left-[15px] h-6 w-[3px] rounded-r-full bg-accent" />}
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-text opacity-0 shadow-lg ring-1 ring-line transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </Link>
  );
}
