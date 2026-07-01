export type CommoditySlug = "petrol" | "diesel" | "kerosene";

export interface Commodity {
  id: number;
  name: string;
  slug: CommoditySlug;
  unit: string;
  color: string;
}

export interface Location {
  id: number;
  name: string;
  region: string;
}

export interface PriceRecord {
  id: number;
  commodity_id: number;
  location_id: number;
  price: number;
  period_date: string;
}

export interface CurrentPrice {
  commodity: string;
  slug: CommoditySlug;
  unit: string;
  color: string;
  currentPrice: number;
  previousPrice: number;
  percentChange: number;
  lastUpdated: string;
}

export interface HistoryPoint {
  period_date: string;
  petrol: number;
  diesel: number;
  kerosene: number;
}

export interface NewsEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  impact_level: "low" | "medium" | "high";
  source: string | null;
}

export interface Insight {
  id: number;
  commodity_id: number | null;
  commodity_name: string | null;
  title: string;
  content: string;
  sentiment: "positive" | "negative" | "neutral";
  period_date: string;
}

export interface DashboardStats {
  currentPetrol: number;
  currentDiesel: number;
  currentKerosene: number;
  highest24m: { commodity: string; price: number; period_date: string };
  lowest24m: { commodity: string; price: number; period_date: string };
}
