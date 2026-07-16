"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { CurrentPrice, CommoditySlug } from "@/lib/types";

function formatUpdated(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
    });
  } catch {
    return dateStr;
  }
}

export default function Hero({
  prices,
  sinceIndependenceMultiple,
  onSelectCommodity,
}: {
  prices: CurrentPrice[];
  sinceIndependenceMultiple: number;
  onSelectCommodity: (slug: CommoditySlug) => void;
}) {
  const petrol = prices.find((p) => p.slug === "petrol")!;

  const stats = prices.map((p) => ({
    label:
      p.percentChange === 0
        ? `${p.commodity} is`
        : `${p.commodity} is ${p.percentChange > 0 ? "up" : "down"}`,
    value:
      p.percentChange === 0
        ? "Unchanged"
        : `${p.percentChange > 0 ? "+" : ""}${p.percentChange.toFixed(1)}%`,
    sub: "this month",
    flat: p.percentChange === 0,
    positive: p.percentChange < 0,
  }));

  return (
    <section className="relative overflow-hidden bg-dot-grid border-b border-border dark:border-borderDark">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background dark:to-backgroundDark pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-16 sm:pt-20 sm:pb-20">
        <div className="max-w-3xl">
          <div className="accent-line mb-6" />
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-[3.3rem] leading-[1.15] tracking-tight mb-6 text-ink dark:text-inkDark">
            Why is fuel getting{" "}
            <em className="not-italic text-accent dark:text-accentDark">
              more expensive
            </em>
            ?
          </h1>
          <p className="text-lg text-muted dark:text-mutedDark leading-relaxed mb-8 max-w-xl">
            Hali now tracks Super Petrol, Diesel, and Kerosene prices in
            Kenya, Tanzania, and Uganda — with Kenya&apos;s full price
            history live below — and explains what&apos;s behind every
            change, no economics degree required. Today&apos;s Super Petrol
            price in Kenya:{" "}
            <span className="font-mono-data font-semibold text-ink dark:text-inkDark">
              KES {petrol.currentPrice.toFixed(2)}
            </span>{" "}
            per litre, as of {formatUpdated(petrol.lastUpdated)}.{" "}
            <span className="text-xs text-muted dark:text-mutedDark">
              Source: {petrol.sourceLabel}.
            </span>
          </p>
          <div className="flex flex-wrap gap-3 mb-2">
            {prices.map((p) => {
              const isFlat = p.percentChange === 0;
              const isDown = p.percentChange < 0;
              const arrow = isFlat ? "—" : isDown ? "↓" : "↑";
              return (
                <button
                  key={p.slug}
                  onClick={() => onSelectCommodity(p.slug)}
                  className="inline-flex items-center gap-2 rounded-full border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark px-4 py-2.5 text-sm font-medium text-ink dark:text-inkDark hover:border-accent dark:hover:border-accentDark hover:bg-accent/5 dark:hover:bg-accentDark/10 transition-colors"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.commodity}
                  <span
                    className={
                      isFlat
                        ? "text-muted dark:text-mutedDark font-semibold text-xs"
                        : isDown
                        ? "text-primary dark:text-primaryDark font-semibold text-xs"
                        : "text-danger dark:text-dangerDark font-semibold text-xs"
                    }
                  >
                    {arrow}
                    {!isFlat && `${Math.abs(p.percentChange).toFixed(1)}%`}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-accent dark:bg-accentDark px-5 py-3 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-opacity"
            >
              See the full dashboard <ArrowRight size={16} />
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted dark:text-mutedDark font-mono-data">
              <Sparkles size={13} className="text-accent dark:text-accentDark" />
              {sinceIndependenceMultiple.toFixed(0)}x pricier than at independence
            </span>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-4"
            >
              <div className="text-muted dark:text-mutedDark text-[11px] font-medium uppercase tracking-wider">
                {s.label}
              </div>
              <div
                className={`font-mono-data font-bold text-xl mt-1 ${
                  s.flat
                    ? "text-muted dark:text-mutedDark"
                    : s.positive
                    ? "text-primary dark:text-primaryDark"
                    : "text-danger dark:text-dangerDark"
                }`}
              >
                {s.value}
              </div>
              <div className="text-muted dark:text-mutedDark text-xs">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
