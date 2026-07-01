import { Sparkles } from "lucide-react";
import InsightCard from "@/components/InsightCard";
import { getInsights } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function InsightsPage() {
  const insights = getInsights();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-accent" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Market Insights
          </h1>
        </div>
        <p className="text-sm text-muted">
          AI-generated commentary on key drivers behind recent fuel price
          movements in Kenya.
        </p>
      </div>

      {insights.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted text-sm">
          No insights available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
