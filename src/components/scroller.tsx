"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Horizontal, natively scrolling track with hover arrows on pointer devices. */
export function Scroller({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="group/scroller relative">
      <div
        ref={ref}
        onScroll={update}
        className={`no-scrollbar flex snap-x snap-mandatory scroll-px-gutter gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-gutter pb-2 md:gap-5 ${className}`}
      >
        {children}
      </div>
      <Arrow side="left" hidden={edges.start} onClick={() => page(-1)} />
      <Arrow side="right" hidden={edges.end} onClick={() => page(1)} />
    </div>
  );
}

function Arrow({ side, hidden, onClick }: { side: "left" | "right"; hidden: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Scroll left" : "Scroll right"}
      tabIndex={-1}
      onClick={onClick}
      className={`absolute top-0 bottom-10 z-10 hidden w-gutter items-center justify-center pointer-fine:flex ${
        side === "left" ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"
      } from-bg/90 to-transparent opacity-0 transition-opacity group-hover/scroller:opacity-100 ${hidden ? "!pointer-events-none !opacity-0" : ""}`}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-surface-2/90 ring-1 ring-line backdrop-blur hover:bg-white hover:text-black">
        <Icon className="size-5" />
      </span>
    </button>
  );
}
