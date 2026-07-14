"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border dark:border-borderDark bg-surfaceLight dark:bg-surfaceLightDark text-gray-600 dark:text-mutedDark hover:text-gray-900 dark:hover:text-white hover:border-primary/40 transition-colors"
    >
      <Sun
        size={16}
        className={`absolute transition-all duration-200 ${
          isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <Moon
        size={16}
        className={`absolute transition-all duration-200 ${
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
        }`}
      />
    </button>
  );
}
