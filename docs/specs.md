# CineFlex — Technical Specs

## 1. Stack

- **Next.js 16** (App Router, Cache Components enabled, Turbopack), React 19, TypeScript.
- **Tailwind CSS v4** with design tokens in `src/app/globals.css`.
- **pnpm** as the package manager.
- No database. Client state in `localStorage` behind a tiny typed store (`src/lib/library.ts`).

## 2. Repository layout

```
docs/                 prd.md, specs.md, design.md
src/app/(site)/       public pages: landing, about, FAQ, developer, contact, legal (site header + footer)
src/app/(app)/        the app: home, browse, detail, player, search, library, settings (nav rail / pill)
src/components/       UI components (server by default, `"use client"` only where needed)
src/lib/tmdb.ts       TMDB client (server-only, cached)
src/lib/vidcore.ts    VidCore embed URL builder + event parsing
src/lib/library.ts    My List / Continue Watching (client, localStorage)
src/lib/types.ts      shared types
```

## 3. Environment

| Variable | Required | Notes |
|----------|----------|-------|
| `TMDB_API_KEY` | yes | TMDB v3 API key **or** v4 read access token (a value starting with `eyJ` is sent as a Bearer token). Server-only. |
| `TMDB_API_BASE` | no | Alternate API base (e.g. a proxy) for networks that block `api.themoviedb.org`. |
| `NEXT_PUBLIC_PLAYER_COLOR` | no | Hex without `#`, passed to VidCore `color`/`theme`. Defaults to the brand accent. |

Without `TMDB_API_KEY`, pages render an empty state explaining how to set it instead of crashing.

## 4. Routes

| Route | Rendering | Purpose |
|-------|-----------|---------|
| `/` | Static + cached data | Public landing page (hero with poster wall, features, trending, FAQ teaser) |
| `/home` | Static shell + cached data | App home: hero, rows |
| `/about`, `/faq`, `/developer`, `/contact` | Static | Site pages |
| `/privacy`, `/terms`, `/cookies`, `/disclaimer`, `/dmca`, `/legal` | Static | Legal pages; facts in `src/lib/site.ts` |
| `/robots.txt`, `/sitemap.xml` | Static | SEO |
| `/movies`, `/tv` | Shell + Suspense (searchParams) | Browse with `?sort=&genre=&decade=&rating=&lang=&page=` |
| `/movie/[id]` | Shell + Suspense (params) | Movie detail |
| `/tv/[id]` | Shell + Suspense (params) | Series detail, `?season=` |
| `/watch/movie/[id]` | Shell + Suspense | Player |
| `/watch/tv/[id]/[season]/[episode]` | Shell + Suspense | Player with episode nav |
| `/collection/[slug]` | Static params + cached data | "See all" pages for the home rows (`src/lib/collections.ts`) |
| `/search` | Shell + client | Instant search (`?q=`), recent searches, trending suggestions, top-result card |
| `/library` | Client | Tabs for My List (type filter, sort, remove) and Continue Watching |
| `/settings` | Client | Accent color, ad shield, autoplay next, spoiler default, hero rotation, clear data |
| `GET /api/search?q=` | Route handler | Proxies TMDB multi-search (keeps key server-side) |
| `GET /api/tv/[id]/season/[n]` | Route handler | Season episodes for client-side season switching |

Per Cache Components rules, every `params` / `searchParams` read happens inside a `<Suspense>` boundary, and all TMDB calls are `"use cache"` functions with `cacheLife("hours")` (search uses `"minutes"`).

## 5. TMDB integration (`src/lib/tmdb.ts`)

- Base `https://api.themoviedb.org/3`, images `https://image.tmdb.org/t/p/{size}{path}`.
- Functions: `getTrending(type, window)`, `getList(type, list)` (popular/top_rated/now_playing/on_the_air), `discover(type, {genre, sort})`, `getMovie(id)`, `getShow(id)`, `getSeason(id, n)`, `getGenres(type)`, `searchMulti(q)`.
- Detail calls use `append_to_response=images,credits,recommendations,videos` and `include_image_language=en,null` to get title logos.
- All responses are mapped to slim internal types (`MediaItem`, `MovieDetail`, `ShowDetail`, `Episode`) before leaving the server so client payloads stay small.
- Requests time out after 8s and retry up to 3 times on 429/5xx/network errors/timeouts.
- Errors: a 4xx → `null` (detail pages call `notFound()`). Transient failures throw from detail/season functions so they are never cached and `app/error.tsx` offers a retry; list functions swallow them and render an empty row, cached for seconds only.

## 6. VidCore integration (`src/lib/vidcore.ts`)

