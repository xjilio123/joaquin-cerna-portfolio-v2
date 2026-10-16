"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import type { Lang } from "@/content/types";
import { LOCALES, tr } from "@/lib/i18n";
import { switchLanguage } from "@/lib/scroll";

/**
 * ES / EN switch. Each language has its own URL (/es, /en) so search engines
 * index both. Switching reloads the page on purpose (see switchLanguage) and
 * lands the visitor back on the section they were reading.
 */
export function LangToggle({ lang }: { lang: Lang }) {
  const pathname = usePathname();

  const hrefFor = (target: Lang) => pathname.replace(/^\/(es|en)(?=\/|$)/, `/${target}`) || `/${target}`;

  function onClick(event: MouseEvent<HTMLAnchorElement>, target: Lang) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    if (target === lang) return;
    switchLanguage(target);
  }

  return (
    <div role="group" aria-label={tr("theme.language", lang)} className="flex rounded-full p-0.5">
      {LOCALES.map((code) => {
        const active = code === lang;
        return (
          <Link
            key={code}
            href={hrefFor(code)}
            prefetch={false}
            hrefLang={code}
            lang={code}
            aria-current={active ? "true" : undefined}
            onClick={(event) => onClick(event, code)}
            className={`grid h-10 min-w-10 place-items-center rounded-full px-3 font-mono text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
              active ? "bg-accent text-accent-fg" : "text-muted hover:text-fg"
            }`}
          >
            {code}
          </Link>
        );
      })}
    </div>
  );
}
