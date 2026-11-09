export const VIDCORE_ORIGIN = "https://vidcore.org";

const COLOR = (process.env.NEXT_PUBLIC_PLAYER_COLOR || "f2b84b").replace("#", "");

type EmbedOptions = { autoplay?: boolean; startAt?: number };

function withParams(path: string, opts: EmbedOptions) {
  const params = new URLSearchParams({ color: COLOR, theme: COLOR });
  if (opts.autoplay ?? true) params.set("autoplay", "true");
  if (opts.startAt && opts.startAt > 0) params.set("startAt", String(Math.floor(opts.startAt)));
  return `${VIDCORE_ORIGIN}${path}?${params}`;
}

export function movieEmbedUrl(tmdbId: number, opts: EmbedOptions = {}) {
  return withParams(`/embed/movie/${tmdbId}`, opts);
}

export function episodeEmbedUrl(tmdbId: number, season: number, episode: number, opts: EmbedOptions = {}) {
  return withParams(`/embed/tv/${tmdbId}/${season}/${episode}`, opts);
}

export type PlayerEvent = "play" | "pause" | "ended";

/**
 * VidCore documents `vidcore:play`, `vidcore:pause` and `vidcore:ended` postMessage events
 * but not their payload shape, so accept either a bare string or an object carrying the name.
 */
export function parsePlayerEvent(e: MessageEvent): PlayerEvent | null {
  let host: string;
  try {
    host = new URL(e.origin).hostname;
  } catch {
    return null;
  }
  if (host !== "vidcore.org" && !host.endsWith(".vidcore.org")) return null;

  let data: unknown = e.data;
  if (typeof data === "string" && data.startsWith("{")) {
    try {
      data = JSON.parse(data);
    } catch {
      /* keep the string */
    }
  }
  const name =
    typeof data === "string"
      ? data
      : data && typeof data === "object"
        ? String((data as Record<string, unknown>).type ?? (data as Record<string, unknown>).event ?? "")
        : "";
  const m = /^vidcore:(play|pause|ended)$/.exec(name);
  return m ? (m[1] as PlayerEvent) : null;
}
