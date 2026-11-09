export const VIDCORE_ORIGIN = "https://vidcore.org";

const DEFAULT_COLOR = process.env.NEXT_PUBLIC_PLAYER_COLOR || "f2b84b";

/**
 * VidCore embed parameters (all optional). See vidcore.org/#documentation.
 * Booleans are only sent when they differ from the player's default.
 */
export type EmbedOptions = {
  /** Player accent, hex with or without '#'. Sent as both `color` and `theme`. */
  color?: string;
  autoplay?: boolean;
  /** Start position in seconds. */
  startAt?: number;
  /** Overrides the title shown in the player. */
  title?: string;
  /** Overrides the poster image shown before playback. */
  poster?: string | null;
  /** Default audio language, e.g. "en". Empty = the title's original. */
  lang?: string;
  /** Show the inline subtitle button (false → disableInfo). */
  subtitleButton?: boolean;
  /** Show the fullscreen player settings (false → disableControls). */
  settingsMenu?: boolean;
  /** Append related recommendations inside the player. */
  showRelated?: boolean;
};

function withParams(path: string, opts: EmbedOptions) {
  const color = (opts.color || DEFAULT_COLOR).replace("#", "");
  const params = new URLSearchParams({ color, theme: color });
  if (opts.autoplay ?? true) params.set("autoplay", "true");
  if (opts.startAt && opts.startAt > 0) params.set("startAt", String(Math.floor(opts.startAt)));
  if (opts.title) params.set("title", opts.title);
  if (opts.poster) params.set("poster", opts.poster);
  if (opts.lang) params.set("lang", opts.lang);
  if (opts.subtitleButton === false) params.set("disableInfo", "true");
  if (opts.settingsMenu === false) params.set("disableControls", "true");
  if (opts.showRelated) params.set("showRelated", "true");
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
