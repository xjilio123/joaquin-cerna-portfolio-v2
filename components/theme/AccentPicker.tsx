"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Lang } from "@/content/types";
import { tr } from "@/lib/i18n";
import { ACCENTS } from "@/lib/preferences";
import { switchAccent, useAccent } from "./use-theme-state";

/**
 * Accent colour picker: a dot showing the current accent that opens a row of
 * five swatches. Swatches paint from the same CSS variables as the page, so
 * each one shows the exact shade it will apply in the current mode.
 */
export function AccentPicker({ lang }: { lang: Lang }) {
  const accent = useAccent();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={tr("theme.accent", lang)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="grid size-10 place-items-center rounded-full transition-colors hover:bg-surface-2"
      >
        <span className="size-4 rounded-full bg-accent ring-2 ring-accent/30 ring-offset-2 ring-offset-surface" />
      </button>

      <div
        id={panelId}
        role="radiogroup"
        aria-label={tr("theme.accent", lang)}
        data-open={open || undefined}
        className="pointer-events-none absolute right-0 top-[calc(100%+12px)] flex origin-top-right scale-90 gap-2 rounded-full border border-line bg-surface/90 p-2 opacity-0 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 ease-out-expo data-open:pointer-events-auto data-open:scale-100 data-open:opacity-100"
      >
        {ACCENTS.map((name) => {
          const selected = accent === name;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={tr(`theme.accent.${name}`, lang)}
              title={tr(`theme.accent.${name}`, lang)}
              tabIndex={open ? 0 : -1}
              onClick={() => switchAccent(name)}
              className="grid size-10 place-items-center rounded-full transition-transform duration-300 ease-out-expo hover:scale-110"
            >
              <span
                className="size-6 rounded-full transition-shadow duration-300"
                style={{
                  background: `var(--a-${name})`,
                  boxShadow: selected ? `0 0 0 3px var(--surface), 0 0 0 5px var(--a-${name})` : "none",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
