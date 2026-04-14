# 6ix Slices — Design Spec

## Overview

**6ix Slices** is a web app that compares pizza deals across 7 major Toronto chains, helping groups find the best value when ordering for parties, events, or gatherings.

**Target users:** Anyone in Toronto ordering pizza for a group (office lunches, parties, game nights).

## Branding

- **Name:** 6ix Slices
- **Logo:** Minimalist/flat CN Tower silhouette where the antenna tip transitions into a pizza slice. Single or two-tone vector.
- **Color palette:** Tomato red + golden crust yellow accents on a clean white/dark background.
- **Typography:** Modern sans-serif (e.g., Inter or similar).
- **Tagline:** "Toronto's smartest pizza calculator"

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Framework | Next.js 15 (App Router) | Free |
| Hosting | Vercel (Hobby plan) | Free |
| Database | Turso (SQLite, free tier) | Free |
| Easy scraping | Cheerio + fetch | Free |
| Hard scraping | Puppeteer via GitHub Actions cron | Free |
| Styling | Tailwind CSS | Free |

## Chains & Data Sources

### Tier 1 — Easy (fetch/Cheerio, runs on Vercel)

| Chain | Method | Details |
|-------|--------|---------|
| **Domino's** | Direct JSON API | `order.dominos.ca/power/store/{storeId}/menu?lang=en&structured=true` — returns products, variants with prices, sizes, toppings, and 35+ coupons. No auth needed. |
| **Pizza Nova** | Cheerio + `__NEXT_DATA__` | Next.js SSR site. Parse `<script id="__NEXT_DATA__">` for full product catalog with prices. Key URLs: `/products/4505` (Signature), `/products/4513` (Create Your Own), `/products/4494` (Other Favourites). |
| **Pizzaiolo** | Cheerio (static HTML) | Traditional server-rendered site. Prices in plain HTML. Key URLs: `/orders/gourmet-meat-pizzas/categories`, `/orders/gourmet-vegetarian-pizzas/categories`, `/orders/gourmet-vegan-pizzas/categories`, `/orders/additional_items`. |

### Tier 2 — Hard (Puppeteer, runs on GitHub Actions)

| Chain | Method | Details |
|-------|--------|---------|
| **Pizza Pizza** | Puppeteer (Angular SPA) | Navigate to `/catalog/products/`, wait for Angular bootstrap, extract rendered DOM. Intercept API calls to discover backend endpoints for future direct access. |
| **Little Caesars** | Puppeteer (JS SPA + Cloudflare) | Navigate to `order.littlecaesars.ca`, handle store selection, wait for menu render. Cloudflare challenge may require stealth plugin. |
| **Pizza Hut** | Puppeteer + Contentful API | Product names/descriptions available via public Contentful GraphQL API (`graphql.contentful.com`). Prices require Puppeteer to load the Angular SPA and intercept Yum Connect API responses. |
| **Papa John's** | Puppeteer (SPA + bot protection) | `www.papajohns.ca` returns 403; use `www2.papajohns.ca`. SPA requires store selection before showing prices. Fallback: scrape `canadianmenuwithprices.com` for approximate pricing. |

## Scraping Architecture

### Client-Side Orchestrated Lazy Refresh

No cron jobs or scheduled tasks. Data refreshes naturally from user traffic, orchestrated by the frontend.

**Vercel Hobby constraint:** 10-second function timeout, no background tasks. Each chain gets its own refresh endpoint so individual scrapes stay within the limit.

### Flow

1. User visits the site → frontend calls `/api/freshness` which returns `last_updated` timestamps per chain
2. Frontend checks each chain's freshness against staleness thresholds
3. For **fresh** chains: frontend calls `/api/deals?chains=dominos,pizzanova,...` to get cached data from DB
4. For **stale Tier 1** chains: frontend calls per-chain refresh endpoints in parallel (`/api/refresh/dominos`, `/api/refresh/pizzanova`, `/api/refresh/pizzaiolo`). Each scrapes, updates DB, and returns fresh data — all within 10s.
5. For **stale Tier 2** chains: frontend calls `/api/refresh/tier2` which triggers a GitHub Actions `workflow_dispatch`. Cached data is served in the meantime. Results trickle in on next visit.
6. UI shows results as each chain's data arrives — cards appear progressively

### Per-Chain Refresh Endpoints

| Endpoint | Method | Expected Time |
|----------|--------|---------------|
| `/api/refresh/dominos` | Fetch JSON API | ~1-2s |
| `/api/refresh/pizzanova` | Fetch + parse `__NEXT_DATA__` | ~2-3s |
| `/api/refresh/pizzaiolo` | Fetch 3 pages + Cheerio parse | ~3-5s |
| `/api/refresh/tier2` | Dispatch GitHub Action | ~1s (fire-and-forget) |

### GitHub Actions Workflow (Tier 2)

Triggered via `workflow_dispatch` from the `/api/refresh/tier2` endpoint:
1. Runs on `ubuntu-latest` with Puppeteer + stealth plugin
2. Scrapes Pizza Pizza, Little Caesars, Pizza Hut, Papa John's sequentially
3. Pushes results to Turso via HTTP API
4. Requires a GitHub PAT stored as a Vercel environment variable

