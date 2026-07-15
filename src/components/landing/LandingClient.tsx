"use client";

import { useCallback, useState } from "react";
import type {
  CurrentPrice,
  HistoryPoint,
  YearPoint,
  CommodityDetail,
  CommoditySlug,
  Story,
  BudgetShare,
  PerspectiveItem,
  PerspectiveKey,
} from "@/lib/types";
import type { CountrySnapshot } from "@/lib/data";
import Hero from "./Hero";
import StoriesGrid from "./StoriesGrid";
import ExploreSection from "./ExploreSection";
import EastAfricaMap from "./EastAfricaMap";
import BudgetImpact from "./BudgetImpact";
import PerspectiveTabs from "./PerspectiveTabs";
import NewsletterCTA from "./NewsletterCTA";
import Toast from "@/components/Toast";
import Reveal from "@/components/Reveal";
import LandingSubNav from "./LandingSubNav";

export default function LandingClient({
  prices,
  history,
  sinceIndependence,
  details,
  stories,
  countries,
  budgetShare,
  perspectives,
}: {
  prices: CurrentPrice[];
  history: HistoryPoint[];
  sinceIndependence: YearPoint[];
  details: Record<CommoditySlug, CommodityDetail>;
  stories: Story[];
  countries: CountrySnapshot[];
  budgetShare: BudgetShare[];
  perspectives: Record<PerspectiveKey, PerspectiveItem[]>;
}) {
  const [selected, setSelected] = useState<CommoditySlug>("petrol");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const selectAndScroll = useCallback((slug: CommoditySlug) => {
    setSelected(slug);
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const startPrice = sinceIndependence[0]?.price ?? 1;
  const endPrice = sinceIndependence[sinceIndependence.length - 1]?.price ?? 1;
  const multiple = endPrice / startPrice;

  return (
    <>
      <Hero
        prices={prices}
        sinceIndependenceMultiple={multiple}
        onSelectCommodity={selectAndScroll}
      />

      <LandingSubNav />

      <StoriesGrid stories={stories} onSelectCommodity={selectAndScroll} />

      <ExploreSection
        prices={prices}
        history={history}
        sinceIndependence={sinceIndependence}
        details={details}
        selected={selected}
        onSelect={setSelected}
      />

      <Reveal as="section" id="global" className="mx-auto max-w-6xl px-5 py-16 md:py-20 scroll-mt-28">
        <div className="mb-10">
          <div className="accent-line mb-4" />
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-2 text-ink dark:text-inkDark">
            Where this ripples across East Africa
          </h2>
          <p className="text-muted dark:text-mutedDark text-sm max-w-lg">
            Kenya is live today. Tap a marker to see where Hali is tracking
            now — and where it&apos;s headed next.
          </p>
        </div>
        <EastAfricaMap countries={countries} onTap={showToast} />
      </Reveal>

      <BudgetImpact data={budgetShare} />

      <PerspectiveTabs perspectives={perspectives} />

      <NewsletterCTA onSubscribe={showToast} />

      <Toast message={toast} />
    </>
  );
}
