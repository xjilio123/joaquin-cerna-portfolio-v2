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

/** The section the visitor is reading: the last one whose top has passed 30 % of the screen. */
function currentSectionId() {
  let current = "top";
  for (const section of document.querySelectorAll<HTMLElement>("main section[id]")) {
    if (section.getBoundingClientRect().top <= window.innerHeight * 0.3) current = section.id;
  }
  return current;
}

/**
 * Switches language with a full page load, deliberately. A client-side
 * navigation between /es and /en keeps the previous page alive but hidden
 * (React Activity): two copies of every section, a hidden WebGL canvas with a
 * lost context, duplicate ids — and view transitions that capture that
 * document can fail. A fresh load keeps exactly one page. The visitor lands
 * back on the section they were reading, and the text scrambles in.
 */
export function switchLanguage(target: "es" | "en") {
  const path = window.location.pathname.replace(/^\/(es|en)(?=\/|$)/, `/${target}`) || `/${target}`;
  const section = currentSectionId();
  flagLanguageSwitch();
  window.location.assign(path + (section === "top" ? "" : `#${section}`));
}
