# Hali — Fuel & Energy Prices Across East Africa

**Hali** (Swahili for "condition/state") is an MVP commodity-intelligence platform that tracks fuel prices — starting with Kenya, expanding across the 8 East African Community countries. It has two faces:

- A **plain-language landing page** anyone can land on and understand in ten seconds, no economics background needed.
- A **detailed dashboard** with EPRA-style pricing, 24-month trend charts, statistics, market insights, and news, for people who want the full picture.

Built with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Recharts**.

## Features

- **Landing page (`/`)** — today's prices at a glance, everyday cost translations ("what does this mean for my motorbike/car tank"), an East Africa expansion map/grid, plain-language reasons prices move, and teasers for insights & news.
- **Dashboard (`/dashboard`)** — current Super Petrol, Diesel, and Kerosene prices (KES/Litre), previous month price, percentage change, last-updated date, and dashboard statistics (24-month high/low).
- **Historical Price Trends (`/trends`)** — interactive 24-month line chart with toggleable series, month-over-month percentage-change bar charts, and a full data table.
- **Market Insights (`/insights`)** — AI-style commentary cards explaining recent price movements.
- **News & Events (`/news`)** — a timeline of EPRA announcements, global oil market events, currency movements, and OPEC news with impact levels.
- **REST API** — `/api/prices`, `/api/history`, `/api/news`, `/api/insights`.
- **Light & dark themes** — defaults to light (for broad accessibility), with a toggle in the navbar; preference is remembered per-browser.

## Tech Stack

| Layer       | Technology                                  |
|-------------|-----------------------------------------------|
| Framework   | Next.js 15 (App Router)                       |
| UI          | React 19 + Tailwind CSS 3 (class-based dark mode) |
| Language    | TypeScript                                    |
| Data        | In-memory, deterministic mock data (`src/lib/data.ts`) — no database setup required |
| Charts      | Recharts                                      |
| Icons       | lucide-react                                  |
| Fonts       | Inter (body/UI), Playfair Display (editorial headings), JetBrains Mono (numbers) — loaded via `next/font/google` |

> **Note on fonts:** Anthropic's in-house typeface used across Claude's own products isn't publicly licensed, so it can't be reused here. Instead, Hali pairs **Playfair Display** (an editorial serif) for headlines with **Inter** for UI text and **JetBrains Mono** for figures — a similar "editorial headline + clean data" feel, using free Google Fonts.

## Project Structure

