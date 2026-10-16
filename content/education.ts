import type { EducationEntry } from "./types";

export const education: EducationEntry[] = [
  {
    id: "usmp",
    institution: "Universidad de San Martín de Porres",
    location: { es: "Lima, Perú", en: "Lima, Peru" },
    program: {
      es: "Ingeniería de Computación y Sistemas",
      en: "Computer & Systems Engineering",
    },
    period: { es: "Marzo 2021 — 2026", en: "March 2021 — 2026" },
    note: {
      es: "Participación en EXPO EPICS USMP con proyectos de IoT y diseño de bases de datos.",
      en: "Participated in EXPO EPICS USMP with IoT and database design projects.",
    },
  },
  {
    id: "icpna",
    institution: "Instituto Cultural Peruano Norteamericano (ICPNA)",
    location: { es: "Lima, Perú", en: "Lima, Peru" },
    program: {
      es: "Inglés avanzado — formación vinculada a la certificación MET (University of Michigan)",
      en: "Advanced English — training linked to the MET certification (University of Michigan)",
    },
    period: { es: "Enero 2018 — 2021", en: "January 2018 — 2021" },
  },
];

/** Years of university study — derived, so the About stat strip can never drift. */
export const yearsOfStudy = 2026 - 2021;
