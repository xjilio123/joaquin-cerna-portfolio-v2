import Link from "next/link";
import type { Lang } from "@/content/types";
import { SECTIONS, tr } from "@/lib/i18n";
import { AccentPicker } from "@/components/theme/AccentPicker";
import { LangToggle } from "@/components/theme/LangToggle";
import { ModeToggle } from "@/components/theme/ModeToggle";

const pill = "rounded-full border border-line bg-surface/70 backdrop-blur-xl";

export function SiteHeader({ lang }: { lang: Lang }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-4 pt-4 sm:px-6 lg:px-8">
      <Link
        href={`/${lang}`}
        aria-label={tr("nav.home", lang)}
        className={`${pill} grid h-12 place-items-center px-5 font-mono text-sm font-semibold tracking-wider text-fg transition-colors hover:text-accent`}
      >
        JCR
      </Link>

      <nav aria-label={tr("a11y.mainNav", lang)} className={`${pill} hidden h-12 items-center px-2 lg:flex`}>
        <ul className="flex items-center">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
              >
                {tr(section.label, lang)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div
        role="group"
        aria-label={tr("a11y.preferences", lang)}
        className={`${pill} flex h-12 items-center gap-1 px-1`}
      >
        <LangToggle lang={lang} />
        <span aria-hidden className="mx-1 h-5 w-px bg-line" />
        <ModeToggle lang={lang} />
        <AccentPicker lang={lang} />
      </div>
    </header>
  );
}
