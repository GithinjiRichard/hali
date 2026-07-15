"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref to attach to an element and a boolean that flips to true
 * once the element scrolls into view. Used to drive the .reveal /
 * .reveal-visible fade-in-and-rise effect on the landing page without any
 * external animation library.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      });
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
