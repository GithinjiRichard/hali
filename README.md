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
| Fonts       | Inter (body/UI), Fraunces (editorial headings), JetBrains Mono (numbers) — loaded via `next/font/google` |

> **Note on fonts:** Anthropic's in-house typeface used across Claude's own products isn't publicly licensed, so it can't be reused here. Instead, Hali pairs **Fraunces** (a warm, humanist serif) for headlines with **Inter** for UI text and **JetBrains Mono** for figures — a similar "editorial headline + clean data" feel, using free Google Fonts.

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

This is an MVP/demo project provided as-is for evaluation and prototyping purposes. All price data is mock/sample data and does not reflect real EPRA pricing.
