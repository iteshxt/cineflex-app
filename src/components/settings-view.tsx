"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import {
  Check,
  Clapperboard,
  Database,
  Download,
  Film,
  LayoutGrid,
  Palette,
  Smartphone,
  Upload,
} from "lucide-react";
import {
  clearCustomLists,
  clearList,
  clearProgress,
  clearRecentSearches,
  countRecentSearches,
  exportLibrary,
  importLibrary,
  useLists,
  useMyList,
  useProgress,
} from "@/lib/library";
import { promptInstall, useInstallState } from "@/lib/pwa";
import { ACCENTS, AUDIO_LANGUAGES, resetSettings, updateSettings, useSettings, type Settings } from "@/lib/settings";
import { Select } from "./select";

const SECTIONS = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "browsing", label: "Browsing", icon: LayoutGrid },
  { id: "playback", label: "Playback", icon: Clapperboard },
  { id: "player", label: "Player", icon: Film },
  { id: "app", label: "App", icon: Smartphone },
  { id: "data", label: "Your data", icon: Database },
] as const;

export function SettingsView() {
  const s = useSettings();
  const set = <K extends keyof Settings>(key: K) => (value: Settings[K]) => updateSettings({ [key]: value } as Partial<Settings>);

  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-14">
      {/* Section index */}
      <nav aria-label="Settings sections" className="hidden lg:block">
        <ul className="sticky top-10 space-y-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-white/[0.04] hover:text-text"
              >
                <Icon className="size-4" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 space-y-12">
        <Section id="appearance" title="Appearance">
          <Row label="Accent color" hint="Buttons, highlights and the video player." stacked>
            <div role="radiogroup" aria-label="Accent color" className="mt-4 flex flex-wrap gap-3">
              {ACCENTS.map((a) => {
                const selected = s.accent === a.hex;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => updateSettings({ accent: a.hex })}
                    className={`group flex w-[92px] flex-col items-center gap-2 rounded-2xl p-3 ring-1 transition ${
                      selected ? "bg-white/[0.06] ring-white/25" : "ring-line hover:bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className="flex size-11 items-center justify-center rounded-full shadow-lg transition group-hover:scale-105"
                      style={{ background: a.hex }}
                    >
                      {selected && <Check className="size-5 text-black" strokeWidth={2.75} />}
                    </span>
                    <span className={`text-xs ${selected ? "text-text" : "text-muted"}`}>{a.name}</span>
                  </button>
                );
              })}
            </div>
          </Row>
          <ToggleRow label="Rotate featured titles" hint="Auto-advance the banner on Home." value={s.heroAutoplay} onChange={set("heroAutoplay")} />
          <ToggleRow
            label="Reduce motion"
            hint="Turn off animations, banner rotation and hover effects."
            value={s.reduceMotion}
            onChange={set("reduceMotion")}
          />
        </Section>

        <Section id="browsing" title="Browsing">
          <ToggleRow
            label="Hover previews"
            hint="Show details and quick actions when you rest the mouse on a title."
            value={s.hoverPreviews}
            onChange={set("hoverPreviews")}
          />
          <ToggleRow
            label="Continue Watching on Home"
            hint="Show the row of titles you’ve started."
            value={s.showContinueWatching}
            onChange={set("showContinueWatching")}
          />
          <ToggleRow
            label="Spoiler protection"
            hint="Blur stills and hide descriptions of episodes you haven’t watched."
            value={s.spoilerProtection}
            onChange={set("spoilerProtection")}
          />
        </Section>

        <Section id="playback" title="Playback">
          <ToggleRow label="Autoplay" hint="Start playing as soon as the player opens." value={s.autoplay} onChange={set("autoplay")} />
          <ToggleRow
            label="Autoplay next episode"
            hint="Start the next episode 10 seconds after one ends."
            value={s.autoplayNext}
            onChange={set("autoplayNext")}
          />
          <ToggleRow
            label="Ad shield"
            hint="Block pop-ups and redirects from the player. Turn off only if a title won’t load."
            value={s.adShield}
            onChange={set("adShield")}
          />
        </Section>

        <Section id="player" title="Player" note="These are passed to the video provider. Some titles may not support every option.">
          <Row label="Player size" hint="Make the player’s controls and text larger. Phones always use Standard.">
            <Select
              label="Player size"
              value={s.playerSize}
              onChange={set("playerSize")}
              align="right"
              options={[
                { value: "standard", label: "Standard" },
                { value: "large", label: "Large" },
                { value: "larger", label: "Larger" },
              ]}
            />
          </Row>
          <Row label="Audio language" hint="Preferred audio track when a title has several.">
            <Select
              label="Audio language"
              value={s.audioLanguage}
              onChange={set("audioLanguage")}
              align="right"
              options={AUDIO_LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
            />
          </Row>
          <ToggleRow
            label="Subtitle button"
            hint="Show the subtitles button on the player."
            value={s.subtitleButton}
            onChange={set("subtitleButton")}
          />
          <ToggleRow
            label="Player settings menu"
            hint="Show quality, speed and source settings in fullscreen."
            value={s.playerSettingsMenu}
            onChange={set("playerSettingsMenu")}
          />
          <ToggleRow
            label="Related titles in player"
            hint="Let the player suggest similar titles when one ends."
            value={s.showRelated}
            onChange={set("showRelated")}
          />
        </Section>

        <Section id="app" title="App">
          <InstallRow />
          <Row label="Welcome page" hint="See the CineFlex introduction again.">
            <Link href="/?welcome" className={BUTTON}>
              Open
            </Link>
          </Row>
          <Row label="About & legal" hint="FAQ, privacy, terms and the developer.">
            <div className="flex flex-wrap justify-end gap-2">
              <Link href="/faq" className={BUTTON}>
                FAQ
              </Link>
              <Link href="/legal" className={BUTTON}>
                Legal
              </Link>
            </div>
          </Row>
        </Section>

        <Section id="data" title="Your data" note="Everything here is stored only in this browser.">
          <BackupRows />
          <ClearRows />
          <DangerRow label="Reset settings" detail="Restore every option on this page to its default." action="Reset" onConfirm={resetSettings} />
        </Section>
      </div>
    </div>
  );
}

const BUTTON =
  "inline-flex h-9 items-center gap-2 rounded-full bg-white/[0.07] px-4 text-sm font-medium ring-1 ring-white/10 transition hover:bg-white/[0.12] disabled:pointer-events-none disabled:opacity-40";

/* -------------------------------------------------------------- layout */

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8">
      <h2 id={`${id}-title`} className="text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl bg-surface ring-1 ring-line">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  stacked = false,
  children,
}: {
  label: string;
  hint?: string;
  stacked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`px-5 py-4 ${stacked ? "" : "flex items-center justify-between gap-6"}`}>
      <div className="min-w-0">
        <p className="text-[15px] font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{hint}</p>}
      </div>
      {stacked ? children : <div className="shrink-0">{children}</div>}
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row label={label} hint={hint}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 rounded-full transition-colors ${value ? "bg-accent" : "bg-white/10"}`}
      >
        <span
          className={`absolute left-1 top-1 size-5 rounded-full shadow transition-transform ${
            value ? "translate-x-5 bg-accent-ink" : "bg-text"
          }`}
        />
      </button>
    </Row>
  );
}

/* ----------------------------------------------------------------- app */

function InstallRow() {
  const state = useInstallState();
  return (
    <Row
      label={state === "installed" ? "CineFlex is installed" : "Install CineFlex"}
      hint={
        state === "installed"
          ? "You’re using the app. Open it from your home screen anytime."
          : state === "available"
            ? "Add it to your home screen for a full-screen, app-like experience."
            : "In Chrome, use ⋮ → “Install app”. On iPhone, Share → “Add to Home Screen”."
      }
    >
      {state === "available" ? (
        <button
          type="button"
          onClick={() => void promptInstall()}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:brightness-110"
        >
          <Download className="size-4" /> Install
        </button>
      ) : state === "installed" ? (
        <Check className="size-5 text-accent" />
      ) : null}
    </Row>
  );
}

/* ---------------------------------------------------------------- data */

function BackupRows() {
  const file = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const download = () => {
    const blob = new Blob([JSON.stringify(exportLibrary(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `cineflex-backup-${new Date().toISOString().slice(0, 10)}.json`,
    });
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
  };

  const restore = async (f: File) => {
    try {
      const { list, progress } = importLibrary(JSON.parse(await f.text()));
      updateSettings({}); // re-apply imported settings
      setMessage(`Imported ${list} saved title${list === 1 ? "" : "s"} and ${progress} in progress.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "That file couldn’t be read.");
    }
  };

  return (
    <Row label="Back up your library" hint={message ?? "Move My List, history and settings to another device or browser."}>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={download} className={BUTTON}>
          <Download className="size-4" /> Export
        </button>
        <button type="button" onClick={() => file.current?.click()} className={BUTTON}>
          <Upload className="size-4" /> Import
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void restore(f);
            e.target.value = "";
          }}
        />
      </div>
    </Row>
  );
}

const noop = () => () => {};

function ClearRows() {
  const list = useMyList();
  const lists = useLists();
  const progress = useProgress();
  // Read once on the client; this count isn't shown anywhere else.
  const initialSearches = useSyncExternalStore(noop, countRecentSearches, () => 0);
  const [searchesCleared, setSearchesCleared] = useState(false);
  const searches = searchesCleared ? 0 : initialSearches;
  const n = (count: number) => `${count} title${count === 1 ? "" : "s"}`;
  return (
    <>
      <DangerRow
        label="Recent searches"
        detail={`${searches} saved`}
        action="Clear"
        disabled={searches === 0}
        onConfirm={() => {
          clearRecentSearches();
          setSearchesCleared(true);
        }}
      />
      <DangerRow label="Continue Watching" detail={n(progress.length)} action="Clear history" disabled={progress.length === 0} onConfirm={clearProgress} />
      <DangerRow label="My List" detail={n(list.length)} action="Clear list" disabled={list.length === 0} onConfirm={clearList} />
      <DangerRow
        label="Your lists"
        detail={`${lists.length} list${lists.length === 1 ? "" : "s"}`}
        action="Delete all"
        disabled={lists.length === 0}
        onConfirm={clearCustomLists}
      />
    </>
  );
}

function DangerRow({
  label,
  detail,
  action,
  disabled,
  onConfirm,
}: {
  label: string;
  detail: string;
  action: string;
  disabled?: boolean;
  onConfirm: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <Row label={label} hint={detail}>
      {confirming ? (
        <span className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              onConfirm();
              setConfirming(false);
            }}
            className="h-9 rounded-full bg-red-500/90 px-4 text-sm font-medium text-white transition hover:bg-red-500"
          >
            Confirm
          </button>
          <button type="button" onClick={() => setConfirming(false)} className={BUTTON}>
            Cancel
          </button>
        </span>
      ) : (
        <button type="button" disabled={disabled} onClick={() => setConfirming(true)} className={BUTTON}>
          {action}
        </button>
      )}
    </Row>
  );
}
