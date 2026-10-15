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

  bio: {
    es: "Egresado de Ingeniería de Computación y Sistemas (2026-1) con enfoque profesional en Data Analytics, Business Intelligence y automatización de procesos. Experiencia en procesos ETL, limpieza y transformación de datos, modelado dimensional y diseño de dashboards interactivos. Manejo avanzado de SQL, Power BI y Excel para análisis de datos y visualización de KPIs. Conocimiento en Python para análisis exploratorio de datos (EDA) y automatización. Experiencia trabajando bajo metodología Scrum y control de versiones con GitHub.",
    en: "Computer & Systems Engineering graduate (2026-1) focused on Data Analytics, Business Intelligence and process automation. Experienced in ETL processes, data cleaning and transformation, dimensional modeling and interactive dashboard design. Advanced command of SQL, Power BI and Excel for data analysis and KPI visualization. Working knowledge of Python for exploratory data analysis (EDA) and automation. Experience with Scrum methodology and version control using GitHub.",
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
