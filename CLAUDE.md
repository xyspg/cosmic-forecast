# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
bun run dev        # Start dev server (Next.js 16 + Turbopack)
bun run build      # Production build
bun run lint       # oxlint
bun run format     # oxfmt (writes in place)
```

## Tech Stack

- **Next.js 16.2.2** (App Router, Turbopack) — `params` and `searchParams` are async Promises in pages/layouts
- **React 19** + TypeScript
- **Tailwind CSS v4** with `@theme inline` in globals.css for custom colors
- **zustand 5** with `persist` middleware (localStorage) — causes hydration mismatches, always guard with `useHydrated()` hook
- **motion/react** (framer-motion) for animations
- **oxlint** for linting and **oxfmt** for formatting (not ESLint/Prettier/Biome) — `sortImports` and `sortTailwindcss` are enabled in `.oxfmtrc.json`
- **bun** as package manager

## Architecture

**Cosmic Forecast** is a satirical Polymarket clone for an NYU course project. Users bet on real prediction market questions, but outcomes are determined by NASA astronomical data via SHA-256 hashing. An LLM generates fake "scientific" explanations.

### Core Flow

1. User browses markets on homepage → clicks Yes/No → navigates to `/market/[slug]?side=yes|no`
2. Places a bet → balance deducts, position saved to zustand store
3. After 2s, a dark overlay fades in with a mysterious "Speed Up Time" button (SpeedUpOverlay)
4. Click → seamless transition to warp starfield animation (WarpAnimation)
5. During animation: `POST /api/resolve-bet` (SHA-256 hash) + `POST /api/generate-explanation` (LLM) fire in parallel
6. Result reveals → CosmicReport with fake scientific explanation → balance updates with P&L

### State Management

`lib/store.ts` — single zustand store persisted to localStorage:

- `balance`: starting $1,000
- `positions[]`: bets placed (marketId, side, amount, price, shares)
- `resolutions[]`: resolved markets (outcome, explanation, NASA event, hash)

**Hydration rule**: any component reading from the store must guard with `useHydrated()` from `hooks/useHydrated.ts`. Server renders default state (balance=1000, no positions), client updates after hydration.

### API Routes

- `GET /api/cosmic-data` — fetches solar flares + CMEs from NASA DONKI (no API key needed)
- `POST /api/resolve-bet` — SHA-256 hash of NASA event ID + date + market slug → YES/NO
- `POST /api/generate-explanation` — OpenAI-compatible API call (DeepSeek in dev, configurable via env vars)

### Data

- `data/markets.json` — 40 static market questions seeded from Polymarket format
- `lib/generate-price-history.ts` — deterministic fake price history from market slug (seeded PRNG)
- `lib/fake-data.ts` — random wallets, usernames, comments, trade generation

### Key Components

- `FeaturedMarket` — hero card with interactive dual-line chart (hover crosshair + tooltips), scrolling comments
- `PriceChart` — detail page chart with hover interaction, floating +$X amounts, dual Yes/No lines
- `SpeedUpOverlay` — dark overlay with motion/react, the "Speed Up Time" button
- `WarpAnimation` — full-screen starfield with cycling status messages
- `BettingPanel` — Yes/No selector, amount input, position display, P&L after resolution

### Environment Variables

```
OPENAI_API_KEY=     # OpenAI-compatible API key (DeepSeek in dev)
OPENAI_BASE_URL=    # API base URL (https://api.deepseek.com/v1 for dev)
OPENAI_MODEL=       # Model name (deepseek-chat for dev)
```

## Important Patterns

- **No database, no auth** — pure frontend simulation with API routes and localStorage
- Market data is static JSON; prices "jitter" client-side via `useMarketTicker` hook
- The LLM prompt instructs the model to never mention dates or event IDs (to avoid revealing the current date breaks the illusion)
- Resolved markets sink to bottom of homepage grid; featured slot skips resolved markets
- The `scripts/` directory is excluded from tsconfig (uses Bun APIs)
