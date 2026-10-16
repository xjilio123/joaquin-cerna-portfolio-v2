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
  /** Split so the number is never one scrapeable string in the markup. */
  phone: { country: "+51", body: "939 936 706" },
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
    es: "Analytics, Business Intelligence y automatización — desde el proceso ETL hasta el dashboard que alguien usa para decidir.",
    en: "Analytics, Business Intelligence and automation — from the ETL process to the dashboard someone actually decides with.",
  } satisfies LocalizedString,

  /** Opening statement of the About section, set large. */
  bioLead: {
    es: "Egresado de Ingeniería de Computación y Sistemas, hoy en Data Analytics e IA en PREDIQT.",
    en: "Computer & Systems Engineering graduate, now working in Data Analytics & AI at PREDIQT.",
  } satisfies LocalizedString,

  bio: {
    es: "Mi enfoque es Data Analytics, Business Intelligence y automatización de procesos. Tengo experiencia en procesos ETL, limpieza y transformación de datos, modelado dimensional y diseño de dashboards interactivos. Manejo SQL, Power BI y Excel a nivel avanzado para análisis y visualización de KPIs, y Python para análisis exploratorio (EDA) y automatización. Trabajo con Scrum y control de versiones en GitHub.",
    en: "My focus is Data Analytics, Business Intelligence and process automation. I have hands-on experience with ETL processes, data cleaning and transformation, dimensional modeling and interactive dashboard design. I use SQL, Power BI and Excel at an advanced level for analysis and KPI visualization, and Python for exploratory data analysis (EDA) and automation. I work with Scrum and version control on GitHub.",
  } satisfies LocalizedString,

  /** Condensed version used for metadata and the OG image. */
  metaDescription: {
    es: "Portafolio de Joaquín Cerna Rojas — Data Analytics, Business Intelligence y automatización. Procesos ETL, modelado dimensional y dashboards con Power BI, SQL y Python.",
    en: "Portfolio of Joaquín Cerna Rojas — Data Analytics, Business Intelligence and automation. ETL processes, dimensional modeling and dashboards with Power BI, SQL and Python.",
  } satisfies LocalizedString,

  cvPath: "/cv/JOAQUIN_CERNA_ROJAS_CV.pdf",
  cvFileName: "Joaquin_Cerna_Rojas_CV.pdf",
} as const;

export type Profile = typeof profile;
