import { TrendingUp, TrendingDown, Info } from "lucide-react";
import clsx from "clsx";
import type { Insight } from "@/lib/types";

const SENTIMENT_CONFIG = {
  positive: {
    icon: TrendingDown,
    label: "Favorable",
    classes: "text-primary bg-primary/10 border-primary/20",
  },
  negative: {
    icon: TrendingUp,
    label: "Unfavorable",
    classes: "text-danger bg-danger/10 border-danger/20",
  },
  neutral: {
    icon: Info,
    label: "Outlook",
    classes: "text-accent bg-accent/10 border-accent/20",
  },
} as const;

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-KE", { year: "numeric", month: "long" });
  } catch {
    return dateStr;
  }
}

export default function InsightCard({ insight }: { insight: Insight }) {
  const config = SENTIMENT_CONFIG[insight.sentiment];
  const Icon = config.icon;

  return (
    <div className="card-hover rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5 shadow-card dark:shadow-cardDark flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div
          className={clsx(
            "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold font-mono-data shrink-0",
            config.classes
          )}
        >
          <Icon size={12} />
          {config.label}
        </div>
        {insight.commodity_name && (
          <span className="text-[11px] text-muted dark:text-mutedDark font-mono-data text-right">
            {insight.commodity_name}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-ink dark:text-inkDark text-sm leading-snug">
        {insight.title}
      </h3>

      <p className="text-sm text-muted dark:text-mutedDark leading-relaxed">{insight.content}</p>

      <div className="text-[11px] text-muted dark:text-mutedDark font-mono-data mt-1 pt-3 border-t border-border dark:border-borderDark">
        {formatDate(insight.period_date)}
      </div>
    </div>
  );
}
