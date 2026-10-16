"use client";

import { useSyncExternalStore } from "react";
import {
  ACCENT_STORAGE_KEY,
  MODE_STORAGE_KEY,
  isAccent,
  isMode,
  persistPreference,
  type Accent,
  type Mode,
} from "@/lib/preferences";

/**
 * The attributes on <html> are the single source of truth: the pre-paint script
 * writes them before React exists, and every control reads them back from the
 * DOM. On the server (and during hydration) the value is unknown, so controls
 * render a neutral state instead of guessing and mismatching.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-accent"],
  });
  return () => observer.disconnect();
}

const readMode = () => {
  const value = document.documentElement.getAttribute("data-theme");
  return isMode(value) ? value : null;
};

const readAccent = () => {
  const value = document.documentElement.getAttribute("data-accent");
  return isAccent(value) ? value : null;
};

const serverSnapshot = () => null;

export const useMode = (): Mode | null => useSyncExternalStore(subscribe, readMode, serverSnapshot);

export const useAccent = (): Accent | null =>
  useSyncExternalStore(subscribe, readAccent, serverSnapshot);

export function applyMode(mode: Mode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.style.colorScheme = mode;
  persistPreference(MODE_STORAGE_KEY, mode);
}

/**
 * Switches mode with the new one revealed as a circle growing from `origin`
 * (the button that was pressed, or the centre of the screen). Without
 * view-transition support, or with reduced motion requested, it just switches.
 */
export function switchMode(next: Mode, origin?: { x: number; y: number }) {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof document.startViewTransition !== "function" || reduceMotion) {
    applyMode(next);
    return;
  }

  const x = origin?.x ?? innerWidth / 2;
  const y = origin?.y ?? innerHeight / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const root = document.documentElement;
  root.setAttribute("data-switching", "");
  const transition = document.startViewTransition(() => applyMode(next));

  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});

  transition.finished.finally(() => root.removeAttribute("data-switching"));
}

export const currentMode = (): Mode =>
  document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";

export function applyAccent(accent: Accent) {
  document.documentElement.setAttribute("data-accent", accent);
  persistPreference(ACCENT_STORAGE_KEY, accent);
}
