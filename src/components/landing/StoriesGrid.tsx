"use client";

import { ArrowRight } from "lucide-react";
import type { Story, CommoditySlug } from "@/lib/types";
import Reveal from "@/components/Reveal";

export default function StoriesGrid({
  stories,
  onSelectCommodity,
}: {
  stories: Story[];
  onSelectCommodity: (slug: CommoditySlug) => void;
}) {
  return (
    <Reveal as="section" id="stories" className="mx-auto max-w-6xl px-5 py-16 md:py-20 scroll-mt-28">
      <div className="mb-8">
        <div className="accent-line mb-4" />
        <h2 className="font-display font-bold text-2xl md:text-3xl text-ink dark:text-inkDark">
          What&apos;s happening now
        </h2>
        <p className="text-muted dark:text-mutedDark text-sm mt-1">
          Fuel stories that affect your life, explained simply
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.map((s) => (
          <article
            key={s.id}
            className={`card-hover rounded-2xl border border-border dark:border-borderDark bg-surface dark:bg-surfaceDark overflow-hidden ${
              s.big ? "md:col-span-2 grid grid-cols-1 md:grid-cols-2" : ""
            }`}
          >
            <div
              className={`bg-surfaceLight dark:bg-surfaceLightDark overflow-hidden ${
                s.big ? "aspect-[16/10] md:aspect-auto" : "aspect-[16/9]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://picsum.photos/seed/${s.imgSeed}/800/500`}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className={s.big ? "p-6 md:p-8 flex flex-col justify-center" : "p-5"}>
              <div className="flex flex-wrap gap-2 mb-3">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-surfaceLight dark:bg-surfaceLightDark text-muted dark:text-mutedDark"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h3
                className={`font-display font-bold leading-snug mb-2 text-ink dark:text-inkDark ${
                  s.big ? "text-xl md:text-2xl" : "text-lg"
                }`}
              >
                {s.title}
              </h3>
              <p className="text-muted dark:text-mutedDark text-sm leading-relaxed mb-4">
                {s.excerpt}
              </p>
              <button
                onClick={() => onSelectCommodity(s.commodity)}
                className="text-accent dark:text-accentDark font-semibold text-sm inline-flex items-center gap-2 hover:gap-3 transition-all self-start"
              >
                See the data <ArrowRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </Reveal>
  );
}
