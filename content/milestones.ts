import type { LocalizedString } from "./types";

/**
 * The hero chart is Joaquín's own trajectory: when the scattered particles
 * settle, these are the data points they settle on. Values are a visual rise,
 * not a measured metric, so the chart carries no y-axis numbers.
 */
export interface Milestone {
  id: string;
  year: string;
  label: LocalizedString;
  /** Position along the chart, 0 → 1. */
  t: number;
  /** Height on the chart, 0 → 1. */
  v: number;
}

export const milestones: Milestone[] = [
  { id: "usmp", year: "2021", label: { es: "Ingeniería en la USMP", en: "Engineering at USMP" }, t: 0, v: 0.1 },
  { id: "bi", year: "2023", label: { es: "Certificación en BI", en: "BI certification" }, t: 0.4, v: 0.34 },
  { id: "analyst", year: "2025", label: { es: "Analista de datos", en: "Data analyst" }, t: 0.8, v: 0.64 },
  { id: "prediqt", year: "2026", label: { es: "Data & IA en PREDIQT", en: "Data & AI at PREDIQT" }, t: 1, v: 0.95 },
];
