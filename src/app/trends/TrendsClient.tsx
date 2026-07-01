"use client";

import { useState } from "react";
import clsx from "clsx";
import PriceTrendChart from "@/components/PriceTrendChart";
import PercentChangeChart from "@/components/PercentChangeChart";
import type { HistoryPoint } from "@/lib/types";

const COMMODITIES = [
  { key: "petrol" as const, label: "Super Petrol", color: "#22c55e" },
  { key: "diesel" as const, label: "Diesel", color: "#3b82f6" },
  { key: "kerosene" as const, label: "Kerosene", color: "#f59e0b" },
];

export default function TrendsClient({ data }: { data: HistoryPoint[] }) {
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
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-gray-100">Combined Price Trend</h2>
          <div className="flex items-center gap-2">
            {COMMODITIES.map((c) => (
              <button
                key={c.key}
                onClick={() => toggle(c.key)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  active.has(c.key)
                    ? "border-border bg-surfaceLight text-gray-200"
                    : "border-border text-muted opacity-50 hover:opacity-80"
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
            className="rounded-xl border border-border bg-surface p-5 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <h3 className="font-semibold text-gray-100 text-sm">
                {c.label} &mdash; MoM % Change
              </h3>
            </div>
            <PercentChangeChart data={data} commodityKey={c.key} color={c.color} />
          </div>
        ))}
      </section>

      {/* Data table */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card overflow-x-auto">
        <h2 className="font-semibold text-gray-100 mb-4">
          Monthly Price History (Nairobi)
        </h2>
        <table className="w-full text-sm font-mono-data">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="py-2 pr-4 font-medium">Month</th>
              <th className="py-2 pr-4 font-medium text-right">
                Super Petrol
              </th>
              <th className="py-2 pr-4 font-medium text-right">Diesel</th>
              <th className="py-2 pr-4 font-medium text-right">Kerosene</th>
            </tr>
          </thead>
          <tbody>
            {data
              .slice()
              .reverse()
              .map((row) => (
                <tr
                  key={row.period_date}
                  className="border-b border-border/60 hover:bg-surfaceLight"
                >
                  <td className="py-2 pr-4 text-gray-300">
                    {new Date(row.period_date).toLocaleDateString("en-KE", {
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-2 pr-4 text-right text-gray-200">
                    {row.petrol.toFixed(2)}
                  </td>
                  <td className="py-2 pr-4 text-right text-gray-200">
                    {row.diesel.toFixed(2)}
                  </td>
                  <td className="py-2 pr-4 text-right text-gray-200">
                    {row.kerosene.toFixed(2)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
