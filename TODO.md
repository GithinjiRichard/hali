# Hali — Progress Tracker

How to use this file: tasks are written as user stories where it helps.
Check items off as they ship; add new ones under "Backlog" as they come up
(newest at the bottom of each list unless priority says otherwise). This
file is the source of truth for "what's done vs what's next" — keep it
current rather than trusting memory across sessions.

Current version: **0.0.3**

---

## ✅ Done

### Phase 1 — MVP dashboard
- [x] As a visitor, I can see current Super Petrol / Diesel / Kerosene prices, previous-month price, and % change.
- [x] As a visitor, I can see interactive historical price trend charts (24 months).
- [x] As a visitor, I can read market insight cards explaining *why* prices moved.
- [x] As a visitor, I can browse a news/events timeline with impact levels.
- [x] Data model: commodities, locations, commodity_prices, news_events, insights.
- [x] Dashboard stats: current prices + 24-month high/low.
- [x] REST API routes: `/api/prices`, `/api/history`, `/api/news`, `/api/insights`.
- [x] Runs with `npm install && npm run dev`; deployable to Vercel.

### Phase 2 — Landing page & brand
- [x] Dedicated landing page at `/`, dashboard moved to `/dashboard`.
- [x] Editorial cream/gold visual identity (Playfair Display + Inter + JetBrains Mono), light default, dark mode supported.
- [x] Original Hali logo/mark (not borrowed — Anthropic's own typeface isn't licensable, so this was designed fresh).
- [x] Hero, Stories, Explore (chart + factors + plain-language explainer), East Africa hotspot map, budget-impact bars, perspective tabs (Commuter/Business/Government), newsletter CTA.
- [x] "Since Independence" long-run petrol chart with a year-scrubber and real historical events (1971, 1974, 1979, 1994, 2008, 2010, 2022).

