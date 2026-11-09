import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage, Summary } from "@/components/prose-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookies & Storage",
  description: "CineFlex sets no cookies. Here is exactly what it stores in your browser, and why.",
};

const STORAGE = [
  ["cineflex:list", "Local storage", "Titles you added to My List", "Until you remove them"],
  ["cineflex:progress", "Local storage", "Continue Watching (last title / episode opened)", "Until cleared (max 30 items)"],
  ["cineflex:settings", "Local storage", "Accent color and playback preferences", "Until cleared"],
  ["cineflex:recent-searches", "Local storage", "Your last 8 search terms", "Until cleared"],
  ["cineflex:install-dismissed", "Local storage", "Remembers that you closed the install banner", "Until cleared"],
  ["cineflex-*", "Cache storage", "Offline copies of visited pages and site files (installed app)", "Replaced on each app update"],
];

export default function CookiesPage() {
  return (
    <ProsePage eyebrow="Legal" title="Cookies & Storage" updated={SITE.legalUpdated}>
      <Summary>
        CineFlex itself sets <strong>no cookies</strong> and uses no tracking. It keeps a few preferences in your browser so
        the app remembers you — that’s why there’s no cookie banner.
      </Summary>

      <h2>What CineFlex stores</h2>
      <p>Everything below stays on your device. Nothing is sent to us.</p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Where</th>
              <th>Purpose</th>
              <th>How long</th>
            </tr>
          </thead>
          <tbody>
            {STORAGE.map(([key, where, purpose, ttl]) => (
              <tr key={key}>
                <td>
                  <code>{key}</code>
                </td>
                <td>{where}</td>
                <td>{purpose}</td>
                <td>{ttl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        These are strictly functional: without them the app can’t remember your list or settings, but nothing else breaks.
      </p>

      <h2>Third-party cookies</h2>
      <p>
        The video player is an embed from a third-party provider. When you open it, that provider may set its own cookies or
        storage inside its frame. CineFlex can’t read or control them. With the <strong>ad shield</strong> on (the default),
        the player can’t open pop-ups or redirect you, but it can still store data within its own frame. Most browsers let you
        block third-party cookies in their settings.
      </p>

      <h2>How to clear it</h2>
      <ul>
        <li>
          In CineFlex: <Link href="/settings">Settings</Link> → “Your data” lets you clear history, your list or settings.
        </li>
        <li>In your browser: clear “site data” for this site to remove everything, including the offline cache.</li>
      </ul>

      <p>
        Questions? See the <Link href="/privacy">Privacy Policy</Link> or contact{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>
    </ProsePage>
  );
}
