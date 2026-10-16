import type { Lang } from "@/content/types";
import { certifications, certificationTopics, education, experience, issuers, projects, skills } from "@/content";
import { t } from "@/lib/i18n";
import type { Table } from "@/lib/sql";

const current = (period: string) => /Actualidad|Present/.test(period);

/** The console's tables: the same public facts the page shows, nothing more. */
export function buildTables(lang: Lang): Table[] {
  return [
    {
      key: "experiencia",
      es: "experiencia",
      en: "experience",
      columns: [
        { key: "empresa", es: "empresa", en: "company" },
        { key: "rol", es: "rol", en: "role" },
        { key: "periodo", es: "periodo", en: "period" },
        { key: "inicio", es: "inicio", en: "start" },
        { key: "actual", es: "actual", en: "current" },
        { key: "stack", es: "stack", en: "stack" },
      ],
      rows: [...experience]
        .sort((a, b) => b.start.localeCompare(a.start))
        .map((entry) => ({
          empresa: entry.company,
          rol: t(entry.role, lang),
          periodo: t(entry.period, lang),
          inicio: entry.start.slice(0, 7),
          actual: current(entry.period.es),
          stack: entry.stack.join(", "),
        })),
    },
    {
      key: "certificaciones",
      es: "certificaciones",
      en: "certifications",
      columns: [
        { key: "titulo", es: "titulo", en: "title" },
        { key: "emisor", es: "emisor", en: "issuer" },
        { key: "fecha", es: "fecha", en: "date" },
        { key: "tema", es: "tema", en: "topic" },
      ],
      rows: certifications.map((certification) => ({
        titulo: t(certification.title, lang),
        emisor: issuers[certification.issuer].name,
        fecha: certification.date,
        tema: certification.topics.map((topic) => t(certificationTopics[topic], lang)).join(", "),
      })),
    },
    {
      key: "habilidades",
      es: "habilidades",
      en: "skills",
      columns: [
        { key: "herramienta", es: "herramienta", en: "tool" },
        { key: "grupo", es: "grupo", en: "group" },
        { key: "nivel", es: "nivel", en: "level" },
      ],
      rows: skills.flatMap((group) =>
        group.items.map((item) => ({
          herramienta: item.name,
          grupo: t(group.label, lang),
          nivel: item.level ? t(item.level, lang).split(" — ")[0] : null,
        })),
      ),
    },
    {
      key: "formacion",
      es: "formacion",
      en: "education",
      columns: [
        { key: "institucion", es: "institucion", en: "institution" },
        { key: "programa", es: "programa", en: "program" },
        { key: "periodo", es: "periodo", en: "period" },
      ],
      rows: education.map((entry) => ({
        institucion: entry.institution,
        programa: t(entry.program, lang),
        periodo: t(entry.period, lang),
      })),
    },
    {
      key: "proyectos",
      es: "proyectos",
      en: "projects",
      columns: [
        { key: "titulo", es: "titulo", en: "title" },
        { key: "categoria", es: "categoria", en: "category" },
        { key: "anio", es: "anio", en: "year" },
      ],
      rows: projects.map((project) => ({
        titulo: t(project.title, lang),
        categoria: project.category,
        anio: project.year,
      })),
    },
  ];
}
