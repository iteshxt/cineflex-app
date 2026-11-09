# Cineflex — Product Requirements

## 1. Summary

Cineflex is a clean, minimal, cinematic web app for discovering and watching movies and TV series. Metadata comes from TMDB. Playback is embedded from the VidCore player (`vidcore.org/embed/...`). There are no accounts: personal state (My List, Continue Watching) lives in the viewer's browser.

## 2. Goals

- Discovery that feels like a premium streaming service: big artwork, calm typography, very little chrome.
- Get from landing to playing in two clicks: hero → **Play**, or poster → **Watch Now**.
- Series are first-class: seasons, episode lists, next/previous episode in the player.
- Fast. Server-rendered and cached metadata, small client bundles, no layout shift.

## 3. Non-goals (v1)

- User accounts, sync across devices, social features ("Watch together").
- Hosting or transcoding video. Cineflex only embeds a third-party player.
- Downloads, notifications/reminders, admin tooling.
- Anime-specific catalog (VidCore documents no anime endpoint).

## 4. Users

- **Casual viewer** — opens the site, sees what's trending, hits Play.
- **Series watcher** — comes back to continue the next episode of a show.
- **Searcher** — knows the title, wants to find and play it immediately.

## 5. Features

| # | Feature | Priority |
|---|---------|----------|
| F1 | Home: rotating hero (trending), Continue Watching, Top 10 Today (Movies / Series toggle), curated rows | P0 |
| F2 | Movie detail: backdrop, logo/title, meta (year, runtime, rating, genres), overview, cast, similar titles | P0 |
| F3 | Series detail: same as movie + season picker + episode list, spoiler protection toggle | P0 |
| F4 | Player page: full-bleed VidCore embed; for series, prev/next episode and episode drawer | P0 |
| F5 | Search: instant, debounced, movies + series, keyboard friendly (`/` focuses search) | P0 |
| F6 | Browse Movies / Series: genre filter, sort by popular / top rated / new | P1 |
| F7 | My List: add/remove from any detail page; Library page shows it | P1 |
| F8 | Continue Watching: recorded when playback starts; resumes at the last episode | P1 |
| F9 | Responsive: side rail on desktop, bottom bar on mobile | P0 |

## 6. Success criteria

- Lighthouse performance ≥ 90 on home (desktop).
- Detail → player in one click. Player shows within 1s on a warm cache (excluding the embed's own loading).
- Home works with no JavaScript for discovery (links, artwork, text); interactivity enhances it.

## 7. Risks

- **Provider availability.** VidCore is a third-party aggregator; a title can 404 or the service can rate-limit (429). The player page shows a clear fallback and a link back.
- **Legal/content.** Cineflex does not host content. The footer and About text state that playback is provided by a third-party embed.
- **TMDB key.** Required server-side (`TMDB_API_KEY`). Never exposed to the client.
