import { Fuel, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import PriceCard from "@/components/PriceCard";
import StatCard from "@/components/StatCard";
import PriceTrendChart from "@/components/PriceTrendChart";
import InsightCard from "@/components/InsightCard";
import NewsTimeline from "@/components/NewsTimeline";
import Link from "next/link";
import {
  getCurrentPrices,
  getDashboardStats,
  getPriceHistory,
  getInsights,
  getNewsEvents,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const prices = getCurrentPrices();
  const stats = getDashboardStats();
  const history = getPriceHistory();
  const insights = getInsights().slice(0, 3);
  const news = getNewsEvents().slice(0, 3);

  const last24m = history.slice(-24);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Fuel Price Dashboard
          </h1>
          <p className="text-sm text-muted dark:text-mutedDark">
            Current EPRA-regulated pump prices for Nairobi and 24-month market
            trends. Kenya is live today &mdash; more East African markets are
            on the way.
          </p>
        </div>

        {/* Current Prices */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map((price) => (
            <PriceCard key={price.slug} price={price} />
          ))}
        </section>

        {/* Dashboard Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Current Petrol"
            value={`KES ${stats.currentPetrol.toFixed(2)}`}
            icon={Fuel}
            accent="primary"
          />
          <StatCard
            label="Current Diesel"
            value={`KES ${stats.currentDiesel.toFixed(2)}`}
            icon={Fuel}
            accent="accent"
          />
          <StatCard
            label="Current Kerosene"
            value={`KES ${stats.currentKerosene.toFixed(2)}`}
            icon={Fuel}
            accent="muted"
          />
          <StatCard
            label="Highest (24mo)"
            value={`KES ${stats.highest24m.price.toFixed(2)}`}
            sublabel={stats.highest24m.commodity}
            icon={TrendingUp}
            accent="danger"
          />
          <StatCard
            label="Lowest (24mo)"
            value={`KES ${stats.lowest24m.price.toFixed(2)}`}
            sublabel={stats.lowest24m.commodity}
            icon={TrendingDown}
            accent="primary"
          />
        </section>

        {/* Trend Chart */}
        <section className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5 shadow-card dark:shadow-cardDark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-accent" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                24-Month Price Trend &mdash; Nairobi
              </h2>
            </div>
            <Link
              href="/trends"
              className="text-xs text-accent hover:underline font-medium"
            >
              View detailed trends &rarr;
            </Link>
          </div>
          <PriceTrendChart data={last24m} />
        </section>

        {/* Insights preview */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Market Insights</h2>
            <Link
              href="/insights"
              className="text-xs text-accent hover:underline font-medium"
            >
              View all insights &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>

        {/* News preview */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Latest News &amp; Events</h2>
            <Link
              href="/news"
              className="text-xs text-accent hover:underline font-medium"
            >
              View all news &rarr;
            </Link>
          </div>
          <NewsTimeline events={news} />
        </section>
      </div>
    </div>
  );
}