```
kenya-fuel-intel/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── prices/route.ts      # GET /api/prices
│   │   │   ├── history/route.ts     # GET /api/history
│   │   │   ├── news/route.ts        # GET /api/news
│   │   │   └── insights/route.ts    # GET /api/insights
│   │   ├── dashboard/page.tsx       # Full data dashboard
│   │   ├── trends/
│   │   │   ├── page.tsx             # Historical trends page
│   │   │   └── TrendsClient.tsx     # Interactive chart controls
│   │   ├── insights/page.tsx        # Market insights page
│   │   ├── news/page.tsx            # News & events page
│   │   ├── layout.tsx               # Root layout + navbar + footer + fonts + theme provider
│   │   ├── page.tsx                 # Landing page (plain-language, public-facing)
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ThemeProvider.tsx        # Light/dark context + localStorage persistence
│   │   ├── ThemeToggle.tsx
│   │   ├── PriceCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── PriceTrendChart.tsx
│   │   ├── PercentChangeChart.tsx
│   │   ├── InsightCard.tsx
│   │   └── NewsTimeline.tsx
│   └── lib/
│       ├── data.ts                  # Deterministic mock data + accessors (prices, history, news, insights, EAC snapshot)
│       └── types.ts                 # Shared TypeScript types
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Data Model (conceptual)

The MVP uses an in-memory, deterministic data module rather than a live database, so it runs anywhere with zero setup. The shapes mirror the tables a production version would use:

| Concept              | Purpose                                                            |
|-----------------------|---------------------------------------------------------------------|
| `commodities`         | Super Petrol, Diesel, Kerosene — name, slug, unit, color            |
| `locations`           | Nairobi (today); Uganda, Tanzania, Rwanda, Burundi, South Sudan, DR Congo, Somalia (coming soon) |
| `commodity_prices`    | Monthly price per commodity/location (24 months of mock history)   |
| `news_events`         | Fuel-related news with title, description, date, impact level      |
| `insights`            | AI-style market commentary linked to a commodity and period        |

To move to a real database later (Postgres on Neon/Supabase, Turso, etc.), swap the functions in `src/lib/data.ts` for real queries — the rest of the app (pages, API routes, components) consumes the same typed shapes and won't need to change.

## Getting Started

### Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- npm

### Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. That's it — no database, no environment variables, no paid services required.

### Available Scripts

| Command           | Description                                  |
|--------------------|-----------------------------------------------|
| `npm run dev`      | Start the development server                  |
| `npm run build`    | Build for production                          |
| `npm run start`    | Start the production server (after build)     |
| `npm run lint`     | Run ESLint                                     |

### Troubleshooting install warnings

- **"No lockfile found"** — this happens the very first time anyone installs
  (no `package-lock.json`/`yarn.lock` has been committed yet). Run
  `npm install` once and commit the `package-lock.json` it generates; the
  warning won't reappear after that. If your team uses Yarn instead, run
  `yarn install` and commit `yarn.lock` — just pick one package manager and
  commit its lockfile, not both.
- **ESLint / recharts deprecation warnings** — ESLint has been upgraded to
  v9 with the modern flat config (`eslint.config.mjs`) to clear the "no
  longer supported" warning and its outdated sub-dependencies. Recharts is
  intentionally staying on 2.x for now — the 3.x migration is a breaking
  change not worth the risk this early; it's a fine candidate for a later,
  dedicated upgrade PR.

## API Reference

All endpoints return JSON.

### `GET /api/prices`
Current prices (Nairobi) for all commodities, plus dashboard statistics.

```json
{
  "prices": [
    {
      "commodity": "Super Petrol",
      "slug": "petrol",
      "unit": "KES/Litre",
      "color": "#16a34a",
      "currentPrice": 195.4,
      "previousPrice": 191.8,
      "percentChange": 1.9,
      "lastUpdated": "2026-06-01"
    }
  ],
  "stats": {
    "currentPetrol": 195.4,
    "currentDiesel": 182.3,
    "currentKerosene": 178.1,
    "highest24m": { "commodity": "Super Petrol", "price": 210.2, "period_date": "2025-08-01" },
    "lowest24m": { "commodity": "Kerosene", "price": 165.4, "period_date": "2024-12-01" }
  }
}
```

### `GET /api/history`
Monthly Nairobi price history (24 months) for all commodities.

```json
{
  "history": [
    { "period_date": "2024-07-01", "petrol": 193.84, "diesel": 180.1, "kerosene": 172.93 }
  ]
}
```

### `GET /api/news`
Fuel-related news and events, most recent first.

```json
{
  "news": [
    {
      "id": 1,
      "title": "EPRA Announces New Fuel Prices for the Monthly Review Cycle",
      "description": "...",
      "event_date": "2026-06-14",
      "impact_level": "high",
      "source": "EPRA Monthly Price Guide"
    }
  ]
}
```

### `GET /api/insights`
AI-style market insights, most recent first.

```json
{
  "insights": [
    {
      "id": 1,
      "commodity_id": 1,
      "commodity_name": "Super Petrol",
      "title": "Super Petrol Prices Move on Crude and FX Pressures",
      "content": "...",
      "sentiment": "negative",
      "period_date": "2026-06-01"
    }
  ]
}
```

## Updating Fuel Prices

Kenya's Super Petrol, Diesel, and Kerosene prices for several recent months
are **real**, sourced directly from EPRA's public monthly pump price
circular (published around the 14th–15th of each month at
[epra.go.ke/pump-prices](https://www.epra.go.ke/pump-prices), and widely
reported by Kenyan outlets the same day) — not just the current and
previous cycle, but nine confirmed months scattered across the 24-month
chart. Every month in between two confirmed real points is an illustrative
trend shape, mathematically calibrated to pass exactly through the real
numbers on either side — see the `calibrateToReal()` comment in
`src/lib/data.ts` if you want the mechanics.

**To update prices for a new EPRA cycle**, open `src/lib/data.ts` and find
the `REAL_MONTHLY_PRICES` table near the top:

```ts
const REAL_MONTHLY_PRICES: Record<string, { petrol: number; diesel: number; kerosene: number }> = {
  "2025-07-01": { petrol: 186.31, diesel: 171.58, kerosene: 156.58 },
  // ...
  "2026-06-01": { petrol: 214.03, diesel: 222.86, kerosene: 191.38 },
  "2026-07-01": { petrol: 214.03, diesel: 222.86, kerosene: 191.38 },
};
```

1. Add a new entry keyed to the new cycle's month (`"YYYY-MM-01"`, matching
   the month the cycle *starts* in — e.g. a cycle starting July 15 is
   keyed `"2026-07-01"`).
2. Update `REAL_ANCHORS.effectiveFrom` / `effectiveTo` to the new cycle's
   dates (this just drives the "last updated" label and source caption).
3. Save, commit, and redeploy (`git push`, or `npm run build && npm run
   start` locally). The current price, % change, "last updated" date, the
   24-month chart, the dashboard high/low, and the `/trends` calendar all
   update automatically — nothing else needs to change.

A note on accuracy: an earlier pass of this table mistakenly attributed a
price cut to the wrong cycle (labeling June as a fresh reduction, when
EPRA's own July 14 announcement was genuinely "unchanged" from June — the
real cut happened one cycle earlier, going from May into June). If a
month's % change ever looks surprising, it's worth checking the actual
EPRA circular for that exact cycle rather than assuming the app is right —
the goal here is to stay correctable, not to appear authoritative.

Because `getMonthList()` anchors to the real calendar date at build time
(not a hardcoded date), the "current month" label also stays correct on
its own as time passes, even if you forget to redeploy for a cycle or two.

**Price events** shown on `/trends` (the highlighted months with a story
behind them) live in `getPriceEvents()`, right below `getPriceHistory()`
in the same file. Add an entry there — `{ period_date, title, description,
direction }` — whenever a cycle has a real, citable story worth
surfacing (a sharp spike, a subsidy, a policy change), the same way the six
currently there were sourced from actual EPRA announcements and news
coverage, not invented.

### Tanzania and Uganda

Hali now also tracks Tanzania and Uganda — the other two founding members
of the original East African Community, alongside Kenya. Each has a real
current price, but the three countries genuinely work differently, and the
app is deliberately honest about that rather than flattening them into one
model:

| Country  | Regulator                                              | Model                                             | Cadence                                  |
|----------|---------------------------------------------------------|----------------------------------------------------|-------------------------------------------|
| Kenya    | EPRA                                                     | Official gazetted max retail price                  | Monthly, effective the **14th–15th**      |
| Tanzania | EWURA                                                    | Official gazetted cap price (by port: Dar/Tanga/Mtwara) | Monthly, effective **early in the month** (varies, historically 1st–6th) |
| Uganda   | Ministry of Energy & Mineral Development                 | **Deregulated** — dealers set their own pump prices | No fixed cadence; Ministry publishes an indicative price, actual pump prices vary station to station |

To update Tanzania or Uganda, edit `TANZANIA_ANCHOR` / `UGANDA_ANCHOR` in
`src/lib/data.ts` the same way as `REAL_ANCHORS` above. Uganda has no
`previous` block by design — with no official cycle date, a clean
month-over-month % change would imply more precision than the source
actually supports, so the UI only shows Uganda's current price.

### Keeping this current without manual edits

This sandbox has no network access, so this update is a manual, one-time
data refresh rather than a deployed automation. The natural next step is a
small scheduled job (a GitHub Action or Vercel Cron Job both work well)
that runs monthly and:

1. Fetches the official page for each country (EPRA's pump price page,
   EWURA's cap price notice) rather than a news aggregator.
2. Parses out the retail petrol/diesel/kerosene figures.
3. Opens a PR (or writes directly, if you're comfortable skipping review)
   updating the relevant `*_ANCHOR` block in `src/lib/data.ts`.
4. Runs on a schedule matched to each country's real cadence — e.g. the
   15th for Kenya, the 1st for Tanzania — rather than a single shared day,
   since the two don't actually update on the same schedule.

Uganda doesn't fit this pattern well since there's no single official
number to fetch on a schedule — a periodic manual spot-check (as done here)
or a small survey-based estimate is more honest than pretending there's an
official cadence to scrape.

## Deployment (Vercel)

This project is ready for direct deployment to Vercel with zero configuration:

1. Push the repository to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. Vercel runs `npm install` and `npm run build` automatically — there's no database to provision and no environment variables to set.

## Customization

- **Mock data** — edit `src/lib/data.ts` to change base prices, volatility, news events, insights, or the East Africa country list.
- **Styling & theme** — color tokens for both light and dark themes live in `tailwind.config.ts`; global styles (including the light/dark base styles) live in `src/app/globals.css`. Dark mode uses Tailwind's `class` strategy — components pair a light-mode class with a `dark:` variant (e.g. `bg-surface dark:bg-surfaceDark`).
- **Fonts** — configured in `src/app/layout.tsx` via `next/font/google`; swap `Fraunces`/`Inter`/`JetBrains_Mono` for any other Google Font by changing the import and variable name.
- **Adding countries** — the East Africa expansion grid on the landing page is powered by `getEastAfricaSnapshot()` in `src/lib/data.ts`; add a `price`/mark a country `"live"` once real data is available for it.
- **Adding commodities** — extend `getCurrentPrices()`/`getPriceHistory()` in `src/lib/data.ts`; UI components may need minor extension for more than 3 series.

## License

This is an MVP/demo project provided as-is for evaluation and prototyping purposes. Kenya's current and previous-month fuel prices are sourced from EPRA's public pump price circular (see "Updating Fuel Prices" above); the rest of the 24-month trend, the independence-era history, and all non-Kenya figures are illustrative estimates, not audited data.
