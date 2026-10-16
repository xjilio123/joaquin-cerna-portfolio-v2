"use client";

import type { MouseEvent } from "react";
import type { Lang } from "@/content/types";
import { tr } from "@/lib/i18n";
import { switchMode, useMode } from "./use-theme-state";

/**
 * Light/dark switch. The new mode is revealed as a circle growing out of the
 * button: the browser snapshots the old page, the attribute flips, and the new
 * page is clipped open over it. Without view-transition support, or with
 * reduced motion requested, the mode simply changes.
 */
export function ModeToggle({ lang }: { lang: Lang }) {
  const mode = useMode();
  const next = mode === "light" ? "dark" : "light";

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    switchMode(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={tr(mode === "light" ? "theme.toDark" : "theme.toLight", lang)}
      className="relative grid size-10 place-items-center rounded-full text-fg transition-colors hover:bg-surface-2"
    >
      {/* Moon: shown in dark mode */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="absolute size-[18px] transition-all duration-500 ease-out-expo in-data-[theme=light]:-rotate-90 in-data-[theme=light]:scale-50 in-data-[theme=light]:opacity-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
      </svg>
      {/* Sun: shown in light mode */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="absolute size-[18px] rotate-90 scale-50 opacity-0 transition-all duration-500 ease-out-expo in-data-[theme=light]:rotate-0 in-data-[theme=light]:scale-100 in-data-[theme=light]:opacity-100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
    </button>
  );
}