### Staleness Thresholds

| Tier | Threshold | Rationale |
|------|-----------|-----------|
| Tier 1 | 6 hours | Lightweight fetches, promos change frequently |
| Tier 2 | 24 hours | Heavy Puppeteer scrapes, prices change less often |

### First Visit / Cold Start

On the very first visit (empty DB):
- Tier 1 chains are scraped synchronously via their refresh endpoints — results appear within seconds
- Tier 2 chains show a "Loading — first-time setup" skeleton card until the GitHub Action completes
- A flag in the DB tracks whether initial seeding has occurred

### Resilience

- If a scrape fails, the last successful data is retained (never wiped)
- Each chain's scraper is an independent module — one failure doesn't affect others
- Scrape failures are logged with timestamps for debugging broken selectors
- Each record in the DB has a `last_updated` timestamp shown to users

## Database Schema

```sql
-- Pizza chains
CREATE TABLE chains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT
);

-- Individual pizza products
CREATE TABLE pizzas (
  id TEXT PRIMARY KEY,
  chain_id TEXT NOT NULL REFERENCES chains(id),
  name TEXT NOT NULL,
  size TEXT NOT NULL,          -- 'small', 'medium', 'large', 'xlarge', 'party'
  slices INTEGER NOT NULL,     -- number of slices in this size
  price REAL NOT NULL,         -- price in CAD
  toppings_included INTEGER DEFAULT 0,
  square_inches REAL,          -- for value score calculation
  category TEXT,               -- 'cheese', 'pepperoni', 'specialty', 'custom'
  last_updated DATETIME NOT NULL
);

-- Active deals and promos
CREATE TABLE deals (
  id TEXT PRIMARY KEY,
  chain_id TEXT NOT NULL REFERENCES chains(id),
  name TEXT NOT NULL,
  description TEXT,
  price REAL,
  items_included TEXT,         -- JSON array of what's in the deal
  min_people INTEGER,          -- suggested minimum group size
  max_people INTEGER,          -- suggested maximum group size
  promo_code TEXT,
  valid_days TEXT,             -- JSON array e.g. ["mon","tue"] or null for all
  valid_hours TEXT,            -- e.g. "21:00-00:00" or null for all
  last_updated DATETIME NOT NULL
);

-- Scrape run logs
CREATE TABLE scrape_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chain_id TEXT NOT NULL REFERENCES chains(id),
  status TEXT NOT NULL,        -- 'success' or 'failure'
  error_message TEXT,
  scraped_at DATETIME NOT NULL
);
```

## Features

### Two Comparison Modes

**1. Price-Per-Person Mode**
- User inputs group size (slider: 1–50+)
- User selects appetite level:
  - Light = 2 slices/person
  - Medium = 3 slices/person
  - Hungry = 4 slices/person
- App calculates how many pizzas needed from each chain, applies best available deals, and ranks by total cost per person (cheapest first)

**2. Value Score Mode**
- Each deal/pizza gets a score from 0–100 based on:
  - **Price per square inch** (normalizes across pizza sizes) — 40% weight
  - **Toppings included** vs. extra charges — 20% weight
  - **Active promos applied** (discount percentage) — 25% weight
  - **Bundled extras** (drinks, dips, wings in party packs) — 15% weight
- Ranked by score (best value first)

### UI Components

**Hero Section**
- 6ix Slices logo + tagline
- Group size slider (1–50+)
- Appetite toggle (Light / Medium / Hungry)
- Mode toggle (Price-Per-Person / Value Score)

**Results Grid**
- Responsive card grid (1 col mobile, 2–3 cols desktop)
- Each deal card shows:
  - Chain logo
  - Deal name
  - Price breakdown (total + per person)
  - Value score badge (in Value Score mode)
  - Promo badge if active coupon applied
  - "What you get" summary (number of pizzas, sizes, extras)
- Clicking a card expands to show full breakdown

**Filters**
- Filter by chain (checkboxes)
- Filter by pizza type (cheese, pepperoni, specialty)
- Sort by price or value score

**Footer**
- "Last updated" timestamp per chain
- Disclaimer: "Prices may vary by location. Based on Toronto pricing."

### Interactions

- Adjusting group size or appetite recalculates all cards instantly (client-side math)
- Cards animate and re-sort smoothly when switching modes
- Expanded card shows: individual pizza prices, quantity needed, promo details, link to chain's ordering page

## UI & Style

- **Layout:** Single-page app, no routing needed
- **Responsive:** Mobile-first, cards stack on small screens
- **Animations:** Smooth card re-ordering with `layout` animations (Framer Motion or CSS transitions)
- **Dark mode:** Not in v1, can add later
- **Logo style:** Minimalist flat vector — CN Tower antenna merging into a pizza slice tip

## Out of Scope (v1)

- User accounts / saved preferences
- Location-based pricing (v1 uses a single default Toronto store per chain)
- Independent pizza shops (chains only)
- Delivery fee comparison
- Mobile native app
- Dark mode
- Real-time ordering / checkout integration
