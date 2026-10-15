import type { LocalizedString, Project, ProjectCategory } from "./types";

/** Filter tabs, in display order. */
export const projectCategories: { id: ProjectCategory; label: LocalizedString }[] = [
  { id: "personal", label: { es: "Proyectos personales", en: "Personal projects" } },
  { id: "analytics", label: { es: "Data Analytics", en: "Data Analytics" } },
  { id: "engineering", label: { es: "Data Engineering", en: "Data Engineering" } },
  { id: "science", label: { es: "Data Science", en: "Data Science" } },
];

/**
 * Real work only. The section renders an honest "in progress" state while this
 * list is empty, so the site never presents sample work as delivered work.
 *
 *    {
 *      id: "churn-retail",
 *      slug: "churn-retail",                     // optional → /[lang]/projects/churn-retail
 *      title:   { es: "...", en: "..." },
 *      summary: { es: "una línea", en: "one line" },
 *      category: "analytics",
 *      stack: ["Power BI", "SQL Server", "DAX"],
 *      status: "live",
 *      year: "2026",
 *      links: [{ kind: "repo", url: "https://github.com/..." }],
 *      caseStudy: { problem, data, approach, result, metrics },
 *    }
 */
export const projects: Project[] = [];

/** Projects that own a case-study route. */
export const projectsWithCaseStudies = projects.filter(
  (project): project is Project & { slug: string } => Boolean(project.slug && project.caseStudy),
);

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
