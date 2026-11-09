# Cineflex

A clean, minimal movie & series site. Metadata from TMDB, playback via the VidCore embed player.

- Product: [docs/prd.md](docs/prd.md)
- Technical: [docs/specs.md](docs/specs.md)
- Design: [docs/design.md](docs/design.md)

## Run

```bash
cp .env.example .env.local   # then set TMDB_API_KEY
pnpm install
pnpm dev
```

Open http://localhost:3000.

Cineflex does not host any video. Playback is provided by a third-party embed.
