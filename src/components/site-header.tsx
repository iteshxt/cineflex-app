import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "./logo";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/developer", label: "Developer" },
];

/** Public-site header. Content sits in the same centred column as the page below it. */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header
      className={`${overlay ? "absolute" : "sticky border-b border-line bg-bg/80 backdrop-blur-xl"} inset-x-0 top-0 z-40 px-gutter pt-[env(safe-area-inset-top)]`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center md:h-[72px]">
        <Link href="/" className="flex items-center gap-2.5" aria-label="CineFlex">
          <LogoMark className="size-8" />
          <span className="text-[19px] font-semibold tracking-[-0.035em]">CineFlex</span>
        </Link>
        <nav aria-label="Site" className="ml-10 hidden items-center gap-1 text-sm sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-text"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/home"
          className="group ml-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-text pl-4 pr-3.5 text-sm font-semibold text-black transition hover:bg-white"
        >
          Open app
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </header>
  );
}
