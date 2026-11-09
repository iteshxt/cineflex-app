"use client";

import { useState } from "react";
import { Check, Download, Smartphone } from "lucide-react";
import { clearList, clearProgress, useMyList, useProgress } from "@/lib/library";
import { promptInstall, useInstallState } from "@/lib/pwa";
import { ACCENTS, resetSettings, updateSettings, useSettings } from "@/lib/settings";

export function SettingsView() {
  const s = useSettings();
  const list = useMyList();
  const progress = useProgress();

  return (
    <div className="mt-10 space-y-10">
      <InstallSection />

      <Section title="Appearance" description="The accent colors buttons, highlights and the video player.">
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Accent color">
          {ACCENTS.map((a) => {
            const selected = s.accent.toLowerCase() === a.hex;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={a.name}
                title={a.name}
                onClick={() => updateSettings({ accent: a.hex })}
                className={`flex size-12 items-center justify-center rounded-full ring-offset-4 ring-offset-bg transition ${
                  selected ? "ring-2 ring-white/80" : "hover:scale-105"
                }`}
                style={{ background: a.hex }}
              >
                {selected && <Check className="size-5 text-black" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
        <Toggle
          label="Rotate featured titles"
          hint="Auto-advance the banner on the home page."
          value={s.heroAutoplay}
          onChange={(v) => updateSettings({ heroAutoplay: v })}
        />
      </Section>

      <Section title="Playback">
        <Toggle
          label="Ad shield"
          hint="Block pop-ups and redirects from the video player. Turn off only if a title won't load."
          value={s.adShield}
          onChange={(v) => updateSettings({ adShield: v })}
        />
        <Toggle
          label="Autoplay next episode"
          hint="Start the next episode 10 seconds after one ends."
          value={s.autoplayNext}
          onChange={(v) => updateSettings({ autoplayNext: v })}
        />
        <Toggle
          label="Spoiler protection by default"
          hint="Blur stills and hide descriptions of episodes you haven't watched."
          value={s.spoilerProtection}
          onChange={(v) => updateSettings({ spoilerProtection: v })}
        />
      </Section>

      <Section title="Your data">
        <DangerRow
          label="Continue Watching"
          detail={`${progress.length} title${progress.length === 1 ? "" : "s"}`}
          action="Clear history"
          disabled={progress.length === 0}
          onConfirm={clearProgress}
        />
        <DangerRow
          label="My List"
          detail={`${list.length} title${list.length === 1 ? "" : "s"}`}
          action="Clear list"
          disabled={list.length === 0}
          onConfirm={clearList}
        />
        <DangerRow label="Settings" detail="Restore defaults" action="Reset" onConfirm={resetSettings} />
      </Section>

      <p className="text-xs leading-relaxed text-faint">
        CineFlex doesn’t host any video. Titles and artwork come from TMDB; playback is provided by a third-party embed.
      </p>
    </div>
  );
}

function InstallSection() {
  const state = useInstallState();
  return (
    <Section title="App">
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface px-5 py-4 ring-1 ring-line">
        <span className="flex items-center gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Smartphone className="size-5" />
          </span>
          <span>
            <span className="block text-[15px] font-medium">
              {state === "installed" ? "CineFlex is installed" : "Install CineFlex"}
            </span>
            <span className="mt-0.5 block text-[13px] text-muted">
              {state === "installed"
                ? "You’re using the app. Open it from your home screen anytime."
                : state === "available"
                  ? "Add it to your home screen for a full-screen, app-like experience."
                  : "In Chrome, open the ⋮ menu and choose “Add to Home screen” or “Install app”. On iPhone, use Share → Add to Home Screen."}
            </span>
          </span>
        </span>
        {state === "available" && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.97]"
          >
            <Download className="size-4" />
            Install
          </button>
        )}
      </div>
    </Section>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">{title}</h2>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

function Toggle({
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
    <label className="flex cursor-pointer items-center justify-between gap-6 rounded-2xl bg-surface px-5 py-4 ring-1 ring-line transition hover:bg-surface-2">
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        <span className="mt-0.5 block text-[13px] text-muted">{hint}</span>
      </span>
      <input type="checkbox" className="peer sr-only" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-white/10 transition peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-text after:shadow after:transition peer-checked:after:translate-x-5 peer-checked:after:bg-accent-ink" />
    </label>
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
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface px-5 py-4 ring-1 ring-line">
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        <span className="mt-0.5 block text-[13px] text-muted">{detail}</span>
      </span>
      {confirming ? (
        <span className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              onConfirm();
              setConfirming(false);
            }}
            className="rounded-full bg-red-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setConfirming(true)}
          className="rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-40"
        >
          {action}
        </button>
      )}
    </div>
  );
}
