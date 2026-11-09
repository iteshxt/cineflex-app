"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption<T extends string | number> = { value: T; label: string; hint?: string };

/**
 * Themed replacement for <select>: a pill trigger and an animated listbox.
 * Keyboard: ↑/↓/Home/End move, Enter/Space choose, Esc closes, letters jump.
 */
export function Select<T extends string | number>({
  value,
  options,
  onChange,
  label,
  align = "left",
  className = "",
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  label: string;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const current = options[selectedIndex];

  const openList = () => {
    setActive(selectedIndex);
    setOpen(true);
  };

  const choose = (i: number) => {
    const o = options[i];
    if (o) onChange(o.value);
    setOpen(false);
    trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  // Close if the page is hidden by navigation (Next keeps pages alive in <Activity>).
  useLayoutEffect(() => () => setOpen(false), []);

  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, last));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      if (e.key === "Escape") trigger.current?.focus();
      return;
    } else if (e.key.length === 1) {
      const k = e.key.toLowerCase();
      const from = options.findIndex((o, i) => i > active && o.label.toLowerCase().startsWith(k));
      const hit = from >= 0 ? from : options.findIndex((o) => o.label.toLowerCase().startsWith(k));
      if (hit >= 0) setActive(hit);
      return;
    } else return;
    e.preventDefault();
  };

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${label}: ${current?.label ?? ""}`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
          }
        }}
        className={`inline-flex h-9 items-center gap-2 rounded-full pl-4 pr-3 text-[13px] font-medium ring-1 transition ${
          open ? "bg-surface-2 text-text ring-white/20" : "bg-surface-2/80 text-text/90 ring-line hover:bg-surface-2 hover:ring-white/15"
        }`}
      >
        <span className="truncate">{current?.label}</span>
        <ChevronDown className={`size-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-opt-${active}`}
          onKeyDown={onListKey}
          className={`menu-in thin-scrollbar absolute top-full z-30 mt-2 max-h-72 min-w-full w-max max-w-[18rem] overflow-y-auto rounded-2xl bg-surface-2/95 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/10 outline-none backdrop-blur-xl ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          }`}
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={String(o.value)}
                id={`${id}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                onPointerMove={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3 py-2 text-sm transition-colors ${
                  i === active ? "bg-white/[0.07] text-text" : "text-muted"
                }`}
              >
                <span className="flex flex-col">
                  <span className={selected ? "text-text" : ""}>{o.label}</span>
                  {o.hint && <span className="text-xs text-faint">{o.hint}</span>}
                </span>
                <Check className={`size-4 shrink-0 text-accent ${selected ? "opacity-100" : "opacity-0"}`} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
