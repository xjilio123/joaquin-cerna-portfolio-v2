"use client";

import { useState } from "react";
import type { Lang } from "@/content/types";
import { profile } from "@/content";
import { tr } from "@/lib/i18n";

export function CopyEmailButton({ lang }: { lang: Lang }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      data-cursor={tr("cursor.copy", lang)}
      onClick={() => {
        navigator.clipboard
          ?.writeText(profile.email)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          })
          .catch(() => {
            window.location.href = `mailto:${profile.email}`;
          });
      }}
      className={`rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
        copied ? "border-accent bg-accent text-accent-fg" : "border-line text-fg hover:border-fg"
      }`}
    >
      <span aria-live="polite">{copied ? `✓ ${tr("contact.copied", lang)}` : tr("contact.copy", lang)}</span>
    </button>
  );
}

/** Decodes the phone stored in content/profile.ts: base64 → digits reversed back → "999 999 999". */
function decodePhone(encoded: string) {
  const digits = [...atob(encoded)].reverse().join("");
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ");
}

/** The number is decoded only on request, so it is never a scrapeable string. */
export function RevealPhone({ lang }: { lang: Lang }) {
  const [shown, setShown] = useState(false);
  if (shown) {
    const full = `${profile.phone.country} ${decodePhone(profile.phone.encoded)}`;
    return (
      <a href={`tel:${full.replace(/\s/g, "")}`} className="font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">
        {full}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      className="rounded-full border border-line px-4 py-2 text-sm text-fg transition-colors hover:border-fg"
    >
      {tr("contact.reveal", lang)}
    </button>
  );
}
