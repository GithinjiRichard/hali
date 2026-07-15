"use client";

import type { BudgetShare } from "@/lib/types";
import Reveal from "@/components/Reveal";

export default function BudgetImpact({ data }: { data: BudgetShare[] }) {
  const max = Math.max(...data.map((d) => d.sharePct));

  return (
    <Reveal as="section" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-10">
          <div className="accent-line mb-4" />
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-2 text-ink dark:text-inkDark">
            Fuel&apos;s weight on the wallet
          </h2>
          <p className="text-muted dark:text-mutedDark text-sm max-w-2xl">
            An estimate of how much of an average monthly income goes toward
            fuel and transport across the East African Community — the
            higher the bar, the harder rising prices bite.
          </p>
        </div>
        <div className="bg-surface dark:bg-surfaceDark rounded-2xl border border-border dark:border-borderDark p-6 md:p-8">
          {data.map((d, i) => {
            const pct = (d.sharePct / max) * 100;
            const color =
              d.sharePct > 10 ? "#C0392B" : d.sharePct > 7 ? "#B8720A" : "#1B7A3D";
            return (
              <div
                key={d.code}
                className="flex items-center gap-4 mb-3 animate-fade-slide-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="w-32 shrink-0 flex items-center gap-2">
                  <span className="text-lg">{d.flag}</span>
                  <span className="text-sm font-medium truncate text-ink dark:text-inkDark">
                    {d.name}
                  </span>
                </div>
                <div className="h-7 flex-1 rounded-lg bg-surfaceLight dark:bg-surfaceLightDark overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center px-2.5 text-[11px] font-bold text-white transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color, minWidth: "fit-content" }}
                  >
                    {d.sharePct.toFixed(1)}%
                  </div>
                </div>
                <div className="w-28 shrink-0 text-right text-[11px] text-muted dark:text-mutedDark">
                  {d.live ? "Live tracked" : "Illustrative"}
                </div>
              </div>
            );
          })}
          <p className="text-[11px] text-muted dark:text-mutedDark mt-4 pt-4 border-t border-border dark:border-borderDark">
            Kenya&apos;s figure is derived from Hali&apos;s tracked pump price.
            Every other country is a clearly-labelled illustrative estimate
            until Hali tracks it live.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
