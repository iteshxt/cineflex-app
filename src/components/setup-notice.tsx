import { KeyRound } from "lucide-react";

export function SetupNotice() {
  return (
    <div className="mx-gutter my-24 max-w-lg rounded-2xl bg-surface p-8 ring-1 ring-line">
      <KeyRound className="size-6 text-accent" />
      <h1 className="mt-4 text-xl font-semibold tracking-tight">Connect TMDB to load the catalog</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Cineflex reads titles, artwork and episodes from TMDB. Create a free API key at{" "}
        <a className="text-text underline underline-offset-4" href="https://www.themoviedb.org/settings/api">
          themoviedb.org/settings/api
        </a>
        , add it to <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">.env.local</code> as{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">TMDB_API_KEY</code>, and restart the dev
        server.
      </p>
    </div>
  );
}
