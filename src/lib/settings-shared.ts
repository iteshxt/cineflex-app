/** Settings constants shared by server (layout boot script) and client code. */

export const ACCENTS = [
  { id: "amber", name: "Amber", hex: "#f2b84b" },
  { id: "coral", name: "Coral", hex: "#ff8a65" },
  { id: "rose", name: "Rose", hex: "#f472b6" },
  { id: "violet", name: "Violet", hex: "#a78bfa" },
  { id: "sky", name: "Sky", hex: "#38bdf8" },
  { id: "mint", name: "Mint", hex: "#34d399" },
  { id: "lime", name: "Lime", hex: "#bef264" },
] as const;

export type Settings = {
  accent: string; // hex with '#'
  adShield: boolean;
  autoplayNext: boolean;
  spoilerProtection: boolean;
  heroAutoplay: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  accent: ACCENTS[0].hex,
  adShield: true,
  autoplayNext: true,
  spoilerProtection: false,
  heroAutoplay: true,
};

export const SETTINGS_KEY = "cineflex:settings";

/**
 * Inline script for <head>: applies the saved accent before first paint so there's
 * no flash of the default color. Keep it tiny and dependency-free.
 */
export const ACCENT_BOOT_SCRIPT = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  SETTINGS_KEY,
)})||"{}");if(/^#[0-9a-f]{6}$/i.test(s.accent))document.documentElement.style.setProperty("--accent",s.accent)}catch(e){}`;
