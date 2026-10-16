"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * The portrait redrawn as a halftone of accent-coloured dots, the same
 * material as the hero. Brightness sets each dot's size; the black backdrop
 * leaves no dots. The dots gather the first time the card scrolls in and
 * part around the cursor (or a tap), then settle back.
 *
 * The photo stays underneath as the accessible image and the no-JS fallback;
 * it fades out once the first frame is drawn. Swapping the photo file is all
 * it takes to redraw the portrait.
 */

const SAMPLE_W = 225; // sampling resolution, 3:4 like the card
const SAMPLE_H = 300;
const SHARPEN = 1.2; // edge boost, so glasses and features survive the halftone
const MIN_LEVEL = 0.18;
const PUSH_RADIUS = 72;

/** The card is dark in both themes, so the dots always take the dark-theme accent. */
const DOT_COLORS: Record<string, string> = {
  cobalt: "#6b93ff",
  violet: "#a78bfa",
  crimson: "#ff6b70",
  emerald: "#2cc9a6",
  graphite: "#e8e6e1",
};
const dotColor = () => DOT_COLORS[document.documentElement.dataset.accent ?? ""] ?? DOT_COLORS.cobalt;

function boxBlur(source: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(source.length);
  const out = new Float32Array(source.length);
  const size = r * 2 + 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) sum += source[y * w + Math.min(w - 1, Math.max(0, x + k))];
      tmp[y * w + x] = sum / size;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) sum += tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x];
      out[y * w + x] = sum / size;
    }
  }
  return out;
}

