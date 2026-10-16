import { milestones } from "@/content/milestones";

/**
 * Geometry of the hero chart, shared by the WebGL particle field and the DOM
 * markers so both land on exactly the same points.
 *
 * The chart lives in a real layout box ([data-chart-box] in the hero): on
 * phones it takes the free space between the header and the text, on desktop
 * the upper-right quadrant. Coordinates here are normalised to that box, so
 * the chart can never overlap the copy whatever the screen height.
 */
export interface ChartRect {
  x0: number;
  x1: number;
  /** Top of the chart (highest value). */
  y0: number;
  /** Baseline. */
  y1: number;
}

/** The plot area inside the chart box; the margins leave room for the year labels. */
export const CHART_INNER: ChartRect = { x0: 0.12, x1: 0.97, y0: 0.16, y1: 0.94 };

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
