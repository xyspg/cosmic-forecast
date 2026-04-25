# Cosmic Forecast

A satirical prediction-market interface where bets are resolved by the cosmos. Users trade Yes/No shares on real-world questions, but outcomes aren't settled by reality — they're settled by whatever NASA's space-weather feed happens to report that day, then rationalized by an LLM pretending to be a rigorous research bureau.

Built as an NYU course project.

![Cosmic Forecast — The Prediction Record](./public/screenshot-home.jpg)

## Quick start

```bash
bun install
bun run dev        # http://localhost:5173
```

### Other scripts

```bash
bun run build      # build SPA + Worker bundle to dist/
bun run preview    # preview the production build locally
bun run typecheck  # tsc --noEmit
bun run lint       # oxlint
bun run format     # oxfmt (writes in place)
bun run test       # Playwright e2e (excludes load tests)
```

## How it works

1. Browse markets on the homepage, click Yes/No → `/market/$slug?side=yes|no`
2. Place a bet. Balance deducts; the position is saved to localStorage.
3. A "Speed Up Time" overlay appears, leading into a warp-starfield animation.
4. During the animation, `POST /api/resolve-bet` deterministically maps a live NASA DONKI event (solar flares, CMEs, geomagnetic storms, etc.) to a YES/NO outcome and asks an OpenAI-compatible model to write a plausible-sounding cosmic rationale — both returned in a single response.
5. The result reveals: outcome, P&L, and a fabricated scientific write-up.

There is no database, no auth, and no real money. Everything runs client-side with a single Cloudflare Worker proxying NASA DONKI and the LLM.

## Tech stack

- **Vite 8** + **`@cloudflare/vite-plugin`** — dev server runs the SPA _and_ the Hono Worker with KV bindings via Miniflare
- **TanStack Router** (file-based) — routes in `src/routes/`, `routeTree.gen.ts` is auto-generated
- **Hono** — single Worker entry at `src/worker/index.ts`, handles `/api/*` and falls through to assets
- **React 19** + TypeScript (strict)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **zustand 5** (persist → localStorage)
- **motion/react** for animations
- **zod** for `validateSearch` schemas
- **oxlint + oxfmt**, **bun** as package manager
- **Cloudflare Workers** as the deploy target (single Worker serves API + assets)

## Environment

Set in `.dev.vars` for local dev or `wrangler secret put` for prod:

```bash
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=
```

NASA DONKI does not require a key.

## Project layout

```
src/
  main.tsx              # RouterProvider entry
  styles.css            # Tailwind + design tokens
  routes/               # / , /wallet, /market/$slug, /resolution/$slug
  worker/index.ts       # Hono — /api/* + ASSETS fallback
components/             # bureau/, loading/, ui/, top-level overlays
data/markets.json       # 40 seeded market questions
hooks/                  # useMarketTicker
lib/                    # zustand store, NASA fetch, hash, LLM prompt
public/                 # icon, _headers, screenshot
scripts/                # Bun-only utilities (excluded from tsconfig)
tests/                  # Playwright specs
```

## Deploy (Cloudflare)

```bash
bun run deploy     # vite build && wrangler deploy
```
