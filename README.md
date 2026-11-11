<div align="center">

<img src="src/app/icon.svg" width="88" height="88" alt="CineFlex icon" />

# CineFlex

**Movies & series, beautifully simple.**

[cineflex-app-beta.vercel.app](https://cineflex-app-beta.vercel.app)

</div>

---

CineFlex is a clean, minimal place to browse and watch movies and series. No accounts, no clutter: open it and press play. Titles, artwork and details come from [TMDB](https://www.themoviedb.org/); playback uses the [VidCore](https://www.vidcore.org/) embed player.

## Features

- **Browse:** a home page of trending, popular and top-rated rows, a Top 10, and "See all" pages. Movies and Series can be filtered by genre, decade, rating and language.
- **Hover previews:** rest on a poster and it zooms into a card with details, **Watch now** and **Add to list**.
- **Search:** results appear as you type, with recent searches and trending suggestions.
- **Player:**
  - full-screen, with a frosted control pill that hides while you watch and comes back when you move;
  - next and previous episode buttons, plus an episode drawer;
  - a details and related-titles sheet you can scroll up over the video, even in fullscreen.
- **Ad shield:** the embed is sandboxed, so it can't open pop-ups or redirect you away. If an ad link ever replaces the player, CineFlex puts it back where you were.
- **Continue Watching:** picks up close to where you stopped.
- **Lists:** My List, plus as many custom lists as you like.
- **Settings:**
  - accent colour (yellow, red, blue or white), shared by the app and the player;
  - player size, audio language and autoplay;
  - spoiler protection and reduced motion;
  - backup export and import.
- **Installable:** a PWA that installs on Android, iOS and desktop, with an offline fallback.
- **Private by design:** your list, progress and settings stay in your browser. There are no trackers and no database.

## Tech stack

- **Next.js 16** (App Router, Cache Components, Turbopack) with **React 19** and **TypeScript**
- **Tailwind CSS v4**, with design tokens in `src/app/globals.css`
- **TMDB API**, fetched server-side and cached (`src/lib/tmdb.ts`)
- **VidCore** embed (`src/lib/vidcore.ts`)
- **pnpm**, hosted on **Vercel**

## Getting started

You’ll need Node.js 20.9+, pnpm, and a free TMDB API key from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

```bash
git clone https://github.com/iteshxt/cineflex-app.git
cd cineflex-app
cp .env.example .env.local   # then set TMDB_API_KEY
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `TMDB_API_KEY` | Yes | A TMDB v3 API key **or** a v4 read access token. Server-only. |
| `TMDB_API_BASE` | No | An alternate TMDB API base (for example a proxy), for networks that block `api.themoviedb.org`. |
| `NEXT_PUBLIC_PLAYER_COLOR` | No | The player accent as hex without `#`. It defaults to the brand yellow `f2b84b`. |

### Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Starts the dev server |
| `pnpm build` | Makes a production build |
| `pnpm start` | Serves the production build |
| `pnpm lint` | Runs ESLint |
| `python3 scripts/generate-icons.py` | Regenerates the PNG app icons and favicon (needs Pillow) |

## Project structure

```
docs/                 prd.md · specs.md · design.md
public/               app icons and the service worker (sw.js)
scripts/              icon generator
src/app/(site)/       landing, about, FAQ, developer, contact and legal pages
src/app/(app)/        the app: home, browse, details, player, search, library, settings
src/app/api/          search and season routes (keep the TMDB key server-side)
src/components/       UI components
src/lib/              TMDB client, VidCore URL builder, library and settings stores, site facts
src/proxy.ts          sends returning visitors from / to /home
```

A first visit to `/` shows the landing page. After that, `/` opens the app at `/home`. To see the landing page again, go to `/?welcome`.

## Docs

- [Product requirements](docs/prd.md)
- [Technical specs](docs/specs.md)
- [Design](docs/design.md)

## Disclaimer

CineFlex does not host, store or upload any video. Titles, artwork and metadata are provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB. Playback is provided by a third-party embedded player. See the [disclaimer](https://cineflex-app-beta.vercel.app/disclaimer).

---

<div align="center">

Built by [iteshxt](https://iteshxt.me)

</div>
