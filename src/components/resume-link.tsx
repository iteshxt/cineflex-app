"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { useProgress } from "@/lib/library";

/** "Resume S2 · E4" shortcut shown on a series page when the viewer has history. */
export function ResumeLink({ showId }: { showId: number }) {
  const p = useProgress().find((i) => i.type === "tv" && i.id === showId);
  if (!p?.season || !p.episode) return null;
  return (
    <Link
      href={`/watch/tv/${showId}/${p.season}/${p.episode}`}
      className="mt-4 inline-flex items-center gap-2 text-sm text-muted transition hover:text-text"
    >
      <RotateCcw className="size-4 text-accent" />
      Resume S{p.season} · E{p.episode}
      {p.episodeName ? <span className="text-faint">— {p.episodeName}</span> : null}
    </Link>
  );
}
