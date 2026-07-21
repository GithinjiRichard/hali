import type { QuoteRow } from "@/lib/types";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function Cell({ value }: { value: number | null }) {
  if (value === null) {
    return <td className="py-2.5 px-3 text-right text-muted dark:text-mutedDark">—</td>;
  }
  const isFlat = value === 0;
  const isUp = value > 0; // up = more expensive = bad for consumers
  const intensity = Math.min(Math.abs(value) / 12, 1); // heatmap strength, caps around a 12% move
  const bg = isFlat
    ? "transparent"
    : isUp
    ? `rgba(192, 57, 43, ${0.08 + intensity * 0.28})`
    : `rgba(27, 122, 61, ${0.08 + intensity * 0.28})`;
  const textColor = isFlat
    ? "text-muted dark:text-mutedDark"
    : isUp
    ? "text-danger dark:text-dangerDark"
    : "text-primary dark:text-primaryDark";

  return (
    <td
      className={`py-2.5 px-3 text-right font-mono-data text-sm font-semibold ${textColor}`}
      style={{ backgroundColor: bg }}
    >
      {isUp ? "+" : ""}
      {value.toFixed(1)}%
    </td>
  );
}

export default function QuotesTable({ rows }: { rows: QuoteRow[] }) {
  return (
    <section className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5 shadow-card dark:shadow-cardDark overflow-x-auto">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2 className="font-semibold text-ink dark:text-inkDark">Quotes</h2>
        <span className="text-[11px] text-muted dark:text-mutedDark">
          Nairobi, KES/litre · updated each EPRA cycle, not real-time
        </span>
      </div>
      <p className="text-xs text-muted dark:text-mutedDark mb-4">
        Red = pricier than the comparison point, green = cheaper — same
        color logic as a trading quote grid, just re-timed to how pump
        prices actually move: once a month, not by the second.
      </p>
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-muted dark:text-mutedDark border-b border-border dark:border-borderDark text-xs uppercase tracking-wide">
            <th className="py-2 px-3 font-medium">Commodity</th>
            <th className="py-2 px-3 font-medium text-right">Price</th>
            <th className="py-2 px-3 font-medium text-right">Chg</th>
            <th className="py-2 px-3 font-medium text-right">%Chg</th>
            <th className="py-2 px-3 font-medium text-right">3M</th>
            <th className="py-2 px-3 font-medium text-right">6M</th>
            <th className="py-2 px-3 font-medium text-right">YTD</th>
            <th className="py-2 px-3 font-medium text-right">YoY</th>
            <th className="py-2 px-3 font-medium text-right">As of</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.slug}
              className="border-b border-border/60 dark:border-borderDark/60 hover:bg-surfaceLight dark:hover:bg-surfaceLightDark"
            >
              <td className="py-2.5 px-3">
                <span className="inline-flex items-center gap-2 font-medium text-ink dark:text-inkDark">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  {r.commodity}
                </span>
              </td>
              <td className="py-2.5 px-3 text-right font-mono-data font-semibold text-ink dark:text-inkDark">
                {r.current.toFixed(2)}
              </td>
              <td className="py-2.5 px-3 text-right font-mono-data text-muted dark:text-mutedDark">
                {r.changeAbs > 0 ? "+" : ""}
                {r.changeAbs.toFixed(2)}
              </td>
              <Cell value={r.changePct} />
              <Cell value={r.pct3M} />
              <Cell value={r.pct6M} />
              <Cell value={r.pctYTD} />
              <Cell value={r.pctYoY} />
              <td className="py-2.5 px-3 text-right text-xs text-muted dark:text-mutedDark">
                {formatDate(r.asOf)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
