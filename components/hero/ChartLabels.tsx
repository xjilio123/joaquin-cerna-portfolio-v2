import type { CSSProperties } from "react";
import type { Lang } from "@/content/types";
import { milestones } from "@/content/milestones";
import { CHART_DESKTOP, CHART_MOBILE, chartPoint } from "@/lib/chart";
import { t } from "@/lib/i18n";

const pct = (value: number) => `${(value * 100).toFixed(2)}%`;

/**
 * Milestone labels pinned to the exact points the particles settle on. They
 * fade in only as the chart completes (driven by --p on the hero stage).
 * Below lg only the year shows; the band is too narrow for sentences.
 */
export function ChartLabels({ lang }: { lang: Lang }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 [--show:clamp(0,calc((var(--p,0)_-_0.72)*4),1)]">
      {/* Baseline */}
      <div
        className="absolute h-px origin-left bg-line opacity-[var(--show)] [left:var(--bx-m)] [top:var(--by-m)] [width:var(--bw-m)] lg:[left:var(--bx-d)] lg:[top:var(--by-d)] lg:[width:var(--bw-d)]"
        style={
          {
            "--bx-m": pct(CHART_MOBILE.x0),
            "--by-m": pct(CHART_MOBILE.y1),
            "--bw-m": pct(CHART_MOBILE.x1 - CHART_MOBILE.x0),
            "--bx-d": pct(CHART_DESKTOP.x0),
            "--by-d": pct(CHART_DESKTOP.y1),
            "--bw-d": pct(CHART_DESKTOP.x1 - CHART_DESKTOP.x0),
          } as CSSProperties
        }
      />

      {milestones.map((milestone) => {
        const [xm, ym] = chartPoint(milestone.t, CHART_MOBILE);
        const [xd, yd] = chartPoint(milestone.t, CHART_DESKTOP);
        return (
          <div
            key={milestone.id}
            className="absolute opacity-[var(--show)] [left:var(--x-m)] [top:var(--y-m)] lg:[left:var(--x-d)] lg:[top:var(--y-d)]"
            style={
              {
                "--x-m": pct(xm),
                "--y-m": pct(ym),
                "--x-d": pct(xd),
                "--y-d": pct(yd),
              } as CSSProperties
            }
          >
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
