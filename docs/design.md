# Cineflex — Design

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
| `--accent` | `#f2b84b` (warm amber) | Rating star, active nav marker, progress, player color |

Radius: `10px` cards/posters, `999px` buttons and chips, `16px` panels.
Spacing: 4px base; page gutter `clamp(16px, 4vw, 56px)`; row gap 40px.

## 3. Type

- **Geist Sans** for everything; tracking `-0.02em` on headings.
- Display (hero title fallback): 56–80px, weight 700, tight leading 0.95.
- H2 row titles: 20px, weight 600.
- Body: 15px / 1.6, `--muted` for overviews, max 60ch.
- Meta line: 13px, items separated by a `·` in `--faint`.

## 4. Layout

- **Desktop:** fixed 72px left rail (logo, search, home, movies, series, library). Active item = text-white + 2px amber dot under the icon. Content offset by the rail.
- **Mobile (<768px):** rail becomes a bottom tab bar (5 items) with safe-area padding. Hero height 70vh.
- Max content width: none for heroes; rows bleed to the right edge so cards peek (signals scroll).

## 5. Components

- **Hero** — full-bleed backdrop (`w1280`/`original`), left-to-right and bottom gradients, logo or title, meta line, 2-line overview, Play (solid) + More info (ghost). Progress dashes bottom-right; current one fills over the interval.
- **Poster card** — 2:3, radius 10, subtle scale 1.03 + brightness on hover; title + year below in small type (not overlaid).
- **Landscape card** (Continue Watching) — 16:9 backdrop, thin amber progress bar, "S2 · E5" label.
- **Top 10 card** — giant outlined numeral (stroke only, `--faint`) behind/left of the poster.
- **Row** — title + optional "See all ›"; native horizontal scroll with snap; desktop shows round arrow buttons on hover.
- **Detail page** — backdrop at top 70vh with gradient; poster on the left at md+; title/logo, meta chips, genres, overview, actions (Watch Now, My List). Below: cast strip, More like this row. Series: episodes panel on the right at xl, below at smaller sizes.
- **Episodes panel** — season select, spoiler-protection toggle (blurs stills and hides overviews of unwatched episodes), list of rows: still 16:9, "N. Title", runtime, overview (2 lines).
- **Player** — black page, iframe fills viewport; a top bar (back, title, S/E) that fades after 3s of no mouse movement; series get prev/next and an episodes drawer.

## 6. States

- Loading: skeletons with a very soft shimmer, same dimensions as content (no layout shift).
- Empty: one sentence, one action. Missing TMDB key gets a setup card.
- Errors: inline, calm, with a retry.

## 7. Accessibility

- Contrast: text on images always sits on ≥ 60% black gradient.
- Focus ring: 2px amber outline with 2px offset.
- Reduced motion: disable carousel autoplay and hover scaling.
