"use client";

import { useEffect } from "react";

/**
 * Marks every [data-reveal] element with data-shown the first time it enters
 * the viewport; CSS does the rest. Content only hides once this observer is
 * running (html[data-observing]), so without JavaScript everything is visible,
 * and with reduced motion nothing is hidden at all.
 */
export function RevealObserver() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const html = document.documentElement;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const elements = document.querySelectorAll("[data-reveal]:not([data-shown])");
    // Anything already on screen is shown immediately, so nothing blinks out.
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) element.setAttribute("data-shown", "");
      else observer.observe(element);
    }
    html.setAttribute("data-observing", "");

    return () => {
      observer.disconnect();
      html.removeAttribute("data-observing");
    };
  }, []);

  return null;
}
