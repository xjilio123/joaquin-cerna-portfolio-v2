/**
 * Visitor preferences for the two theme axes.
 *
 * Kept free of React so the pre-paint script, the client controls and the
 * metadata can all share one source of truth.
 */

export const MODES = ["dark", "light"] as const;
export type Mode = (typeof MODES)[number];

export const ACCENTS = ["cobalt", "violet", "crimson", "emerald", "graphite"] as const;
export type Accent = (typeof ACCENTS)[number];

export const DEFAULT_ACCENT: Accent = "cobalt";

export const MODE_STORAGE_KEY = "jcr-mode";
export const ACCENT_STORAGE_KEY = "jcr-accent";

export const isMode = (value: unknown): value is Mode =>
  typeof value === "string" && (MODES as readonly string[]).includes(value);

export const isAccent = (value: unknown): value is Accent =>
  typeof value === "string" && (ACCENTS as readonly string[]).includes(value);

export function persistPreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the choice still applies for this visit.
  }
}

/**
 * Writes the stored (or OS-preferred) mode and accent onto <html>.
 *
 * Serialised into PREPAINT_SCRIPT so it runs in <head> before the first paint,
 * and also called by <PreferencesSync> whenever the root layout remounts —
 * switching language swaps the root layout and React resets <html>'s
 * attributes, which would otherwise drop the visitor's choice.
 */
export function applyStoredPreferences() {
  try {
    const root = document.documentElement;
    let mode = localStorage.getItem(MODE_STORAGE_KEY);
    if (mode !== "dark" && mode !== "light") {
      mode = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    root.setAttribute("data-theme", mode);
    root.style.colorScheme = mode;

    let accent = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (!accent || ACCENTS.indexOf(accent as Accent) < 0) accent = DEFAULT_ACCENT;
    root.setAttribute("data-accent", accent);
  } catch {
    // Storage unavailable: the CSS defaults (OS mode, cobalt accent) apply.
  }
  applyIntroState();
}

/**
 * Intro state on <html>:
 *   data-intro="pending"  the preloader is about to play (first visit this session)
 *   data-intro="done"     it already played, or reduced motion is on
 *   data-ready            the page may run its entrance animations
 * Without JavaScript none of these exist and every element is simply visible.
 */
export const INTRO_STORAGE_KEY = "jcr-intro";

export function applyIntroState() {
  const root = document.documentElement;
  let seen = false;
  try {
    seen = sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
  } catch {}
  if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.setAttribute("data-intro", "done");
    root.setAttribute("data-ready", "");
  } else {
    root.setAttribute("data-intro", "pending");
  }
}

/** The same logic as applyStoredPreferences, as a string for <head>. Keep in sync. */
export const PREPAINT_SCRIPT = `(function(){var d=document.documentElement;try{var m=localStorage.getItem(${JSON.stringify(
  MODE_STORAGE_KEY,
)});if(m!=="dark"&&m!=="light"){m=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}d.setAttribute("data-theme",m);d.style.colorScheme=m;var a=localStorage.getItem(${JSON.stringify(
  ACCENT_STORAGE_KEY,
)});if(${JSON.stringify(ACCENTS)}.indexOf(a)<0){a=${JSON.stringify(
  DEFAULT_ACCENT,
)}}d.setAttribute("data-accent",a)}catch(e){}var s=false;try{s=sessionStorage.getItem(${JSON.stringify(
  INTRO_STORAGE_KEY,
)})==="1"}catch(e){}if(s||matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-intro","done");d.setAttribute("data-ready","")}else{d.setAttribute("data-intro","pending")}})();`;
