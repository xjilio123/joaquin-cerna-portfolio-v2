import type { Lang } from "@/content/types";
import { sampleRows, sampleWeeks } from "@/content";
import { t } from "@/lib/i18n";

/**
 * The three pictures of the "Método" story, all drawn from the sample data in
 * content/process.ts. `live` renders every state at once (raw and clean cells
 * stacked, links undrawn) for the pinned desktop stage, where MotionLayer
 * scrubs between them; otherwise each renders the one state its card shows.
 */

const ERROR = "text-[#ff6b70] in-data-[theme=light]:text-[#b0262c]";
const COLUMNS = {
  es: ["fecha", "tienda", "venta", "estado"],
  en: ["date", "store", "sale", "status"],
} as const;
const GRID = "grid grid-cols-[1.3fr_1fr_0.8fr_1fr] gap-x-3";

export function TableVisual({ lang, mode }: { lang: Lang; mode: "raw" | "clean" | "live" }) {
  const columns = COLUMNS[lang];
  const showStatus = mode !== "raw";

  return (
    <div className="w-full font-mono text-[11px] sm:text-xs lg:text-[13px]">
      <div className={`${GRID} border-b border-line pb-2 uppercase tracking-wider text-muted`}>
        <span>{columns[0]}</span>
        <span>{columns[1]}</span>
        <span>{columns[2]}</span>
        <span data-status={mode === "live" ? "" : undefined}>{showStatus ? columns[3] : ""}</span>
      </div>
      {sampleRows.map((row, r) => {
        const dropped = row.clean === null;
        return (
          <div key={r} className={`relative ${GRID} border-b border-line/60 py-2 last:border-b-0`} data-dropped={mode === "live" && dropped ? "" : undefined}>
            {row.raw.map((raw, c) => {
              const wrong = row.errors.includes(c);
              const shownRaw = raw || "—";
              if (mode === "raw")
                return (
                  <span key={c} className={wrong ? ERROR : "text-fg"}>
                    {shownRaw}
                  </span>
                );
              if (mode === "clean") {
                if (dropped)
                  return (
                    <span key={c} className="text-muted">
                      {shownRaw}
                    </span>
                  );
                return (
                  <span key={c} className={wrong ? "text-accent" : "text-fg"}>
                    {row.clean![c]}
                  </span>
                );
              }
              // live: the clean value waits under the raw one
              const fixable = wrong && !dropped;
              return (
                <span key={c} className="grid">
                  <span data-raw={fixable ? "" : undefined} className={`[grid-area:1/1] ${wrong ? ERROR : "text-fg"}`}>
                    {shownRaw}
                  </span>
                  {fixable ? (
                    <span data-clean className="text-accent opacity-0 [grid-area:1/1]">
                      {row.clean![c]}
                    </span>
                  ) : null}
                </span>
              );
            })}
            <span data-status={mode === "live" ? "" : undefined} className={dropped ? ERROR : "text-accent"}>
              {showStatus ? (dropped ? `✕ ${t(row.reason!, lang)}` : "✓ ok") : ""}
            </span>
            {dropped && mode !== "raw" ? (
              <span
                aria-hidden
                data-strike={mode === "live" ? "" : undefined}
                className="absolute left-0 right-[calc(25%+0.25rem)] top-1/2 h-px origin-left bg-muted"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const DIMENSIONS = [
  { name: "dim_fecha", x: 22, y: 16 },
  { name: "dim_tienda", x: 138, y: 16 },
  { name: "dim_producto", x: 22, y: 84 },
  { name: "dim_canal", x: 138, y: 84 },
];

export function ModelVisual({ live = false, className = "" }: { live?: boolean; className?: string }) {
  return (
    <div className={`relative w-full font-mono ${className}`}>
      <svg aria-hidden viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {DIMENSIONS.map((dimension) => (
          <line
            key={dimension.name}
            data-link={live ? "" : undefined}
            x1={80}
            y1={50}
            x2={dimension.x}
            y2={dimension.y}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={0}
            strokeWidth={0.5}
            className="stroke-accent"
          />
        ))}
      </svg>
      <div
        data-fact={live ? "" : undefined}
        className="absolute left-1/2 top-1/2 w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-accent px-3 py-2.5 text-center text-accent-fg sm:rounded-2xl sm:py-3.5"
      >
        <p className="text-[11px] font-semibold sm:text-sm">fact_ventas</p>
        <p className="mt-1 hidden text-[10px] opacity-80 sm:block lg:text-[11px]">fecha_id · tienda_id · producto_id · canal_id · venta</p>
      </div>
      {DIMENSIONS.map((dimension) => (
        <div
          key={dimension.name}
          data-dim={live ? "" : undefined}
          style={{
            left: `${(dimension.x / 160) * 100}%`,
            top: `${dimension.y}%`,
          }}
          className="absolute w-[31%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface-2 px-1 py-2 sm:w-[27%] sm:px-2 text-center text-[10px] text-fg sm:text-xs lg:text-[13px]"
        >
          {dimension.name}
        </div>
      ))}
    </div>
  );
}

const DASH_COPY = {
  es: {
    title: "Ventas semanales · S/ miles",
    sample: "Datos de ejemplo",
    kpi: (value: number) => `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 1 })} mil`,
    delta: (pct: number) => `+${pct} % vs. semana anterior`,
    week: "S",
  },
  en: {
    title: "Weekly sales · PEN thousands",
    sample: "Sample data",
    kpi: (value: number) => `S/ ${value.toLocaleString("en-US", { minimumFractionDigits: 1 })}k`,
    delta: (pct: number) => `+${pct}% vs. last week`,
    week: "W",
  },
} as const;

export function DashboardVisual({ lang, live = false }: { lang: Lang; live?: boolean }) {
  const copy = DASH_COPY[lang];
  const last = sampleWeeks[sampleWeeks.length - 1];
  const previous = sampleWeeks[sampleWeeks.length - 2];
  const pct = Math.round(((last - previous) / previous) * 100);
  const max = Math.max(...sampleWeeks);

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:justify-between">
        <div data-kpi={live ? "" : undefined}>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted sm:text-xs">{copy.title}</p>
          <p className="mt-1.5 whitespace-nowrap font-display text-3xl font-bold tracking-[-0.03em] text-fg lg:text-4xl">{copy.kpi(last)}</p>
          <p className="mt-1 font-mono text-xs text-accent">{copy.delta(pct)}</p>
        </div>
        {live ? null : (
          <span className="shrink-0 rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">{copy.sample}</span>
        )}
      </div>
      <div className={`flex items-end gap-2 sm:gap-3 ${live ? "min-h-0 flex-1" : "h-36"}`}>
        {sampleWeeks.map((value, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div
              data-bar={live ? "" : undefined}
              style={{ height: `${(value / max) * 100}%` }}
              className={`w-full origin-bottom rounded-t-md ${i === sampleWeeks.length - 1 ? "bg-accent" : "bg-muted/30"}`}
            />
            <span className="font-mono text-[10px] text-muted">
              {copy.week}
              {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
