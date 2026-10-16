"use client";

import { useLayoutEffect } from "react";
import { applyStoredPreferences, isReload } from "@/lib/preferences";
import { markPageMounted } from "./use-theme-state";

/**
 * Re-applies the visitor's mode and accent when the root layout mounts.
 * The pre-paint script covers the first load; this covers client navigations
 * between /es and /en, where React recreates <html> without those attributes.
 */
export function PreferencesSync() {
  useLayoutEffect(() => {
    applyStoredPreferences();
    markPageMounted();
    // The pre-paint script already turned off scroll restoration on a refresh; this makes sure.
    if (isReload()) window.scrollTo(0, 0);
  }, []);
  return null;
}
