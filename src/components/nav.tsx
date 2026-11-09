"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Home, Library, Search, Tv } from "lucide-react";
import { LogoMark } from "./logo";

const ITEMS = [
  { href: "/search", label: "Search", icon: Search, match: (p: string) => p.startsWith("/search") },
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/movies", label: "Movies", icon: Clapperboard, match: (p: string) => p.startsWith("/movie") },
  { href: "/tv", label: "Series", icon: Tv, match: (p: string) => p === "/tv" || p.startsWith("/tv/") },
  { href: "/library", label: "Library", icon: Library, match: (p: string) => p.startsWith("/library") },
];

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
        className="fixed inset-y-0 left-0 z-40 hidden w-rail flex-col items-center bg-gradient-to-r from-bg/90 to-transparent py-6 md:flex"
      >
        <Link href="/" aria-label="Cineflex home" className="mb-auto">
          <LogoMark className="size-9" />
        </Link>
        <ul className="flex flex-col gap-2">
          {ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex size-12 items-center justify-center rounded-xl transition-colors ${
                    active ? "text-text" : "text-faint hover:bg-white/5 hover:text-text"
                  }`}
                >
                  <Icon className="size-[22px]" strokeWidth={1.75} />
                  {active && <span className="absolute bottom-1.5 size-1 rounded-full bg-accent" />}
                  <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-surface-2 px-2 py-1 text-xs text-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto" />
      </nav>

      {/* Mobile bottom bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="grid grid-cols-5">
          {ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${active ? "text-text" : "text-faint"}`}
                >
                  <Icon className={`size-5 ${active ? "text-accent" : ""}`} strokeWidth={1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
