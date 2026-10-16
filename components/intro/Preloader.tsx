"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "@/content/types";
import { tr } from "@/lib/i18n";
import { INTRO_STORAGE_KEY } from "@/lib/preferences";

const DURATION = 1400;

/**
 * First-visit curtain: a counter runs 000 → 100 while the fonts load, then the
 * curtain lifts and hands over to the hero entrance (by setting data-ready).
 * It plays once per session, never with reduced motion (the pre-paint script
 * marks the intro as done), and CSS removes it after 5 s whatever happens.
 * It is decorative, so it is hidden from assistive technology.
 */
export function Preloader({ lang }: { lang: Lang }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-intro") !== "pending") return;

    let frame = 0;
    let fontsReady = false;
    let leaveTimer: ReturnType<typeof setTimeout> | undefined;
    const start = performance.now();
    document.fonts?.ready.then(() => {
      fontsReady = true;
    });

    const finish = () => {
      try {
        sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      } catch {}
      rootRef.current?.setAttribute("data-leaving", "");
      html.setAttribute("data-ready", "");
      leaveTimer = setTimeout(() => html.setAttribute("data-intro", "done"), 950);
    };

    const tick = (now: number) => {
      let progress = Math.min(1, (now - start) / DURATION);
      // Hold at 90 % until the type is ready, so the hero never swaps fonts on reveal.
      if (!fontsReady) progress = Math.min(progress, 0.9);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (countRef.current) countRef.current.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`;
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="preloader fixed inset-0 z-[100] flex-col justify-between bg-bg px-5 py-6 sm:px-8 lg:px-16 lg:py-10"
    >
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-muted sm:text-sm">
        <span className="text-fg">JCR</span>
        <span>Portfolio · 2026</span>
      </div>

      <div className="flex items-end justify-between gap-6">
        <p className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-tight tracking-tight text-muted">
          {tr("intro.data", lang)} → <span className="text-fg">{tr("intro.decisions", lang)}</span>
        </p>
        <p className="font-display text-[clamp(5rem,18vw,15rem)] font-bold leading-[0.8] tracking-[-0.05em] text-fg tabular-nums">
          <span ref={countRef}>000</span>
          <span className="text-accent">%</span>
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-line">
        <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
    </div>
  );
}
