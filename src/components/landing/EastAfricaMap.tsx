"use client";

import { useState } from "react";
import Link from "next/link";
import type { CountrySnapshot } from "@/lib/data";

// Approximate, stylized positions (not cartographically precise — same
// spirit as most illustrative "pressure point" maps: enough to place each
// country sensibly relative to its neighbors without claiming to be a
// real atlas). Percent-based so it reflows responsively.
const POSITIONS: Record<string, { top: string; left: string }> = {
  KE: { top: "42%", left: "58%" },
  UG: { top: "38%", left: "42%" },
  TZ: { top: "64%", left: "50%" },
  RW: { top: "46%", left: "32%" },
  BI: { top: "54%", left: "32%" },
  SS: { top: "16%", left: "48%" },
  CD: { top: "44%", left: "16%" },
  SO: { top: "30%", left: "80%" },
};

export default function EastAfricaMap({
  countries,
  onTap,
}: {
  countries: CountrySnapshot[];
  onTap: (message: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="bg-surface dark:bg-surfaceDark rounded-2xl border border-border dark:border-borderDark p-4 md:p-8 relative overflow-hidden" style={{ minHeight: 380 }}>
      {/* Abstract East Africa blob — decorative, not a precise map */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.08]" preserveAspectRatio="xMidYMid slice">
        <path
          d="M150,60 Q210,40 250,70 Q290,60 310,100 Q340,130 320,170 Q340,210 310,250 Q300,300 250,320 Q220,360 170,340 Q120,360 100,310 Q60,290 70,240 Q40,200 70,160 Q60,110 110,90 Q120,60 150,60Z"
          className="fill-ink dark:fill-inkDark"
        />
      </svg>

      {countries.map((c) => {
        const pos = POSITIONS[c.code];
        if (!pos) return null;
        const color = c.status === "live" ? "#1B7A3D" : "#B8860B";
        const label =
          c.status === "live"
            ? `${c.name}: ${c.currency} ${c.petrolPrice?.toFixed(2)}/litre${
                c.priceModel === "deregulated" ? " (indicative, dealer prices vary)" : " — live"
              }`
            : `${c.name}: coming soon`;
        const href =
          c.status === "live" ? (c.code === "KE" ? "/dashboard" : `/countries/${c.code.toLowerCase()}`) : undefined;

        const marker = (
          <>
            <span className="relative flex h-3.5 w-3.5">
              <span
                className="hotspot-ping absolute inline-flex h-full w-full rounded-full"
                style={{ backgroundColor: color, opacity: 0.4 }}
              />
              <span
                className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white dark:border-surfaceDark"
                style={{ backgroundColor: color }}
              />
            </span>
            <span
              className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-ink dark:bg-surfaceLightDark text-background dark:text-inkDark text-[11px] font-medium px-3 py-1.5 transition-all ${
                hovered === c.code ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              }`}
            >
              {c.flag} {label}
            </span>
          </>
        );

        if (href) {
          return (
            <Link
              key={c.code}
              href={href}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
              style={{ top: pos.top, left: pos.left }}
              onMouseEnter={() => setHovered(c.code)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`${label} — view details`}
            >
              {marker}
            </Link>
          );
        }

        return (
          <button
            key={c.code}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
            style={{ top: pos.top, left: pos.left }}
            onMouseEnter={() => setHovered(c.code)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onTap(label)}
            aria-label={label}
          >
            {marker}
          </button>
        );
      })}

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-muted dark:text-mutedDark">
          Tap a live marker to open that country
        </span>
        <div className="flex gap-4 text-[11px] text-muted dark:text-mutedDark font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary dark:bg-primaryDark" />
            Live
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent dark:bg-accentDark" />
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
