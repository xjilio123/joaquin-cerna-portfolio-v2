"use client";

import { useEffect, useRef } from "react";
import { milestones } from "@/content/milestones";
import { CHART_BREAKPOINT, CHART_INNER, chartPoint, type ChartRect } from "@/lib/chart";

/*
 * The hero's particle field.
 *
 * Every particle carries three homes: a scattered one, a point on the letters
 * of the name, and a place on the chart (the line, the area under it, or a
 * milestone). On arrival the particles write the name exactly over the real
 * heading, which then fades in as they let go; scroll progress through the
 * pinned hero then sorts the cloud into the chart.
 *
 * All motion is computed in the vertex shader from a handful of uniforms, so a
 * frame costs one draw call no matter how many particles there are. Raw WebGL
 * keeps the bundle small; nothing here needs a scene graph.
 */

const VERTEX = /* glsl */ `
attribute vec3 aScatter;  // x, y in 0..1, depth 0..1
attribute vec3 aTarget;   // x, y in 0..1, kind: 0 area · 1 line · 2 milestone
attribute float aSeed;
attribute vec2 aName;     // a point on the glyphs of the hero name, 0..1

uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uTime;
uniform float uProgress;
uniform float uIntro;
uniform float uDpr;
uniform float uMotion;
uniform float uScale;
uniform float uName;      // 0..1 how firmly the particles hold the name

varying float vAlpha;
varying float vSettled;

void main() {
  float t = uTime * uMotion;
  vec2 drift = vec2(sin(t * 0.21 + aSeed * 6.2831), cos(t * 0.17 + aSeed * 11.0)) * 0.018 * (0.4 + aScatter.z);
  vec2 scatter = aScatter.xy + drift;

  float local = clamp(uProgress * 1.35 - aSeed * 0.35, 0.0, 1.0);
  float p = local * local * (3.0 - 2.0 * local);

  vec2 target = aTarget.xy + vec2(0.0, sin(t * 1.3 + aSeed * 40.0) * 0.0025);
  vec2 pos = mix(scatter, target, p);

  float nameLocal = clamp(uName * 1.3 - aSeed * 0.3, 0.0, 1.0);
  float nm = nameLocal * nameLocal * (3.0 - 2.0 * nameLocal);
  pos = mix(pos, aName + vec2(sin(t * 2.0 + aSeed * 30.0) * 0.0006, 0.0), nm);
  float held = max(p, nm);

  float intro = clamp(uIntro * 1.4 - aSeed * 0.4, 0.0, 1.0);
  intro = 1.0 - pow(1.0 - intro, 3.0);
  pos = mix(vec2(0.5, 0.55), pos, intro);

  vec2 px = pos * uRes;
  vec2 d = px - uMouse;
  float dist = length(d) + 0.0001;
  float radius = 150.0 * uDpr;
  float push = max(0.0, radius - dist) / radius;
  px += (d / dist) * push * push * 70.0 * uDpr * (1.0 - 0.75 * held) * uMotion;

  vec2 clip = (px / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  float kind = aTarget.z;
  float settledSize = kind > 1.5 ? 4.0 : (kind > 0.5 ? 2.4 : 1.8);
  gl_PointSize = mix(mix(1.4 + aScatter.z * 2.4, settledSize, p), 3.2, nm) * uDpr * uScale;

  // Milestones stay soft: the crisp marker is a DOM ring (ChartLabels); stacked
  // additive particles would otherwise burn out to a white blob.
  float settledAlpha = kind > 1.5 ? 0.45 : (kind > 0.5 ? 0.85 : 0.3);
  vAlpha = mix(mix(0.22 + aScatter.z * 0.5, settledAlpha, p), 0.95, nm) * intro;
  vSettled = held;
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uAccent;
uniform vec3 uMuted;
varying float vAlpha;
varying float vSettled;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.12, d) * vAlpha;
  vec3 color = mix(uMuted, uAccent, 0.35 + 0.65 * vSettled);
  gl_FragColor = vec4(color * a, a);
}
`;

const MILESTONE_SHARE = 0.025;
const LINE_SHARE = 0.55;

function gaussian() {
  // Box–Muller, good enough for jitter.
  return Math.sqrt(-2 * Math.log(Math.random() + 1e-9)) * Math.cos(2 * Math.PI * Math.random());
}