### Phase 3 — Authenticity & real data
- [x] Versioning reset to semver `0.0.x` for the MVP phase.
- [x] Kenya current price sourced from real EPRA circular (not mock).
- [x] ESLint migrated 8 → 9 (flat config) to clear deprecation warnings.
- [x] Tanzania and Uganda added as live-tracked (the other two founding EAC members) — each honestly labeled with its real pricing model (EPRA/EWURA official cap vs Uganda's deregulated, indicative pricing).
- [x] Fixed stale "last updated" date bug on the dashboard.
- [x] `/trends` "Monthly Price History" replaced with a calendar highlighting real, sourced pricing events (not mock) — includes the April 2026 VAT reversal, the May 2026 mid-cycle diesel/kerosene correction, etc.
- [x] Corrected a real data error (June 2026 was genuinely unchanged from July, not a fresh cut — fixed the mislabeled cycle).
- [x] Added a proper "flat/unchanged" UI state everywhere price changes are shown (previously forced into up/down only).
- [x] 24-month chart now anchored to ~9 real confirmed EPRA months, not just the latest 2 — gaps between them are calibrated, not fully invented.
- [x] Per-country pages (`/countries/[code]`) — live map markers now link through instead of dead-ending at a tooltip.
- [x] `TODO.md` progress tracker established.

### Phase 4 — Content freshness (no daily posting required)
- [x] "Fact of the day" strip on the landing page — rotates daily through real historical + recent price events, zero manual upkeep, no fabrication (it's a rotation, not a claim the event happened on today's date).
- [x] Quotes table on `/trends` — Trading-Economics-style multi-timeframe heatmap (Chg / %Chg / 3M / 6M / YTD / YoY), honestly re-timed to the real monthly EPRA cadence instead of fake live-ticking.

---

## 🔜 Backlog — Up Next

### Data coverage
- [ ] **Add LPG (cooking gas) as a tracked commodity** — price card, history, factors, and inclusion in the Explore section alongside Petrol/Diesel/Kerosene. *(requested — not yet started)*
- [ ] Optional "Global Benchmarks" mini table (Brent/WTI crude) sourced from a free live market API — the one piece of this app that genuinely *could* tick in real time, since crude actually trades. Would sit alongside, not replace, the monthly-cadence Quotes table. Needs a live environment to build/test against (no network in the dev sandbox).
- [ ] Verify the derived (least-certain) 2026-03 petrol/diesel figures in `REAL_MONTHLY_PRICES` against the actual EPRA circular for that cycle, once available, rather than the currently backed-out estimate.
- [ ] Verify Tanzania's carried-forward kerosene previous-month figure (currently assumed unchanged from the prior notice — flagged as least certain of the six TZ figures).
- [ ] Fill remaining gaps in `REAL_MONTHLY_PRICES` (Nov 2024 – Feb 2026 window) as older EPRA circulars are sourced.

### Countries
- [x] Design and ship a per-country page (`/countries/[code]`) so Tanzania/Uganda visitors have somewhere to land — live markers on the map now link through (Kenya → full dashboard, Tanzania/Uganda → a snapshot page with price, source, methodology, and regional context).
- [x] **Adaptive tier system replacing the "one page per country forever" model** — `/countries/[code]` now branches on data richness (Tier 1: official price, Tier 2: reported figure + real range, Tier 3: modeled estimate + visible methodology) instead of assuming every country can support the same template. Proof of concept: Kenya + Tanzania (Tier 1), Uganda (Tier 1/reported hybrid), Ghana + Nigeria (Tier 2 — both turned out to be deregulated with real price ranges, not clean Tier 1 like assumed), South Sudan (Tier 3 — no regulator, real Juba/black-market range cited instead of a fabricated single price).
- [ ] Rwanda as a genuine Tier 1 candidate (RURA — regulated, similar to Kenya/Tanzania) — not yet verified.
- [ ] Wire the adaptive system to more countries — currently 6 profiles exist (`getCountryProfiles()`); scaling this further needs either more manual research passes or the structured-ingestion/crowdsourcing approach discussed for global scale (see "Sustainability at scale" notes below).
- [x] The EAC map widget is still East-Africa-only by design — but a `/countries` directory page now lists every tracked country (grouped by region, tier-badged), linked from the main nav and directly below the map. Ghana/Nigeria/South Sudan are reachable by browsing, not just direct URL.
- [ ] Full historical-chart depth for Tier 1/2 countries beyond Kenya (currently: current price + source only, no 24-month series for TZ/UG/GH/NG).
- [ ] Multi-currency support across dashboard components (currently KES-hardcoded in several places outside the map/budget/country-page sections).

### Sustainability at scale (from the "is this global-ready" discussion)
- [ ] The current model (hand-researched, per-country) does not scale past a handful of Tier 1/2 countries — documented as a known, deliberate limit, not an oversight.
- [ ] World Bank pump-price indicator (`EP.PMP.SGAS.CD`) investigated as a bulk Tier 2/3 data source — turned out to be stale (last real values ~2016), not usable as-is. Logged so nobody re-investigates it from scratch.
- [ ] Real path to "global": either (a) a maintained third-party data feed/API (breaks the no-paid-services constraint — a real milestone to name explicitly when it happens), or (b) a crowdsourcing submission + light moderation flow, which is likely the *only* honest option for true data-desert markets (South Sudan, Somalia, CAR, etc.) since no regulator exists to source from.

### Automation & infra
- [ ] Automate the EPRA price update (scheduled scraper/GitHub Action hitting the official page directly) — cadence table and runbook already documented in README, not yet built (no network access in the dev sandbox to build/test one).
- [ ] Same for EWURA (Tanzania) on its own cadence.
- [ ] Real newsletter backend (current signup is a mock confirmation only).

### Content (so posting doesn't depend on someone remembering daily)
- [ ] Real news aggregation — pull actual headlines from Kenyan business press (Business Daily, Capital FM, Nation) via free RSS, filtered to fuel/energy keywords, on a schedule. Real links, zero fabrication risk.
- [ ] AI-assisted summarization of a real source (EPRA circular, news article) into a plain-language insight card — only ever summarizing something real and citing it, never generating numbers from nothing. Natural follow-on once news aggregation (above) exists to summarize.
- [ ] Commit to "within 24 hours of every price review" as the actual content promise, rather than "daily," since prices genuinely only move monthly.

### Growth & polish
- [ ] SEO / OpenGraph metadata for the landing page.
- [ ] Basic analytics (pageviews/engagement) to see what people actually use.
- [ ] Accessibility pass (keyboard nav, screen reader labels) across the new landing components.

---

## 💡 Ideas / Not Yet Scoped
- Predictions / forecasting (explicitly deferred — "predictions will come later" per earlier note).
- Admin UI for monthly price updates (vs. hand-editing `data.ts`).
- Mobile app or PWA packaging.
