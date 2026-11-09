import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage, Summary } from "@/components/prose-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What CineFlex collects (very little), where it lives (your browser) and which third parties are involved.",
};

export default function PrivacyPage() {
  return (
    <ProsePage eyebrow="Legal" title="Privacy Policy" updated={SITE.legalUpdated}>
      <Summary>
        CineFlex has no accounts and runs no analytics or ad trackers. Your list, history and settings are saved only in your
        own browser. A few third parties are involved in showing artwork, hosting the site and playing video — they’re listed
        below.
      </Summary>

      <p>
        This policy explains how CineFlex (“we”, “the site”) handles information when you use{" "}
        <a href={SITE.url}>{SITE.url.replace("https://", "")}</a> or the installed CineFlex app.
      </p>

      <h2>1. Information we don’t collect</h2>
      <ul>
        <li>No sign-up: we never ask for your name, email, phone number or password.</li>
        <li>No analytics, tracking pixels, fingerprinting or advertising SDKs from CineFlex.</li>
        <li>
          One functional cookie (<code>cf_returning</code>) records only that you’ve opened the app, so the site skips the
          welcome page next time. It contains no identifier.
        </li>
        <li>No payment information — CineFlex is free.</li>
      </ul>

      <h2>2. Information stored on your device</h2>
      <p>
        To remember your preferences, CineFlex saves a small amount of data in your browser’s local storage. It never leaves
        your device and we can’t see it:
      </p>
      <ul>
        <li>
          <strong>My List</strong> — titles you saved.
        </li>
        <li>
          <strong>Continue Watching</strong> — the titles (and for series, the season and episode) you last opened.
        </li>
        <li>
          <strong>Settings</strong> — accent color, ad shield, autoplay and spoiler options.
        </li>
        <li>
          <strong>Recent searches</strong> — your last few search terms.
        </li>
      </ul>
      <p>
        If you install the app, a service worker also caches pages you visited and the site’s own files so it opens faster
        and can show an offline screen. You can clear all of this at any time in{" "}
        <Link href="/settings">Settings</Link> or by clearing site data in your browser. Details are on the{" "}
        <Link href="/cookies">Cookies &amp; Storage</Link> page.
      </p>

      <h2>3. Information processed to run the service</h2>
      <ul>
        <li>
          <strong>Requests to our server.</strong> When you browse or search, your browser requests pages and search results
          from our server, which fetches the data from TMDB on your behalf. Your search terms are used only to answer that
          request.
        </li>
        <li>
          <strong>Hosting logs.</strong> The site is hosted on Vercel, which—like any web host—processes technical data such
          as IP address, browser type and requested URL to deliver the site and keep it secure. See{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
            Vercel’s privacy policy
          </a>
          .
        </li>
      </ul>

      <h2>4. Third parties</h2>
      <ul>
        <li>
          <strong>TMDB (The Movie Database).</strong> Posters and backdrops load directly from TMDB’s image servers, so TMDB
          receives your IP address and browser details for those image requests.{" "}
          <a href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noreferrer">
            TMDB privacy policy
          </a>
          .
        </li>
        <li>
          <strong>Video player provider.</strong> Playback runs in an embedded player operated by a third party (VidCore).
          When you open the player, your browser connects to that provider, which may set its own cookies, use its own
          storage, and show its own content. Its practices are governed by its own policies, not this one.
        </li>
        <li>
          <strong>YouTube.</strong> Trailer links open YouTube in a new tab, only when you click them.
        </li>
      </ul>

      <h2>5. Children</h2>
      <p>
        CineFlex is not directed at children under 13 and we don’t knowingly collect personal information from them. Some
        titles are intended for mature audiences; parents should supervise younger viewers.
      </p>

      <h2>6. Your choices and rights</h2>
      <p>
        Because we don’t hold personal data on our servers, there’s generally nothing for us to access, correct or delete on
        your behalf — you control everything stored on your device. If you have a privacy question or request, write to{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update this policy as the service changes. The date at the top shows the latest revision. Continued use after
        an update means you accept the revised policy.
      </p>
    </ProsePage>
  );
}
