"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Shuffle, Minus, Info } from "lucide-react";
import type { HistoryPoint, PriceEvent } from "@/lib/types";
import clsx from "clsx";

const DIRECTION_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  mixed: Shuffle,
  flat: Minus,
};

const DIRECTION_COLOR = {
  up: "text-danger dark:text-dangerDark border-danger/40 dark:border-dangerDark/40",
  down: "text-primary dark:text-primaryDark border-primary/40 dark:border-primaryDark/40",
  mixed: "text-accent dark:text-accentDark border-accent/40 dark:border-accentDark/40",
  flat: "text-muted dark:text-mutedDark border-border dark:border-borderDark",
};

function formatMonth(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function PriceEventsCalendar({
  data,
  events,
}: {
  data: HistoryPoint[];
  events: PriceEvent[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const eventByMonth = new Map(events.map((e) => [e.period_date, e]));
  const rows = data.slice().reverse();

  return (
    <section className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5 shadow-card dark:shadow-cardDark">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <h2 className="font-semibold text-ink dark:text-inkDark">
          Monthly Price History (Nairobi)
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted dark:text-mutedDark">
          <Info size={12} />
          Highlighted months have a recorded event — tap to read it
        </span>
      </div>
      <p className="text-xs text-muted dark:text-mutedDark mb-4">
        KES/litre. Highlighted cells mark real, sourced pricing events —
        everything else is Hali&apos;s illustrative trend line calibrated
        between confirmed EPRA figures.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {rows.map((row) => {
          const event = eventByMonth.get(row.period_date);
          const isOpen = expanded === row.period_date;
          const Icon = event ? DIRECTION_ICON[event.direction] : null;

          return (
            <div
              key={row.period_date}
              className={clsx(
                "col-span-1 rounded-lg border p-3 transition-colors",
                event
                  ? clsx("cursor-pointer", DIRECTION_COLOR[event.direction])
                  : "border-border dark:border-borderDark",
                event && isOpen && "bg-surfaceLight dark:bg-surfaceLightDark"
              )}
              onClick={() => event && setExpanded(isOpen ? null : row.period_date)}
              role={event ? "button" : undefined}
              tabIndex={event ? 0 : undefined}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-ink dark:text-inkDark">
                  {formatMonth(row.period_date)}
                </span>
                {Icon && <Icon size={13} />}
              </div>
              <dl className="font-mono-data text-[11px] leading-relaxed text-muted dark:text-mutedDark">
                <div className="flex justify-between">
                  <dt>Petrol</dt>
                  <dd className="text-ink dark:text-inkDark">{row.petrol.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Diesel</dt>
                  <dd className="text-ink dark:text-inkDark">{row.diesel.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Kerosene</dt>
                  <dd className="text-ink dark:text-inkDark">{row.kerosene.toFixed(2)}</dd>
                </div>
              </dl>

              {event && isOpen && (
                <div className="mt-2.5 pt-2.5 border-t border-current/20 text-[11px] leading-relaxed text-ink dark:text-inkDark">
                  <p className="font-semibold mb-1">{event.title}</p>
                  <p className="text-muted dark:text-mutedDark">{event.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
