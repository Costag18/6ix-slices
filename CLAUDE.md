@AGENTS.md

# 6ix Slices — Toronto Pizza Deal Comparator

## Project Overview
Compares pizza deals across 7 major Toronto chains to find the cheapest option for feeding a group. Area-based scoring ensures small and large slices are weighted correctly.

## Tech Stack
- **Next.js 16** (App Router) + **Tailwind CSS v4**
- **Turso** (libsql) for SQLite database
- **Cheerio** for HTML parsing (Tier 1 scrapers)
- **Vitest** for testing
- **Framer Motion** for card animations

## Architecture

### Chains (7 total)
- **Tier 1 (live scraping):** Domino's (JSON API), Pizza Nova (__NEXT_DATA__), Pizzaiolo (HTML)
- **Tier 2 (static data):** Pizza Pizza, Little Caesars, Pizza Hut, Papa John's
  - Static prices from public Canadian menu aggregator sites (April 2026)
  - TODO: Replace with live Puppeteer scraping via GitHub Actions

### Scoring Engine (`src/lib/scoring.ts`)
- **Area-based comparison**: Picks cheapest pizza by cost per square inch (not per slice)
- **Appetite levels** calibrated to large (14") slice area (~19.24 sq in per slice)
- **Deals** only shown if they actually beat the best regular menu price per sq in
- **Value Score** (0-100): 40% price/sqin + 20% toppings + 25% promo + 15% extras

### Data Flow (client-side orchestrated lazy refresh)
1. Page loads → fetches `/api/freshness` + `/api/deals`
2. Checks staleness per chain (6h Tier 1, 24h Tier 2)
3. Stale chains refreshed via `/api/refresh/{chainId}` in parallel
4. No cron jobs — scraping triggered by user visits

### Key Constraints
- **Vercel Hobby** 10s function timeout → per-chain refresh endpoints
- All Canadian URLs (`.ca` domains) for chain links
- Pizza Hut has non-standard sizes (Personal 6", Pan Small 9") — use actual diameter for area, NOT the generic size mapping

## File Structure
```
src/
  lib/
    types.ts          — Shared types, AREA_PER_PERSON, STALENESS_THRESHOLDS
    db.ts             — Turso client + CRUD helpers
    schema.ts         — DB schema + chain seed data (INSERT OR REPLACE)
    scoring.ts        — Area-based scoring engine
    scrapers/
      normalize.ts    — Size/slice/area helpers
      dominos.ts      — Live: Domino's JSON API
      pizzanova.ts    — Live: Pizza Nova __NEXT_DATA__
      pizzaiolo.ts    — Live: Pizzaiolo HTML scraping
      pizzapizza.ts   — Static: Pizza Pizza pricing
      littlecaesars.ts — Static: Little Caesars pricing
      pizzahut.ts     — Static: Pizza Hut pricing (custom diameters!)
      papajohns.ts    — Static: Papa John's pricing
  app/
    page.tsx          — Main client page with state management
    api/
      freshness/      — GET last-updated timestamps
      deals/          — GET cached pizza/deal data
      refresh/        — Per-chain refresh endpoints (7 routes)
  components/         — DealCard, GroupControls, ModeToggle, etc.
tests/                — Vitest tests for scrapers, scoring, DB
```

## Common Pitfalls
- **Tailwind v4** uses `@import "tailwindcss"` not `@tailwind base/components/utilities`
- **Pizza sizes aren't standardized** across chains — always use actual diameter for area calculation, never assume size label = standard diameter
- **Deals can be worse than menu prices** — always filter deals by whether they actually save money per sq in
- **Deals need structured `itemsIncluded`** — only deals with pizza items in `itemsIncluded` are evaluated; raw coupon data with empty `itemsIncluded` is excluded to prevent cluttered/misleading display
- **Domino's coupons** are parsed from name text to extract pizza size/count for `itemsIncluded`; coupons without recognizable pizza items are not shown
- Chain seed uses `INSERT OR REPLACE` so URL updates take effect on next refresh
