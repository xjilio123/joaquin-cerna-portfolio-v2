import { certifications } from "./certifications";
import { education, yearsOfStudy } from "./education";
import { experience } from "./experience";
import type { LocalizedString } from "./types";

export * from "./types";
export { profile } from "./profile";
export { education, yearsOfStudy } from "./education";
export { experience } from "./experience";
export { skills } from "./skills";
export {
  certifications,
  certificationTopics,
  issuers,
  activeIssuers,
  activeTopics,
} from "./certifications";
export {
  projects,
  projectCategories,
  projectsWithCaseStudies,
  getProjectBySlug,
} from "./projects";

/**
 * About-section counters.
 *
 * Every number is derived from the data above rather than typed by hand, so a new
 * credential or role updates the strip automatically and the site can never
 * overstate the record.
 */
export interface Stat {
  id: string;
  /** Numbers count up on first viewport entry; strings fade in as-is. */
  value: number | string;
  label: LocalizedString;
  note?: LocalizedString;
}

export const stats: Stat[] = [
  {
    id: "roles",
    value: experience.length,
    label: { es: "Roles profesionales", en: "Professional roles" },
    note: { es: "Data & IA, analytics, QA y soporte TI", en: "Data & AI, analytics, QA and IT support" },
  },
  {
    id: "certifications",
    value: certifications.length,
    label: { es: "Certificaciones", en: "Certifications" },
    note: { es: "Verificables en esta página", en: "Verifiable on this page" },
  },
  {
    id: "study",
    value: yearsOfStudy,
    label: { es: "Años de formación", en: "Years of study" },
    note: { es: "Ingeniería, USMP", en: "Engineering, USMP" },
  },
  {
    id: "english",
    value: "MET",
    label: { es: "Inglés avanzado", en: "Advanced English" },
    note: { es: "University of Michigan", en: "University of Michigan" },
  },
];

/** Kept for the JSON-LD `alumniOf` block. */
export const educationCount = education.length;
