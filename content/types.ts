/**
 * Shared content types.
 *
 * Every user-facing string in `/content` is a `LocalizedString`, so the site can
 * render Spanish or English from a single source of truth and `npm run check:i18n`
 * can prove that nothing is missing a translation.
 */

export type Lang = "es" | "en";

export interface LocalizedString {
  es: string;
  en: string;
}

/** Topic taxonomy used by the certification filters. */
export type CertificationTopic =
  | "data-bi"
  | "databases"
  | "programming"
  | "cybersecurity"
  | "automation"
  | "languages";

export type CertificationIssuer =
  | "netzun"
  | "uni"
  | "santander"
  | "huawei"
  | "certiprof"
  | "cisco"
  | "camcop"
  | "icpna";

export interface Certification {
  id: string;
  issuer: CertificationIssuer;
  title: LocalizedString;
  /** ISO date (or year-month) used for sorting — never rendered directly. */
  date: string;
  /** Human date, e.g. "18 de diciembre de 2025" / "December 18, 2025". */
  dateLabel: LocalizedString;
  /** Study time or scope, e.g. "2 h 47 min", "16 horas · nota 17/20". */
  detail?: LocalizedString;
  /** Credential / serial code printed on the certificate. */
  code?: string;
  topics: CertificationTopic[];
  /** Certificate scans in /public/certificates. Multi-page credentials list every page. */
  images?: string[];
  /**
   * The original PDF the scan came from, when it is not the main bundle.
   * The viewer's "open original" link uses it, so a credential from a separate
   * bundle does not send the reader to a document it is not in.
   */
  pdf?: string;
  /** Public verification URL, when the issuer exposes one. */
  verifyUrl?: string;
  /** Flagship credentials get visual prominence in the grid. */
  highlight?: boolean;
}

export type ProjectCategory = "personal" | "analytics" | "engineering" | "science";

/**
 * `placeholder` projects are clearly labelled in the UI as structural examples,
 * so the section never reads as a claim of work that was not done.
 */
export type ProjectStatus = "live" | "placeholder";

export interface ProjectLink {
  kind: "repo" | "demo" | "writeup";
  url: string;
}

export interface ProjectCaseStudy {
  problem: LocalizedString;
  data: LocalizedString;
  approach: LocalizedString;
  result: LocalizedString;
  metrics?: { label: LocalizedString; value: string }[];
}

export interface Project {
  id: string;
  /** Optional — when present a /projects/[slug] case study page is generated. */
  slug?: string;
  title: LocalizedString;
  summary: LocalizedString;
  category: ProjectCategory;
  /** Rendered as chips; short tool names, not sentences. */
  stack: string[];
  status: ProjectStatus;
  year: string;
  links?: ProjectLink[];
  caseStudy?: ProjectCaseStudy;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: LocalizedString;
  period: LocalizedString;
  /** ISO start date, used only for ordering. */
  start: string;
  bullets: LocalizedString[];
  stack: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  location: LocalizedString;
  program: LocalizedString;
  period: LocalizedString;
  note?: LocalizedString;
}

export interface SkillItem {
  name: string;
  level?: LocalizedString;
  /** Featured skills claim the large cells of the bento grid. */
  featured?: boolean;
  /**
   * Path to the tool's own logo in /public/images/tools. Featured skills
   * without one fall back to the drawn mark in components/sections/SkillMark.
   */
  logo?: string;
}

export interface SkillGroup {
  id: string;
  label: LocalizedString;
  items: SkillItem[];
}
