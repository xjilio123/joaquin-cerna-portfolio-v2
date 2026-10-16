import type { ExperienceEntry } from "./types";

/**
 * Ordered newest first. `start` exists purely to keep that ordering explicit.
 * Wording mirrors the published CV (public/cv), so the two never disagree.
 */
export const experience: ExperienceEntry[] = [
  {
    id: "prediqt",
    company: "PREDIQT",
    role: {
      es: "Practicante Profesional de Data Analytics e IA",
      en: "Data Analytics & AI Professional Intern",
    },
    period: { es: "Agosto 2026 — Actualidad", en: "August 2026 — Present" },
    start: "2026-08-20",
    bullets: [
      {
        es: "Apoyo en la extracción, limpieza, transformación y análisis de datos para atender requerimientos de negocio.",
        en: "Support data extraction, cleaning, transformation and analysis to meet business requirements.",
      },
      {
        es: "Colaboro en la elaboración de reportes, visualizaciones y dashboards para el análisis de información e indicadores.",
        en: "Help build reports, visualizations and dashboards to analyse information and indicators.",
      },
      {
        es: "Participo en iniciativas de IA generativa, modelos de lenguaje (LLM), prompting y exploración de agentes de IA.",
        en: "Take part in generative AI initiatives: large language models (LLMs), prompting and AI agent exploration.",
      },
      {
        es: "Apoyo en la evaluación de herramientas de automatización y soluciones de analítica basadas en plataformas cloud.",
        en: "Help evaluate automation tools and analytics solutions built on cloud platforms.",
      },
      {
        es: "Investigo herramientas y tendencias de Data Analytics, IA y Agentic AI para identificar oportunidades de aplicación.",
        en: "Research Data Analytics, AI and Agentic AI tools and trends to identify where they can be applied.",
      },
    ],
    stack: ["SQL", "Python", "IA generativa", "LLM", "Agentic AI", "Cloud"],
  },
  {
    id: "jpc-garrita",
    company: "JPC Garrita",
    role: { es: "Analista de Datos — Proyecto", en: "Data Analyst — Project" },
    period: { es: "Agosto 2025 — Noviembre 2025", en: "August 2025 — November 2025" },
    start: "2025-08-01",
    bullets: [
      {
        es: "Desarrollé procesos ETL (extracción, transformación y carga) con Python y SQL para preparar datos para su análisis.",
        en: "Built ETL (extract, transform, load) processes with Python and SQL to prepare data for analysis.",
      },
      {
        es: "Estructuré modelos dimensionales para facilitar la consulta y el análisis de información.",
        en: "Structured dimensional models to make information easier to query and analyse.",
      },
      {
        es: "Construí dashboards interactivos en Power BI para visualizar indicadores clave de desempeño (KPIs).",
        en: "Built interactive Power BI dashboards to visualise key performance indicators (KPIs).",
      },
      {
        es: "Realicé análisis exploratorio de datos (EDA) para identificar patrones, tendencias y oportunidades de análisis.",
        en: "Performed exploratory data analysis (EDA) to identify patterns, trends and analysis opportunities.",
      },
    ],
    stack: ["Python", "SQL", "Power BI", "ETL", "Modelado dimensional"],
  },
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
        es: "Contribuí a la continuidad operativa con la instalación, configuración y mantenimiento de equipos y sistemas.",
        en: "Kept operations running by installing, configuring and maintaining equipment and systems.",
      },
      {
        es: "Atendí incidencias de hardware y software, brindando soporte técnico a usuarios.",
        en: "Resolved hardware and software incidents, providing technical support to users.",
      },
      {
        es: "Gestioné comunicaciones institucionales en Microsoft Outlook y apoyé en tareas operativas del área.",
        en: "Managed institutional communications in Microsoft Outlook and supported the unit's daily operations.",
      },
      {
        es: "Documenté procedimientos técnicos para estandarizar actividades y facilitar la atención de incidencias.",
        en: "Documented technical procedures to standardise work and speed up incident handling.",
      },
    ],
    stack: ["Windows", "Outlook", "Hardware", "Soporte N1-N2"],
  },
  {
    id: "na-vishe",
    company: "Ña Vishe",
    role: {
      es: "Practicante de Quality Assurance (QA) — Proyecto",
      en: "Quality Assurance (QA) Intern — Project",
    },
    period: { es: "Marzo 2025 — Junio 2025", en: "March 2025 — June 2025" },
    start: "2025-03-01",
    bullets: [
      {
        es: "Implementé pruebas automatizadas con Playwright, Node.js y TypeScript para validar el comportamiento de la aplicación.",
        en: "Implemented automated tests with Playwright, Node.js and TypeScript to validate the application's behaviour.",
      },
      {
        es: "Ejecuté pruebas funcionales y de regresión en Chromium para detectar posibles defectos.",
        en: "Ran functional and regression tests in Chromium to catch defects.",
      },
      {
        es: "Organicé las tareas siguiendo prácticas ágiles y la metodología Scrum.",
        en: "Organised work following agile practices and the Scrum methodology.",
      },
      {
        es: "Gestioné el control de versiones y la colaboración en el código mediante GitHub.",
        en: "Managed version control and code collaboration on GitHub.",
      },
    ],
    stack: ["Playwright", "TypeScript", "Node.js", "GitHub", "Scrum"],
  },
];
