import type Lenis from "lenis";

/**
 * The smooth-scroll instance, when one is running (desktop, motion allowed).
 * Anything that scrolls programmatically goes through scrollToId so it never
 * fights Lenis with a native smooth scroll.
 */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (instance) instance.scrollTo(target, { offset: id === "top" ? 0 : -16 });
  else target.scrollIntoView({ behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
}

/** Set before a language switch so the next page scrambles its text in. */
export const SCRAMBLE_FLAG = "jcr-scramble";

export function flagLanguageSwitch() {
  try {
    sessionStorage.setItem(SCRAMBLE_FLAG, "1");
  } catch {}
}
