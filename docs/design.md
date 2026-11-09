# CineFlex — Design

## 1. Direction

**Quiet cinema.** The artwork is the interface. Chrome is dark, flat and recedes; the only things that glow are images and the one primary action on screen. Reference: the existing dark streaming UIs (left icon rail, full-bleed hero, Top 10 row) — we keep that skeleton and remove the noise: fewer borders, fewer pills, one accent, more air.

Principles:
1. **One primary action per view.** Solid light button (Play / Watch Now). Everything else is ghost.
2. **Image first, text second.** Use the TMDB title logo when available; fall back to set type.
3. **Depth through gradients, not boxes.** Backdrops fade into the page with long gradients instead of cards with borders.
4. **Motion is slow and small.** 200–300ms ease-out; hero crossfades over 700ms. No bouncing.

## 2. Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#09090b` | Page |
| `--surface` | `#131316` | Panels, inputs |
| `--surface-2` | `#1c1c21` | Hover, chips |
| `--line` | `rgb(255 255 255 / 0.07)` | Hairlines only |
| `--text` | `#f4f4f5` | Primary text |
| `--muted` | `#a1a1aa` | Secondary text |
| `--faint` | `#63636b` | Tertiary, meta separators |
| `--accent` | `#f2b84b` (warm amber, default) | Rating star, active nav, highlights, player color. User-selectable in Settings (Amber, Coral, Rose, Violet, Sky, Mint, Lime) and applied before first paint. |
| `--accent-ink` | `#09090b` | Text/icons on top of the accent |

Radius: `10px` cards/posters, `999px` buttons and chips, `16px` panels.
Spacing: 4px base; page gutter `clamp(16px, 4vw, 56px)`; row gap 40px.

## 3. Type

- **Geist Sans** for everything; tracking `-0.02em` on headings.
- Display (hero title fallback): 56–80px, weight 700, tight leading 0.95.
- H2 row titles: 20px, weight 600.
- Body: 15px / 1.6, `--muted` for overviews, max 60ch.
- Meta line: 13px, items separated by a `·` in `--faint`.

## 4. Layout

- **Order everywhere:** Home, Movies, **Search** (centre), Series, Library.
- **Desktop:** fixed 88px left rail: logo at the top; the five 56px icon buttons are vertically centred so Search sits at the middle; Settings sits directly below Library after a hairline. Labels appear as tooltips.
- **Mobile (<768px):** a floating, icon-only pill (52px targets) with Search in the centre. Settings is reached from a gear on the Library page.
- **Active page:** no box or fill, only a short accent bar under the icon.
- Max content width: none for heroes; rows bleed to the right edge so cards peek (signals scroll).

## 5. Components

- **Hero** — full-bleed backdrop (`w1280`/`original`), left-to-right and bottom gradients, logo or title, meta line, 2-line overview, Play (solid) + More info (ghost). Progress dashes bottom-right; current one fills over the interval.
- **Poster card** — 2:3, radius 10, subtle scale 1.03 + brightness on hover; title + year below in small type (not overlaid).
- **Landscape card** (Continue Watching) — 16:9 backdrop, "S2 · E5" label. No progress bar: the embed doesn't report playback position.
- **Top 10 card** — giant outlined numeral (stroke only, `--faint`) behind/left of the poster.
- **Row** — title + "See all"; at most 10 titles, ending in a "See all" tile that opens `/collection/[slug]`. Native horizontal scroll with snap; desktop shows round arrow buttons on hover. The home page keeps to five curated rows plus a genre strip.
- **Detail page** — backdrop at top 70vh with gradient; poster on the left at md+; title/logo, meta chips, genres, overview, actions (Watch Now, My List). Below: cast strip, More like this row. Series: episodes panel on the right at xl, below at smaller sizes.
- **Episodes panel** — season select, spoiler-protection toggle (blurs stills and hides overviews of unwatched episodes), list of rows: still 16:9, "N. Title", runtime, overview (2 lines).
- **Hover preview** (mouse only) — after ~450ms on a poster, a 340px panel opens *beside* the card (right, else left, else over it on narrow screens). It morphs out of the poster's exact rect (FLIP via the Web Animations API) and back into it on close; content fades in once the panel is open. Backdrop, title, Play / My List / Details, rating, year, type, genres, 3-line overview.
- **Dropdowns** — no native `<select>`: the themed `Select` component (pill trigger, animated listbox, full keyboard support) and the filter-bar menus share one look.
- **Player** — black page, iframe fills viewport; a top bar (back, title, S/E) that fades after 3s of no mouse movement; series get prev/next and an episodes drawer.

## 6. Brand

- **Mark:** a rounded play triangle with a faded "echo" triangle behind it, separated by a clean gap — quiet, and it suggests motion. Accent on transparent in the app (`src/components/logo.tsx`); on a dark rounded tile for favicons and app icons (`src/app/icon.svg`). Survives 16px.
- **Wordmark:** "CineFlex" (capital C and F), Geist semibold, tracking -0.035em, single color.
- **Assets:** `icon.svg` (favicon), `favicon.ico` (16/32/48), `apple-icon.png` (180), `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `manifest.ts`, and a generated 1200×630 `opengraph-image`. PNG/ICO files are produced by `scripts/generate-icons.py` from the same geometry.

## 7. States

- Loading: skeletons with a very soft shimmer, same dimensions as content (no layout shift).
- Empty: one sentence, one action. Missing TMDB key gets a setup card.
- Errors: inline, calm, with a retry.

## 8. Accessibility

- Contrast: text on images always sits on ≥ 60% black gradient.
- Focus ring: 2px amber outline with 2px offset.
- Reduced motion: disable carousel autoplay and hover scaling.