function buildTargets(count: number, rect: ChartRect, kinds: Float32Array, picks: Float32Array) {
  const targets = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const kind = kinds[i];
    const pick = picks[i];
    let x: number;
    let y: number;
    if (kind === 2) {
      const m = milestones[Math.floor(pick * milestones.length) % milestones.length];
      [x, y] = chartPoint(m.t, rect);
      x += gaussian() * 0.0025;
      y += gaussian() * 0.004;
    } else if (kind === 1) {
      [x, y] = chartPoint(pick, rect);
      y += gaussian() * 0.0035;
    } else {
      const [cx, top] = chartPoint(pick, rect);
      // Denser just under the line, thinning towards the baseline.
      x = cx;
      y = top + (rect.y1 - top) * Math.pow(Math.random(), 1.7);
    }
    targets[i * 3] = x;
    targets[i * 3 + 1] = y;
    targets[i * 3 + 2] = kind;
  }
  return targets;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Parses the computed value of a registered <color> property: "rgb(r, g, b)" or hex. */
function readColor(value: string, fallback: [number, number, number]): [number, number, number] {
  const v = value.trim();
  const rgb = v.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (rgb) return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255];
  const hex = v.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  return fallback;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const section = canvas.closest<HTMLElement>("[data-hero]");
    const stage = canvas.closest<HTMLElement>("[data-hero-stage]");
    const readout = stage?.querySelector<HTMLElement>("[data-sorted-value]") ?? null;
    if (!section || !stage) return;

    // The real heading stays hidden until the particles have written it
    // (globals.css). Any path that cannot draw it must reveal it at once.
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      stage.setAttribute("data-name", "revealed");
    };

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl || gl.isContextLost()) {
      reveal(); // No WebGL: the labels and copy still tell the story.
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      reveal();
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      reveal();
      return;
    }
    gl.useProgram(program);

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) reveal();
    const desktopQuery = matchMedia(CHART_BREAKPOINT);
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    const count = Math.round((desktopQuery.matches ? 2600 : 1400) * (lowPower ? 0.5 : 1));

    // The plot area: the chart box's inner rect, mapped into canvas-normalised
    // coordinates. Measured from the layout, so it follows the real space the
    // hero leaves for the chart on every screen.
    const box = stage.querySelector<HTMLElement>("[data-chart-box]");
    const plotRect = (): ChartRect => {
      const c = canvas.getBoundingClientRect();
      const b = (box ?? canvas).getBoundingClientRect();
      const nx = (px: number) => (px - c.left) / Math.max(1, c.width);
      const ny = (py: number) => (py - c.top) / Math.max(1, c.height);
      return {
        x0: nx(b.left + CHART_INNER.x0 * b.width),
        x1: nx(b.left + CHART_INNER.x1 * b.width),
        y0: ny(b.top + CHART_INNER.y0 * b.height),
        y1: ny(b.top + CHART_INNER.y1 * b.height),
      };
    };

    // Per-particle constants. On desktop the cloud fills the screen; below lg it
    // gathers in the band around the chart, so it never sits behind the text.
    const scatterSeed = new Float32Array(count * 3).map(() => Math.random());
    const buildScatter = (desktop: boolean, rect: ChartRect) => {
      const out = new Float32Array(count * 3);
      const top = desktop ? -0.05 : rect.y0 - 0.08;
      const span = desktop ? 1.1 : rect.y1 - rect.y0 + 0.14;
      for (let i = 0; i < count; i++) {
        out[i * 3] = scatterSeed[i * 3] * 1.1 - 0.05;
        out[i * 3 + 1] = top + scatterSeed[i * 3 + 1] * span;
        out[i * 3 + 2] = scatterSeed[i * 3 + 2];
      }
      return out;
    };
    const seeds = new Float32Array(count);
    const kinds = new Float32Array(count);
    const picks = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seeds[i] = Math.random();
      const r = Math.random();
      kinds[i] = r < MILESTONE_SHARE ? 2 : r < MILESTONE_SHARE + LINE_SHARE ? 1 : 0;
      picks[i] = Math.random();
    }

    const bind = (name: string, data: Float32Array, size: number) => {
      const buffer = gl.createBuffer();
      const location = gl.getAttribLocation(program, name);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
      return buffer;
    };

    const initialRect = plotRect();
    const scatterBuffer = bind("aScatter", buildScatter(desktopQuery.matches, initialRect), 3);
    bind("aSeed", seeds, 1);
    const targetBuffer = bind("aTarget", buildTargets(count, initialRect, kinds, picks), 3);

    const nameBuffer = bind("aName", new Float32Array(count * 2), 2);

    /**
     * Points on the glyphs of the hero heading, in canvas-normalised space:
     * every character is drawn where it really sits, in the same font, then
     * the drawing is sampled. Returns false when there is nothing to draw on.
     */
    const sampleName = () => {
      const heading = stage.querySelector("h1");
      const chars = heading ? Array.from(heading.querySelectorAll<HTMLElement>(".hero-char")) : [];
      const c = canvas.getBoundingClientRect();
      if (!heading || !chars.length || c.width < 1 || c.height < 1) return false;
      // Only the heading's own box is drawn and read back, not the whole hero,
      // padded because the tight line-height lets glyphs overflow the box.
      const style = getComputedStyle(heading);
      const size = parseFloat(style.fontSize);
      const pad = Math.ceil(size * 0.35);
      const h = heading.getBoundingClientRect();
      const ox = Math.max(0, Math.floor(h.left - c.left) - pad);
      const oy = Math.max(0, Math.floor(h.top - c.top) - pad);
      const ow = Math.min(Math.ceil(c.width) - ox, Math.ceil(h.width) + pad * 2);
      const oh = Math.min(Math.ceil(c.height) - oy, Math.ceil(h.height) + pad * 2);
      if (ow < 1 || oh < 1) return false;
      const off = document.createElement("canvas");
      off.width = ow;
      off.height = oh;
      const ctx = off.getContext("2d", { willReadFrequently: true });
      if (!ctx) return false;
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#fff";
      const metrics = ctx.measureText("Hg");
      const ascent = metrics.fontBoundingBoxAscent || size * 0.8;
      const descent = metrics.fontBoundingBoxDescent || size * 0.2;
      for (const char of chars) {
        const r = char.getBoundingClientRect();
        const baseline = r.top - c.top - oy + (r.height - (ascent + descent)) / 2 + ascent;
        ctx.fillText(char.textContent ?? "", r.left - c.left - ox, baseline);
      }
      const { data } = ctx.getImageData(0, 0, ow, oh);
      const width = Math.ceil(c.width);
      const height = Math.ceil(c.height);
      const step = 3;
      const points: number[] = [];
      for (let y = 0; y < oh; y += step) {
        for (let x = 0; x < ow; x += step) {
          if (data[(y * ow + x) * 4 + 3] > 140) points.push((x + ox) / width, (y + oy) / height);
        }
      }
      const total = points.length / 2;
      if (total < 50) return false;
      const out = new Float32Array(count * 2);
      for (let i = 0; i < count; i++) {
        const k = Math.floor(Math.random() * total);
        out[i * 2] = points[k * 2] + ((Math.random() - 0.5) * step) / width;
        out[i * 2 + 1] = points[k * 2 + 1] + ((Math.random() - 0.5) * step) / height;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, nameBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, out, gl.STATIC_DRAW);
      return true;
    };

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uName = u("uName");
    const uScale = u("uScale");
    const uRes = u("uRes");
    const uMouse = u("uMouse");
    const uTime = u("uTime");
    const uProgress = u("uProgress");
    const uIntro = u("uIntro");
    const uDpr = u("uDpr");
    const uMotion = u("uMotion");
    const uAccent = u("uAccent");
    const uMuted = u("uMuted");

    // Re-target the particles whenever the chart box moves or resizes.
    let geometryKey = "";
    const updateGeometry = () => {
      const desktop = desktopQuery.matches;
      const rect = plotRect();
      const key = [desktop, rect.x0, rect.x1, rect.y0, rect.y1].map((v) => (typeof v === "number" ? v.toFixed(3) : v)).join();
      if (key === geometryKey) return;
      geometryKey = key;
      gl.bindBuffer(gl.ARRAY_BUFFER, scatterBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, buildScatter(desktop, rect), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, targetBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, buildTargets(count, rect, kinds, picks), gl.STATIC_DRAW);
      gl.uniform1f(uScale, desktop ? 1 : 0.8);
    };
    updateGeometry();
    desktopQuery.addEventListener("change", updateGeometry);
    const geometryObserver = new ResizeObserver(updateGeometry);
    geometryObserver.observe(canvas);
    if (box) geometryObserver.observe(box);

    gl.uniform1f(uMotion, reduceMotion ? 0 : 1);
    gl.enable(gl.BLEND);

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uDpr, dpr);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Scroll progress through the pinned hero, eased towards its target.
    let progressTarget = 0;
    let progress = 0;
    const measure = () => {
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      progressTarget = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
    };
    measure();
    progress = progressTarget;
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    // Pointer, in canvas pixels; parked far away when absent.
    const mouse = { x: -1e5, y: -1e5, tx: -1e5, ty: -1e5 };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      mouse.tx = (event.clientX - rect.left) * dpr;
      mouse.ty = (event.clientY - rect.top) * dpr;
      if (mouse.x < -1e4) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
    };
    const onPointerLeave = () => {
      mouse.tx = mouse.x = -1e5;
      mouse.ty = mouse.y = -1e5;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    // Run only while the hero is on screen and the tab is visible.
    let onScreen = true;
    let frame = 0;
    let running = false;
    const start = performance.now();
    let introStart: number | null = null;
    let lastP = -1;
    let lastReadout = -1;
    const html = document.documentElement;
    const fallbackAccent: [number, number, number] = [0.42, 0.58, 1];
    const fallbackMuted: [number, number, number] = [0.64, 0.66, 0.71];

    // Colours are read once per theme change, never per frame: a computed-style
    // read inside the loop would force a style pass on every frame.
    const palette = { accent: fallbackAccent, muted: fallbackMuted, light: false };
    const readPalette = () => {
      const styles = getComputedStyle(html);
      palette.accent = readColor(styles.getPropertyValue("--accent"), fallbackAccent);
      palette.muted = readColor(styles.getPropertyValue("--muted"), fallbackMuted);
      palette.light = html.getAttribute("data-theme") === "light";
    };
    readPalette();
    const themeObserver = new MutationObserver(readPalette);
    themeObserver.observe(html, { attributes: true, attributeFilter: ["data-theme", "data-accent"] });

    // Name phase: write the name (form), keep it (hold), let go (leave).
    const NAME_FORM = 1300;
    const NAME_HOLD = 900;
    const NAME_LEAVE = 1300;
    let nameStart: number | null = null;

    const nameAmount = (now: number) => {
      if (nameStart === null) return 0;
      // A visitor already scrolling should not wait for the show.
      if (progressTarget > 0.04 && now - nameStart < NAME_FORM + NAME_HOLD) nameStart = now - NAME_FORM - NAME_HOLD;
      const e = now - nameStart;
      if (e >= NAME_FORM + NAME_HOLD * 0.35) reveal();
      if (e < NAME_FORM) return 1 - Math.pow(1 - e / NAME_FORM, 3);
      if (e < NAME_FORM + NAME_HOLD) return 1;
      if (e < NAME_FORM + NAME_HOLD + NAME_LEAVE) {
        const u = (e - NAME_FORM - NAME_HOLD) / NAME_LEAVE;
        return 1 - u * u * (3 - 2 * u);
      }
      nameStart = null;
      return 0;
    };

    const render = (now: number) => {
      if (introStart === null && html.hasAttribute("data-ready")) {
        introStart = now;
        if (!reduceMotion && sampleName()) nameStart = now;
        else reveal();
      }
      const intro = reduceMotion ? 1 : introStart === null ? 0 : Math.min(1, (now - introStart) / 1800);
      gl.uniform1f(uName, nameAmount(now));

      progress += (progressTarget - progress) * (reduceMotion ? 1 : 0.085);
      if (Math.abs(progress - lastP) > 0.0005) {
        stage.style.setProperty("--p", progress.toFixed(4));
        lastP = progress;
      }
      const shown = Math.round(progress * 100);
      if (readout && shown !== lastReadout) {
        readout.textContent = String(shown).padStart(3, "0");
        lastReadout = shown;
      }

      mouse.x += (mouse.tx - mouse.x) * 0.15;
      mouse.y += (mouse.ty - mouse.y) * 0.15;

      const { accent, muted, light } = palette;

      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uProgress, progress);
      gl.uniform1f(uIntro, intro);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform3f(uAccent, accent[0], accent[1], accent[2]);
      gl.uniform3f(uMuted, muted[0], muted[1], muted[2]);
      // Additive glow on dark paper, plain alpha on light paper.
      if (light) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      else gl.blendFunc(gl.ONE, gl.ONE);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);

      frame = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (running || !onScreen || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(render);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) startLoop();
      else stopLoop();
    });
    intersection.observe(section);

    const onVisibility = () => (document.hidden ? stopLoop() : startLoop());
    document.addEventListener("visibilitychange", onVisibility);

    startLoop();

    return () => {
      stopLoop();
      themeObserver.disconnect();
      intersection.disconnect();
      resizeObserver.disconnect();
      desktopQuery.removeEventListener("change", updateGeometry);
      geometryObserver.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      // The context is not force-lost here: if React shows this canvas again
      // (hidden-then-visible Activity), the same context must still work.
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}
