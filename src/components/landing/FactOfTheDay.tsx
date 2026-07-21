import { Sparkles } from "lucide-react";
import type { DailyFact } from "@/lib/types";

function formatWhen(fact: DailyFact) {
  if (fact.kind === "independence" && fact.year) return String(fact.year);
  if (fact.kind === "recent" && fact.period_date) {
    try {
      return new Date(fact.period_date).toLocaleDateString("en-KE", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export default function FactOfTheDay({ fact }: { fact: DailyFact }) {
  const when = formatWhen(fact);
  return (
    <div className="mx-auto max-w-6xl px-5 -mt-px">
      <div className="flex items-start gap-3 rounded-xl border border-accent/25 dark:border-accentDark/25 bg-accent/5 dark:bg-accentDark/10 px-5 py-4 my-6">
        <Sparkles size={16} className="text-accent dark:text-accentDark shrink-0 mt-0.5" />
        <p className="text-sm text-ink dark:text-inkDark leading-relaxed">
          <span className="font-semibold">Fact of the day</span>
          {when && <span className="text-muted dark:text-mutedDark"> · {when}</span>}
          {" — "}
          <span className="font-medium">{fact.title}.</span>{" "}
          <span className="text-muted dark:text-mutedDark">{fact.description}</span>
        </p>
      </div>
    </div>
  );
}
