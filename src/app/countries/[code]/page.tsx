import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Fuel, Info } from "lucide-react";
import { getCountryByCode, getBudgetShare } from "@/lib/data";

export default async function CountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const country = getCountryByCode(code);

  if (!country || country.status !== "live") {
    notFound();
  }

  const budget = getBudgetShare().find((b) => b.code === country.code);
  const isDeregulated = country.priceModel === "deregulated";

  const priceRows = [
    { label: "Super Petrol", value: country.petrolPrice, icon: Fuel },
    { label: "Diesel", value: country.dieselPrice, icon: Fuel },
    ...(country.kerosenePrice !== undefined
      ? [{ label: "Kerosene", value: country.kerosenePrice, icon: Fuel }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Link
        href="/#global"
        className="inline-flex items-center gap-1.5 text-sm text-muted dark:text-mutedDark hover:text-ink dark:hover:text-inkDark transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to the East Africa map
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{country.flag}</span>
        <div>
          <h1 className="font-display font-bold text-3xl text-ink dark:text-inkDark">
            {country.name}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold mt-1 px-2.5 py-1 rounded-full ${
              isDeregulated
                ? "bg-accent/10 text-accent dark:bg-accentDark/10 dark:text-accentDark"
                : "bg-primary/10 text-primary dark:bg-primaryDark/10 dark:text-primaryDark"
            }`}
          >
            {isDeregulated ? "Live · Deregulated market" : "Live · Regulated pricing"}
          </span>
        </div>
      </div>

      <p className="text-muted dark:text-mutedDark leading-relaxed mb-8 max-w-xl">
        {isDeregulated
          ? `${country.name}'s fuel market is deregulated — dealers set their own pump prices, so there's no single official price ceiling the way Kenya or Tanzania publish one. The figures below are the best available indicative reference.`
          : `${country.name} regulates fuel prices with an official monthly (or similar) cap, the same broad model Kenya uses.`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {priceRows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-5"
            >
              <div className="flex items-center gap-2 text-muted dark:text-mutedDark text-xs font-semibold uppercase tracking-wider mb-2">
                <Icon size={13} />
                {row.label}
              </div>
              <div className="font-mono-data font-bold text-2xl text-ink dark:text-inkDark">
                {row.value !== undefined ? row.value.toFixed(2) : "—"}
              </div>
              <div className="text-xs text-muted dark:text-mutedDark mt-1">
                {country.currency} / litre
              </div>
            </div>
          );
        })}
      </div>

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
