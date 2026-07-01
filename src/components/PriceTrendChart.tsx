"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { HistoryPoint } from "@/lib/types";

const SERIES = [
  { key: "petrol", name: "Super Petrol", color: "#22c55e" },
  { key: "diesel", name: "Diesel", color: "#3b82f6" },
  { key: "kerosene", name: "Kerosene", color: "#f59e0b" },
] as const;

function formatMonth(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-KE", { month: "short", year: "2-digit" });
  } catch {
    return dateStr;
  }
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surfaceLight px-3 py-2 shadow-card">
      <p className="text-xs text-muted mb-1.5 font-mono-data">
        {label ? formatMonth(label) : ""}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-3 text-xs"
        >
          <span className="flex items-center gap-1.5 text-gray-300">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-mono-data font-semibold text-white">
            KES {entry.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PriceTrendChart({
  data,
  visibleSeries,
}: {
  data: HistoryPoint[];
  visibleSeries?: string[];
}) {
  const seriesToShow = visibleSeries
    ? SERIES.filter((s) => visibleSeries.includes(s.key))
    : SERIES;

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222838" vertical={false} />
        <XAxis
          dataKey="period_date"
          tickFormatter={formatMonth}
          stroke="#7d869c"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "#222838" }}
          interval={Math.max(0, Math.floor(data.length / 12))}
        />
        <YAxis
          stroke="#7d869c"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "#222838" }}
          domain={["auto", "auto"]}
          tickFormatter={(v: number) => `${v.toFixed(0)}`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#7d869c" }}
          iconType="circle"
          iconSize={8}
        />
        {seriesToShow.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
