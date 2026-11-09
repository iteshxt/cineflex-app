"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <main className="flex min-h-[70dvh] flex-col items-start justify-center px-gutter">
      <p className="text-sm font-medium text-accent">Hiccup</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] md:text-4xl">We couldn’t load this right now.</h1>
      <p className="mt-2 text-muted">The movie database didn’t respond. It’s usually back in a moment.</p>
      <button
        type="button"
        onClick={() =>
          startTransition(() => {
            router.refresh();
            reset();
          })
        }
        className="mt-6 inline-flex h-11 items-center rounded-full bg-text px-6 text-sm font-semibold text-black hover:bg-white"
      >
        Try again
      </button>
    </main>
  );
}
