"use client";

import { useInView } from "@/hooks/useInView";
import clsx from "clsx";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  id?: string;
}

/**
 * Wraps a section in a scroll-triggered fade/rise reveal. Renders a real
 * <section> or <div> (not a dynamically-chosen component) so ref typing
 * stays simple and correct.
 */
export default function Reveal({ children, className = "", as = "div", id }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const cls = clsx("reveal", inView && "reveal-visible", className);

  if (as === "section") {
    return (
      <section ref={ref} id={id} className={cls}>
        {children}
      </section>
    );
  }
  return (
    <div ref={ref} id={id} className={cls}>
      {children}
    </div>
  );
}
