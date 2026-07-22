import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Fuel, Info, ShieldCheck, TriangleAlert } from "lucide-react";
import { getCountryProfile, getCountryProfiles, getBudgetShare } from "@/lib/data";
import type { CountryProfile } from "@/lib/data";

const TIER_BADGE: Record<
  CountryProfile["confidence"],
  { label: string; icon: typeof ShieldCheck; className: string }
> = {
  official: {
    label: "Official source",
    icon: ShieldCheck,
    className: "bg-primary/10 text-primary dark:bg-primaryDark/10 dark:text-primaryDark",
  },
  reported: {
    label: "Reported, not official",
    icon: Info,
    className: "bg-accent/10 text-accent dark:bg-accentDark/10 dark:text-accentDark",
  },
  modeled: {
    label: "Modeled estimate",
    icon: TriangleAlert,
    className: "bg-danger/10 text-danger dark:bg-dangerDark/10 dark:text-dangerDark",
  },
};

export default async function CountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const country = getCountryProfile(code);

  if (!country) {
    notFound();
  }

  const badge = TIER_BADGE[country.confidence];
  const BadgeIcon = badge.icon;
  const budget = getBudgetShare().find((b) => b.code === country.code);
  const neighbors = country.neighbors
    .map((code) => getCountryProfiles().find((c) => c.code === code))
    .filter((c): c is CountryProfile => Boolean(c));

  const priceRows = [
    { label: "Super Petrol", value: country.petrolPrice },
    { label: "Diesel", value: country.dieselPrice },
    ...(country.kerosenePrice !== undefined
      ? [{ label: "Kerosene", value: country.kerosenePrice }]
      : []),
  ].filter((r) => r.value !== undefined);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Link
        href="/#global"
        className="inline-flex items-center gap-1.5 text-sm text-muted dark:text-mutedDark hover:text-ink dark:hover:text-inkDark transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to the map
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{country.flag}</span>
        <div>
          <h1 className="font-display font-bold text-3xl text-ink dark:text-inkDark">
            {country.name}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold mt-1 px-2.5 py-1 rounded-full ${badge.className}`}
          >
            <BadgeIcon size={12} />
            {badge.label} · Tier {country.tier}
          </span>
        </div>
      </div>

      {/* Tier 1: clean price cards */}
      {country.tier === 1 && (
        <>
          <p className="text-muted dark:text-mutedDark leading-relaxed mb-8 max-w-xl">
            {country.priceModel === "deregulated"
              ? `${country.name}'s fuel market is deregulated — dealers set their own pump prices, so there's no single official price ceiling the way a regulator publishes. The figure below is the best available reference.`
              : `${country.name} regulates fuel prices with an official periodic cap, the same broad model Kenya uses.`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {priceRows.map((row) => (
              <div
                key={row.label}
                className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5"
              >
                <div className="flex items-center gap-2 text-muted dark:text-mutedDark text-xs font-semibold uppercase tracking-wider mb-2">
                  <Fuel size={13} />
                  {row.label}
                </div>
                <div className="font-mono-data font-bold text-2xl text-ink dark:text-inkDark">
                  {row.value!.toFixed(2)}
                </div>
                <div className="text-xs text-muted dark:text-mutedDark mt-1">
                  {country.currency} / litre
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tier 2: reported figure + real range, confidence visible */}
      {country.tier === 2 && (
        <>
          <p className="text-muted dark:text-mutedDark leading-relaxed mb-8 max-w-xl">
            {country.name} has no single official pump price — the market is
            deregulated, and real prices vary by station and region. What
            follows is the best available reported figure, shown with the
            real range rather than false precision.
          </p>
          <div className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-6 mb-8">
            <div className="flex items-center gap-2 text-muted dark:text-mutedDark text-xs font-semibold uppercase tracking-wider mb-2">
              <Fuel size={13} />
              Petrol — reported reference price
            </div>
            <div className="font-mono-data font-bold text-3xl text-ink dark:text-inkDark">
              {country.petrolPrice?.toLocaleString()}{" "}
              <span className="text-base font-normal text-muted dark:text-mutedDark">
                {country.currency}/litre
              </span>
            </div>
            {country.rangeLow !== undefined && country.rangeHigh !== undefined && (
              <p className="text-sm text-muted dark:text-mutedDark mt-2">
                Real station prices this week ranged{" "}
                <span className="font-mono-data font-semibold text-ink dark:text-inkDark">
                  {country.rangeLow.toLocaleString()}–{country.rangeHigh.toLocaleString()}
                </span>{" "}
                {country.currency}/litre depending on location.
              </p>
            )}
          </div>
        </>
      )}

      {/* Tier 3: no price card — a modeled range with visible methodology */}
      {country.tier === 3 && (
        <>
          <p className="text-muted dark:text-mutedDark leading-relaxed mb-8 max-w-xl">
            {country.name} has no fuel price regulator and no single
            reliable current price to report. Rather than invent one, here
            is the real, dated range being reported on the ground, and how
            we think about it.
          </p>
          <div className="rounded-xl border-2 border-dashed border-danger/30 dark:border-dangerDark/30 bg-danger/5 dark:bg-dangerDark/5 p-6 mb-8">
            <div className="flex items-center gap-2 text-danger dark:text-dangerDark text-xs font-semibold uppercase tracking-wider mb-2">
              <TriangleAlert size={13} />
              Estimated range, not a measured price
            </div>
            {country.rangeLow !== undefined && country.rangeHigh !== undefined && (
              <div className="font-mono-data font-bold text-3xl text-ink dark:text-inkDark mb-1">
                {country.rangeLow.toLocaleString()}–{country.rangeHigh.toLocaleString()}{" "}
                <span className="text-base font-normal text-muted dark:text-mutedDark">
                  {country.currency}/litre
                </span>
              </div>
            )}
            {country.methodologyNote && (
              <p className="text-sm text-muted dark:text-mutedDark leading-relaxed mt-3">
                {country.methodologyNote}
              </p>
            )}
          </div>
        </>
      )}

      <div className="rounded-xl border border-border dark:border-borderDark bg-surfaceLight dark:bg-surfaceLightDark p-5 mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted dark:text-mutedDark mb-2">
          <Info size={13} />
          Source &amp; methodology
        </div>
        <p className="text-sm text-ink dark:text-inkDark mb-1">{country.sourceLabel}</p>
        <p className="text-xs text-muted dark:text-mutedDark">{country.effectiveLabel}</p>
      </div>

      {budget && (
        <div className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5 mb-8">
          <p className="text-sm text-ink dark:text-inkDark">
            An estimated{" "}
            <span className="font-mono-data font-semibold">{budget.sharePct.toFixed(1)}%</span>{" "}
            of an average monthly income in {country.name} goes toward fuel and
            transport — see how that compares across the region on the home page.
          </p>
        </div>
      )}

      {neighbors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-mutedDark mb-3">
            Nearby countries
          </h2>
          <div className="flex flex-wrap gap-2">
            {neighbors.map((n) => (
              <Link
                key={n.code}
                href={n.code === "KE" ? "/dashboard" : `/countries/${n.code.toLowerCase()}`}
                className="inline-flex items-center gap-2 rounded-full border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark px-3.5 py-2 text-sm text-ink dark:text-inkDark hover:border-accent dark:hover:border-accentDark transition-colors"
              >
                {n.flag} {n.name}
                <span className="text-[10px] text-muted dark:text-mutedDark">Tier {n.tier}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-ink dark:bg-surfaceDark p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-display font-semibold text-background dark:text-inkDark mb-1">
            Kenya has the deepest tracking so far
          </p>
          <p className="text-sm text-[#B8AFA1] dark:text-mutedDark">
            Full 24-month history, trend charts, and event annotations —{" "}
            {country.name}&apos;s equivalent is on the roadmap.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-accent dark:bg-accentDark px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
        >
          See Kenya&apos;s dashboard <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
