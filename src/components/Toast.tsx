"use client";

import clsx from "clsx";

export default function Toast({ message }: { message: string | null }) {
  return (
    <div
      className={clsx(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] rounded-xl bg-ink dark:bg-surfaceLightDark text-background dark:text-inkDark px-5 py-3 text-sm font-medium shadow-lift transition-all duration-300",
        message
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
