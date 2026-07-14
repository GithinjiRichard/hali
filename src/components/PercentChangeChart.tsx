"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import type { HistoryPoint } from "@/lib/types";
import { useTheme } from "./ThemeProvider";

function formatMonth(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-KE", { month: "short", year: "2-digit" });
  } catch {
    return dateStr;
  }
}

interface ChangePoint {
  period_date: string;
  change: number;
}

function computeChanges(data: HistoryPoint[], key: "petrol" | "diesel" | "kerosene"): ChangePoint[] {
  const result: ChangePoint[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1][key];
    const curr = data[i][key];
    const change = prev === 0 ? 0 : ((curr - prev) / prev) * 100;
    result.push({ period_date: data[i].period_date, change: Math.round(change * 10) / 10 });
  }
  return result;
}

interface TooltipPayloadItem {
  value: number;
  payload: ChangePoint;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const isUp = point.change >= 0;

  return (
    <div className="rounded-lg border border-border dark:border-borderDark bg-surfaceLight dark:bg-surfaceLightDark px-3 py-2 shadow-card dark:shadow-cardDark">
      <p className="text-xs text-muted dark:text-mutedDark mb-1 font-mono-data">
        {formatMonth(point.period_date)}
      </p>
      <p
        className={`text-xs font-mono-data font-semibold ${
          isUp ? "text-danger" : "text-primary"
        }`}
      >
        {isUp ? "+" : ""}
        {point.change.toFixed(1)}% MoM
      </p>
    </div>
  );
}

export default function PercentChangeChart({
  data,
  commodityKey,
  color,
}: {
  data: HistoryPoint[];
  commodityKey: "petrol" | "diesel" | "kerosene";
  color: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridColor = isDark ? "#222838" : "#e4e7ef";
  const axisColor = isDark ? "#7d869c" : "#667085";
  const cursorColor = isDark ? "#1a1f2e" : "#f0f2f7";
  const changes = computeChanges(data, commodityKey);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={changes} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="period_date"
          tickFormatter={formatMonth}
          stroke={axisColor}
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          interval={Math.max(0, Math.floor(changes.length / 12))}
        />
        <YAxis
          stroke={axisColor}
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          tickFormatter={(v: number) => `${v}%`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorColor }} />
        <Bar dataKey="change" radius={[2, 2, 0, 0]}>
          {changes.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={entry.change >= 0 ? "#dc2626" : color}
              opacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
