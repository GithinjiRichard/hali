"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import { ArrowUp, ArrowDown, Fuel, CalendarClock } from "lucide-react";
import type {
  CurrentPrice,
  HistoryPoint,
  YearPoint,
  CommodityDetail,
  CommoditySlug,
  HistoricalEvent,
} from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";
import Reveal from "@/components/Reveal";

type Period = "6M" | "1Y" | "2Y" | "ALL";

function formatMonth(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-KE", { month: "short", year: "2-digit" });
  } catch {
    return dateStr;
  }
}

function CustomTooltip({
  active,
  payload,
  label,
  commodityName,
  isAllTime,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  commodityName: string;
  isAllTime: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border dark:border-borderDark bg-surfaceLight dark:bg-surfaceLightDark px-3 py-2 shadow-card dark:shadow-cardDark">
      <p className="text-xs text-muted dark:text-mutedDark mb-1 font-mono-data">
        {isAllTime ? label : label ? formatMonth(label) : ""}
      </p>
      <p className="text-xs font-semibold text-ink dark:text-inkDark">
        {commodityName}: KES {payload[0].value.toFixed(2)}
      </p>
    </div>
  );
}

export default function ExploreSection({
  prices,
  history,
  sinceIndependence,
  events,
  details,
  selected,
  onSelect,
}: {
  prices: CurrentPrice[];
  history: HistoryPoint[];
  sinceIndependence: YearPoint[];
  events: HistoricalEvent[];
  details: Record<CommoditySlug, CommodityDetail>;
  selected: CommoditySlug;
  onSelect: (slug: CommoditySlug) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [period, setPeriod] = useState<Period>("2Y");
  const [scrubYear, setScrubYear] = useState<number>(
    sinceIndependence[sinceIndependence.length - 1]?.year ?? 2026
  );

  const current = prices.find((p) => p.slug === selected)!;
  const detail = details[selected];

  const periods: Period[] =
    selected === "petrol" ? ["6M", "1Y", "2Y", "ALL"] : ["6M", "1Y", "2Y"];

  const effectivePeriod = periods.includes(period) ? period : "2Y";

  const chartData = useMemo(() => {
    if (effectivePeriod === "ALL") {
      return sinceIndependence.map((p) => ({ label: String(p.year), value: p.price }));
    }
    const months = { "6M": 6, "1Y": 12, "2Y": 24 }[effectivePeriod];
    return history.slice(-months).map((p) => ({
      label: p.period_date,
      value: p[selected],
    }));
  }, [effectivePeriod, history, sinceIndependence, selected]);

  const gridColor = isDark ? "#3A332A" : "#E8E4DC";
  const axisColor = isDark ? "#A39C92" : "#6B6560";

  const minYear = sinceIndependence[0]?.year ?? 1963;
  const maxYear = sinceIndependence[sinceIndependence.length - 1]?.year ?? 2026;

  const priceForYear = useMemo(() => {
    const map = new Map(sinceIndependence.map((p) => [p.year, p.price]));
    return (year: number) => map.get(year);
  }, [sinceIndependence]);

  const activeEvent = useMemo(() => {
    if (events.length === 0) return null;
    return events.reduce((closest, e) =>
      Math.abs(e.year - scrubYear) < Math.abs(closest.year - scrubYear) ? e : closest
    );
  }, [events, scrubYear]);
  const isExactEventYear = activeEvent?.year === scrubYear;

  return (
    <Reveal as="section" id="explore" className="py-16 md:py-20 bg-surfaceLight dark:bg-surfaceLightDark scroll-mt-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center mb-10">
          <div className="accent-line mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-2 text-ink dark:text-inkDark">
            Pick a fuel, see the full picture
          </h2>
          <p className="text-muted dark:text-mutedDark text-sm max-w-lg mx-auto">
            Price trends, what&apos;s driving them, and what it means — in plain
            language
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 justify-center flex-wrap">
          {prices.map((p) => (
            <button
              key={p.slug}
              onClick={() => onSelect(p.slug)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                p.slug === selected
                  ? "border-accent dark:border-accentDark bg-accent dark:bg-accentDark text-white"
                  : "border-border dark:border-borderDark bg-surface dark:bg-surfaceDark text-ink dark:text-inkDark hover:border-accent/50 dark:hover:border-accentDark/50"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: p.slug === selected ? "rgba(255,255,255,0.7)" : p.color }}
              />
              <Fuel size={13} />
              {p.commodity}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chart */}
          <div className="lg:col-span-3 bg-surface dark:bg-surfaceDark rounded-2xl border border-border dark:border-borderDark p-6">
            <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-xl text-ink dark:text-inkDark">
                  {current.commodity}
                </h3>
                <p className="text-muted dark:text-mutedDark text-xs mt-0.5">
                  {detail.subtext}
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono-data font-bold text-2xl text-ink dark:text-inkDark">
                  KES {current.currentPrice.toFixed(2)}
                </div>
                <div
                  className={`text-sm font-semibold inline-flex items-center gap-1 justify-end w-full ${
                    current.percentChange >= 0
                      ? "text-danger dark:text-dangerDark"
                      : "text-primary dark:text-primaryDark"
                  }`}
                >
                  {current.percentChange >= 0 ? (
                    <ArrowUp size={13} />
                  ) : (
                    <ArrowDown size={13} />
                  )}
                  {Math.abs(current.percentChange).toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="flex gap-1 bg-surfaceLight dark:bg-surfaceLightDark rounded-lg p-1 w-fit mb-4">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    effectivePeriod === p
                      ? "bg-ink dark:bg-accentDark text-white"
                      : "text-muted dark:text-mutedDark hover:text-ink dark:hover:text-inkDark"
                  }`}
                >
                  {p === "ALL" ? "Since '63" : p}
                </button>
              ))}
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="exploreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={current.color} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={current.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickFormatter={effectivePeriod === "ALL" ? undefined : formatMonth}
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                    interval={Math.max(0, Math.floor(chartData.length / 8))}
                  />
                  <YAxis
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                    domain={["auto", "auto"]}
                    tickFormatter={(v: number) => v.toFixed(0)}
                    width={40}
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        commodityName={current.commodity}
                        isAllTime={effectivePeriod === "ALL"}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={current.color}
                    strokeWidth={2.5}
                    fill="url(#exploreFill)"
                  />
                  {effectivePeriod === "ALL" &&
                    events.map((e) => {
                      const y = priceForYear(e.year);
                      if (y === undefined) return null;
                      return (
                        <ReferenceDot
                          key={e.year}
                          x={String(e.year)}
                          y={y}
                          r={e.year === activeEvent?.year ? 6 : 4}
                          fill={e.year === activeEvent?.year ? current.color : "#B8860B"}
                          stroke={isDark ? "#211D17" : "#FFFFFF"}
                          strokeWidth={2}
                          isFront
                        />
                      );
                    })}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {effectivePeriod === "ALL" && (
              <div className="mt-5 pt-5 border-t border-border dark:border-borderDark">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted dark:text-mutedDark uppercase tracking-wider">
                  <CalendarClock size={13} />
                  Scrub through the decades
                </div>
                <input
                  type="range"
                  min={minYear}
                  max={maxYear}
                  step={1}
                  value={scrubYear}
                  onChange={(e) => setScrubYear(Number(e.target.value))}
                  className="year-slider w-full"
                  style={{ color: current.color, accentColor: current.color }}
                  aria-label="Select a year to see fuel price history and events"
                />
                <div className="flex items-center justify-between mt-2 mb-3">
                  <span className="font-mono-data text-xs text-muted dark:text-mutedDark">
                    {minYear}
                  </span>
                  <span className="font-display font-bold text-lg text-ink dark:text-inkDark">
                    {scrubYear}
                    {priceForYear(scrubYear) !== undefined && (
                      <span className="font-mono-data font-normal text-sm text-muted dark:text-mutedDark ml-2">
                        KES {priceForYear(scrubYear)?.toFixed(2)}
                      </span>
                    )}
                  </span>
                  <span className="font-mono-data text-xs text-muted dark:text-mutedDark">
                    {maxYear}
                  </span>
                </div>
                {activeEvent && (
                  <div className="rounded-xl bg-surfaceLight dark:bg-surfaceLightDark border border-border dark:border-borderDark p-4">
                    {!isExactEventYear && (
                      <p className="text-[11px] text-muted dark:text-mutedDark mb-1.5">
                        Nearest recorded event — {activeEvent.year}
                      </p>
                    )}
                    <p className="font-semibold text-sm text-ink dark:text-inkDark mb-1">
                      {activeEvent.title}
                    </p>
                    <p className="text-sm text-muted dark:text-mutedDark leading-relaxed">
                      {activeEvent.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Why is this happening? */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-surface dark:bg-surfaceDark rounded-2xl border border-border dark:border-borderDark p-6">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted dark:text-mutedDark mb-4">
                Why is this happening?
              </h4>
              <div className="flex flex-col gap-3">
                {detail.factors.map((f) => (
                  <div
                    key={f.text}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium ${
                      f.direction === "up"
                        ? "bg-danger/8 dark:bg-dangerDark/10 text-danger dark:text-dangerDark"
                        : "bg-primary/8 dark:bg-primaryDark/10 text-primary dark:text-primaryDark"
                    }`}
                  >
                    {f.direction === "up" ? (
                      <ArrowUp size={12} />
                    ) : (
                      <ArrowDown size={12} />
                    )}
                    {f.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface dark:bg-surfaceDark rounded-2xl border border-border dark:border-borderDark p-6">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted dark:text-mutedDark mb-3">
                In simple terms
              </h4>
              <p className="text-sm text-muted dark:text-mutedDark leading-relaxed">
                {detail.simple}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
