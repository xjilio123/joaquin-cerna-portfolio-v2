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

const canTransition = () =>
  typeof document.startViewTransition === "function" &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Runs `update` inside a view transition tagged with `kind` (html[data-vt]),
 * which selects its animation in globals.css. Returns null when the browser
 * cannot, or the visitor prefers no motion: the update then applies at once.
 */
function withTransition(kind: "mode" | "accent", update: () => void) {
  if (!canTransition()) {
    update();
    return null;
  }
  const root = document.documentElement;
  // Set inside the update, with the theme itself: one style pass instead of two.
  const transition = document.startViewTransition(() => {
    root.setAttribute("data-vt", kind);
    update();
  });
  transition.finished.finally(() => {
    if (root.getAttribute("data-vt") === kind) root.removeAttribute("data-vt");
  });
  return transition;
}

/**
 * Switches mode with the new one revealed as a circle growing from `origin`
 * (the button that was pressed, or the centre of the screen). The circle
 * starts fast and settles, so the click answers immediately.
 */
export function switchMode(next: Mode, origin?: { x: number; y: number }) {
  const transition = withTransition("mode", () => applyMode(next));
  if (!transition) return;

  const x = origin?.x ?? innerWidth / 2;
  const y = origin?.y ?? innerHeight / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}

/** Changes the accent with a short crossfade of the whole page. */
export function switchAccent(accent: Accent) {
  if (document.documentElement.getAttribute("data-accent") === accent) return;
  withTransition("accent", () => applyAccent(accent));
}

export const currentMode = (): Mode =>
  document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";

export function applyAccent(accent: Accent) {
  document.documentElement.setAttribute("data-accent", accent);
  persistPreference(ACCENT_STORAGE_KEY, accent);
}
