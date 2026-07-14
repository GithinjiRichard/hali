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
} from "./types";

// ---------------------------------------------------------------------------
// Deterministic price series (mirrors scripts/seed.js exactly)
// ---------------------------------------------------------------------------

function seededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function getMonthList(monthsBack: number): string[] {
  const months: string[] = [];
  const now = new Date(2026, 5, 1); // June 2026
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
  petrol: generateSeries(basePrices.petrol, 2.0),
  diesel: generateSeries(basePrices.diesel, 1.8),
  kerosene: generateSeries(basePrices.kerosene, 2.2),
};

// ---------------------------------------------------------------------------
// Public data accessors (same shape as queries.ts)
// ---------------------------------------------------------------------------

export function getCurrentPrices(): CurrentPrice[] {
  const last = MONTHS.length - 1;
  const commodities: { name: string; slug: CommoditySlug; color: string }[] = [
    { name: "Super Petrol", slug: "petrol", color: "#16a34a" },
    { name: "Diesel", slug: "diesel", color: "#2563eb" },
    { name: "Kerosene", slug: "kerosene", color: "#d97706" },
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
      lastUpdated: MONTHS[last],
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
  currency?: string;
}

export function getEastAfricaSnapshot(): CountrySnapshot[] {
  const petrol = getCurrentPrices().find((p) => p.slug === "petrol");
  return [
    {
      code: "KE",
      name: "Kenya",
      flag: "🇰🇪",
      status: "live",
      petrolPrice: petrol?.currentPrice,
      currency: "KES",
    },
    { code: "UG", name: "Uganda", flag: "🇺🇬", status: "coming_soon" },
    { code: "TZ", name: "Tanzania", flag: "🇹🇿", status: "coming_soon" },
    { code: "RW", name: "Rwanda", flag: "🇷🇼", status: "coming_soon" },
    { code: "BI", name: "Burundi", flag: "🇧🇮", status: "coming_soon" },
    { code: "SS", name: "South Sudan", flag: "🇸🇸", status: "coming_soon" },
    { code: "CD", name: "DR Congo", flag: "🇨🇩", status: "coming_soon" },
    { code: "SO", name: "Somalia", flag: "🇸🇴", status: "coming_soon" },
  ];
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
