"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Home, Library, Search, Settings, Tv, type LucideIcon } from "lucide-react";
import { LogoMark } from "./logo";

type Item = { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean };

// Search sits in the middle of the main group on both desktop and mobile.
const MAIN: Item[] = [
  { href: "/home", label: "Home", icon: Home, match: (p) => p === "/home" || p.startsWith("/collection") },
  { href: "/movies", label: "Movies", icon: Clapperboard, match: (p) => p.startsWith("/movie") },
  { href: "/search", label: "Search", icon: Search, match: (p) => p.startsWith("/search") },
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
      {/* Desktop rail: logo on top; the five main items are centred so Search sits at the
          vertical middle, and Settings hangs directly below Library. */}
      <nav
        aria-label="Primary"
        className="fixed inset-y-0 left-0 z-40 hidden w-rail flex-col items-center bg-gradient-to-r from-bg via-bg/80 to-transparent py-6 md:flex"
      >
        <Link href="/home" aria-label="CineFlex home" className="group flex flex-col items-center gap-1.5">
          <LogoMark className="size-11 transition-transform group-hover:scale-105" />
          <span className="text-[13px] font-semibold tracking-[-0.02em] text-text/85 transition-colors group-hover:text-text">
            CineFlex
          </span>
        </Link>
        <div className="relative my-auto">
          <ul className="flex flex-col gap-3">
            {MAIN.map((item) => (
              <li key={item.href}>
                <RailLink item={item} active={item.match(pathname)} />
              </li>
            ))}
          </ul>
          <div className="absolute inset-x-0 top-full flex flex-col items-center pt-3">
            <span className="mb-3 h-px w-8 bg-white/10" aria-hidden="true" />
            <RailLink item={SETTINGS} active={SETTINGS.match(pathname)} />
          </div>
        </div>
      </nav>

      {/* Mobile brand mark on the home screen (the rail carries it on desktop) */}
      {pathname === "/home" && (
        <Link
          href="/"
          aria-label="About CineFlex"
          className="absolute left-4 top-[max(16px,env(safe-area-inset-top))] z-30 flex items-center gap-2 md:hidden"
        >
          <LogoMark className="size-7" />
          <span className="text-[17px] font-semibold tracking-[-0.045em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            CineFlex
          </span>
        </Link>
      )}

      {/* Mobile floating pill: icon only, Search in the centre */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(14px,env(safe-area-inset-bottom))] md:hidden"
      >
        <ul className="flex items-center gap-1 rounded-full bg-surface/85 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-2xl">
          {MAIN.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex size-14 items-center justify-center rounded-full transition-colors ${
                    active ? "text-text" : "text-faint active:text-muted"
                  }`}
                >
                  <Icon className="size-[26px]" strokeWidth={active ? 2.2 : 1.85} />
                  <Marker active={active} className="bottom-2" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

/** The only active-state indicator: a small accent bar under the icon. */
function Marker({ active, className = "" }: { active: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-accent transition-all duration-300 ${
        active ? "w-4 opacity-100" : "w-0 opacity-0"
      } ${className}`}
    />
  );
}

function RailLink({ item, active }: { item: Item; active: boolean }) {
  const { href, label, icon: Icon } = item;
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`group relative flex size-16 items-center justify-center rounded-2xl transition-colors focus-visible:outline-offset-0 ${
        active ? "text-text" : "text-faint hover:text-text"
      }`}
    >
      <Icon
        className="size-7 transition-transform duration-200 group-hover:scale-110"
        strokeWidth={active ? 2.1 : 1.75}
      />
      <Marker active={active} className="bottom-2" />
      <span className="pointer-events-none absolute left-full ml-3 -translate-x-1 whitespace-nowrap rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-text opacity-0 shadow-lg ring-1 ring-line transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
        {label}
      </span>
    </Link>
  );
}
