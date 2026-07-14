import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  Coins,
  Ship,
  Landmark,
  Sparkles,
  Newspaper,
  Bike,
  Car,
} from "lucide-react";
import PriceCard from "@/components/PriceCard";
import InsightCard from "@/components/InsightCard";
import NewsTimeline from "@/components/NewsTimeline";
import {
  getCurrentPrices,
  getInsights,
  getNewsEvents,
  getEastAfricaSnapshot,
} from "@/lib/data";

export const dynamic = "force-dynamic";

const WHY_REASONS = [
  {
    icon: Globe2,
    title: "Global oil prices",
    body: "Kenya imports its fuel, so when crude oil gets pricier on world markets, it shows up at the pump here too.",
  },
  {
    icon: Coins,
    title: "The Shilling's strength",
    body: "Fuel is bought in US Dollars. When the Shilling weakens, importing the same fuel costs more in KES.",
  },
  {
    icon: Ship,
    title: "Shipping & supply",
    body: "Delays at Mombasa port, shipping costs, and global supply hiccups all filter through to local prices.",
  },
  {
    icon: Landmark,
    title: "Taxes & regulation",
    body: "EPRA sets pump prices monthly, factoring in levies, subsidies, and distribution margins.",
  },
];

function formatUpdated(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function LandingPage() {
  const prices = getCurrentPrices();
  const petrol = prices.find((p) => p.slug === "petrol")!;
  const insights = getInsights().slice(0, 2);
  const news = getNewsEvents().slice(0, 3);
  const countries = getEastAfricaSnapshot();

  const motorbikeCost = petrol.currentPrice * 5;
  const carCost = petrol.currentPrice * 45;

  return (
    <div className="flex flex-col">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-dot-grid border-b border-border dark:border-borderDark">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background dark:to-backgroundDark pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-20 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 dark:border-primaryDark/25 bg-primary/10 dark:bg-primaryDark/10 px-3 py-1 text-xs font-semibold text-primary dark:text-primaryDark font-mono-data tracking-wide">
                🇰🇪 LIVE IN KENYA · EAST AFRICA COMING SOON
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight text-gray-900 dark:text-white">
                Fuel prices, explained simply.
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
                Hali (Swahili for &ldquo;condition&rdquo;) tells you what
                Super Petrol, Diesel, and Kerosene cost right now, whether
                they&rsquo;re going up or down, and why &mdash; in plain
                language, no economics degree required.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#today"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary dark:bg-primaryDark px-5 py-3 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-opacity"
                >
                  See today&rsquo;s prices
                  <ArrowRight size={16} />
                </a>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark px-5 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-surfaceLight dark:hover:bg-surfaceLightDark transition-colors"
                >
                  Explore the full dashboard
                </Link>
              </div>
              <p className="text-xs text-muted dark:text-mutedDark font-mono-data">
                Prices updated {formatUpdated(petrol.lastUpdated)} &middot;
                Source: EPRA (sample data)
              </p>
            </div>

            {/* Snapshot card */}
            <div className="relative">
              <div className="rounded-2xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark shadow-card dark:shadow-cardDark p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Nairobi, right now
                  </span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-primaryDark opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-primaryDark" />
                  </span>
                </div>
                <div className="flex flex-col divide-y divide-border dark:divide-borderDark">
                  {prices.map((p) => {
                    const isUp = p.percentChange > 0;
                    const isDown = p.percentChange < 0;
                    return (
                      <div
                        key={p.slug}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {p.commodity}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-data text-lg font-bold text-gray-900 dark:text-white">
                            {p.currentPrice.toFixed(2)}
                          </span>
                          <span
                            className={
                              "text-xs font-semibold font-mono-data " +
                              (isUp
                                ? "text-danger"
                                : isDown
                                ? "text-primary dark:text-primaryDark"
                                : "text-muted dark:text-mutedDark")
                            }
                          >
                            {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
                            {Math.abs(p.percentChange).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-lg bg-surfaceLight dark:bg-surfaceLightDark p-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  That&rsquo;s about{" "}
                  <span className="font-mono-data font-semibold text-gray-900 dark:text-gray-100">
                    KES {carCost.toFixed(0)}
                  </span>{" "}
                  to fill a small car&rsquo;s 45-litre tank with Super Petrol
                  today.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-20 py-16 sm:py-20">
        {/* -------------------------------------------------------------- */}
        {/* Today at a glance                                               */}
        {/* -------------------------------------------------------------- */}
        <section id="today" className="scroll-mt-24 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Today&rsquo;s fuel prices
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
              Kenya&rsquo;s current EPRA pump prices, compared with last
              month. Green means cheaper, red means pricier.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prices.map((price) => (
              <PriceCard key={price.slug} price={price} />
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* What it means for you                                          */}
        {/* -------------------------------------------------------------- */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              What that means for you
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
              Numbers are easier to feel when they&rsquo;re about real life.
              Here&rsquo;s today&rsquo;s Super Petrol price, translated.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5 shadow-card dark:shadow-cardDark flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 dark:bg-accentDark/10 text-accent dark:text-accentDark">
                <Bike size={22} />
              </span>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Filling a motorbike (5 litres)
                </div>
                <div className="font-mono-data text-2xl font-bold text-gray-900 dark:text-white">
                  KES {motorbikeCost.toFixed(0)}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5 shadow-card dark:shadow-cardDark flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primaryDark/10 text-primary dark:text-primaryDark">
                <Car size={22} />
              </span>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Filling a small car (45 litres)
                </div>
                <div className="font-mono-data text-2xl font-bold text-gray-900 dark:text-white">
                  KES {carCost.toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* East Africa expansion grid                                      */}
        {/* -------------------------------------------------------------- */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Tracking fuel across East Africa
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
              We&rsquo;re starting with Kenya and expanding across all 8 East
              African Community countries next.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {countries.map((c) => {
              const isLive = c.status === "live";
              const card = (
                <div
                  className={
                    "rounded-xl border p-4 flex flex-col items-center gap-2 text-center transition-colors " +
                    (isLive
                      ? "border-primary/30 dark:border-primaryDark/30 bg-primary/5 dark:bg-primaryDark/5 hover:border-primary/50"
                      : "border-border dark:border-borderDark bg-surface dark:bg-surfaceDark opacity-70")
                  }
                >
                  <span className="text-3xl" aria-hidden>
                    {c.flag}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {c.name}
                  </span>
                  {isLive ? (
                    <span className="text-[11px] font-semibold font-mono-data text-primary dark:text-primaryDark">
                      KES {c.petrolPrice?.toFixed(2)} &middot; Live
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono-data text-muted dark:text-mutedDark">
                      Coming soon
                    </span>
                  )}
                </div>
              );
              return isLive ? (
                <Link
                  key={c.code}
                  href="/dashboard"
                  className="block"
                  aria-label={`${c.name} — live, view dashboard`}
                >
                  {card}
                </Link>
              ) : (
                <div
                  key={c.code}
                  aria-label={`${c.name} — coming soon`}
                >
                  {card}
                </div>
              );
            })}
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Why prices move                                                 */}
        {/* -------------------------------------------------------------- */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Why do prices change?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
              Four things drive most of the movement you see at the pump.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_REASONS.map((r) => (
              <div
                key={r.title}
                className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5 shadow-card dark:shadow-cardDark flex flex-col gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 dark:bg-accentDark/10 text-accent dark:text-accentDark">
                  <r.icon size={18} />
                </span>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {r.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Insights teaser                                                 */}
        {/* -------------------------------------------------------------- */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent dark:text-accentDark" />
              <h2 className="font-display text-2xl font-semibold text-gray-900 dark:text-white">
                This month, in plain English
              </h2>
            </div>
            <Link
              href="/insights"
              className="text-xs text-accent dark:text-accentDark hover:underline font-medium"
            >
              View all insights &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* News teaser                                                     */}
        {/* -------------------------------------------------------------- */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Newspaper size={18} className="text-accent dark:text-accentDark" />
              <h2 className="font-display text-2xl font-semibold text-gray-900 dark:text-white">
                What&rsquo;s happening
              </h2>
            </div>
            <Link
              href="/news"
              className="text-xs text-accent dark:text-accentDark hover:underline font-medium"
            >
              View all news &rarr;
            </Link>
          </div>
          <NewsTimeline events={news} />
        </section>

        {/* -------------------------------------------------------------- */}
        {/* CTA banner                                                      */}
        {/* -------------------------------------------------------------- */}
        <section className="rounded-2xl bg-gradient-to-br from-primary to-emerald-700 dark:from-primaryDark dark:to-emerald-700 px-6 py-10 sm:px-12 sm:py-14 flex flex-col sm:flex-row items-center justify-between gap-6 text-white shadow-glow">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">
              Want the full picture?
            </h2>
            <p className="text-sm text-white/85 max-w-md">
              Dive into 24 months of trends, charts, and detailed market
              statistics on the full dashboard.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-white/90 transition-colors shrink-0"
          >
            Open the dashboard
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}
