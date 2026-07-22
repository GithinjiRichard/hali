import Link from "next/link";
import { ShieldCheck, Info, TriangleAlert, ArrowRight } from "lucide-react";
import { getCountryProfiles } from "@/lib/data";
import type { CountryProfile } from "@/lib/data";

const TIER_BADGE: Record<
  CountryProfile["confidence"],
  { label: string; icon: typeof ShieldCheck; className: string }
> = {
  official: {
    label: "Official",
    icon: ShieldCheck,
    className: "bg-primary/10 text-primary dark:bg-primaryDark/10 dark:text-primaryDark",
  },
  reported: {
    label: "Reported",
    icon: Info,
    className: "bg-accent/10 text-accent dark:bg-accentDark/10 dark:text-accentDark",
  },
  modeled: {
    label: "Modeled",
    icon: TriangleAlert,
    className: "bg-danger/10 text-danger dark:bg-dangerDark/10 dark:text-dangerDark",
  },
};

export const dynamic = "force-dynamic";

export default function CountriesIndexPage() {
  const countries = getCountryProfiles();
  const byRegion = countries.reduce<Record<string, CountryProfile[]>>((acc, c) => {
    (acc[c.region] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink dark:text-inkDark mb-2">
          Tracked countries
        </h1>
        <p className="text-muted dark:text-mutedDark max-w-xl leading-relaxed">
          Every country Hali has real, sourced data for — plus what kind of
          data it is. Not every country can support the same depth honestly,
          so each one is labeled by how solid its number actually is,
          instead of pretending they&apos;re all equally certain.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8 text-xs">
        {(Object.keys(TIER_BADGE) as CountryProfile["confidence"][]).map((k) => {
          const b = TIER_BADGE[k];
          const Icon = b.icon;
          return (
            <span
              key={k}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${b.className}`}
            >
              <Icon size={12} />
              {b.label}
            </span>
          );
        })}
      </div>

      {Object.entries(byRegion).map(([region, list]) => (
        <div key={region} className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-mutedDark mb-3">
            {region}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map((c) => {
              const badge = TIER_BADGE[c.confidence];
              const Icon = badge.icon;
              return (
                <Link
                  key={c.code}
                  href={c.code === "KE" ? "/dashboard" : `/countries/${c.code.toLowerCase()}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-4 card-hover"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <span>
                      <span className="block font-medium text-ink dark:text-inkDark">
                        {c.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${badge.className}`}
                      >
                        <Icon size={10} />
                        {badge.label} · Tier {c.tier}
                      </span>
                    </span>
                  </span>
                  <ArrowRight size={15} className="text-muted dark:text-mutedDark shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-muted dark:text-mutedDark mt-4">
        Don&apos;t see your country? It&apos;s not tracked yet — this list
        grows one honestly-sourced country at a time, not all at once.
      </p>
    </div>
  );
}
