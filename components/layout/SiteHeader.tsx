"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Lang } from "@/content/types";
import { AccentPicker } from "@/components/theme/AccentPicker";
import { LangToggle } from "@/components/theme/LangToggle";
import { ModeToggle } from "@/components/theme/ModeToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { openCommandPalette } from "@/lib/command";
import { SECTIONS, tr } from "@/lib/i18n";

const pill =
  "rounded-full border border-line bg-surface/70 backdrop-blur-xl transition-[height,background-color,box-shadow] duration-500 ease-out-expo";

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const noop = () => () => {};

/**
 * Fixed header. It condenses once the page moves, slides away while the
 * visitor reads downwards and returns the moment they scroll up. The active
 * section is tracked with an IntersectionObserver and marked by a pill that
 * glides between links. A hairline at the very top shows reading progress.
 */
export function SiteHeader({ lang }: { lang: Lang }) {
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const mac = useSyncExternalStore(noop, isMac, () => false);

  // Scroll: condense, hide/show, progress hairline.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setCondensed(y > 24);
      if (y < 160 || y < lastY - 4) setHidden(false);
      else if (y > lastY + 4) setHidden(true);
      lastY = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Active section: whichever section crosses the middle band of the viewport.
  useEffect(() => {
    const targets = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    const hero = document.getElementById("top");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setActive(entry.target.id === "top" ? null : entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    if (hero) observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Move the indicator pill under the active link.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const place = () => {
      const link = active ? list.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
      setIndicator(link ? { left: link.offsetLeft, width: link.offsetWidth } : null);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active, lang]);

  const height = condensed ? "h-11" : "h-12";
  const raised = condensed ? "bg-surface/85 shadow-lg shadow-black/10" : "";

  return (
    <>
      <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-0.5">
        <div ref={progressRef} className="h-full origin-left scale-x-0 bg-accent" />
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-4 pt-4 transition-transform duration-500 ease-out-expo sm:px-6 lg:px-8 ${
          hidden ? "-translate-y-[130%]" : "translate-y-0"
        }`}
        onFocusCapture={() => setHidden(false)}
      >
        <Link
          href={`/${lang}`}
          aria-label={tr("nav.home", lang)}
          className={`${pill} ${height} ${raised} grid place-items-center px-5 font-mono text-sm font-semibold tracking-wider text-fg hover:text-accent`}
        >
          JCR
        </Link>

        <nav aria-label={tr("a11y.mainNav", lang)} className={`${pill} ${height} ${raised} hidden items-center px-1.5 lg:flex`}>
          <ul ref={listRef} className="relative flex items-center">
            <span
              aria-hidden
              className="absolute inset-y-0 my-auto h-8 rounded-full bg-surface-2 transition-[transform,width,opacity] duration-500 ease-out-expo"
              style={{
                width: indicator?.width ?? 0,
                transform: `translateX(${indicator?.left ?? 0}px)`,
                opacity: indicator ? 1 : 0,
              }}
            />
            {SECTIONS.map((section) => (
              <li key={section.id} className="relative">
                <a
                  href={`#${section.id}`}
                  data-scramble
                  aria-current={active === section.id ? "location" : undefined}
                  className={`block rounded-full px-3.5 py-1.5 text-sm transition-colors duration-300 xl:px-4 ${
                    active === section.id ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {tr(section.label, lang)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label={tr("cmd.open", lang)}
            aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
            className={`${pill} ${height} ${raised} hidden items-center gap-2 pl-4 pr-2 text-sm text-muted hover:text-fg xl:flex`}
          >
            {tr("nav.search", lang)}
            <kbd className="rounded-full border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg">
              {mac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          <div
            role="group"
            aria-label={tr("a11y.preferences", lang)}
            className={`${pill} ${height} ${raised} flex items-center gap-1 px-1`}
          >
            <LangToggle lang={lang} />
            <span aria-hidden className="mx-1 h-5 w-px bg-line" />
            <ModeToggle lang={lang} />
            <AccentPicker lang={lang} />
          </div>

          <MobileMenu lang={lang} className={`${pill} ${height} ${raised}`} />
        </div>
      </header>
    </>
  );
}
