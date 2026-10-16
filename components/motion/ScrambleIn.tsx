"use client";

import { useEffect } from "react";
import { SCRAMBLE_FLAG } from "@/lib/scroll";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const DURATION = 700;

/**
 * After a language switch, the visible [data-scramble] texts arrive as random
 * glyphs that resolve left to right into the new language. Only text nodes are
 * touched and every one is restored to its exact original at the end, so React
 * keeps owning the DOM.
 */
export function ScrambleIn() {
  useEffect(() => {
    let flagged = false;
    try {
      flagged = sessionStorage.getItem(SCRAMBLE_FLAG) === "1";
      sessionStorage.removeItem(SCRAMBLE_FLAG);
    } catch {}
    if (!flagged || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes: { node: Text; original: string }[] = [];
    document.querySelectorAll<HTMLElement>("[data-scramble]").forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        if (node.nodeValue?.trim()) nodes.push({ node, original: node.nodeValue });
      }
    });
    if (!nodes.length) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION);
      for (const { node, original } of nodes) {
        const settled = Math.floor(original.length * progress);
        let text = original.slice(0, settled);
        for (let i = settled; i < original.length; i++) {
          const char = original[i];
          text += char === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        node.nodeValue = text;
      }
      if (progress < 1) frame = requestAnimationFrame(tick);
      else for (const { node, original } of nodes) node.nodeValue = original;
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      for (const { node, original } of nodes) node.nodeValue = original;
    };
  }, []);

  return null;
}