export function PortraitDots({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let levels: Float32Array | null = null;
    // Per dot: home x, home y, radius, x, y, ease
    let homeX = new Float32Array(0);
    let homeY = new Float32Array(0);
    let radius = new Float32Array(0);
    let posX = new Float32Array(0);
    let posY = new Float32Array(0);
    let ease = new Float32Array(0);
    let count = 0;
    let width = 0;
    let height = 0;
    let gathered = reduce;
    let visible = false;
    let frame = 0;
    let color = dotColor();
    const pointer = { x: -1e4, y: -1e4, active: false };
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;

    /** Luminance → 0..1, with the backdrop at 0 and the brightest skin near 1. */
    // The photo is fetched and turned into dots only when the card comes near
    // the screen, in idle time and in short steps, so none of it competes with
    // the page load or with scrolling.
    const idle = (task: () => void) =>
      "requestIdleCallback" in window ? requestIdleCallback(task, { timeout: 600 }) : setTimeout(task, 1);
    const pause = () => new Promise<void>((resolve) => idle(resolve));

    async function readLevels(image: HTMLImageElement) {
      const sample = document.createElement("canvas");
      sample.width = SAMPLE_W;
      sample.height = SAMPLE_H;
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      if (!sctx) return null;
      // object-cover crop into 3:4
      const scale = Math.max(SAMPLE_W / image.naturalWidth, SAMPLE_H / image.naturalHeight);
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;
      sctx.drawImage(image, (SAMPLE_W - dw) / 2, (SAMPLE_H - dh) / 2, dw, dh);
      const { data } = sctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
      // "Red filter" mix, as in black-and-white portraits: skin reads light,
      // greens and blues (clothes, walls) read darker, so the face leads.
      const base = new Float32Array(SAMPLE_W * SAMPLE_H);
      for (let i = 0; i < base.length; i++) base[i] = 0.65 * data[i * 4] + 0.315 * data[i * 4 + 1] + 0.035 * data[i * 4 + 2];
      // Backdrop: the darker top corner. Anything clearly above it is the person.
      const corner = (x0: number) => {
        let sum = 0;
        for (let y = 0; y < 12; y++) for (let x = x0; x < x0 + 12; x++) sum += base[y * SAMPLE_W + x];
        return sum / 144;
      };
      const backdrop = Math.min(corner(0), corner(SAMPLE_W - 12)) + 7;
      await pause();
      // Edge boost: base + k·(base − blur), a box blur of radius 4 run both ways.
      const blur = boxBlur(base, SAMPLE_W, SAMPLE_H, 4);
      await pause();
      const lum = new Float32Array(base.length);
      // Levels from the person's own range (2nd–99.5th percentile), so dark and
      // bright photos both fill the scale. A histogram is enough for percentiles.
      const OFFSET = 512;
      const histogram = new Uint32Array(1536);
      let count = 0;
      for (let i = 0; i < lum.length; i++) {
        lum[i] = base[i] + SHARPEN * (base[i] - blur[i]);
        if (base[i] > backdrop) {
          histogram[Math.min(1535, Math.max(0, Math.round(lum[i]) + OFFSET))]++;
          count++;
        }
      }
      const at = (q: number) => {
        let seen = 0;
        for (let v = 0; v < histogram.length; v++) {
          seen += histogram[v];
          if (seen > count * q) return v - OFFSET;
        }
        return 255;
      };
      const low = at(0.02);
      const span = Math.max(1, at(0.995) - low);
      for (let i = 0; i < lum.length; i++) {
        // The person always keeps a minimum dot, so dark hair and clothes still draw the silhouette.
        lum[i] = base[i] > backdrop ? Math.max(MIN_LEVEL, Math.min(1, Math.max(0, (lum[i] - low) / span))) : 0;
      }
      return lum;
    }

    function layout() {
      if (!levels || !canvas || !ctx || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const spacing = Math.max(3.5, width / 88);
      const maxR = spacing * 0.46;
      const rowH = spacing * 0.866;
      const xs: number[] = [];
      const ys: number[] = [];
      const rs: number[] = [];
      for (let row = 0, y = rowH / 2; y < height; row++, y += rowH) {
        for (let x = (row % 2 ? spacing : spacing / 2); x < width; x += spacing) {
          const sx = Math.min(SAMPLE_W - 1, Math.floor((x / width) * SAMPLE_W));
          const sy = Math.min(SAMPLE_H - 1, Math.floor((y / height) * SAMPLE_H));
          const level = levels[sy * SAMPLE_W + sx];
          if (level < 0.1) continue;
          const r = Math.max(0.55, level * maxR);
          xs.push(x);
          ys.push(y);
          rs.push(r);
        }
      }
      count = xs.length;
      homeX = Float32Array.from(xs);
      homeY = Float32Array.from(ys);
      radius = Float32Array.from(rs);
      ease = new Float32Array(count);
      posX = new Float32Array(count);
      posY = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        ease[i] = 0.05 + Math.random() * 0.06;
        if (gathered) {
          posX[i] = homeX[i];
          posY[i] = homeY[i];
        } else {
          // Scattered like loose data points, waiting to gather.
          posX[i] = Math.random() * width;
          posY[i] = height * 0.15 + Math.random() * height * 0.85;
        }
      }
      draw();
      if (!disposed) setReady(true);
      if (visible) start();
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        ctx.moveTo(posX[i] + radius[i], posY[i]);
        ctx.arc(posX[i], posY[i], radius[i], 0, Math.PI * 2);
      }
      ctx.fill();
    }

    function step() {
      frame = 0;
      let moving = 0;
      for (let i = 0; i < count; i++) {
        let tx = homeX[i];
        let ty = homeY[i];
        if (pointer.active) {
          const dx = homeX[i] - pointer.x;
          const dy = homeY[i] - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < PUSH_RADIUS && dist > 0.01) {
            const push = (1 - dist / PUSH_RADIUS) ** 2 * PUSH_RADIUS * 0.55;
            tx += (dx / dist) * push;
            ty += (dy / dist) * push;
          }
        }
        const k = gathered ? 0.16 : ease[i];
        const ddx = tx - posX[i];
        const ddy = ty - posY[i];
        posX[i] += ddx * k;
        posY[i] += ddy * k;
        moving = Math.max(moving, Math.abs(ddx) + Math.abs(ddy));
      }
      draw();
      if (!gathered && moving < 0.6) gathered = true;
      if (visible && (moving > 0.05 || pointer.active)) frame = requestAnimationFrame(step);
    }

    function start() {
      if (reduce || frame || disposed) return;
      frame = requestAnimationFrame(step);
    }

    const image = new window.Image();
    image.decoding = "async";
    image.onload = () =>
      idle(async () => {
        const read = await readLevels(image);
        if (disposed) return;
        levels = read;
        layout();
      });
    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        nearby.disconnect();
        image.src = src;
      },
      { rootMargin: "400px 0px" },
    );
    nearby.observe(wrap);

    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { threshold: 0.25 },
    );
    visibility.observe(wrap);

    const resize = new ResizeObserver(() => {
      if (Math.abs(wrap.clientWidth - width) > 1 || Math.abs(wrap.clientHeight - height) > 1) layout();
    });
    resize.observe(wrap);

    const recolor = new MutationObserver(() => {
      color = dotColor();
      draw();
    });
    recolor.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent"] });

    const onMove = (event: PointerEvent) => {
      if (reduce) return;
      const rect = wrap.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      clearTimeout(releaseTimer);
      // A tap has no "leave": let the dots settle after a moment.
      if (event.pointerType !== "mouse") releaseTimer = setTimeout(release, 700);
      start();
    };
    const release = () => {
      pointer.active = false;
      start();
    };
    // Touch fires pointerleave as the finger lifts; let the timer release it instead.
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") release();
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerdown", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(releaseTimer);
      visibility.disconnect();
      nearby.disconnect();
      resize.disconnect();
      recolor.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover grayscale contrast-[1.15] transition-opacity duration-700 ${ready ? "opacity-0" : ""}`}
      />
      <div aria-hidden className={`absolute inset-0 bg-accent mix-blend-color transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-60"}`} />
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
    </div>
  );
}
