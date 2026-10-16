import { milestones } from "@/content/milestones";

/**
 * Geometry of the hero chart, shared by the WebGL particle field and the DOM
 * labels so both land on exactly the same points. Coordinates are normalised
 * to the hero viewport: x 0 → 1 left to right, y 0 → 1 top to bottom.
 */
export interface ChartRect {
  x0: number;
  x1: number;
  /** Top of the chart (highest value). */
  y0: number;
  /** Baseline. */
  y1: number;
}

/** Desktop: upper-right quadrant, clear of the name. */
export const CHART_DESKTOP: ChartRect = { x0: 0.57, x1: 0.93, y0: 0.16, y1: 0.5 };
/** Below lg: a band across the top, above the text block. */
export const CHART_MOBILE: ChartRect = { x0: 0.18, x1: 0.9, y0: 0.15, y1: 0.33 };

export const CHART_BREAKPOINT = "(min-width: 1024px)";

const ease = (u: number) => u * u * (3 - 2 * u);

/** Height of the curve (0 → 1) at position t, passing through every milestone. */
export function curveValue(t: number): number {
  const points = milestones;
  if (t <= points[0].t) return points[0].v;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (t <= b.t) {
      const u = (t - a.t) / (b.t - a.t);
      // Half linear, half eased: gentle S-curves that never go flat at a node.
      return a.v + (b.v - a.v) * (0.5 * u + 0.5 * ease(u));
    }
  }
  return points[points.length - 1].v;
}

export function chartPoint(t: number, rect: ChartRect): [number, number] {
  const x = rect.x0 + t * (rect.x1 - rect.x0);
  const y = rect.y1 - curveValue(t) * (rect.y1 - rect.y0);
  return [x, y];
}
