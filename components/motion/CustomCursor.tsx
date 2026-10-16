"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='option'], label, summary, [data-tilt]";

/**
 * A ring that trails the pointer and swells over anything clickable, plus a
 * dot that sits exactly on it. Over elements that carry `data-cursor`, the
 * ring fills with the accent and says what a click does ("Ver", "Abrir"…).
 * Desktop with a mouse only; the native cursor stays visible, so nothing about
 * pointing or text selection changes.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const label = labelRef.current;
    const dot = dotRef.current;
    if (!ring || !label || !dot) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let frame = 0;
    let visible = false;

    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      // Any movement means the pointer is here, even after a stray leave event.
      if (!visible || !ring.hasAttribute("data-visible")) {
        if (!visible) {
          rx = x;
          ry = y;
        }
        visible = true;
        ring.setAttribute("data-visible", "");
        dot.setAttribute("data-visible", "");
      }
      const target = event.target as Element | null;
      const text = target?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? "";
      const hovering = Boolean(target?.closest(INTERACTIVE));
      const typing = Boolean(target?.closest("input, textarea, [contenteditable='true']"));
      if (label.textContent !== text) label.textContent = text;
      ring.toggleAttribute("data-label", Boolean(text) && !typing);
      ring.toggleAttribute("data-hover", hovering && !text && !typing);
      ring.toggleAttribute("data-hidden", typing);
      dot.toggleAttribute("data-hidden", typing || hovering);
    };
    const onLeave = () => {
      visible = false;
      ring.removeAttribute("data-visible");
      dot.removeAttribute("data-visible");
    };
    const onDown = () => ring.setAttribute("data-press", "");
    const onUp = () => ring.removeAttribute("data-press");

    frame = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="group/cursor pointer-events-none fixed left-0 top-0 z-[90] hidden size-9 items-center justify-center rounded-full border border-accent opacity-0 transition-[width,height,opacity,background-color,border-color] duration-300 ease-out-expo data-[visible]:opacity-100 data-[hover]:size-14 data-[hover]:border-transparent data-[hover]:bg-accent/15 data-[label]:size-[4.5rem] data-[label]:border-transparent data-[label]:bg-accent data-[press]:scale-90 data-[hidden]:opacity-0 fx:flex"
      >
        <span
          ref={labelRef}
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-fg opacity-0 transition-opacity duration-200 group-data-[label]/cursor:opacity-100"
        />
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] hidden size-1.5 rounded-full bg-accent opacity-0 transition-opacity duration-200 data-[visible]:opacity-100 data-[hidden]:opacity-0 fx:block"
      />
    </>
  );
}
