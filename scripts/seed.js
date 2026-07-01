/* eslint-disable @typescript-eslint/no-require-imports */
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(process.cwd(), "data", "fuel.db");
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Start fresh each seed run for consistent demo data
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE commodities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL DEFAULT 'KES/Litre',
    color TEXT NOT NULL DEFAULT '#22c55e'
  );

  CREATE TABLE locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    region TEXT NOT NULL
  );

  CREATE TABLE commodity_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commodity_id INTEGER NOT NULL REFERENCES commodities(id),
    location_id INTEGER NOT NULL REFERENCES locations(id),
    price REAL NOT NULL,
    period_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(commodity_id, location_id, period_date)
  );

  CREATE TABLE news_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TEXT NOT NULL,
    impact_level TEXT NOT NULL CHECK (impact_level IN ('low','medium','high')),
    source TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commodity_id INTEGER REFERENCES commodities(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive','negative','neutral')),
    period_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX idx_prices_period ON commodity_prices(period_date);
  CREATE INDEX idx_prices_commodity ON commodity_prices(commodity_id);
  CREATE INDEX idx_news_date ON news_events(event_date);
  CREATE INDEX idx_insights_date ON insights(period_date);
`);

// ---------- Commodities ----------
const commodities = [
  { name: "Super Petrol", slug: "petrol", unit: "KES/Litre", color: "#22c55e" },
  { name: "Diesel", slug: "diesel", unit: "KES/Litre", color: "#3b82f6" },
  { name: "Kerosene", slug: "kerosene", unit: "KES/Litre", color: "#f59e0b" },
];

const insertCommodity = db.prepare(
  "INSERT INTO commodities (name, slug, unit, color) VALUES (?, ?, ?, ?)"
);
const commodityIds = {};
for (const c of commodities) {
  const info = insertCommodity.run(c.name, c.slug, c.unit, c.color);
  commodityIds[c.slug] = info.lastInsertRowid;
}

// ---------- Locations ----------
const locations = [
  { name: "Nairobi", region: "Nairobi County" },
  { name: "Mombasa", region: "Coast Region" },
  { name: "Kisumu", region: "Nyanza Region" },
];

const insertLocation = db.prepare(
  "INSERT INTO locations (name, region) VALUES (?, ?)"
);
const locationIds = {};
for (const l of locations) {
  const info = insertLocation.run(l.name, l.region);
  locationIds[l.name] = info.lastInsertRowid;
}

// ---------- Generate 24 months of mock historical prices ----------
// Build month list ending at the current month (2026-06)
function getMonthList(monthsBack) {
  const months = [];
  const now = new Date(2026, 5, 1); // June 2026 (month index 5)
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}-01`);
  }
  return months;
}

const MONTHS = getMonthList(24);

// Base starting prices (approx mid-2024 Nairobi EPRA pump prices)
const basePrices = {
  petrol: 193.84,
  diesel: 180.1,
  kerosene: 172.93,
};

// Location adjustments relative to Nairobi (Mombasa typically cheaper, Kisumu higher due to transport)
const locationAdjustment = {
  Nairobi: 0,
  Mombasa: -3.5,
  Kisumu: 4.2,
};

// Deterministic pseudo-random walk so data is reproducible across builds
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seededRandom(42);

