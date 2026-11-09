"use client";

import { Check, Plus } from "lucide-react";
import { useInMyList, type LibraryItem } from "@/lib/library";

export function ListButton({ item }: { item: Omit<LibraryItem, "addedAt"> }) {
  const [inList, toggle] = useInMyList(item.id, item.type);
  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={inList}
      className="inline-flex h-12 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-medium backdrop-blur-md transition hover:bg-white/20"
    >
      {inList ? <Check className="size-4 text-accent" /> : <Plus className="size-4" />}
      {inList ? "In My List" : "My List"}
    </button>
  );
}
