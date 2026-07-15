"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Reveal from "@/components/Reveal";

export default function NewsletterCTA({
  onSubscribe,
}: {
  onSubscribe: (msg: string) => void;
}) {
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      onSubscribe("Welcome aboard! Check your inbox for the first briefing.");
      setEmail("");
    } else {
      onSubscribe("Please enter a valid email address");
    }
  }

  return (
    <Reveal as="section" className="mx-auto max-w-6xl px-5 pb-16 md:pb-20">
      <div className="bg-ink dark:bg-surfaceDark rounded-2xl p-8 md:p-14 text-center relative overflow-hidden border border-transparent dark:border-borderDark">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #B8860B 0%, transparent 50%), radial-gradient(circle at 80% 50%, #B8860B 0%, transparent 50%)",
          }}
        />
        <div className="relative">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-background dark:text-inkDark mb-3">
            Stay ahead of what matters
          </h2>
          <p className="text-[#B8AFA1] dark:text-mutedDark text-sm mb-8 max-w-md mx-auto">
            Weekly briefings that connect fuel price movements to your daily
            life across East Africa. No jargon, no noise.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-sm text-background dark:text-inkDark placeholder:text-[#8A8177] focus:outline-none focus:border-accent dark:focus:border-accentDark transition-colors"
            />
            <button
              type="submit"
              className="bg-accent dark:bg-accentDark hover:opacity-90 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-opacity shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </Reveal>
  );
}
