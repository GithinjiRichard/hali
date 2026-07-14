"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Activity } from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trends", label: "Trends" },
  { href: "/insights", label: "Insights" },
  { href: "/news", label: "News" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border dark:border-borderDark bg-surface/90 dark:bg-surfaceDark/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-primaryDark/10 text-primary dark:text-primaryDark border border-primary/20 dark:border-primaryDark/20 font-display font-semibold text-base group-hover:bg-primary/20 dark:group-hover:bg-primaryDark/20 transition-colors">
              H
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold text-base tracking-tight text-gray-900 dark:text-gray-100">
                Hali
              </span>
              <span className="text-[11px] text-muted dark:text-mutedDark font-mono-data tracking-wide">
                EAST AFRICA · FUEL PRICES
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
                      ? "text-primary dark:text-primaryDark bg-primary/10 dark:bg-primaryDark/10"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-surfaceLight dark:hover:bg-surfaceLightDark"
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
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
                className="px-2 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b border-border dark:border-borderDark last:border-b-0"
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
