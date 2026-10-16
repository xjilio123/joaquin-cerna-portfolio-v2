"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import type { Lang } from "@/content/types";
import { LOCALES, tr } from "@/lib/i18n";
import { flagLanguageSwitch } from "@/lib/scroll";

/**
 * ES / EN switch. Each language has its own URL (/es, /en) so search engines
 * index both. Switching keeps the visitor on the same section by carrying the
 * current hash and leaving the scroll position alone.
 */
export function LangToggle({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const router = useRouter();

  const hrefFor = (target: Lang) => pathname.replace(/^\/(es|en)(?=\/|$)/, `/${target}`) || `/${target}`;

  function onClick(event: MouseEvent<HTMLAnchorElement>, target: Lang) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    if (target === lang) return;
    flagLanguageSwitch();
    router.push(hrefFor(target) + window.location.hash, { scroll: false });
  }

  return (
    <div role="group" aria-label={tr("theme.language", lang)} className="flex rounded-full p-0.5">
      {LOCALES.map((code) => {
        const active = code === lang;
        return (
          <Link
            key={code}
            href={hrefFor(code)}
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
