import {
  getCurrentPrices,
  getPriceHistory,
  getCommodityDetail,
  getStories,
  getEastAfricaSnapshot,
  getBudgetShare,
  getPerspectives,
  getSinceIndependenceSeries,
  getHistoricalEvents,
} from "@/lib/data";
import type { CommoditySlug, CommodityDetail } from "@/lib/types";
import LandingClient from "@/components/landing/LandingClient";

export default function HomePage() {
  const prices = getCurrentPrices();
  const history = getPriceHistory();
  const stories = getStories();
  const countries = getEastAfricaSnapshot();
  const budgetShare = getBudgetShare();
  const perspectives = getPerspectives();
  const sinceIndependence = getSinceIndependenceSeries();
  const historicalEvents = getHistoricalEvents();

  const slugs: CommoditySlug[] = ["petrol", "diesel", "kerosene"];
  const details = slugs.reduce((acc, slug) => {
    acc[slug] = getCommodityDetail(slug);
    return acc;
  }, {} as Record<CommoditySlug, CommodityDetail>);

  return (
    <LandingClient
      prices={prices}
      history={history}
      sinceIndependence={sinceIndependence}
      historicalEvents={historicalEvents}
      details={details}
      stories={stories}
      countries={countries}
      budgetShare={budgetShare}
      perspectives={perspectives}
    />
  );
}
