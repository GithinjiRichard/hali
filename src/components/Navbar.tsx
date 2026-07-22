"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Activity } from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "./ThemeToggle";
import { HaliMark } from "./HaliLogo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trends", label: "Trends" },
  { href: "/insights", label: "Insights" },
  { href: "/news", label: "News" },
  { href: "/countries", label: "Countries" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border dark:border-borderDark bg-surface/90 dark:bg-surfaceDark/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <HaliMark size={34} className="transition-transform group-hover:scale-105" />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-base tracking-tight text-ink dark:text-inkDark">
                Hali
              </span>
              <span className="text-[10px] uppercase text-muted dark:text-mutedDark font-mono-data tracking-wide">
                East Africa · Fuel Prices
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-accent dark:text-accentDark bg-accent/10 dark:bg-accentDark/10"
                      : "text-muted dark:text-mutedDark hover:text-ink dark:hover:text-inkDark hover:bg-surfaceLight dark:hover:bg-surfaceLightDark"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted dark:text-mutedDark font-mono-data">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-primaryDark opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-primaryDark" />
              </span>
              <span className="flex items-center gap-1">
                <Activity size={12} />
                Kenya Live
              </span>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 text-muted dark:text-mutedDark hover:text-ink dark:hover:text-inkDark"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border dark:border-borderDark bg-surface dark:bg-surfaceDark">
          <nav className="flex flex-col px-4 py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-2 py-3 text-sm font-medium text-muted dark:text-mutedDark hover:text-ink dark:hover:text-inkDark border-b border-border dark:border-borderDark last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
