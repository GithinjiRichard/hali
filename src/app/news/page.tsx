import { Newspaper } from "lucide-react";
import NewsTimeline from "@/components/NewsTimeline";
import { getNewsEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function NewsPage() {
  const news = getNewsEvents();

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Newspaper size={20} className="text-accent" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            News &amp; Events
          </h1>
        </div>
        <p className="text-sm text-muted">
          Key market events and regulatory announcements affecting fuel
          prices in Kenya.
        </p>
      </div>

      {news.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted text-sm">
          No news events available yet.
        </div>
      ) : (
        <NewsTimeline events={news} />
      )}
    </div>
  );
}
