"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { Home, RotateCw, WifiOff } from "lucide-react";
import { LogoMark } from "./logo";

const AUTO_RETRY_SECONDS = 6;

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/**
 * Friendly error screen for route error boundaries. Distinguishes "you're offline" from a
 * flaky upstream, retries once automatically, and retries again as soon as the device
 * comes back online.
 */
export function ErrorState({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const [countdown, setCountdown] = useState<number | null>(AUTO_RETRY_SECONDS);

  const retry = () => {
    setCountdown(null);
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  // One automatic retry: most failures here are brief network blips.
  useEffect(() => {
    if (countdown === null || !online) return;
    const t = setTimeout(() => (countdown <= 1 ? retry() : setCountdown(countdown - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, online]);

  // Coming back online is the best moment to try again.
  useEffect(() => {
    if (!online) return;
    const onOnline = () => retry();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  return (
    <main className="flex min-h-[78dvh] items-center justify-center px-gutter py-16">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto size-20">
          <span className="absolute inset-0 animate-ping rounded-3xl bg-accent/10 [animation-duration:2.4s]" />
          <span className="relative flex size-20 items-center justify-center rounded-3xl bg-surface ring-1 ring-line">
            {online ? <LogoMark className="size-9 opacity-60 grayscale-[0.3]" /> : <WifiOff className="size-8 text-accent" />}
          </span>
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-[-0.03em]">{online ? "Lost the signal" : "You’re offline"}</h1>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
          {online
            ? "We couldn’t reach the movie database just now. It’s usually a brief network hiccup."
            : "Check your connection. We’ll try again as soon as you’re back online."}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={retry}
            disabled={pending}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-text px-6 text-sm font-semibold text-black transition hover:bg-white active:scale-[0.98] disabled:opacity-70"
          >
            <RotateCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
            {pending ? "Retrying…" : "Try again"}
          </button>
          <Link
            href="/home"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.06] px-5 text-sm font-medium ring-1 ring-white/10 transition hover:bg-white/10"
          >
            <Home className="size-4" /> Go home
          </Link>
        </div>

        <p className="mt-6 h-5 text-sm text-faint" aria-live="polite">
          {online && countdown !== null && countdown > 0 && !pending && (
            <>
              Retrying in {countdown}s ·{" "}
              <button type="button" onClick={() => setCountdown(null)} className="text-muted underline-offset-2 hover:underline">
                Cancel
              </button>
            </>
          )}
        </p>

        {error.digest && <p className="mt-8 font-mono text-[11px] text-faint/70">Ref {error.digest}</p>}
      </div>
    </main>
  );
}