// Generate a monthly price series per commodity with realistic small fluctuations
// plus a few notable trend events (mirroring real-world EPRA review patterns).
function generateSeries(base, volatility) {
  const series = [base];
  for (let i = 1; i < MONTHS.length; i++) {
    const prev = series[i - 1];
    // Random walk component
    let change = (rand() - 0.5) * 2 * volatility;

    // Inject a few larger directional shocks at specific points for realism
    if (i === 4) change += 6.5; // crude oil spike
    if (i === 9) change -= 4.2; // shilling strengthens
    if (i === 14) change += 8.1; // global supply shock
    if (i === 18) change -= 5.0; // EPRA subsidy adjustment
    if (i === 22) change += 3.6; // OPEC cut impact

    let next = prev + change;
    // Keep within a sane band
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

const insertPrice = db.prepare(`
  INSERT INTO commodity_prices (commodity_id, location_id, price, period_date)
  VALUES (?, ?, ?, ?)
`);

for (const slug of Object.keys(commodityIds)) {
  for (let i = 0; i < MONTHS.length; i++) {
    const periodDate = MONTHS[i];
    const nairobiPrice = series[slug][i];

    for (const loc of locations) {
      const adj = locationAdjustment[loc.name];
      // Slight independent noise per location
      const noise = (rand() - 0.5) * 1.5;
      const price = Math.round((nairobiPrice + adj + noise) * 100) / 100;
      insertPrice.run(commodityIds[slug], locationIds[loc.name], price, periodDate);
    }
  }
}

// ---------- News & Events ----------
const newsEvents = [
  {
    title: "EPRA Announces New Fuel Prices for the Monthly Review Cycle",
    description:
      "The Energy and Petroleum Regulatory Authority (EPRA) released its latest monthly price guide, adjusting pump prices for Super Petrol, Diesel, and Kerosene across all regions. The changes reflect updated landed costs and exchange rate movements.",
    event_date: "2026-06-14",
    impact_level: "high",
    source: "EPRA Monthly Price Guide",
  },
  {
    title: "Global Crude Oil Prices Increase Amid Middle East Tensions",
    description:
      "Brent crude prices rose by over 4% in the past two weeks as geopolitical tensions in key oil-producing regions raised concerns over supply disruptions, putting upward pressure on Kenya's landed fuel costs.",
    event_date: "2026-06-10",
    impact_level: "high",
    source: "International Energy Markets",
  },
  {
    title: "Kenya Shilling Weakens Against the US Dollar",
    description:
      "The Kenyan Shilling depreciated against the US Dollar over the past month, increasing the cost of imported petroleum products and contributing to higher landed costs ahead of the next pricing cycle.",
    event_date: "2026-06-05",
    impact_level: "medium",
    source: "Central Bank of Kenya",
  },
  {
    title: "OPEC+ Announces Adjustments to Production Quotas",
    description:
      "OPEC+ member countries agreed on revised production targets during their latest meeting, a move expected to influence global oil supply levels and could affect crude prices over the coming quarter.",
    event_date: "2026-05-28",
    impact_level: "medium",
    source: "OPEC Secretariat",
  },
  {
    title: "Government Maintains Fuel Subsidy Framework for Q2",
    description:
      "The National Treasury confirmed that the existing fuel stabilization framework will remain in place for the second quarter, aiming to cushion consumers from extreme price volatility.",
    event_date: "2026-05-20",
    impact_level: "low",
    source: "National Treasury",
  },
  {
    title: "Mombasa Port Reports Increased Petroleum Import Volumes",
    description:
      "The Kenya Pipeline Company reported a notable increase in petroleum product imports through the Port of Mombasa, signaling improved supply chain throughput ahead of peak demand season.",
    event_date: "2026-05-12",
    impact_level: "low",
    source: "Kenya Pipeline Company",
  },
  {
    title: "Diesel Demand Rises with Agricultural Transport Season",
    description:
      "Increased agricultural transport activity during the harvest season has driven up diesel demand across the Rift Valley and Western regions, with distributors reporting tighter regional supply margins.",
    event_date: "2026-04-30",
    impact_level: "medium",
    source: "Industry Distributors Association",
  },
  {
    title: "EPRA Revises Pricing Formula Margins for Distributors",
    description:
      "EPRA published revised guidance on allowable margins for oil marketing companies, a move intended to improve price transparency and ensure consistent pump price calculations nationwide.",
    event_date: "2026-04-15",
    impact_level: "low",
    source: "EPRA Regulatory Notice",
  },
];

const insertNews = db.prepare(`
  INSERT INTO news_events (title, description, event_date, impact_level, source)
  VALUES (?, ?, ?, ?, ?)
`);
for (const n of newsEvents) {
  insertNews.run(n.title, n.description, n.event_date, n.impact_level, n.source);
}

// ---------- Insights ----------
// Compute month-over-month percentage change for the latest month (Nairobi) for narrative accuracy
function pctChange(slug) {
  const s = series[slug];
  const last = s[s.length - 1];
  const prev = s[s.length - 2];
  return Math.round(((last - prev) / prev) * 1000) / 10;
}

const petrolChange = pctChange("petrol");
const dieselChange = pctChange("diesel");
const keroseneChange = pctChange("kerosene");

const latestPeriod = MONTHS[MONTHS.length - 1];
const prevPeriod = MONTHS[MONTHS.length - 2];

function directionWord(change) {
  return change >= 0 ? "increased" : "decreased";
}

const insights = [
  {
    slug: "petrol",
    title: "Super Petrol Prices Move on Crude and FX Pressures",
    content: `Super Petrol prices ${directionWord(petrolChange)} by ${Math.abs(
      petrolChange
    )}% this period, driven primarily by rising global crude oil benchmark prices and a weaker Kenya Shilling against the US Dollar, which raised the landed cost of imported refined products.`,
    sentiment: petrolChange >= 0 ? "negative" : "positive",
  },
  {
    slug: "diesel",
    title: "Diesel Prices Reflect Seasonal Demand and Import Costs",
    content: `Diesel prices ${directionWord(dieselChange)} by ${Math.abs(
      dieselChange
    )}% compared to the previous month. Increased agricultural and logistics sector demand, combined with higher international shipping costs, contributed to the movement observed in the latest pricing cycle.`,
    sentiment: dieselChange >= 0 ? "negative" : "positive",
  },
  {
    slug: "kerosene",
    title: "Kerosene Prices Track Broader Petroleum Trends",
    content: `Kerosene prices ${directionWord(keroseneChange)} by ${Math.abs(
      keroseneChange
    )}% in the latest review, broadly mirroring movements in diesel and petrol due to shared import cost structures and exchange rate effects on the overall petroleum products basket.`,
    sentiment: keroseneChange >= 0 ? "negative" : "positive",
  },
  {
    slug: null,
    title: "Outlook: Volatility Expected to Persist in Coming Months",
    content:
      "Market analysts expect continued price volatility over the next quarter as global supply dynamics, OPEC+ production decisions, and Kenya Shilling performance remain key swing factors for domestic pump prices. Consumers and businesses are advised to monitor monthly EPRA announcements closely.",
    sentiment: "neutral",
  },
];

const insertInsight = db.prepare(`
  INSERT INTO insights (commodity_id, title, content, sentiment, period_date)
  VALUES (?, ?, ?, ?, ?)
`);
for (const ins of insights) {
  const commodityId = ins.slug ? commodityIds[ins.slug] : null;
  insertInsight.run(commodityId, ins.title, ins.content, ins.sentiment, latestPeriod);
}

// Add a couple of historical insights too, for the prior month
const historicalInsights = [
  {
    slug: "diesel",
    title: "Diesel Prices Stabilize Following EPRA Subsidy Adjustment",
    content:
      "Diesel prices held relatively steady in the prior pricing cycle as the fuel price stabilization mechanism absorbed part of the increase in landed costs, limiting the pass-through effect to consumers.",
    sentiment: "neutral",
  },
  {
    slug: "petrol",
    title: "Petrol Prices Eased on Temporary Shilling Recovery",
    content:
      "Super Petrol prices saw a modest decline in the previous month as a brief recovery in the Kenya Shilling against major currencies reduced import costs for refined petroleum products.",
    sentiment: "positive",
  },
];

for (const ins of historicalInsights) {
  insertInsight.run(commodityIds[ins.slug], ins.title, ins.content, ins.sentiment, prevPeriod);
}

console.log("Database seeded successfully at", DB_PATH);
console.log(`Inserted ${MONTHS.length} months of price history for ${commodities.length} commodities across ${locations.length} locations.`);
console.log(`Inserted ${newsEvents.length} news events and ${insights.length + historicalInsights.length} insights.`);

db.close();
