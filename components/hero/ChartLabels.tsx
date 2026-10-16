import type { CSSProperties } from "react";
import type { Lang } from "@/content/types";
import { milestones } from "@/content/milestones";
import { CHART_INNER, chartPoint } from "@/lib/chart";
import { t } from "@/lib/i18n";

const pct = (value: number) => `${(value * 100).toFixed(2)}%`;

/**
 * Milestone rings and labels, positioned inside the chart box at exactly the
 * points the particles settle on. They fade in only as the chart completes
 * (driven by --p on the hero stage). Below lg only the year shows.
 */
export function ChartLabels({ lang }: { lang: Lang }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 [--show:clamp(0,calc((var(--p,0)_-_0.72)*4),1)]">
      {/* Baseline */}
      <div
        className="absolute h-px bg-line opacity-[var(--show)]"
        style={{ left: pct(CHART_INNER.x0), top: pct(CHART_INNER.y1), width: pct(CHART_INNER.x1 - CHART_INNER.x0) }}
      />

      {milestones.map((milestone) => {
        const [x, y] = chartPoint(milestone.t, CHART_INNER);
        return (
          <div key={milestone.id} className="absolute opacity-[var(--show)]" style={{ left: pct(x), top: pct(y) } as CSSProperties}>
            {/* The milestone marker: a crisp ring exactly on the point. */}
            <span className="absolute left-0 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-bg shadow-[0_0_0_5px_var(--color-accent-soft)] lg:size-3.5" />
            {/* Above and to the left of its point: the rising line leaves that corner empty. */}
            <div className="absolute bottom-2.5 right-2.5 flex flex-col items-end gap-0.5 whitespace-nowrap text-right">
              <span className="font-mono text-[11px] font-medium tracking-wider text-accent sm:text-xs">
                {milestone.year}
              </span>
              <span className="hidden text-xs text-muted lg:block">{t(milestone.label, lang)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
