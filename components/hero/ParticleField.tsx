"use client";

import { useEffect, useRef } from "react";
import { milestones } from "@/content/milestones";
import { CHART_BREAKPOINT, CHART_DESKTOP, CHART_MOBILE, chartPoint, type ChartRect } from "@/lib/chart";

/*
 * The hero's particle field.
 *
 * Every particle carries two homes: a scattered one and a place on the chart
 * (the line, the area under it, or a milestone). Scroll progress through the
 * pinned hero blends between them, each particle on its own slightly offset
 * schedule, so the cloud visibly sorts itself into the chart.
 *
 * All motion is computed in the vertex shader from a handful of uniforms, so a
 * frame costs one draw call no matter how many particles there are. Raw WebGL
 * keeps the bundle small; nothing here needs a scene graph.
 */

const VERTEX = /* glsl */ `
attribute vec3 aScatter;  // x, y in 0..1, depth 0..1
attribute vec3 aTarget;   // x, y in 0..1, kind: 0 area · 1 line · 2 milestone
attribute float aSeed;

uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uTime;
uniform float uProgress;
uniform float uIntro;
uniform float uDpr;
uniform float uMotion;

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

  float intro = clamp(uIntro * 1.4 - aSeed * 0.4, 0.0, 1.0);
  intro = 1.0 - pow(1.0 - intro, 3.0);
  pos = mix(vec2(0.5, 0.55), pos, intro);

  vec2 px = pos * uRes;
  vec2 d = px - uMouse;
  float dist = length(d) + 0.0001;
  float radius = 150.0 * uDpr;
  float push = max(0.0, radius - dist) / radius;
  px += (d / dist) * push * push * 70.0 * uDpr * (1.0 - 0.75 * p) * uMotion;

  vec2 clip = (px / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  float kind = aTarget.z;
  float settledSize = kind > 1.5 ? 6.0 : (kind > 0.5 ? 2.6 : 1.9);
  gl_PointSize = mix(1.4 + aScatter.z * 2.4, settledSize, p) * uDpr;

  float settledAlpha = kind > 1.5 ? 1.0 : (kind > 0.5 ? 0.9 : 0.3);
  vAlpha = mix(0.22 + aScatter.z * 0.5, settledAlpha, p) * intro;
  vSettled = p;
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

const MILESTONE_SHARE = 0.05;
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

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) return; // No WebGL: the labels and copy still tell the story.

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktopQuery = matchMedia(CHART_BREAKPOINT);
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    const count = Math.round((desktopQuery.matches ? 2600 : 1400) * (lowPower ? 0.5 : 1));

    // Per-particle constants.
    const scatter = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const kinds = new Float32Array(count);
    const picks = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      scatter[i * 3] = Math.random() * 1.1 - 0.05;
      scatter[i * 3 + 1] = Math.random() * 1.1 - 0.05;
      scatter[i * 3 + 2] = Math.random();
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

    bind("aScatter", scatter, 3);
    bind("aSeed", seeds, 1);
    const targetBuffer = bind(
      "aTarget",
      buildTargets(count, desktopQuery.matches ? CHART_DESKTOP : CHART_MOBILE, kinds, picks),
      3,
    );

    const onBreakpoint = () => {
      gl.bindBuffer(gl.ARRAY_BUFFER, targetBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        buildTargets(count, desktopQuery.matches ? CHART_DESKTOP : CHART_MOBILE, kinds, picks),
        gl.STATIC_DRAW,
      );
    };
    desktopQuery.addEventListener("change", onBreakpoint);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u("uRes");
    const uMouse = u("uMouse");
    const uTime = u("uTime");
    const uProgress = u("uProgress");
    const uIntro = u("uIntro");
    const uDpr = u("uDpr");
    const uMotion = u("uMotion");
    const uAccent = u("uAccent");
    const uMuted = u("uMuted");

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

    const render = (now: number) => {
      if (introStart === null && html.hasAttribute("data-ready")) introStart = now;
      const intro = reduceMotion ? 1 : introStart === null ? 0 : Math.min(1, (now - introStart) / 1800);

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

      // Reading the live tokens means the field follows the 500 ms accent melt for free.
      const styles = getComputedStyle(html);
      const accent = readColor(styles.getPropertyValue("--accent"), fallbackAccent);
      const muted = readColor(styles.getPropertyValue("--muted"), fallbackMuted);
      const light = html.getAttribute("data-theme") === "light";

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
      intersection.disconnect();
      resizeObserver.disconnect();
      desktopQuery.removeEventListener("change", onBreakpoint);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}
