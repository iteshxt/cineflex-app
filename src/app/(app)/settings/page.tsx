import type { Metadata } from "next";
import { SettingsView } from "@/components/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-5xl px-gutter pb-16 pt-10 md:pt-14">
      <h1 className="text-3xl font-bold tracking-[-0.03em] md:text-4xl">Settings</h1>
      <p className="mt-2 text-muted">Personalize CineFlex. Everything is saved in this browser only.</p>
      <SettingsView />
    </main>
  );
}
