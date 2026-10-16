import type { SkillGroup } from "./types";

/**
 * `featured: true` promotes a skill to a large cell of the bento grid.
 * Keep four featured items so the asymmetric grid stays balanced.
 */
export const skills: SkillGroup[] = [
  {
    id: "data-bi",
    label: { es: "Análisis de datos y BI", en: "Data analysis & BI" },
    items: [
      {
        name: "Power BI",
        level: { es: "Avanzado", en: "Advanced" },
        featured: true,
        logo: "/images/tools/power-bi.webp",
      },
      {
        name: "SQL",
        level: { es: "Intermedio", en: "Intermediate" },
        featured: true,
        logo: "/images/tools/sql.webp",
      },
      {
        name: "Excel",
        level: { es: "Avanzado", en: "Advanced" },
        featured: true,
        logo: "/images/tools/excel.webp",
      },
      {
        name: "Python · Pandas",
        level: { es: "Análisis y EDA", en: "Analysis & EDA" },
        featured: true,
        logo: "/images/tools/python.webp",
      },
      { name: "Tableau", level: { es: "Intermedio", en: "Intermediate" } },
      { name: "DAX", level: { es: "Medidas y KPIs", en: "Measures & KPIs" } },
      { name: "Power Query", level: { es: "Transformación", en: "Transformation" } },
    ],
  },
  {
    id: "databases",
    label: { es: "Bases de datos", en: "Databases" },
    items: [
      { name: "SQL Server" },
      { name: "MySQL" },
      { name: "PostgreSQL" },
      { name: "Procesos ETL" },
      { name: "Modelado dimensional" },
      { name: "Normalización" },
    ],
  },
  {
    id: "automation",
    label: { es: "Automatización y nube", en: "Automation & cloud" },
    items: [
      { name: "Power Apps" },
      { name: "Power Automate" },
      { name: "Python scripting" },
      { name: "GCP", level: { es: "Nociones", en: "Fundamentals" } },
      { name: "Azure", level: { es: "Nociones", en: "Fundamentals" } },
      { name: "AWS", level: { es: "Nociones", en: "Fundamentals" } },
    ],
  },
  {
    id: "engineering",
    label: { es: "Ingeniería y control de versiones", en: "Engineering & version control" },
    items: [
      { name: "Git" },
      { name: "GitHub" },
      { name: "TypeScript" },
      { name: "NodeJS" },
      { name: "Playwright" },
    ],
  },
  {
    id: "delivery",
    label: { es: "Gestión de proyectos", en: "Project management" },
    items: [{ name: "Scrum" }, { name: "Agile" }, { name: "Jira" }],
  },
  {
    id: "ai",
    label: { es: "Inteligencia artificial", en: "Artificial intelligence" },
    items: [
      { name: "IA generativa" },
      { name: "LLM" },
      { name: "Prompting" },
      { name: "Claude" },
      { name: "ChatGPT" },
      { name: "Microsoft Copilot" },
      { name: "Gemini" },
      { name: "Grok" },
    ],
  },
  {
    id: "languages",
    label: { es: "Idiomas", en: "Languages" },
    items: [
      { name: "Español", level: { es: "Nativo", en: "Native" } },
      {
        name: "English",
        level: { es: "Avanzado — MET, U. of Michigan", en: "Advanced — MET, U. of Michigan" },
      },
    ],
  },
];
