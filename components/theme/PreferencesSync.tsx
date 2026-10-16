"use client";

import { useLayoutEffect } from "react";
import { applyStoredPreferences } from "@/lib/preferences";
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
  }, []);
  return null;
}
