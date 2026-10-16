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
  "nav.process": { es: "Método", en: "Process" },
  "nav.experience": { es: "Experiencia", en: "Experience" },
  "nav.certifications": { es: "Certificaciones", en: "Certifications" },
  "nav.sql": { es: "Consola", en: "Console" },
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

  "nav.openMenu": { es: "Abrir menú", en: "Open menu" },
  "nav.closeMenu": { es: "Cerrar menú", en: "Close menu" },
  "nav.menu": { es: "Menú", en: "Menu" },
  "nav.search": { es: "Buscar", en: "Search" },

  "intro.data": { es: "Datos", en: "Data" },
  "intro.decisions": { es: "decisiones", en: "decisions" },

  "hero.eyebrow": { es: "Data Analytics · BI · IA", en: "Data Analytics · BI · AI" },
  "hero.downloadCv": { es: "Descargar CV", en: "Download CV" },
  "hero.viewProjects": { es: "Ver proyectos", en: "View projects" },
  "hero.sorting": { es: "Datos ordenados", en: "Data sorted" },
  "hero.scrollHint": { es: "Desliza para ordenarlos", en: "Scroll to sort them" },
  "hero.chartAlt": {
    es: "Gráfico animado: puntos dispersos que se ordenan en una línea ascendente con los hitos de mi trayectoria.",
    en: "Animated chart: scattered points that settle into a rising line marking the milestones of my career.",
  },
  "hero.localTime": { es: "Hora local en Lima", en: "Local time in Lima" },

  "cmd.open": { es: "Abrir paleta de comandos", en: "Open command palette" },
  "cmd.title": { es: "Paleta de comandos", en: "Command palette" },
  "cmd.placeholder": { es: "Escribe un comando o una sección…", en: "Type a command or a section…" },
  "cmd.empty": { es: "Sin resultados", en: "No results" },
  "cmd.group.navigate": { es: "Ir a", en: "Go to" },
  "cmd.group.preferences": { es: "Preferencias", en: "Preferences" },
  "cmd.group.actions": { es: "Acciones", en: "Actions" },
  "cmd.top": { es: "Inicio", en: "Top" },
  "cmd.toLanguage": { es: "Cambiar a inglés", en: "Switch to Spanish" },
  "cmd.accent": { es: "Color", en: "Colour" },
  "cmd.copyEmail": { es: "Copiar correo", en: "Copy email" },
  "cmd.copied": { es: "Correo copiado", en: "Email copied" },
  "cmd.linkedin": { es: "Abrir LinkedIn", en: "Open LinkedIn" },
  "cmd.hintNavigate": { es: "navegar", en: "navigate" },
  "cmd.hintSelect": { es: "elegir", en: "select" },
  "cmd.hintClose": { es: "cerrar", en: "close" },

  "about.title": { es: "Quién está detrás de los datos", en: "Who is behind the data" },
  "about.portraitAlt": { es: "Retrato de Joaquín Cerna Rojas", en: "Portrait of Joaquín Cerna Rojas" },
  "about.education": { es: "Formación", en: "Education" },
  "about.based": { es: "Desde Lima, Perú", en: "Based in Lima, Peru" },

  "skills.title": { es: "Las herramientas del oficio", en: "The tools of the trade" },
  "skills.intro": {
    es: "Cuatro herramientas cargan con la mayor parte del trabajo. El resto sostiene el proceso alrededor de ellas.",
    en: "Four tools carry most of the work. The rest support the process around them.",
  },
  "skills.core": { es: "Herramientas principales", en: "Core tools" },

  "experience.title": { es: "Dónde he trabajado", en: "Where I have worked" },
  "experience.intro": {
    es: "De soporte y QA a datos e IA: cada puesto sumó una pieza del proceso.",
    en: "From support and QA to data and AI: each role added a piece of the process.",
  },
  "experience.current": { es: "Actual", en: "Current" },

  "process.title": { es: "De datos sucios a una decisión", en: "From messy data to a decision" },
  "process.intro": {
    es: "Así trabajo un caso de punta a punta. Los datos de esta sección son de ejemplo.",
    en: "How I take a case from end to end. The data in this section is sample data.",
  },
  "process.sample": { es: "Datos de ejemplo", en: "Sample data" },
  "sql.title": { es: "Consulta mi perfil", en: "Query my profile" },
  "sql.intro": {
    es: "Mi experiencia, certificados y habilidades cargados en una base de datos de solo lectura. Escribe SQL o usa una consulta sugerida.",
    en: "My experience, certificates and skills loaded into a read-only database. Write SQL or pick a suggested query.",
  },
  "certifications.title": { es: "Formación verificable", en: "Verifiable training" },
  "certifications.intro": {
    es: "Cada tarjeta abre el certificado original. Filtra por institución o por tema.",
    en: "Every card opens the original certificate. Filter by institution or by topic.",
  },
  "certifications.byIssuer": { es: "Institución", en: "Institution" },
  "certifications.byTopic": { es: "Tema", en: "Topic" },
  "certifications.all": { es: "Todas", en: "All" },
  "certifications.showing": { es: "Mostrando", en: "Showing" },
  "certifications.of": { es: "de", en: "of" },
  "certifications.open": { es: "Ver certificado", en: "View certificate" },
  "certifications.code": { es: "Código", en: "Code" },
  "certifications.featured": { es: "Destacado", en: "Flagship" },
  "certifications.close": { es: "Cerrar certificado", en: "Close certificate" },
  "certifications.prevPage": { es: "Página anterior", en: "Previous page" },
  "certifications.nextPage": { es: "Página siguiente", en: "Next page" },
  "certifications.page": { es: "Página", en: "Page" },
  "certifications.openPdf": { es: "Abrir PDF original", en: "Open original PDF" },
  "certifications.noScan": { es: "Sin escaneo disponible", en: "No scan available" },
  "certifications.noScanBody": {
    es: "Este certificado todavía no está digitalizado en el sitio. Puedo enviarlo a solicitud.",
    en: "This certificate is not digitised on the site yet. I can send it on request.",
  },
  "certifications.emptyTitle": { es: "Ningún resultado", en: "Nothing matches" },
  "certifications.emptyBody": {
    es: "No hay credenciales que combinen esos dos filtros. Prueba con uno solo.",
    en: "No credentials match both filters. Try just one of them.",
  },
  "certifications.reset": { es: "Quitar filtros", en: "Clear filters" },
  "certifications.scanAlt": { es: "Certificado escaneado:", en: "Scanned certificate:" },
  "certifications.issuers": { es: "instituciones", en: "institutions" },
  "certifications.credentials": { es: "credenciales", en: "credentials" },

  "projects.title": { es: "Proyectos", en: "Projects" },
  "projects.intro": {
    es: "Casos de estudio de análisis, ingeniería y ciencia de datos.",
    en: "Case studies across analytics, engineering and data science.",
  },
  "projects.emptyTitle": { es: "En construcción", en: "Under construction" },
  "projects.emptyBody": {
    es: "Estoy preparando casos de estudio con datos reales. Prefiero publicar pocos y bien documentados antes que ejemplos de relleno.",
    en: "I am preparing case studies built on real data. I would rather publish a few well-documented ones than filler examples.",
  },
  "projects.coming": { es: "Las categorías que tendrá", en: "The categories it will hold" },

  "cv.title": { es: "Currículum", en: "Résumé" },
  "cv.intro": {
    es: "Mi trayectoria en una hoja que puedes guardar, imprimir o compartir.",
    en: "My background on a single sheet you can save, print or share.",
  },
  "cv.download": { es: "Descargar CV", en: "Download CV" },
  "cv.openInTab": { es: "Abrir en pestaña nueva", en: "Open in a new tab" },
  "cv.pages": { es: "2 páginas · PDF", en: "2 pages · PDF" },
  "cv.previewAlt": { es: "Vista previa del CV, página", en: "CV preview, page" },
  "cv.noteRedacted": {
    es: "La versión pública omite el número de documento de identidad.",
    en: "The public version omits the national identity number.",
  },

  "contact.title": { es: "Hablemos", en: "Let’s talk" },
  "contact.intro": {
    es: "¿Un proyecto de datos, una colaboración o una pregunta sobre mi trabajo? Escríbeme.",
    en: "A data project, a collaboration or a question about my work? Write to me.",
  },
  "contact.email": { es: "Correo", en: "Email" },
  "contact.phone": { es: "Teléfono", en: "Phone" },
  "contact.location": { es: "Ubicación", en: "Location" },
  "contact.linkedin": { es: "LinkedIn", en: "LinkedIn" },
  "contact.copy": { es: "Copiar", en: "Copy" },
  "contact.copied": { es: "Copiado", en: "Copied" },
  "contact.reveal": { es: "Mostrar número", en: "Reveal number" },
  "contact.openLinkedin": { es: "Abrir perfil", en: "Open profile" },
  "contact.write": { es: "Escribir un correo", en: "Send an email" },

  "cursor.view": { es: "Ver", en: "View" },
  "cursor.open": { es: "Abrir", en: "Open" },
  "cursor.download": { es: "Bajar", en: "Get" },
  "cursor.copy": { es: "Copiar", en: "Copy" },

  "footer.rights": { es: "Todos los derechos reservados.", en: "All rights reserved." },
  "footer.backToTop": { es: "Volver arriba", en: "Back to top" },
  "footer.built": { es: "Hecho con Next.js y WebGL", en: "Built with Next.js and WebGL" },
} satisfies Record<string, LocalizedString>;

export type UiKey = keyof typeof ui;

export const tr = (key: UiKey, lang: Lang) => ui[key][lang];

/** The page's sections, in scroll order. Drives the nav and the anchors. */
export const SECTIONS = [
  { id: "about", label: "nav.about" },
  { id: "skills", label: "nav.skills" },
  { id: "process", label: "nav.process" },
  { id: "experience", label: "nav.experience" },
  { id: "certifications", label: "nav.certifications" },
  { id: "sql", label: "nav.sql" },
  { id: "projects", label: "nav.projects" },
  { id: "cv", label: "nav.cv" },
  { id: "contact", label: "nav.contact" },
] as const satisfies readonly { id: string; label: UiKey }[];
