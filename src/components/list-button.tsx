"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, ListPlus, Plus } from "lucide-react";
import {
  DEFAULT_LIST_ID,
  MAX_LIST_NAME,
  createList,
  toggleInList,
  useLists,
  useListsContaining,
  type LibraryItem,
} from "@/lib/library";

type Item = Omit<LibraryItem, "addedAt">;

/**
 * Split button: the main part toggles "My List" in one click; the chevron opens a menu to
 * save the title to any of the viewer's lists or create a new one.
 */
export function ListButton({ item }: { item: Item }) {
  const containing = useListsContaining(item.id, item.type);
  const inMyList = containing.includes(DEFAULT_LIST_ID);
  const savedElsewhere = containing.filter((id) => id !== DEFAULT_LIST_ID).length;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <div ref={root} className="relative">
      <div className="flex h-12 items-stretch overflow-hidden rounded-full bg-white/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => toggleInList(DEFAULT_LIST_ID, item)}
          aria-pressed={inMyList}
          className="inline-flex items-center gap-2 pl-5 pr-4 text-sm font-medium transition hover:bg-white/10"
        >
          <span key={String(inMyList)} className="pop-in">
            {inMyList ? <Check className="size-4 text-accent" /> : <Plus className="size-4" />}
          </span>
          {inMyList ? "In My List" : "My List"}
          {savedElsewhere > 0 && (
            <span className="rounded-full bg-white/10 px-1.5 text-[11px] text-muted">+{savedElsewhere}</span>
          )}
        </button>
        <span className="my-3 w-px bg-white/15" aria-hidden="true" />
        <button
          type="button"
          aria-label="Save to a list"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex w-11 items-center justify-center transition hover:bg-white/10"
        >
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && <SaveMenu item={item} containing={containing} />}
    </div>
  );
}

function SaveMenu({ item, containing }: { item: Item; containing: string[] }) {
  const lists = useLists();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) input.current?.focus();
  }, [creating]);

  const rows = [{ id: DEFAULT_LIST_ID, name: "My List", count: -1 }, ...lists.map((l) => ({ id: l.id, name: l.name, count: l.items.length }))];

  return (
    <div
      role="menu"
      aria-label="Save to list"
      className="menu-in absolute left-0 top-full z-30 mt-2 w-64 origin-top-left rounded-2xl bg-surface-2/95 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl"
    >
      <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-faint">Save to</p>
      <div className="thin-scrollbar max-h-64 overflow-y-auto">
        {rows.map((l) => {
          const checked = containing.includes(l.id);
          return (
            <button
              key={l.id}
              type="button"
              role="menuitemcheckbox"
              aria-checked={checked}
              onClick={() => toggleInList(l.id, item)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/[0.06]"
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-md ring-1 transition ${
                  checked ? "bg-accent text-accent-ink ring-accent" : "ring-white/25"
                }`}
              >
                {checked && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1 truncate">{l.name}</span>
              {l.count >= 0 && <span className="text-xs text-faint">{l.count}</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-1 border-t border-line pt-1">
        {creating ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (createList(name, item)) {
                setName("");
                setCreating(false);
              }
            }}
            className="flex items-center gap-2 p-1.5"
          >
            <input
              ref={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_LIST_NAME}
              placeholder="List name"
              aria-label="New list name"
              className="h-9 min-w-0 flex-1 rounded-lg bg-bg px-3 text-sm outline-none ring-1 ring-line placeholder:text-faint focus:ring-accent/60"
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-ink transition disabled:opacity-40"
            >
              Add
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-white/[0.06] hover:text-text"
          >
            <ListPlus className="size-5" />
            New list
          </button>
        )}
      </div>
    </div>
  );
}
