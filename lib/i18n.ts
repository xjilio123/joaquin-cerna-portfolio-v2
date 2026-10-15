import type { Lang, LocalizedString } from "@/content/types";

export const LOCALES = ["es", "en"] as const satisfies readonly Lang[];
export const DEFAULT_LOCALE: Lang = "es";

export const isLocale = (value: unknown): value is Lang =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** Picks the visitor's language from any bilingual content entry. */
export const t = (value: LocalizedString, lang: Lang) => value[lang];

/**
 * Interface copy: labels, actions and aria-labels. Page content (bio, roles,
 * credentials) lives in /content. Typing every entry as LocalizedString makes
 * a missing translation a compile error.
 */
export const ui = {
  "a11y.skip": { es: "Saltar al contenido", en: "Skip to content" },
  "a11y.mainNav": { es: "Navegación principal", en: "Main navigation" },
  "a11y.preferences": { es: "Preferencias de la página", en: "Page preferences" },

  "nav.home": { es: "Inicio", en: "Home" },
  "nav.about": { es: "Perfil", en: "About" },
  "nav.skills": { es: "Habilidades", en: "Skills" },
  "nav.experience": { es: "Experiencia", en: "Experience" },
  "nav.certifications": { es: "Certificaciones", en: "Certifications" },
  "nav.projects": { es: "Proyectos", en: "Projects" },
  "nav.cv": { es: "CV", en: "CV" },
  "nav.contact": { es: "Contacto", en: "Contact" },

  "theme.language": { es: "Cambiar idioma", en: "Change language" },
  "theme.toLight": { es: "Activar modo claro", en: "Switch to light mode" },
  "theme.toDark": { es: "Activar modo oscuro", en: "Switch to dark mode" },
  "theme.accent": { es: "Color de acento", en: "Accent colour" },
  "theme.accent.cobalt": { es: "Azul cobalto", en: "Cobalt blue" },
  "theme.accent.violet": { es: "Violeta", en: "Violet" },
  "theme.accent.crimson": { es: "Carmesí", en: "Crimson" },
  "theme.accent.emerald": { es: "Esmeralda", en: "Emerald" },
  "theme.accent.graphite": { es: "Grafito", en: "Graphite" },

  "hero.eyebrow": { es: "Data Analytics · BI · Lima", en: "Data Analytics · BI · Lima" },
  "hero.downloadCv": { es: "Descargar CV", en: "Download CV" },
  "hero.viewProjects": { es: "Ver proyectos", en: "View projects" },

  "section.building": {
    es: "Esta sección se construye en la fase 3 del rediseño.",
    en: "This section is built in phase 3 of the redesign.",
  },

  "footer.rights": { es: "Todos los derechos reservados.", en: "All rights reserved." },
} satisfies Record<string, LocalizedString>;

export type UiKey = keyof typeof ui;

export const tr = (key: UiKey, lang: Lang) => ui[key][lang];

/** The page's sections, in scroll order. Drives the nav and the anchors. */
export const SECTIONS = [
  { id: "about", label: "nav.about" },
  { id: "skills", label: "nav.skills" },
  { id: "experience", label: "nav.experience" },
  { id: "certifications", label: "nav.certifications" },
  { id: "projects", label: "nav.projects" },
  { id: "cv", label: "nav.cv" },
  { id: "contact", label: "nav.contact" },
] as const satisfies readonly { id: string; label: UiKey }[];
