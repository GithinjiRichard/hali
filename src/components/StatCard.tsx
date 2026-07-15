import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  accent?: "primary" | "danger" | "accent" | "muted";
}

const ACCENT_CLASSES: Record<string, string> = {
  primary: "text-primary bg-primary/10 border-primary/20",
  danger: "text-danger bg-danger/10 border-danger/20",
  accent: "text-accent bg-accent/10 border-accent/20",
  muted: "text-muted dark:text-mutedDark bg-muted/10 border-muted/20",
};

export default function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = "muted",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-4 flex items-center gap-4 shadow-card dark:shadow-cardDark">
      <div
        className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
          ACCENT_CLASSES[accent]
        )}
      >
        <Icon size={18} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-muted dark:text-mutedDark truncate">{label}</span>
        <span className="font-mono-data text-xl font-bold text-ink dark:text-inkDark truncate">
          {value}
        </span>
        {sublabel && (
          <span className="text-[11px] text-muted dark:text-mutedDark truncate mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
