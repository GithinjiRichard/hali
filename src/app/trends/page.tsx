import { getPriceHistory } from "@/lib/data";
import TrendsClient from "./TrendsClient";

export const dynamic = "force-dynamic";

export default function TrendsPage() {
  const history = getPriceHistory();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Historical Price Trends
        </h1>
        <p className="text-sm text-muted">
          Monthly Nairobi pump prices and month-over-month percentage changes
          across the last {history.length} months.
        </p>
      </div>

      <TrendsClient data={history} />
    </div>
  );
}
