import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "fuel.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  return db;
}

export function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS commodities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      unit TEXT NOT NULL DEFAULT 'KES/Litre',
      color TEXT NOT NULL DEFAULT '#22c55e'
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      region TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS commodity_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commodity_id INTEGER NOT NULL REFERENCES commodities(id),
      location_id INTEGER NOT NULL REFERENCES locations(id),
      price REAL NOT NULL,
      period_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(commodity_id, location_id, period_date)
    );

    CREATE TABLE IF NOT EXISTS news_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      event_date TEXT NOT NULL,
      impact_level TEXT NOT NULL CHECK (impact_level IN ('low','medium','high')),
      source TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commodity_id INTEGER REFERENCES commodities(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      sentiment TEXT NOT NULL CHECK (sentiment IN ('positive','negative','neutral')),
      period_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_prices_period ON commodity_prices(period_date);
    CREATE INDEX IF NOT EXISTS idx_prices_commodity ON commodity_prices(commodity_id);
    CREATE INDEX IF NOT EXISTS idx_news_date ON news_events(event_date);
    CREATE INDEX IF NOT EXISTS idx_insights_date ON insights(period_date);
  `);
}
