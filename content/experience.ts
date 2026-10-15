import type { ExperienceEntry } from "./types";

/** Ordered newest first. `start` exists purely to keep that ordering explicit. */
export const experience: ExperienceEntry[] = [
  {
    id: "usmp-derecho",
    company: "Facultad de Derecho — USMP",
    role: {
      es: "Practicante de Soporte Técnico — Unidad de Informática",
      en: "Technical Support Intern — IT Unit",
    },
    period: { es: "Junio 2025 — Diciembre 2025", en: "June 2025 — December 2025" },
    start: "2025-06-01",
    bullets: [
      {
        es: "Aseguré la continuidad operativa mediante instalación, configuración y mantenimiento de equipos y sistemas.",
        en: "Ensured operational continuity through installation, configuration and maintenance of equipment and systems.",
      },
      {
        es: "Brindé soporte técnico a usuarios resolviendo incidencias de hardware y software.",
        en: "Provided technical support to users, resolving hardware and software incidents.",
      },
      {
        es: "Gestioné la comunicación institucional mediante Outlook.",
        en: "Managed institutional communication through Outlook.",
      },
      {
        es: "Documenté procedimientos técnicos para optimizar los tiempos de respuesta.",
        en: "Documented technical procedures to reduce response times.",
      },
    ],
    stack: ["Windows", "Outlook", "Hardware", "Soporte N1-N2"],
  },
  {
    id: "jpc-garrita",
    company: "JPC Garrita",
    role: { es: "Analista de Datos", en: "Data Analyst" },
    period: { es: "Agosto 2025 — Noviembre 2025", en: "August 2025 — November 2025" },
    start: "2025-08-01",
    bullets: [
      {
        es: "Ejecuté procesos ETL (extracción, transformación y carga) utilizando Python y SQL.",
        en: "Executed ETL processes (extract, transform, load) using Python and SQL.",
      },
      {
        es: "Diseñé modelos dimensionales para el análisis de información.",
        en: "Designed dimensional models for information analysis.",
      },
      {
        es: "Desarrollé dashboards interactivos en Power BI para la visualización de KPIs.",
        en: "Developed interactive Power BI dashboards for KPI visualization.",
      },
      {
        es: "Realicé análisis exploratorio de datos (EDA) para identificar patrones y tendencias.",
        en: "Performed exploratory data analysis (EDA) to identify patterns and trends.",
      },
    ],
    stack: ["Python", "SQL", "Power BI", "ETL", "Modelado dimensional"],
  },
  {
    id: "na-vishe",
    company: "Ña Vishe",
    role: { es: "Quality Assurance (QA)", en: "Quality Assurance (QA)" },
    period: { es: "Marzo 2025 — Junio 2025", en: "March 2025 — June 2025" },
    start: "2025-03-01",
    bullets: [
      {
        es: "Implementé pruebas automatizadas utilizando Playwright, NodeJS y TypeScript.",
        en: "Implemented automated tests using Playwright, NodeJS and TypeScript.",
      },
      {
        es: "Apliqué metodología Scrum para la gestión de tareas.",
        en: "Applied Scrum methodology for task management.",
      },
      {
        es: "Gestioné el control de versiones mediante GitHub.",
        en: "Managed version control via GitHub.",
      },
      {
        es: "Ejecuté pruebas funcionales y de regresión en entorno Chromium.",
        en: "Executed functional and regression tests in a Chromium environment.",
      },
    ],
    stack: ["Playwright", "TypeScript", "NodeJS", "GitHub", "Scrum"],
  },
];
