// WCAG contrast for every mode × accent combination, read straight from
// app/globals.css so there is no second copy of the palette to drift.
// Usage: node scripts/check-contrast.mjs   (exits 1 if any pair fails)
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function block(selector) {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`Missing block ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  const tokens = {};
  for (const [, name, value] of css.slice(open + 1, close).matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)) {
    tokens[name] = value;
  }
  return tokens;
}

const modes = {
  dark: block(":root {"),
  light: block(':root[data-theme="light"] {'),
};
const accents = ["cobalt", "violet", "crimson", "emerald", "graphite"];

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum, what it is]
const pairs = [
  ["fg", "bg", 4.5, "body text on page"],
  ["muted", "bg", 4.5, "secondary text on page"],
  ["fg", "surface", 4.5, "text on cards"],
  ["muted", "surface", 4.5, "secondary text on cards"],
  ["muted", "surface-2", 4.5, "secondary text on raised chips"],
  ["accent", "bg", 4.5, "accent text on page"],
  ["accent", "surface", 4.5, "accent text on cards"],
  ["accent-fg", "accent", 4.5, "button label on accent"],
  ["line", "bg", 1.3, "hairlines (decorative)"],
];

let failures = 0;
const rows = [];
for (const [mode, tokens] of Object.entries(modes)) {
  for (const accentName of accents) {
    const t = { ...tokens, accent: tokens[`a-${accentName}`] };
    let weakest = { value: Infinity, label: "" };
    for (const [fg, bg, min, label] of pairs) {
      const value = ratio(t[fg], t[bg]);
      if (value < min) {
        failures++;
        console.log(`FAIL ${mode}/${accentName}: ${label} ${value.toFixed(2)} < ${min}`);
      }
      if (min >= 4.5 && value < weakest.value) weakest = { value, label };
    }
    rows.push(`${mode.padEnd(6)} ${accentName.padEnd(9)} ${t.accent}  weakest ${weakest.value.toFixed(2)}:1 (${weakest.label})`);
  }
}
console.log(rows.join("\n"));
console.log(failures ? `\n${failures} pair(s) below WCAG AA` : "\nAll 10 themes pass WCAG AA");
process.exit(failures ? 1 : 0);
