"use client";

import { useState } from "react";
import clsx from "clsx";
import PriceTrendChart from "@/components/PriceTrendChart";
import PercentChangeChart from "@/components/PercentChangeChart";
import PriceEventsCalendar from "@/components/PriceEventsCalendar";
import type { HistoryPoint, PriceEvent } from "@/lib/types";

const COMMODITIES = [
  { key: "petrol" as const, label: "Super Petrol", color: "#B8860B" },
  { key: "diesel" as const, label: "Diesel", color: "#8B4513" },
  { key: "kerosene" as const, label: "Kerosene", color: "#4A6670" },
];

export default function TrendsClient({ data, events }: { data: HistoryPoint[]; events: PriceEvent[] }) {
  const [active, setActive] = useState<Set<string>>(
    new Set(["petrol", "diesel", "kerosene"])
  );

  function toggle(key: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Combined trend chart */}
      <section className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5 shadow-card dark:shadow-cardDark">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-ink dark:text-inkDark">Combined Price Trend</h2>
          <div className="flex items-center gap-2">
            {COMMODITIES.map((c) => (
              <button
                key={c.key}
                onClick={() => toggle(c.key)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  active.has(c.key)
                    ? "border-border dark:border-borderDark bg-surfaceLight dark:bg-surfaceLightDark text-ink dark:text-inkDark"
                    : "border-border dark:border-borderDark text-muted dark:text-mutedDark opacity-50 hover:opacity-80"
                )}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <PriceTrendChart data={data} visibleSeries={Array.from(active)} />
      </section>

      {/* Per-commodity percentage change charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {COMMODITIES.map((c) => (
          <div
            key={c.key}
            className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5 shadow-card dark:shadow-cardDark"
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <h3 className="font-semibold text-ink dark:text-inkDark text-sm">
                {c.label} &mdash; MoM % Change
              </h3>
            </div>
            <PercentChangeChart data={data} commodityKey={c.key} color={c.color} />
          </div>
        ))}
      </section>

      {/* Price events calendar */}
      <PriceEventsCalendar data={data} events={events} />
    </div>
  );
}
