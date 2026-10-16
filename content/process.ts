import type { LocalizedString } from "./types";

/** The "Método" section: how a case goes from raw files to a decision. */
export interface ProcessStep {
  id: "extract" | "clean" | "model" | "decide";
  title: LocalizedString;
  body: LocalizedString;
  tools: string;
}

export const processSteps: ProcessStep[] = [
  {
    id: "extract",
    title: { es: "Extraer", en: "Extract" },
    body: {
      es: "Reúno los datos tal como llegan: fechas en tres formatos, códigos escritos de varias maneras y celdas vacías.",
      en: "I gather the data as it arrives: dates in three formats, codes written several ways and empty cells.",
    },
    tools: "Excel · CSV · SQL Server",
  },
  {
    id: "clean",
    title: { es: "Limpiar", en: "Clean" },
    body: {
      es: "Normalizo formatos y llaves. Lo que no se puede corregir se descarta y queda registrado: nada se arregla en silencio.",
      en: "I normalise formats and keys. What can't be fixed is dropped and logged: nothing gets fixed silently.",
    },
    tools: "Python · Pandas · Power Query",
  },
  {
    id: "model",
    title: { es: "Modelar", en: "Model" },
    body: {
      es: "Ordeno todo en un modelo estrella: los hechos al centro y las dimensiones alrededor, para que cada métrica se calcule una sola vez.",
      en: "I shape it into a star schema, facts in the middle and dimensions around, so every metric is computed once.",
    },
    tools: "SQL · Modelado dimensional",
  },
  {
    id: "decide",
    title: { es: "Decidir", en: "Decide" },
    body: {
      es: "El dashboard muestra pocas cifras y responde una pregunta concreta. Si nadie lo usa para decidir, no está terminado.",
      en: "The dashboard shows few numbers and answers one concrete question. If nobody uses it to decide, it isn't finished.",
    },
    tools: "Power BI · DAX",
  },
];

/** Sample data, labelled as such on the page. `null` in `clean` = the row is dropped. */
export interface SampleRow {
  raw: [string, string, string];
  clean: [string, string, string] | null;
  /** Which raw cells are wrong (index into `raw`). */
  errors: number[];
  reason?: LocalizedString;
}

export const sampleRows: SampleRow[] = [
  {
    raw: ["03/01/25", "lim 01", "1200"],
    clean: ["2025-01-03", "LIM01", "1200"],
    errors: [0, 1],
  },
  {
    raw: ["N/A", "LIM02", "980"],
    clean: null,
    errors: [0],
    reason: { es: "sin fecha", en: "no date" },
  },
  {
    raw: ["2025-1-4", "LIM01", "1.150"],
    clean: ["2025-01-04", "LIM01", "1150"],
    errors: [0, 2],
  },
  {
    raw: ["04/01/25", "LIM-02", ""],
    clean: null,
    errors: [1, 2],
    reason: { es: "sin venta", en: "no sale" },
  },
  {
    raw: ["05/01/25", "Lim02", "1,310"],
    clean: ["2025-01-05", "LIM02", "1310"],
    errors: [0, 1, 2],
  },
];

/** Weekly sales in thousands (sample). */
export const sampleWeeks = [8.2, 9.1, 8.7, 10.4, 11.0, 12.3];
