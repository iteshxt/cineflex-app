"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { DECADES, LANGUAGES, RATINGS, SORT_OPTIONS, filtersHref, type Filters, type Option } from "@/lib/filters";

export function FilterBar({
  base,
  filters,
  genres,
}: {
  base: string;
  filters: Filters;
  genres: { id: number; name: string }[];
}) {
  const href = (patch: Partial<Filters>) => filtersHref(base, { ...filters, ...patch });
  const genreOptions: Option[] = genres.map((g) => ({ value: g.id, label: g.name }));

  const active: { key: keyof Filters; label: string }[] = [];
  const find = (opts: Option[], v: unknown) => opts.find((o) => o.value === v)?.label;
  if (filters.genre) active.push({ key: "genre", label: find(genreOptions, filters.genre) ?? "Genre" });
  if (filters.decade) active.push({ key: "decade", label: `${filters.decade}s` });
  if (filters.rating) active.push({ key: "rating", label: `${filters.rating}+ ★` });
  if (filters.lang) active.push({ key: "lang", label: find(LANGUAGES, filters.lang) ?? filters.lang });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <nav aria-label="Sort" className="flex rounded-full bg-surface p-1 ring-1 ring-line">
          {SORT_OPTIONS.map((s) => (
            <Link
              key={s.value}
              href={href({ sort: s.value })}
              scroll={false}
              aria-current={s.value === filters.sort ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                s.value === filters.sort ? "bg-text font-medium text-black" : "text-muted hover:text-text"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
        <Dropdown label="Genre" value={filters.genre} options={genreOptions} href={(v) => href({ genre: v as number })} />
        <Dropdown label="Decade" value={filters.decade} options={DECADES} href={(v) => href({ decade: v as number })} />
        <Dropdown label="Rating" value={filters.rating} options={RATINGS} href={(v) => href({ rating: v as number })} />
        <Dropdown label="Language" value={filters.lang} options={LANGUAGES} href={(v) => href({ lang: v as string })} />
      </div>

      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {active.map((a) => (
            <Link
              key={a.key}
              href={href({ [a.key]: undefined })}
              scroll={false}
              className="group inline-flex items-center gap-1.5 rounded-full bg-accent/15 py-1 pl-3 pr-2 text-xs font-medium text-accent ring-1 ring-accent/30 transition hover:bg-accent/25"
            >
              {a.label}
              <X className="size-3.5 opacity-70 group-hover:opacity-100" />
              <span className="sr-only">Remove filter</span>
            </Link>
          ))}
          <Link
            href={filtersHref(base, { sort: filters.sort })}
            scroll={false}
            className="px-2 text-xs text-muted underline-offset-4 hover:text-text hover:underline"
          >
            Clear all
          </Link>
        </div>
      )}
    </div>
  );
}

function Dropdown({
  label,
  value,
  options,
  href,
}: {
  label: string;
  value: string | number | undefined;
  options: Option[];
  href: (v: string | number | undefined) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close when the page is hidden by navigation (Next keeps pages alive in <Activity>).
  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] ring-1 transition ${
          current ? "bg-accent/15 text-accent ring-accent/30" : "bg-surface text-muted ring-line hover:text-text"
        }`}
      >
        {current ? current.label : label}
        <ChevronDown className={`size-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="thin-scrollbar absolute left-0 top-full z-30 mt-2 max-h-80 w-52 overflow-y-auto rounded-2xl bg-surface-2/95 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl"
        >
          <OptionLink selected={!current} href={href(undefined)} onPick={() => setOpen(false)}>
            Any {label.toLowerCase()}
          </OptionLink>
          {options.map((o) => (
            <OptionLink
              key={String(o.value)}
              selected={o.value === value}
              href={href(o.value)}
              onPick={() => setOpen(false)}
            >
              {o.label}
            </OptionLink>
          ))}
        </div>
      )}
    </div>
  );
}

function OptionLink({
  selected,
  href,
  onPick,
  children,
}: {
  selected: boolean;
  href: string;
  onPick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      role="option"
      aria-selected={selected}
      onClick={onPick}
      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
        selected ? "text-text" : "text-muted hover:bg-white/5 hover:text-text"
      }`}
    >
      {children}
      {selected && <Check className="size-4 text-accent" />}
    </Link>
  );
}
