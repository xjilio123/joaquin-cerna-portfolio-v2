import type {
  Certification,
  CertificationIssuer,
  CertificationTopic,
  LocalizedString,
} from "./types";

/** Issuer display names. Keys drive the "by issuer" filter row. */
export const issuers: Record<CertificationIssuer, { name: string; full: LocalizedString }> = {
  netzun: {
    name: "Netzun",
    full: { es: "Netzun · Dionisio Romero University", en: "Netzun · Dionisio Romero University" },
  },
  uni: {
    name: "UNI",
    full: {
      es: "Universidad Nacional de Ingeniería · CTIC-UNI",
      en: "National University of Engineering · CTIC-UNI",
    },
  },
  santander: {
    name: "Santander",
    full: { es: "Santander Open Academy", en: "Santander Open Academy" },
  },
  huawei: { name: "Huawei", full: { es: "Huawei", en: "Huawei" } },
  certiprof: { name: "CertiProf", full: { es: "CertiProf", en: "CertiProf" } },
  cisco: {
    name: "Cisco",
    full: { es: "Cisco Networking Academy", en: "Cisco Networking Academy" },
  },
  camcop: {
    name: "CAMCOP",
    full: { es: "Cámara de Comercio Peruana", en: "Peruvian Chamber of Commerce" },
  },
  icpna: {
    name: "ICPNA",
    full: { es: "ICPNA · University of Michigan", en: "ICPNA · University of Michigan" },
  },
};

/** Topic taxonomy — drives the second filter row. */
export const certificationTopics: Record<CertificationTopic, LocalizedString> = {
  "data-bi": { es: "Datos y BI", en: "Data & BI" },
  databases: { es: "Bases de datos", en: "Databases" },
  programming: { es: "Programación", en: "Programming" },
  cybersecurity: { es: "Ciberseguridad", en: "Cybersecurity" },
  automation: { es: "Automatización", en: "Automation" },
  languages: { es: "Idiomas", en: "Languages" },
};

/**
 * Credentials.
 *
 * The list is sorted by `date` on the way out, so "newest first" is true by
 * construction rather than by whoever last appended an entry — correcting a
 * date used to silently move a card out of order.
 *
 * `images` point at files in /public/certificates produced by
 * scripts/prepare-assets.py. A credential without `images` still opens in the
 * viewer — it shows a designed "no scan available" panel instead of a broken box.
 *
 * `verifyUrl` is intentionally unset everywhere: add the issuer's public
 * verification link once you have confirmed it resolves, and the card grows a
 * "View credential" action on its own.
 */
