import { getDb } from "./db";
import type {
  CommoditySlug,
  CurrentPrice,
  DashboardStats,
  HistoryPoint,
  Insight,
  NewsEvent,
} from "./types";

const NAIROBI = "Nairobi";

interface CommodityRow {
  id: number;
  name: string;
  slug: string;
  unit: string;
  color: string;
}

interface PriceRow {
  price: number;
  period_date: string;
}

/**
 * Returns the two most recent monthly prices (Nairobi) for each commodity,
 * plus percentage change and last updated date.
 */
export function getCurrentPrices(): CurrentPrice[] {
  const db = getDb();

  const commodities = db
    .prepare("SELECT id, name, slug, unit, color FROM commodities ORDER BY id")
    .all() as CommodityRow[];

  const locationRow = db
    .prepare("SELECT id FROM locations WHERE name = ?")
    .get(NAIROBI) as { id: number } | undefined;

  if (!locationRow) return [];

  const priceStmt = db.prepare(`
    SELECT price, period_date
    FROM commodity_prices
    WHERE commodity_id = ? AND location_id = ?
    ORDER BY period_date DESC
    LIMIT 2
  `);

  const results: CurrentPrice[] = [];

  for (const c of commodities) {
    const rows = priceStmt.all(c.id, locationRow.id) as PriceRow[];
    if (rows.length === 0) continue;

    const current = rows[0];
    const previous = rows.length > 1 ? rows[1] : rows[0];
    const percentChange =
      previous.price === 0
        ? 0
        : Math.round(((current.price - previous.price) / previous.price) * 1000) / 10;

    results.push({
      commodity: c.name,
      slug: c.slug as CommoditySlug,
      unit: c.unit,
      color: c.color,
      currentPrice: current.price,
      previousPrice: previous.price,
      percentChange,
      lastUpdated: current.period_date,
    });
  }

  return results;
}

/**
 * Returns monthly Nairobi price history for all commodities, pivoted by date.
 */
export function getPriceHistory(): HistoryPoint[] {
  const db = getDb();

  const locationRow = db
    .prepare("SELECT id FROM locations WHERE name = ?")
    .get(NAIROBI) as { id: number } | undefined;

  if (!locationRow) return [];

  const rows = db
    .prepare(
      `SELECT c.slug as slug, cp.price as price, cp.period_date as period_date
       FROM commodity_prices cp
       JOIN commodities c ON c.id = cp.commodity_id
       WHERE cp.location_id = ?
       ORDER BY cp.period_date ASC`
    )
    .all(locationRow.id) as { slug: string; price: number; period_date: string }[];

  const byDate = new Map<string, HistoryPoint>();

  for (const row of rows) {
    if (!byDate.has(row.period_date)) {
      byDate.set(row.period_date, {
        period_date: row.period_date,
        petrol: 0,
        diesel: 0,
        kerosene: 0,
      });
    }
    const point = byDate.get(row.period_date)!;
    if (row.slug === "petrol") point.petrol = row.price;
    if (row.slug === "diesel") point.diesel = row.price;
    if (row.slug === "kerosene") point.kerosene = row.price;
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.period_date.localeCompare(b.period_date)
  );
}

export function getNewsEvents(): NewsEvent[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, title, description, event_date, impact_level, source
       FROM news_events
       ORDER BY event_date DESC`
    )
    .all() as NewsEvent[];
}

export function getInsights(): Insight[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT i.id, i.commodity_id, c.name as commodity_name, i.title, i.content,
              i.sentiment, i.period_date
       FROM insights i
       LEFT JOIN commodities c ON c.id = i.commodity_id
       ORDER BY i.period_date DESC, i.id ASC`
    )
    .all() as Insight[];
}

export function getDashboardStats(): DashboardStats {
  const db = getDb();

  const current = getCurrentPrices();
  const petrol = current.find((c) => c.slug === "petrol")?.currentPrice ?? 0;
  const diesel = current.find((c) => c.slug === "diesel")?.currentPrice ?? 0;
  const kerosene = current.find((c) => c.slug === "kerosene")?.currentPrice ?? 0;

  const locationRow = db
    .prepare("SELECT id FROM locations WHERE name = ?")
    .get(NAIROBI) as { id: number } | undefined;

  const locationId = locationRow?.id ?? 0;

  const highest = db
    .prepare(
      `SELECT c.name as commodity, cp.price as price, cp.period_date as period_date
       FROM commodity_prices cp
       JOIN commodities c ON c.id = cp.commodity_id
       WHERE cp.location_id = ?
       ORDER BY cp.price DESC, cp.period_date DESC
       LIMIT 1`
    )
    .get(locationId) as { commodity: string; price: number; period_date: string } | undefined;

  const lowest = db
    .prepare(
      `SELECT c.name as commodity, cp.price as price, cp.period_date as period_date
       FROM commodity_prices cp
       JOIN commodities c ON c.id = cp.commodity_id
       WHERE cp.location_id = ?
       ORDER BY cp.price ASC, cp.period_date DESC
       LIMIT 1`
    )
    .get(locationId) as { commodity: string; price: number; period_date: string } | undefined;

  return {
    currentPetrol: petrol,
    currentDiesel: diesel,
    currentKerosene: kerosene,
    highest24m: highest ?? { commodity: "-", price: 0, period_date: "-" },
    lowest24m: lowest ?? { commodity: "-", price: 0, period_date: "-" },
  };
}