Embed URLs (TMDB IDs):

```
https://vidcore.org/embed/movie/{tmdbId}
https://vidcore.org/embed/tv/{tmdbId}/{season}/{episode}
```

Query parameters used:

| Param | Value | Why |
|-------|-------|-----|
| `autoplay` | `true` | User already clicked Play |
| `color`, `theme` | brand hex (no `#`) | Match the site accent |
| `startAt` | seconds (optional) | Reserved for future resume support |

Iframe attributes: `allow="autoplay; encrypted-media; fullscreen; picture-in-picture"`, `referrerPolicy="origin"`. Container fills the viewport.

**Ad shield.** By default the iframe is sandboxed with `allow-scripts allow-same-origin allow-forms allow-presentation allow-orientation-lock`. Leaving out `allow-popups`, `allow-top-navigation` and `allow-modals` stops clicks inside the player from opening ad tabs, redirecting CineFlex, or raising alert dialogs. Ads drawn *inside* the player's own frame can't be removed from outside it. Some players refuse to run when sandboxed, so the player bar has a shield toggle (persisted in `localStorage` under `cineflex:ad-shield`) to turn it off per viewer.

**Events.** VidCore posts `vidcore:play`, `vidcore:pause`, `vidcore:ended` via `postMessage`. The payload shape isn't documented, so the listener (`parsePlayerEvent`) accepts a string or an object with `type`/`event` containing those names, and ignores messages from any origin that isn't `vidcore.org`.
- `play` → upsert Continue Watching entry (title, poster, season/episode, timestamp).
- `ended` on a series → offer "Next episode" with a 10s countdown.

**Errors.** VidCore returns 404 (not indexed), 429 (rate limit), 500 (gateway). These happen inside the iframe, so the player page always shows a small "Having trouble? Reload player" control that re-mounts the iframe.

## 7. Client state (`src/lib/library.ts`, `src/lib/settings.ts`)

Settings live under `cineflex:settings` (`useSettings` / `updateSettings`). The saved accent is applied by a `beforeInteractive` script in the root layout so there is no flash of the default color.

**Background playback.** With Cache Components, Next.js keeps visited pages alive inside React `<Activity>` instead of unmounting them. The player therefore sets the iframe `src` in a `useLayoutEffect` and resets it to `about:blank` in the cleanup, which runs when the page is hidden — so leaving the player stops the video.

```ts
type LibraryItem = { id: number; type: "movie" | "tv"; title: string; poster: string | null; backdrop: string | null; addedAt: number }
type ProgressItem = LibraryItem & { season?: number; episode?: number; updatedAt: number }
```

Keys: `cineflex:list`, `cineflex:progress` (max 30, most recent first). Exposed via `useSyncExternalStore` so components re-render on change and across tabs (`storage` event). All access wrapped in try/catch.

## 8. Performance

- `next/image` with TMDB `remotePatterns`; `unoptimized` because TMDB already serves pre-sized images (`w342`, `w780`, `w1280`, `original`). Pick the smallest size that fits.
- Hero images `priority`; rows lazy.
- Client components: hero carousel, row scroller buttons, Top 10 toggle, episode panel, player, search, library, list button. Everything else is server components.

## 9. Accessibility

- All interactive elements reachable by keyboard with visible focus rings.
- Rows scroll natively (trackpad/touch); arrow buttons are extras, hidden from touch.
- Carousel auto-advance pauses on hover/focus and respects `prefers-reduced-motion`.
- Images have `alt` = title; decorative backdrops `alt=""`.

## 10. PWA

- **Manifest** (`src/app/manifest.ts`): `id`, `scope`, `start_url=/?source=pwa`, `display: standalone`, dark theme/background, SVG + 192/512 PNG + maskable icons, and Search / Library shortcuts.
- **Service worker** (`public/sw.js`, registered in production only by `src/lib/pwa.ts`): network-first for page navigations with an `/offline` fallback, cache-first for hashed `/_next/static` assets, stale-while-revalidate for icons and the manifest. API routes, TMDB images and the VidCore player are never cached. Bump `VERSION` to drop old caches. Served with `Cache-Control: no-store` (see `next.config.ts`) so updates roll out.
- **Install UX:** `beforeinstallprompt` is captured on startup; a dismissible "Install CineFlex" banner and an Install button in Settings call the browser's install dialog. Settings shows manual instructions where the prompt isn't available (iOS Safari, Firefox) and "installed" in standalone mode.
- **Standalone layout:** `viewport-fit=cover`; the mobile nav pads with `env(safe-area-inset-bottom)`.
- Installing on Android requires HTTPS, so test on the deployed site (or `localhost` in desktop Chrome).
