import clsx from "clsx";
import type { NewsEvent } from "@/lib/types";

const IMPACT_CONFIG = {
  high: { label: "High Impact", dot: "bg-danger", badge: "text-danger bg-danger/10 border-danger/20" },
  medium: { label: "Medium Impact", dot: "bg-amber-400", badge: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  low: { label: "Low Impact", dot: "bg-primary", badge: "text-primary bg-primary/10 border-primary/20" },
} as const;

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function NewsTimeline({ events }: { events: NewsEvent[] }) {
  return (
    <div className="relative">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border dark:bg-borderDark" aria-hidden />
      <ul className="flex flex-col gap-6">
        {events.map((event) => {
          const config = IMPACT_CONFIG[event.impact_level];
          return (
            <li key={event.id} className="relative pl-7">
              <span
                className={clsx(
                  "absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-background dark:ring-backgroundDark",
                  config.dot
                )}
                aria-hidden
              />
              <div className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-4 shadow-card dark:shadow-cardDark card-hover">
                <div className="flex flex-wrap items-center gap-2 justify-between mb-2">
                  <span className="text-xs text-muted dark:text-mutedDark font-mono-data">
                    {formatDate(event.event_date)}
                  </span>
                  <span
                    className={clsx(
                      "rounded-md border px-2 py-0.5 text-[11px] font-semibold font-mono-data",
                      config.badge
                    )}
                  >
                    {config.label}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1.5">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {event.description}
                </p>
                {event.source && (
                  <p className="text-[11px] text-muted dark:text-mutedDark mt-2 font-mono-data">
                    Source: {event.source}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
