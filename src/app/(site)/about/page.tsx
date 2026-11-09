import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/prose-page";
import { DEVELOPER, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Why CineFlex exists and how it’s built.",
};

export default function AboutPage() {
  return (
    <ProsePage
      eyebrow="About"
      title="A calmer way to watch"
      intro="CineFlex is a minimal, artwork-first home for movies and series — built so finding something to watch takes seconds, not scrolling."
    >
      <h2>Why it exists</h2>
      <p>
        Most streaming interfaces are crowded with banners, autoplaying previews and endless rows. CineFlex goes the other
        way: fewer, larger titles, one clear action on every screen, and nothing between you and pressing play. No account is
        needed, and the app remembers your list and progress right on your device.
      </p>

      <h2>What you can do</h2>
      <ul>
        <li>Browse what’s trending, top rated and new — or filter by genre, decade, rating and language.</li>
        <li>Search instantly across movies and series.</li>
        <li>Follow series season by season, with spoiler protection and “up next”.</li>
        <li>Save titles to My List and continue where you left off.</li>
        <li>Install it on your phone or desktop like a native app.</li>
      </ul>

      <h2>How it’s built</h2>
      <p>
        CineFlex is built with Next.js, React and Tailwind CSS and hosted on Vercel. Film and TV information comes from{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          TMDB
        </a>
        ; playback opens a third-party embedded player that CineFlex sandboxes to block pop-ups and redirects. CineFlex
        doesn’t host any video — see the <Link href="/disclaimer">disclaimer</Link>.
      </p>

      <h2>Who made it</h2>
      <p>
        CineFlex is designed and developed by <Link href="/developer">{DEVELOPER.name}</Link>, a software developer. The
        source is on{" "}
        <a href={SITE.repo} target="_blank" rel="noreferrer">
          GitHub
        </a>
        .
      </p>
    </ProsePage>
  );
}
