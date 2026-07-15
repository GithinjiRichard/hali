"use client";

import { useState } from "react";
import { X, MapPin } from "lucide-react";

export default function CountryNotice() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-ink dark:bg-surfaceLightDark text-background dark:text-inkDark">
      <div className="mx-auto max-w-6xl px-5 py-2 flex items-center gap-3 text-xs">
        <MapPin size={13} className="text-accentDark shrink-0" />
        <p className="flex-1">
          <span className="font-semibold">🇰🇪 Showing Kenya today.</span>{" "}
          <span className="text-[#B8AFA1] dark:text-mutedDark">
            Live tracking for Uganda, Tanzania, Rwanda and the rest of East
            Africa is coming soon — see where each country stands in the map
            below.
          </span>
        </p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 text-[#B8AFA1] dark:text-mutedDark hover:text-background dark:hover:text-inkDark transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
