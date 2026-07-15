"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  ShoppingCart,
  Bike,
  Flame,
  Home,
  Truck,
  Factory,
  TrendingUp,
  Fuel,
  Landmark,
  Coins,
  Scale,
  Globe2,
  User,
  Briefcase,
  Building2,
} from "lucide-react";
import type { PerspectiveItem, PerspectiveKey } from "@/lib/types";
import Reveal from "@/components/Reveal";

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  ShoppingCart,
  Bike,
  Flame,
  Home,
  Truck,
  Factory,
  TrendingUp,
  Fuel,
  Landmark,
  Coins,
  Scale,
  Globe2,
};

const TABS: { key: PerspectiveKey; label: string; icon: ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "citizen", label: "As a Commuter", icon: User },
  { key: "business", label: "As a Business", icon: Briefcase },
  { key: "government", label: "As Government", icon: Building2 },
];

export default function PerspectiveTabs({
  perspectives,
}: {
  perspectives: Record<PerspectiveKey, PerspectiveItem[]>;
}) {
  const [tab, setTab] = useState<PerspectiveKey>("citizen");
  const items = perspectives[tab];

  return (
    <Reveal as="section" id="impact" className="mx-auto max-w-6xl px-5 py-16 md:py-20 scroll-mt-28">
      <div className="text-center mb-10">
        <div className="accent-line mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-2 text-ink dark:text-inkDark">
          What does this mean for you?
        </h2>
        <p className="text-muted dark:text-mutedDark text-sm">
          Same data, different implications depending on who you are
        </p>
      </div>
      <div className="flex gap-2 justify-center mb-8 flex-wrap">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? "bg-ink dark:bg-accentDark text-white"
                  : "text-muted dark:text-mutedDark hover:bg-surfaceLight dark:hover:bg-surfaceLightDark"
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Fuel;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark p-7 card-hover animate-fade-slide-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 dark:bg-accentDark/10 flex items-center justify-center mb-4">
                <Icon size={18} className="text-accent dark:text-accentDark" />
              </div>
              <h4 className="font-semibold text-base mb-2 text-ink dark:text-inkDark">
                {item.title}
              </h4>
              <p className="text-muted dark:text-mutedDark text-sm leading-relaxed">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
