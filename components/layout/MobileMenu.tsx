"use client";

import { useRef, type CSSProperties } from "react";
import type { Lang } from "@/content/types";
import { profile } from "@/content";
import { openCommandPalette } from "@/lib/command";
import { SECTIONS, tr } from "@/lib/i18n";

/**
 * Full-screen menu below lg. A native modal <dialog> gives focus trapping,
 * Escape to close and an inert page behind it for free; links stagger in.
 */
export function MobileMenu({ lang, className = "" }: { lang: Lang; className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label={tr("nav.openMenu", lang)}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className={`${className} grid w-12 place-items-center text-fg lg:hidden`}
      >
        <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M3 7h14M3 13h9" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={tr("nav.menu", lang)}
        className="sheet m-0 h-dvh w-screen bg-bg"
        onClick={(event) => {
          // A tap on the backdrop area (the dialog itself, not its content) closes it.
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="flex h-full flex-col px-5 pb-8 pt-4 sm:px-8">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-semibold tracking-wider text-fg">JCR</span>
            <button
              type="button"
              onClick={close}
              aria-label={tr("nav.closeMenu", lang)}
              className="grid size-12 place-items-center rounded-full border border-line bg-surface text-fg"
            >
              <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M5 5l10 10M15 5 5 15" />
              </svg>
            </button>
          </div>

          <nav aria-label={tr("a11y.mainNav", lang)} className="mt-10 flex-1">
            <ul className="flex flex-col gap-1">
              {SECTIONS.map((section, index) => (
                <li key={section.id} className="menu-link" style={{ "--i": index } as CSSProperties}>
                  <a
                    href={`#${section.id}`}
                    onClick={close}
                    className="group flex items-baseline gap-4 py-1.5 font-display text-[clamp(2.25rem,9vw,3.5rem)] font-bold leading-none tracking-[-0.03em] text-fg"
                  >
                    <span className="font-mono text-xs font-normal tracking-wider text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="transition-colors group-hover:text-accent">{tr(section.label, lang)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div
            className="menu-link flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted"
            style={{ "--i": SECTIONS.length } as CSSProperties}
          >
            <button
              type="button"
              onClick={() => {
                close();
                openCommandPalette();
              }}
              className="self-start rounded-full border border-line px-4 py-2 text-fg"
            >
              {tr("cmd.title", lang)}
            </button>
            <a href={`mailto:${profile.email}`} className="text-fg">
              {profile.email}
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              {profile.linkedinLabel}
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
