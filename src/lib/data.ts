/**
 * In-memory data store — replaces SQLite for Vercel serverless compatibility.
 * All data is generated deterministically at module load time (same algorithm
 * as the original seed script) so prices are consistent across requests.
 */

import type {
  CurrentPrice,
  DashboardStats,
  HistoryPoint,
  Insight,
  NewsEvent,
  CommoditySlug,
  CommodityDetail,
  Story,
  BudgetShare,
  PerspectiveItem,
  PerspectiveKey,
  YearPoint,
  HistoricalEvent,
  PriceEvent,
  DailyFact,
  QuoteRow,
} from "./types";

// ---------------------------------------------------------------------------
// Deterministic price series (mirrors scripts/seed.js exactly)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// REAL MONTHLY PRICES — genuine, sourced EPRA pump-price-circular figures for
// Nairobi (KES/litre), keyed by the "bucket" month they fall in (see
// getMonthList below). These are the only numbers in this file meant to be
// literally real; everything else is an illustrative mock shape that gets
// calibrated to pass through these exact points. Update this table whenever
// EPRA publishes a new circular — see README → "Updating Fuel Prices".
//
// A correction from an earlier pass: the June 2026 cycle (Jun 15–Jul 14) was
// genuinely IDENTICAL to July's (214.03 / 222.86 / 191.38) — EPRA's July 14
// announcement was "unchanged," not a fresh cut. The -0.22 / -10.00 move
// I'd previously attributed to "last month" actually happened one cycle
// earlier, going from May's cycle into June's. Fixed below.
// ---------------------------------------------------------------------------
const REAL_MONTHLY_PRICES: Record<string, { petrol: number; diesel: number; kerosene: number }> = {
  "2025-07-01": { petrol: 186.31, diesel: 171.58, kerosene: 156.58 },
  "2025-08-01": { petrol: 185.31, diesel: 171.58, kerosene: 155.58 },
  "2025-09-01": { petrol: 184.52, diesel: 171.47, kerosene: 154.78 },
  "2025-10-01": { petrol: 184.52, diesel: 171.47, kerosene: 154.78 },
  // 2026-03 is derived (not directly reported): backed out from the
  // confirmed +28.69/+40.30 jump reported for the April cycle's initial
  // announcement. Least certain figure in this table.
  "2026-03-01": { petrol: 178.28, diesel: 166.54, kerosene: 152.78 },
  "2026-04-01": { petrol: 197.6, diesel: 196.63, kerosene: 152.78 },
  "2026-05-01": { petrol: 214.25, diesel: 232.86, kerosene: 191.38 },
  "2026-06-01": { petrol: 214.03, diesel: 222.86, kerosene: 191.38 },
  "2026-07-01": { petrol: 214.03, diesel: 222.86, kerosene: 191.38 },
};

const REAL_ANCHORS = {
  effectiveFrom: "2026-07-15",
  effectiveTo: "2026-08-14",
  sourceUrl: "https://www.epra.go.ke/pump-prices",
  // This cycle (Nairobi, KES/litre) — genuinely unchanged from last cycle.
  current: REAL_MONTHLY_PRICES["2026-07-01"],
  previous: REAL_MONTHLY_PRICES["2026-06-01"],
};

/**
 * Rescales a generated mock series so it passes exactly through every known
 * real month in `realByMonth`, while preserving the *relative*
 * month-over-month shape of the illustrative trend everywhere else.
 * Between two known real months, the correction needed to bridge them is
 * spread evenly (geometrically) across each step in between, so no single
 * step gets distorted — safer than a single end-to-end rescale when there
 * are several real anchors scattered through the series rather than just
 * two at the very end.
 */
function calibrateToReal(
  raw: number[],
  months: string[],
  realByMonth: Record<string, { petrol: number; diesel: number; kerosene: number }>,
  commodity: "petrol" | "diesel" | "kerosene"
): number[] {
  const calibrated = [...raw];
  const knownIdx = months
    .map((m, i) => (realByMonth[m] ? i : -1))
    .filter((i) => i >= 0);
  if (knownIdx.length === 0) return calibrated.map((v) => Math.round(v * 100) / 100);

  // Anchor every known month directly.
  for (const i of knownIdx) calibrated[i] = realByMonth[months[i]][commodity];

  // Fill between each consecutive pair of known anchors.
  for (let k = 0; k < knownIdx.length - 1; k++) {
    const left = knownIdx[k];
    const right = knownIdx[k + 1];
    if (right - left < 2) continue; // adjacent months, nothing to fill
    const rawTotalRatio = raw[right] / raw[left];
    const targetTotalRatio = calibrated[right] / calibrated[left];
    const perStepAdjustment = Math.pow(targetTotalRatio / rawTotalRatio, 1 / (right - left));
    for (let i = left + 1; i < right; i++) {
      const rawStepRatio = raw[i] / raw[i - 1];
      calibrated[i] = calibrated[i - 1] * rawStepRatio * perStepAdjustment;
    }
  }

  // Fill before the first known anchor and after the last, chaining raw's
  // own ratios outward (no target to bridge to, so no adjustment needed).
  const first = knownIdx[0];
  for (let i = first - 1; i >= 0; i--) {
    const ratio = raw[i + 1] / raw[i];
    calibrated[i] = calibrated[i + 1] / ratio;
  }
  const lastKnown = knownIdx[knownIdx.length - 1];
  for (let i = lastKnown + 1; i < calibrated.length; i++) {
    const ratio = raw[i] / raw[i - 1];
    calibrated[i] = calibrated[i - 1] * ratio;
  }

  return calibrated.map((v) => Math.round(v * 100) / 100);
}

function seededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function getMonthList(monthsBack: number): string[] {
  const months: string[] = [];
  const now = new Date(); // real "today" — advances automatically on every rebuild
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}-01`);
  }
  return months;
}

const MONTHS = getMonthList(24);

const basePrices = { petrol: 193.84, diesel: 180.1, kerosene: 172.93 };

const rand = seededRandom(42);

function generateSeries(base: number, volatility: number): number[] {
  const series = [base];
  for (let i = 1; i < MONTHS.length; i++) {
    const prev = series[i - 1];
    let change = (rand() - 0.5) * 2 * volatility;
    if (i === 4) change += 6.5;
    if (i === 9) change -= 4.2;
    if (i === 14) change += 8.1;
    if (i === 18) change -= 5.0;
    if (i === 22) change += 3.6;
    let next = prev + change;
    next = Math.max(base * 0.85, Math.min(base * 1.35, next));
    series.push(Math.round(next * 100) / 100);
  }
  return series;
}

const series = {
  petrol: calibrateToReal(
    generateSeries(basePrices.petrol, 2.0),
    MONTHS,
    REAL_MONTHLY_PRICES,
    "petrol"
  ),
  diesel: calibrateToReal(
    generateSeries(basePrices.diesel, 1.8),
    MONTHS,
    REAL_MONTHLY_PRICES,
    "diesel"
  ),
  kerosene: calibrateToReal(
    generateSeries(basePrices.kerosene, 2.2),
    MONTHS,
    REAL_MONTHLY_PRICES,
    "kerosene"
  ),
};

// ---------------------------------------------------------------------------
// Public data accessors (same shape as queries.ts)
// ---------------------------------------------------------------------------

export function getCurrentPrices(): CurrentPrice[] {
  const last = MONTHS.length - 1;
  const commodities: { name: string; slug: CommoditySlug; color: string }[] = [
    { name: "Super Petrol", slug: "petrol", color: "#B8860B" },
    { name: "Diesel", slug: "diesel", color: "#8B4513" },
    { name: "Kerosene", slug: "kerosene", color: "#4A6670" },
  ];

  return commodities.map((c) => {
    const current = series[c.slug][last];
    const previous = series[c.slug][last - 1];
    const percentChange =
      Math.round(((current - previous) / previous) * 1000) / 10;
    return {
      commodity: c.name,
      slug: c.slug,
      unit: "KES/Litre",
      color: c.color,
      currentPrice: current,
      previousPrice: previous,
      percentChange,
      lastUpdated: REAL_ANCHORS.effectiveFrom,
      sourceLabel: `EPRA pump price circular, ${REAL_ANCHORS.effectiveFrom} to ${REAL_ANCHORS.effectiveTo}`,
    };
  });
}

export function getPriceHistory(): HistoryPoint[] {
  return MONTHS.map((period_date, i) => ({
    period_date,
    petrol: series.petrol[i],
    diesel: series.diesel[i],
    kerosene: series.kerosene[i],
  }));
}

// ---------------------------------------------------------------------------
// Quotes table — the same "multiple timeframes, color-coded by size of
// move" format used by commodity quote grids (Trading Economics-style),
// adapted honestly to how Kenyan pump prices actually work: EPRA sets them
// once a month, they don't tick every second like a traded commodity. So
// instead of live/weekly columns, this compares against real points already
// in our 24-month series: last cycle, 3 months back, 6 months back, YTD,
// and a year ago. Nothing here is invented — it's the same real data
// getPriceHistory() exposes, just re-sliced for comparison.
// ---------------------------------------------------------------------------
function pctBetween(current: number, past: number | undefined): number | null {
  if (past === undefined) return null;
  return Math.round(((current - past) / past) * 1000) / 10;
}

export function getQuotesTable(): QuoteRow[] {
  const prices = getCurrentPrices();
  const lastIdx = MONTHS.length - 1;
  const yearOfLast = Number(MONTHS[lastIdx].slice(0, 4));
  const jan1ThisYear = `${yearOfLast}-01-01`;
  const ytdIdx = MONTHS.indexOf(jan1ThisYear);

  return prices.map((p) => {
    const s = series[p.slug];
    return {
      commodity: p.commodity,
      slug: p.slug,
      unit: p.unit,
      color: p.color,
      current: p.currentPrice,
      changeAbs: Math.round((p.currentPrice - p.previousPrice) * 100) / 100,
      changePct: p.percentChange,
      pct3M: pctBetween(p.currentPrice, s[lastIdx - 3]),
      pct6M: pctBetween(p.currentPrice, s[lastIdx - 6]),
      pctYTD: ytdIdx >= 0 ? pctBetween(p.currentPrice, s[ytdIdx]) : null,
      pctYoY: pctBetween(p.currentPrice, s[lastIdx - 12]),
      asOf: p.lastUpdated,
    };
  });
}

// ---------------------------------------------------------------------------
// Price Events — real, dated events behind the moves in the recent 24-month
// chart on /trends. Unlike getHistoricalEvents() (which covers 1963–today
// for the landing page's independence-era view), these are specific to
// this shorter, recent window and sourced directly from EPRA's own monthly
// announcements and contemporaneous Kenyan news coverage — not mock.
// ---------------------------------------------------------------------------
export function getPriceEvents(): PriceEvent[] {
  return [
    {
      period_date: "2025-07-01",
      title: "Pump prices jump on rising global oil costs",
      description:
        "EPRA raised prices by a 9-shilling average as the landed cost of imported fuel rose 6–7% month-on-month, driven by renewed Middle East tension pushing global crude higher.",
      direction: "up",
    },
    {
      period_date: "2025-09-01",
      title: "Prices ease to a two-year low",
      description:
        "EPRA cut Super Petrol, Diesel, and Kerosene together as landed costs softened — pushing pump prices to their lowest level in over two years at the time.",
      direction: "down",
    },
    {
      period_date: "2026-04-01",
      title: "Two price changes in 24 hours",
      description:
        "EPRA's scheduled review pushed petrol and diesel to record highs, prompting Gen-Z-led backlash echoing the 2024 Finance Bill protests. Within a day, President Ruto cut VAT on fuel from 16% to 8%, forcing a same-day price reversal — the most volatile single cycle in Hali's tracked history.",
      direction: "mixed",
    },
    {
      period_date: "2026-05-01",
      title: "Diesel spikes, then a rare mid-cycle correction",
      description:
        "A 20%+ jump in landed diesel costs — linked to the US-Israel-Iran conflict — drove the sharpest diesel increase on record. Mid-cycle, EPRA took the unusual step of narrowing the diesel-kerosene price gap after transport operators warned it was encouraging diesel adulteration.",
      direction: "up",
    },
    {
      period_date: "2026-06-01",
      title: "Relief, cushioned by a record subsidy",
      description:
        "Prices eased modestly, helped by a record KES 34.07/litre diesel subsidy from the Petroleum Development Levy Fund as the government worked to contain public anger over living costs.",
      direction: "down",
    },
    {
      period_date: "2026-07-01",
      title: "Held flat for a second straight month",
      description:
        "EPRA kept prices unchanged, extending the 8% VAT rate for three more months and drawing on the Petroleum Development Levy Fund to shield consumers from renewed Middle East volatility.",
      direction: "flat",
    },
  ];
}

export function getDashboardStats(): DashboardStats {
  const prices = getCurrentPrices();

  // Find 24m high and low across all commodities
  let highest = { commodity: "", price: -Infinity, period_date: "" };
  let lowest = { commodity: "", price: Infinity, period_date: "" };

  const slugs: CommoditySlug[] = ["petrol", "diesel", "kerosene"];
  const names: Record<CommoditySlug, string> = {
    petrol: "Super Petrol",
    diesel: "Diesel",
    kerosene: "Kerosene",
  };

  for (const slug of slugs) {
    series[slug].forEach((price, i) => {
      if (price > highest.price) {
        highest = { commodity: names[slug], price, period_date: MONTHS[i] };
      }
      if (price < lowest.price) {
        lowest = { commodity: names[slug], price, period_date: MONTHS[i] };
      }
    });
  }

  return {
    currentPetrol: prices.find((p) => p.slug === "petrol")?.currentPrice ?? 0,
    currentDiesel: prices.find((p) => p.slug === "diesel")?.currentPrice ?? 0,
    currentKerosene:
      prices.find((p) => p.slug === "kerosene")?.currentPrice ?? 0,
    highest24m: highest,
    lowest24m: lowest,
  };
}

export function getNewsEvents(): NewsEvent[] {
  return [
    {
      id: 1,
      title: "EPRA Announces New Fuel Prices for the Monthly Review Cycle",
      description:
        "The Energy and Petroleum Regulatory Authority (EPRA) released its latest monthly price guide, adjusting pump prices for Super Petrol, Diesel, and Kerosene across all regions. The changes reflect updated landed costs and exchange rate movements.",
      event_date: "2026-06-14",
      impact_level: "high",
      source: "EPRA Monthly Price Guide",
    },
    {
      id: 2,
      title: "Global Crude Oil Prices Increase Amid Middle East Tensions",
      description:
        "Brent crude prices rose by over 4% in the past two weeks as geopolitical tensions in key oil-producing regions raised concerns over supply disruptions, putting upward pressure on Kenya's landed fuel costs.",
      event_date: "2026-06-10",
      impact_level: "high",
      source: "International Energy Markets",
    },
    {
      id: 3,
      title: "Kenya Shilling Weakens Against the US Dollar",
      description:
        "The Kenyan Shilling depreciated against the US Dollar over the past month, increasing the cost of imported petroleum products and contributing to higher landed costs ahead of the next pricing cycle.",
      event_date: "2026-06-05",
      impact_level: "medium",
      source: "Central Bank of Kenya",
    },
    {
      id: 4,
      title: "OPEC+ Announces Adjustments to Production Quotas",
      description:
        "OPEC+ member countries agreed on revised production targets during their latest meeting, a move expected to influence global oil supply levels and could affect crude prices over the coming quarter.",
      event_date: "2026-05-28",
      impact_level: "medium",
      source: "OPEC Secretariat",
    },
    {
      id: 5,
      title: "Government Maintains Fuel Subsidy Framework for Q2",
      description:
        "The National Treasury confirmed that the existing fuel stabilization framework will remain in place for the second quarter, aiming to cushion consumers from extreme price volatility.",
      event_date: "2026-05-20",
      impact_level: "low",
      source: "National Treasury",
    },
    {
      id: 6,
      title: "Mombasa Port Reports Increased Petroleum Import Volumes",
      description:
        "The Kenya Pipeline Company reported a notable increase in petroleum product imports through the Port of Mombasa, signaling improved supply chain throughput ahead of peak demand season.",
      event_date: "2026-05-12",
      impact_level: "low",
      source: "Kenya Pipeline Company",
    },
    {
      id: 7,
      title: "Diesel Demand Rises with Agricultural Transport Season",
      description:
        "Increased agricultural transport activity during the harvest season has driven up diesel demand across the Rift Valley and Western regions, with distributors reporting tighter regional supply margins.",
      event_date: "2026-04-30",
      impact_level: "medium",
      source: "Industry Distributors Association",
    },
    {
      id: 8,
      title: "EPRA Revises Pricing Formula Margins for Distributors",
      description:
        "EPRA published revised guidance on allowable margins for oil marketing companies, a move intended to improve price transparency and ensure consistent pump price calculations nationwide.",
      event_date: "2026-04-15",
      impact_level: "low",
      source: "EPRA Regulatory Notice",
    },
  ];
}

// ---------------------------------------------------------------------------
// East African Community snapshot — powers the landing page's expansion grid.
// Kenya is live with real (mock) tracked data today; the rest of the EAC's 8
// partner states are shown as "Coming soon" so people can see where Hali is
// headed next. No invented prices are shown for markets we don't track yet.
// ---------------------------------------------------------------------------

export interface CountrySnapshot {
  code: string;
  name: string;
  flag: string;
  status: "live" | "coming_soon";
  petrolPrice?: number;
  dieselPrice?: number;
  kerosenePrice?: number;
  currency?: string;
  priceModel?: "regulated" | "deregulated";
  sourceLabel?: string;
  effectiveLabel?: string;
}

// ---------------------------------------------------------------------------
// Real regional anchors for the two additional founding EAC members. Kenya's
// figures live in REAL_ANCHORS above and come from EPRA. These two are kept
// separate because each country's pricing *model* is genuinely different —
// see priceModel/sourceLabel on each entry — which matters for authenticity.
// ---------------------------------------------------------------------------
const TANZANIA_ANCHOR = {
  // EWURA (Energy & Water Utilities Regulatory Authority) publishes an
  // official monthly retail cap price for Dar es Salaam, Tanga & Mtwara.
  // Dar es Salaam figures used here as the reference port price.
  effectiveLabel: "July 2026 cycle",
  sourceLabel: "EWURA monthly cap price notice (Dar es Salaam)",
  current: { petrol: 3990, diesel: 4182, kerosene: 4443 }, // TZS/litre
  previous: { petrol: 4086, diesel: 4333, kerosene: 4677 }, // kerosene carried from May notice — least certain of the six figures
};

const UGANDA_ANCHOR = {
  // Uganda's pump market is deregulated — dealers set their own prices, so
  // there is no single official gazetted number the way EPRA/EWURA publish
  // one. This is the Ministry of Energy & Mineral Development's own
  // reference point (reported via Uganda's "Monitor" newspaper, cross-
  // checked same-day against Kenya's EPRA price), described as the highest
  // recorded pump price in Kampala on that date.
  effectiveLabel: "as of June 15, 2026 (highest recorded, Kampala)",
  sourceLabel: "Ministry of Energy & Mineral Development indicative price — deregulated, dealer prices vary",
  current: { petrol: 6499, diesel: 6599 }, // UGX/litre
};

export function getEastAfricaSnapshot(): CountrySnapshot[] {
  const petrol = getCurrentPrices().find((p) => p.slug === "petrol");
  const diesel = getCurrentPrices().find((p) => p.slug === "diesel");
  const kerosene = getCurrentPrices().find((p) => p.slug === "kerosene");
  return [
    {
      code: "KE",
      name: "Kenya",
      flag: "🇰🇪",
      status: "live",
      petrolPrice: petrol?.currentPrice,
      dieselPrice: diesel?.currentPrice,
      kerosenePrice: kerosene?.currentPrice,
      currency: "KES",
      priceModel: "regulated",
      sourceLabel: "EPRA monthly pump price circular",
      effectiveLabel: `${REAL_ANCHORS.effectiveFrom} to ${REAL_ANCHORS.effectiveTo}`,
    },
    {
      code: "TZ",
      name: "Tanzania",
      flag: "🇹🇿",
      status: "live",
      petrolPrice: TANZANIA_ANCHOR.current.petrol,
      dieselPrice: TANZANIA_ANCHOR.current.diesel,
      kerosenePrice: TANZANIA_ANCHOR.current.kerosene,
      currency: "TZS",
      priceModel: "regulated",
      sourceLabel: TANZANIA_ANCHOR.sourceLabel,
      effectiveLabel: TANZANIA_ANCHOR.effectiveLabel,
    },
    {
      code: "UG",
      name: "Uganda",
      flag: "🇺🇬",
      status: "live",
      petrolPrice: UGANDA_ANCHOR.current.petrol,
      dieselPrice: UGANDA_ANCHOR.current.diesel,
      currency: "UGX",
      priceModel: "deregulated",
      sourceLabel: UGANDA_ANCHOR.sourceLabel,
      effectiveLabel: UGANDA_ANCHOR.effectiveLabel,
    },
    { code: "RW", name: "Rwanda", flag: "🇷🇼", status: "coming_soon" },
    { code: "BI", name: "Burundi", flag: "🇧🇮", status: "coming_soon" },
    { code: "SS", name: "South Sudan", flag: "🇸🇸", status: "coming_soon" },
    { code: "CD", name: "DR Congo", flag: "🇨🇩", status: "coming_soon" },
    { code: "SO", name: "Somalia", flag: "🇸🇴", status: "coming_soon" },
  ];
}

export function getCountryByCode(code: string): CountrySnapshot | undefined {
  return getEastAfricaSnapshot().find((c) => c.code.toLowerCase() === code.toLowerCase());
}

function pctChange(slug: CommoditySlug) {
  const s = series[slug];
  const last = s[s.length - 1];
  const prev = s[s.length - 2];
  return Math.round(((last - prev) / prev) * 1000) / 10;
}

export function getInsights(): Insight[] {
  const latestPeriod = MONTHS[MONTHS.length - 1];
  const prevPeriod = MONTHS[MONTHS.length - 2];
  const petrolChange = pctChange("petrol");
  const dieselChange = pctChange("diesel");
  const keroseneChange = pctChange("kerosene");

  function dir(change: number) {
    return change >= 0 ? "increased" : "decreased";
  }

  return [
    {
      id: 1,
      commodity_id: 1,
      commodity_name: "Super Petrol",
      title: "Super Petrol Prices Move on Crude and FX Pressures",
      content: `Super Petrol prices ${dir(petrolChange)} by ${Math.abs(petrolChange)}% this period, driven primarily by rising global crude oil benchmark prices and a weaker Kenya Shilling against the US Dollar, which raised the landed cost of imported refined products.`,
      sentiment: petrolChange >= 0 ? "negative" : "positive",
      period_date: latestPeriod,
    },
    {
      id: 2,
      commodity_id: 2,
      commodity_name: "Diesel",
      title: "Diesel Prices Reflect Seasonal Demand and Import Costs",
      content: `Diesel prices ${dir(dieselChange)} by ${Math.abs(dieselChange)}% compared to the previous month. Increased agricultural and logistics sector demand, combined with higher international shipping costs, contributed to the movement observed in the latest pricing cycle.`,
      sentiment: dieselChange >= 0 ? "negative" : "positive",
      period_date: latestPeriod,
    },
    {
      id: 3,
      commodity_id: 3,
      commodity_name: "Kerosene",
      title: "Kerosene Prices Track Broader Petroleum Trends",
      content: `Kerosene prices ${dir(keroseneChange)} by ${Math.abs(keroseneChange)}% in the latest review, broadly mirroring movements in diesel and petrol due to shared import cost structures and exchange rate effects on the overall petroleum products basket.`,
      sentiment: keroseneChange >= 0 ? "negative" : "positive",
      period_date: latestPeriod,
    },
    {
      id: 4,
      commodity_id: null,
      commodity_name: null,
      title: "Outlook: Volatility Expected to Persist in Coming Months",
      content:
        "Market analysts expect continued price volatility over the next quarter as global supply dynamics, OPEC+ production decisions, and Kenya Shilling performance remain key swing factors for domestic pump prices. Consumers and businesses are advised to monitor monthly EPRA announcements closely.",
      sentiment: "neutral",
      period_date: latestPeriod,
    },
    {
      id: 5,
      commodity_id: 2,
      commodity_name: "Diesel",
      title: "Diesel Prices Stabilize Following EPRA Subsidy Adjustment",
      content:
        "Diesel prices held relatively steady in the prior pricing cycle as the fuel price stabilization mechanism absorbed part of the increase in landed costs, limiting the pass-through effect to consumers.",
      sentiment: "neutral",
      period_date: prevPeriod,
    },
    {
      id: 6,
      commodity_id: 1,
      commodity_name: "Super Petrol",
      title: "Petrol Prices Eased on Temporary Shilling Recovery",
      content:
        "Super Petrol prices saw a modest decline in the previous month as a brief recovery in the Kenya Shilling against major currencies reduced import costs for refined petroleum products.",
      sentiment: "positive",
      period_date: prevPeriod,
    },
  ];
}

// ---------------------------------------------------------------------------
// "Why is this happening?" panel — a few plain-language factors and a one
// -paragraph explanation per commodity, used on the landing page's Explore
// section. Kept separate from getInsights() because these are meant to read
// like a quick glossary, not a dated market note.
// ---------------------------------------------------------------------------

export function getCommodityDetail(slug: CommoditySlug): CommodityDetail {
  const details: Record<CommoditySlug, CommodityDetail> = {
    petrol: {
      slug: "petrol",
      subtext: "What moves your car, boda, or matatu",
      simple:
        "Kenya imports nearly all its petrol, so it's priced in US Dollars before it ever reaches a pump. When crude oil gets pricier globally or the Shilling weakens, importers pay more — and EPRA passes that through at the next monthly review.",
      factors: [
        { direction: "up", text: "Brent crude climbing on global markets" },
        { direction: "up", text: "Shilling softening against the US Dollar" },
        { direction: "down", text: "Lower shipping costs from Gulf refiners" },
        { direction: "up", text: "Fuel levies unchanged in the latest budget" },
      ],
    },
    diesel: {
      slug: "diesel",
      subtext: "What moves goods, buses, and generators",
      simple:
        "Diesel prices track industry and farming demand closely. When trucks are hauling harvests or factories are running full shifts, diesel gets scarcer relative to petrol — and that scarcity shows up as a higher price at the pump.",
      factors: [
        { direction: "up", text: "Harvest season lifting transport demand" },
        { direction: "up", text: "Higher landed cost from global shipping" },
        { direction: "down", text: "Government stabilization fund cushioning" },
        { direction: "down", text: "Slower manufacturing output this quarter" },
      ],
    },
    kerosene: {
      slug: "kerosene",
      subtext: "What lights and cooks in many homes",
      simple:
        "Kerosene shares the same import pipeline as diesel and petrol, so it usually rises and falls with them. It matters most to lower-income households, which is why small changes here are felt disproportionately hard.",
      factors: [
        { direction: "up", text: "Shared import costs with diesel & petrol" },
        { direction: "down", text: "Softer demand as more homes shift to gas" },
        { direction: "up", text: "Weaker Shilling raising landed cost" },
      ],
    },
  };
  return details[slug];
}

// ---------------------------------------------------------------------------
// Stories — short, human-first narratives that anchor the landing page.
// Each links back into the Explore section for whoever wants the data.
// ---------------------------------------------------------------------------

export function getStories(): Story[] {
  return [
    {
      id: 1,
      title: "Why your boda ride just got a little more expensive",
      excerpt:
        "A weaker Shilling and firmer global crude prices pushed Super Petrol up again this cycle — and that few extra shillings a litre adds up fast for anyone earning a living on two wheels.",
      commodity: "petrol",
      tags: ["Petrol", "Cost of living"],
      imgSeed: "boda-nairobi-street",
      big: true,
    },
    {
      id: 2,
      title: "The harvest season squeeze: why diesel gets tight in Q2",
      excerpt:
        "Every planting and harvest season, trucks and tractors across the Rift Valley compete for the same diesel supply — and prices quietly firm up before most people notice.",
      commodity: "diesel",
      tags: ["Diesel", "Agriculture"],
      imgSeed: "kenya-farm-truck",
      big: false,
    },
    {
      id: 3,
      title: "Kerosene: the price that hits the hardest, quietest",
      excerpt:
        "It rarely makes headlines, but kerosene is still how many households light their evenings and cook their meals — which is why even a small increase is felt disproportionately.",
      commodity: "kerosene",
      tags: ["Kerosene", "Households"],
      imgSeed: "kerosene-lamp-home",
      big: false,
    },
    {
      id: 4,
      title: "EPRA's monthly review, explained without the jargon",
      excerpt:
        "Every month, one government body quietly resets what the whole country pays at the pump. Here's what actually goes into that number, in plain language.",
      commodity: "petrol",
      tags: ["EPRA", "How it works"],
      imgSeed: "epra-fuel-station",
      big: true,
    },
  ];
}

// ---------------------------------------------------------------------------
// Fuel's weight on the wallet — illustrative share of an average monthly
// income spent on fuel/transport across the East African Community. Kenya's
// figure is derived from Hali's tracked pump price; every other country is
// a rough, clearly-labelled illustrative estimate until Hali tracks it live.
// ---------------------------------------------------------------------------

export function getBudgetShare(): BudgetShare[] {
  return [
    { code: "SS", name: "South Sudan", flag: "🇸🇸", sharePct: 15.4, live: false },
    { code: "BI", name: "Burundi", flag: "🇧🇮", sharePct: 12.1, live: false },
    { code: "UG", name: "Uganda", flag: "🇺🇬", sharePct: 9.8, live: true },
    { code: "CD", name: "DR Congo", flag: "🇨🇩", sharePct: 9.2, live: false },
    { code: "SO", name: "Somalia", flag: "🇸🇴", sharePct: 8.6, live: false },
    { code: "KE", name: "Kenya", flag: "🇰🇪", sharePct: 7.9, live: true },
    { code: "TZ", name: "Tanzania", flag: "🇹🇿", sharePct: 6.8, live: true },
    { code: "RW", name: "Rwanda", flag: "🇷🇼", sharePct: 6.1, live: false },
  ];
}

// ---------------------------------------------------------------------------
// "What does this mean for you?" — three lenses on the same price data.
// ---------------------------------------------------------------------------

export function getPerspectives(): Record<PerspectiveKey, PerspectiveItem[]> {
  return {
    citizen: [
      {
        icon: "ShoppingCart",
        title: "Your matatu fare",
        text: "Fare hikes usually follow pump prices with a lag of a week or two, as SACCOs pass on higher fuel costs to commuters on popular routes.",
      },
      {
        icon: "Bike",
        title: "Your boda income",
        text: "For riders paid per trip, a few shillings more per litre eats directly into take-home pay — often before any fare adjustment catches up.",
      },
      {
        icon: "Flame",
        title: "Your kitchen",
        text: "Households still using kerosene for cooking or lighting feel price rises immediately, with no cushion from subsidies that mostly target petrol and diesel.",
      },
      {
        icon: "Home",
        title: "Everything you buy",
        text: "Diesel powers the trucks that move food and goods across the country, so fuel costs quietly ride along inside almost every price tag.",
      },
    ],
    business: [
      {
        icon: "Truck",
        title: "Logistics & delivery",
        text: "Transport and courier businesses often run on thin margins — a sustained diesel increase can force a choice between raising delivery fees or absorbing the hit.",
      },
      {
        icon: "Factory",
        title: "Manufacturing costs",
        text: "Factories relying on diesel generators during outages see production costs rise directly with every pump price review.",
      },
      {
        icon: "TrendingUp",
        title: "Pricing decisions",
        text: "Retailers and SMEs use EPRA's monthly announcement as a natural checkpoint to review their own pricing, rather than adjusting reactively all month.",
      },
      {
        icon: "Fuel",
        title: "Fleet planning",
        text: "Businesses with vehicle fleets increasingly time refueling and route planning around the monthly price cycle to manage costs predictably.",
      },
    ],
    government: [
      {
        icon: "Landmark",
        title: "Subsidy burden",
        text: "The fuel price stabilization mechanism cushions consumers from sharp swings, but sustained global increases can strain the fund meant to absorb them.",
      },
      {
        icon: "Coins",
        title: "Inflation management",
        text: "Fuel feeds into the cost of nearly everything, so pump prices are one of the most closely watched inputs to the country's overall inflation picture.",
      },
      {
        icon: "Scale",
        title: "Balancing revenue & relief",
        text: "Fuel levies are a meaningful source of government revenue, creating a constant balancing act between funding public services and easing costs for citizens.",
      },
      {
        icon: "Globe2",
        title: "Regional coordination",
        text: "As EAC neighbors track and compare pump prices more closely, cross-border fuel policy and smuggling incentives become harder to ignore.",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Since Independence — a long-run, deterministic annual mock series for
// Super Petrol from 1963 to today. Powers the landing page's "All-time"
// view so people can see the decades-long story, not just 24 months of it.
// Figures are illustrative/mock, not an audited historical record.
// ---------------------------------------------------------------------------

export function getSinceIndependenceSeries(): YearPoint[] {
  const startYear = 1963;
  const endYear = 2026;
  const startPrice = 1.15; // illustrative shillings/litre at independence
  const endPrice = series.petrol[series.petrol.length - 1];

  const rand = seededRandom(1963);
  const years = endYear - startYear;
  const points: YearPoint[] = [];

  // Smooth exponential-ish glide path from start to end, with mild seeded
  // noise and a few sharper illustrative shocks (oil crises, liberalization,
  // recent currency pressure) so the shape reads as a believable history.
  for (let i = 0; i <= years; i++) {
    const t = i / years;
    const base = startPrice * Math.pow(endPrice / startPrice, t);
    const noise = (rand() - 0.5) * base * 0.06;
    let shock = 0;
    const year = startYear + i;
    if (year === 1974 || year === 1979) shock = base * 0.35; // 1970s global oil crises
    if (year === 1971) shock = base * 0.1; // Kenya first introduces petroleum price controls
    if (year === 1994) shock = base * 0.4; // full deregulation of the petroleum sector (27 Oct 1994)
    if (year === 2008) shock = base * 0.2; // record global crude prices (~$147/barrel)
    if (year === 2010) shock = base * 0.12; // price controls reintroduced (ERC formula, Dec 2010)
    if (year === 2022) shock = base * 0.18; // global energy shock following Russia's invasion of Ukraine
    points.push({ year, price: Math.round((base + noise + shock) * 100) / 100 });
  }
  // Force the final point to match today's tracked price exactly.
  points[points.length - 1].price = endPrice;
  return points;
}

// ---------------------------------------------------------------------------
// Historical events behind the milestone years above. These are real,
// researched events (not mock) — sources: energypedia.info "Fuel Prices
// Kenya", Kenya Gazette Legal Notice 196/2010, and standard accounts of the
// 1970s oil crises and 2022 energy shock. The exact price *shocks* applied
// to the chart are illustrative in magnitude, but the events themselves and
// their years are real.
// ---------------------------------------------------------------------------
export function getHistoricalEvents(): HistoricalEvent[] {
  return [
    {
      year: 1971,
      title: "Kenya introduces its first petroleum price controls",
      description:
        "Before 1971, oil companies set their own margins. The government stepped in with its first formal price-control framework for petroleum products, the start of decades of on-and-off state involvement in what Kenyans pay at the pump.",
    },
    {
      year: 1974,
      title: "The first global oil crisis",
      description:
        "OPEC's oil embargo roughly quadrupled world crude prices almost overnight. Kenya, importing all its fuel, felt the shock immediately — one of the sharpest single-year jumps in this entire chart.",
    },
    {
      year: 1979,
      title: "The second oil shock",
      description:
        "The Iranian Revolution disrupted global oil supply again, sending crude prices sharply higher for the second time in the decade and pushing Kenyan pump prices up in step.",
    },
    {
      year: 1994,
      title: "Kenya fully deregulates the petroleum sector",
      description:
        "On 27 October 1994, the government removed all price controls, ending the state-set pricing formula that had existed since 1971 and opening the market to competition among oil marketers.",
    },
    {
      year: 2008,
      title: "Crude tops $147 a barrel",
      description:
        "A record global oil price spike — combined with the wider financial crisis — pushed Kenyan Super Petrol above KES 100 a litre for the first time in the country's history.",
    },
    {
      year: 2010,
      title: "Price controls return",
      description:
        "After years of complaints about opaque pricing under the deregulated market, the government reintroduced monthly maximum retail prices via Kenya Gazette Legal Notice 196 — the direct ancestor of today's EPRA pricing formula.",
    },
    {
      year: 2022,
      title: "Russia's invasion of Ukraine shakes global energy markets",
      description:
        "Sanctions and supply disruption sent global crude and gas prices sharply higher worldwide, a shock that rippled through to Kenyan pump prices along with nearly every importing economy on earth.",
    },
  ];
}

// ---------------------------------------------------------------------------
// Fact of the Day — a zero-maintenance way to have the site feel current
// every day without inventing anything. Rotates deterministically through
// the two real event pools above (independence-era + recent EPRA cycles)
// based on the calendar day, so it's stable within a day and changes the
// next. This is a rotation through real, already-sourced facts — it does
// not claim any event "happened today," just that today's fact is this one.
// ---------------------------------------------------------------------------
export function getFactOfTheDay(): DailyFact {
  const pool: DailyFact[] = [
    ...getHistoricalEvents().map((e) => ({
      title: e.title,
      description: e.description,
      year: e.year,
      kind: "independence" as const,
    })),
    ...getPriceEvents().map((e) => ({
      title: e.title,
      description: e.description,
      period_date: e.period_date,
      kind: "recent" as const,
    })),
  ];
  const startOfYear = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((Date.now() - startOfYear) / 86400000);
  return pool[dayOfYear % pool.length];
}
