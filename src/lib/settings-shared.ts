/** Settings constants shared by server (layout boot script) and client code. */

/** The four accent colors. Each is light enough for dark text (`--accent-ink`) on top. */
export const ACCENTS = [
  { id: "yellow", name: "Yellow", hex: "#f2b84b" },
  { id: "red", name: "Red", hex: "#f25c5c" },
  { id: "blue", name: "Blue", hex: "#5b9dff" },
  { id: "white", name: "White", hex: "#f4f4f5" },
] as const;

/** Default audio languages offered for the player (`lang` parameter). "" = the title's original. */
export const AUDIO_LANGUAGES = [
  { value: "", label: "Original" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
] as const;

export type Settings = {
  // Appearance
  accent: string; // one of ACCENTS[].hex
  heroAutoplay: boolean;
  reduceMotion: boolean;
  // Browsing
  hoverPreviews: boolean;
  showContinueWatching: boolean;
  spoilerProtection: boolean;
  // Playback
  autoplay: boolean;
  autoplayNext: boolean;
  adShield: boolean;
  // Player
  playerSize: "standard" | "large" | "larger"; // scales the embed's own controls
  audioLanguage: string; // lang
  subtitleButton: boolean; // !disableInfo
  playerSettingsMenu: boolean; // !disableControls
  showRelated: boolean; // showRelated
};

export const DEFAULT_SETTINGS: Settings = {
  accent: ACCENTS[0].hex,
  heroAutoplay: true,
  reduceMotion: false,
  hoverPreviews: true,
  showContinueWatching: true,
  spoilerProtection: false,
  autoplay: true,
  autoplayNext: true,
  adShield: true,
  playerSize: "large",
  audioLanguage: "",
  subtitleButton: true,
  playerSettingsMenu: true,
  showRelated: false,
};

export const SETTINGS_KEY = "cineflex:settings";

/** Accept only known accents (older saves may hold colors that were removed). */
export function normalizeAccent(hex: unknown): string {
  const h = typeof hex === "string" ? hex.toLowerCase() : "";
  return ACCENTS.some((a) => a.hex === h) ? h : DEFAULT_SETTINGS.accent;
}

/**
 * Inline boot script: applies the saved accent and reduced-motion preference before first
 * paint so there's no flash. Keep it tiny and dependency-free.
 */
export const ACCENT_BOOT_SCRIPT = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  SETTINGS_KEY,
)})||"{}"),d=document.documentElement,ok=${JSON.stringify(
  ACCENTS.map((a) => a.hex),
)};if(ok.indexOf(String(s.accent).toLowerCase())>-1)d.style.setProperty("--accent",s.accent);if(s.reduceMotion)d.classList.add("reduce-motion")}catch(e){}`;
