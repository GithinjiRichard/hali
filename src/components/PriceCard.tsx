import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { CurrentPrice } from "@/lib/types";
import clsx from "clsx";

const ICONS: Record<string, string> = {
  petrol: "⛽",
  diesel: "🚛",
  kerosene: "🔥",
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function PriceCard({ price }: { price: CurrentPrice }) {
  const isUp = price.percentChange > 0;
  const isDown = price.percentChange < 0;
  const isFlat = price.percentChange === 0;

  return (
    <div className="card-hover rounded-xl border border-border bg-surface p-5 shadow-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            {ICONS[price.slug] ?? "⛽"}
          </span>
          <h3 className="font-semibold text-gray-100 text-sm tracking-wide">
            {price.commodity}
          </h3>
        </div>
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: price.color }}
          aria-hidden
        />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono-data text-3xl font-bold text-white tracking-tight">
            {price.currentPrice.toFixed(2)}
          </div>
          <div className="text-xs text-muted mt-1">{price.unit}</div>
        </div>

        <div
          className={clsx(
            "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold font-mono-data",
            isUp && "bg-danger/10 text-danger",
            isDown && "bg-primary/10 text-primary",
            isFlat && "bg-muted/10 text-muted"
          )}
        >
          {isUp && <ArrowUpRight size={14} />}
          {isDown && <ArrowDownRight size={14} />}
          {isFlat && <Minus size={14} />}
          {Math.abs(price.percentChange).toFixed(1)}%
        </div>
      </div>

      <div className="border-t border-border pt-3 flex items-center justify-between text-xs">
        <div className="text-muted">
          Prev. month:{" "}
          <span className="font-mono-data text-gray-300">
            KES {price.previousPrice.toFixed(2)}
          </span>
        </div>
        <div className="text-muted">Updated {formatDate(price.lastUpdated)}</div>
      </div>
    </div>
  );
}
