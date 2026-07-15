"use client";

import type { MouseEvent } from "react";

const LINKS = [
  { href: "#stories", label: "Stories" },
  { href: "#explore", label: "Explore" },
  { href: "#global", label: "East Africa" },
  { href: "#impact", label: "Impact" },
];

export default function LandingSubNav() {
  function handleClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="sticky top-16 z-30 hidden md:block border-b border-border dark:border-borderDark bg-background/90 dark:bg-backgroundDark/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 h-11 flex items-center gap-7">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={(e) => handleClick(e, l.href)}
            className="text-xs font-medium text-muted dark:text-mutedDark hover:text-accent dark:hover:text-accentDark transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
