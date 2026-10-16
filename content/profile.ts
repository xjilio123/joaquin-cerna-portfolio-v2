import type { LocalizedString } from "./types";

/**
 * Identity and contact details.
 *
 * PRIVACY: the national ID (DNI) printed on the source CV is deliberately absent
 * from this file, from every other content module, and from the published PDF in
 * /public/cv (see scripts/prepare-assets.py, which redacts it before publishing).
 */
export const profile = {
  name: "Joaquín Alessandro Cerna Rojas",
  shortName: "Joaquín Cerna Rojas",
  monogram: "JCR",
  location: {
    es: "Lima, Perú",
    en: "Lima, Peru",
  } satisfies LocalizedString,
  email: "joaquin200314@gmail.com",
  /**
   * Encoded (reversed digits, base64) so the number is never plain text in the
   * page or its JavaScript. It only stops simple scrapers: anyone who presses
   * "Mostrar número" sees it, which is the point.
   */
  phone: { country: "+51", encoded: "NjA3NjM5OTM5" },
  linkedin: "https://www.linkedin.com/in/joaquincernarojas14",
  linkedinLabel: "linkedin.com/in/joaquincernarojas14",

  title: {
    es: "Ingeniero de Computación y Sistemas · Data Analytics & Business Intelligence",
    en: "Computer & Systems Engineer · Data Analytics & Business Intelligence",
  } satisfies LocalizedString,

  /** Headline, pre-split into lines for the masked reveal animation. */
  headline: {
    es: ["Convierto datos", "dispersos en", "decisiones claras."],
    en: ["I turn scattered", "data into", "clear decisions."],
  } satisfies { es: string[]; en: string[] },

  tagline: {
    es: "Analytics, Business Intelligence e IA — desde el proceso ETL hasta el dashboard que alguien usa para decidir.",
    en: "Analytics, Business Intelligence and AI — from the ETL process to the dashboard someone actually decides with.",
  } satisfies LocalizedString,

  /** Opening statement of the About section, set large. */
  bioLead: {
    es: "Egresado de Ingeniería de Computación y Sistemas, hoy en Data Analytics e IA en PREDIQT.",
    en: "Computer & Systems Engineering graduate, now working in Data Analytics & AI at PREDIQT.",
  } satisfies LocalizedString,

  bio: {
    es: "Mi enfoque es Data Analytics, Business Intelligence e Inteligencia Artificial. Tengo experiencia en extracción, transformación y análisis de datos con SQL y Python, modelado de datos y dashboards en Power BI para el seguimiento de KPIs. Trabajo con análisis exploratorio, automatización de tareas, IA generativa, modelos de lenguaje (LLM) y técnicas de prompting, con metodologías ágiles y control de versiones en GitHub. Me interesa construir soluciones analíticas y de IA aplicadas a procesos de negocio y plataformas cloud.",
    en: "My focus is Data Analytics, Business Intelligence and Artificial Intelligence. I have hands-on experience extracting, transforming and analysing data with SQL and Python, modelling data and building Power BI dashboards to track KPIs. I work with exploratory analysis, task automation, generative AI, large language models (LLMs) and prompting techniques, using agile methods and version control on GitHub. I want to build analytics and AI solutions applied to business processes and cloud platforms.",
  } satisfies LocalizedString,

  /** Condensed version used for metadata and the OG image. */
  metaDescription: {
    es: "Portafolio de Joaquín Cerna Rojas — Data Analytics, Business Intelligence e IA. Procesos ETL, modelado de datos y dashboards con Power BI, SQL y Python; IA generativa y LLM.",
    en: "Portfolio of Joaquín Cerna Rojas — Data Analytics, Business Intelligence and AI. ETL processes, data modeling and dashboards with Power BI, SQL and Python; generative AI and LLMs.",
  } satisfies LocalizedString,

  cvPath: "/cv/JOAQUIN_CERNA_ROJAS_CV.pdf",
  cvFileName: "Joaquin_Cerna_Rojas_CV.pdf",
} as const;

export type Profile = typeof profile;