const entries: Certification[] = [
  {
    id: "netzun-python",
    issuer: "netzun",
    title: { es: "Python Avanzado", en: "Advanced Python" },
    date: "2026-02-26",
    dateLabel: { es: "26 de febrero de 2026", en: "26 February 2026" },
    detail: { es: "1 h 55 min", en: "1 h 55 min" },
    code: "066C8501",
    topics: ["programming"],
    images: ["/certificates/netzun-python.webp"],
  },
  {
    id: "netzun-power-bi",
    issuer: "netzun",
    title: { es: "Power BI Intermedio-Avanzado", en: "Power BI Intermediate-Advanced" },
    date: "2026-02-20",
    dateLabel: { es: "20 de febrero de 2026", en: "20 February 2026" },
    detail: { es: "1 h 50 min", en: "1 h 50 min" },
    code: "A2CB770D",
    topics: ["data-bi"],
    images: ["/certificates/netzun-power-bi.webp"],
    highlight: true,
  },
  {
    id: "netzun-tableau",
    issuer: "netzun",
    title: { es: "Introducción a Tableau", en: "Introduction to Tableau" },
    date: "2026-02-20",
    dateLabel: { es: "20 de febrero de 2026", en: "20 February 2026" },
    detail: { es: "52 min", en: "52 min" },
    code: "E51125DB",
    topics: ["data-bi"],
    images: ["/certificates/netzun-tableau.webp"],
  },
  {
    id: "netzun-sql",
    issuer: "netzun",
    title: { es: "SQL Avanzado", en: "Advanced SQL" },
    date: "2026-02-01",
    dateLabel: { es: "1 de febrero de 2026", en: "1 February 2026" },
    detail: { es: "2 h 57 min", en: "2 h 57 min" },
    code: "2D44F5FB",
    topics: ["databases", "data-bi"],
    images: ["/certificates/netzun-sql.webp"],
  },
  {
    id: "netzun-excel-ia",
    issuer: "netzun",
    title: {
      es: "Microsoft Excel Avanzado con Inteligencia Artificial",
      en: "Advanced Microsoft Excel with Artificial Intelligence",
    },
    date: "2025-12-18",
    dateLabel: { es: "18 de diciembre de 2025", en: "18 December 2025" },
    detail: { es: "2 h 47 min", en: "2 h 47 min" },
    code: "893082C4",
    topics: ["data-bi", "automation"],
    images: ["/certificates/netzun-excel-ia.webp"],
  },
  {
    id: "santander-data-science",
    issuer: "santander",
    title: { es: "Introducción a la Ciencia de Datos", en: "Introduction to Data Science" },
    date: "2025-03-03",
    dateLabel: { es: "3 de marzo de 2025", en: "3 March 2025" },
    detail: {
      es: "6 horas · 2 módulos · contenido de IE University",
      en: "6 hours · 2 modules · content by IE University",
    },
    code: "OA-2025-0411000991171",
    topics: ["data-bi", "programming"],
    images: ["/certificates/santander-data-science.webp"],
  },
  {
    id: "uni-sql-server",
    issuer: "uni",
    title: { es: "SQL Server — Base de Datos 1", en: "SQL Server — Databases 1" },
    date: "2025-02-19",
    dateLabel: { es: "Febrero de 2025", en: "February 2025" },
    detail: {
      es: "16 horas · nota final 17/20 · Programa PIT",
      en: "16 hours · final grade 17/20 · PIT programme",
    },
    code: "017-0006633",
    topics: ["databases"],
    images: ["/certificates/uni-sql-server-1.webp", "/certificates/uni-sql-server-2.webp"],
    highlight: true,
  },
  {
    id: "huawei-seeds",
    issuer: "huawei",
    title: {
      es: "Seeds for the Future 2025 — IA, 5G y Ciberseguridad",
      en: "Seeds for the Future 2025 — AI, 5G and Cybersecurity",
    },
    date: "2025-10-27",
    dateLabel: { es: "Octubre — noviembre de 2025", en: "October — November 2025" },
    detail: {
      es: "Seleccionado para la Fase 1 · clases en vivo de IA, 5G y ciberseguridad",
      en: "Selected for Phase 1 · live classes on AI, 5G and cybersecurity",
    },
    topics: ["cybersecurity", "data-bi"],
    images: ["/certificates/huawei-seeds.webp"],
    pdf: "/certificates/OTROS_CERTIFICADOS.pdf",
    highlight: true,
  },
  {
    id: "santander-iot",
    issuer: "santander",
    title: {
      es: "Internet of Things (IoT)",
      en: "Internet of Things (IoT)",
    },
    date: "2025-02-27",
    dateLabel: { es: "27 de febrero de 2025", en: "27 February 2025" },
    detail: {
      es: "8 horas · 2 módulos · contenido de MIT Professional Education",
      en: "8 hours · 2 modules · content by MIT Professional Education",
    },
    code: "OA-2025-0411000999862",
    topics: ["data-bi"],
    images: ["/certificates/santander-iot.webp"],
    pdf: "/certificates/SANTANDER_IOT.pdf",
  },
  {
    id: "camcop-excel",
    issuer: "camcop",
    title: { es: "Gestión de datos con Excel", en: "Data management with Excel" },
    date: "2025-05-28",
    dateLabel: { es: "28 de mayo de 2025", en: "28 May 2025" },
    detail: {
      es: "3 horas académicas · tablas dinámicas",
      en: "3 academic hours · pivot tables",
    },
    code: "cert_1x9fty80",
    topics: ["data-bi"],
    images: ["/certificates/camcop-excel.webp"],
    pdf: "/certificates/CAMCOP_EXCEL.pdf",
  },
  {
    id: "certiprof-bi",
    issuer: "certiprof",
    title: { es: "Business Intelligence Foundation", en: "Business Intelligence Foundation" },
    date: "2023-10-20",
    dateLabel: { es: "20 de octubre de 2023", en: "20 October 2023" },
    detail: {
      es: "BIFPC · vigente hasta el 19 de octubre de 2026",
      en: "BIFPC · valid until 19 October 2026",
    },
    code: "90864895",
    topics: ["data-bi"],
    images: ["/certificates/certiprof-bi.webp"],
    pdf: "/certificates/OTROS_CERTIFICADOS.pdf",
  },
  {
    id: "icpna-met",
    issuer: "icpna",
    title: { es: "MET — Inglés Avanzado", en: "MET — Advanced English" },
    date: "2021-12-01",
    dateLabel: { es: "2021", en: "2021" },
    detail: {
      es: "Michigan English Test · University of Michigan",
      en: "Michigan English Test · University of Michigan",
    },
    topics: ["languages"],
  },
  {
    id: "cisco-cyber",
    issuer: "cisco",
    title: { es: "Introducción a la Seguridad Cibernética", en: "Introduction to Cybersecurity" },
    date: "2021-06-07",
    dateLabel: { es: "7 de junio de 2021", en: "7 June 2021" },
    detail: {
      es: "Cisco Networking Academy · USMP",
      en: "Cisco Networking Academy · USMP",
    },
    topics: ["cybersecurity"],
    images: ["/certificates/cisco-cyber.webp"],
    pdf: "/certificates/OTROS_CERTIFICADOS.pdf",
  },
];

/** Newest first. A stable sort keeps same-day credentials in authored order. */
export const certifications: Certification[] = [...entries].sort((a, b) =>
  b.date.localeCompare(a.date),
);

/** Issuers that actually appear in the data — keeps the filter row honest. */
export const activeIssuers = (Object.keys(issuers) as CertificationIssuer[]).filter((issuer) =>
  certifications.some((certification) => certification.issuer === issuer),
);

/** Topics that actually appear in the data. */
export const activeTopics = (
  Object.keys(certificationTopics) as CertificationTopic[]
).filter((topic) => certifications.some((certification) => certification.topics.includes(topic)));
