import type { CSSProperties } from "react";
import type { Lang } from "@/content/types";
import { experience } from "@/content";
import { Section } from "@/components/ui/Section";
import { t, tr } from "@/lib/i18n";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

/** A role is current while its period has no end date. */
const isCurrent = (period: string) => /Actualidad|Present/.test(period);

/**
 * Two shapes of one timeline:
 * - default (phones, reduced motion): a vertical rail, dates beside each role;
 * - lg with the motion layer on (`fx`): the section pins and the roles travel
 *   sideways along a horizontal rail as the visitor scrolls (MotionLayer).
 */
export function Experience({ lang, index }: { lang: Lang; index: number }) {
  const ordered = [...experience].sort((a, b) => b.start.localeCompare(a.start));

  return (
    <Section
      id="experience"
      index={index}
      eyebrow={tr("nav.experience", lang)}
      title={tr("experience.title", lang)}
      intro={tr("experience.intro", lang)}
      data-hscroll=""
      className="lg:fx:flex lg:fx:min-h-svh lg:fx:flex-col lg:fx:justify-center lg:fx:overflow-hidden lg:fx:py-16"
      headerClassName="mb-14 lg:mb-20 lg:fx:mb-12"
    >
      <ol data-hscroll-track className="relative lg:fx:flex lg:fx:w-max lg:fx:gap-12 lg:fx:pr-16 lg:fx:will-change-transform">
        {/* Vertical rail */}
        <span aria-hidden className="absolute bottom-0 left-[7px] top-2 w-px bg-line lg:left-[calc(25%-1px)] lg:fx:hidden" />
        {/* Horizontal rail */}
        <span aria-hidden className="absolute inset-x-0 top-[7px] hidden h-px bg-line lg:fx:block" />

        {ordered.map((entry, i) => {
          const current = isCurrent(entry.period.es);
          return (
            <li
              key={entry.id}
              data-reveal
              style={delay(i * 60)}
              className="relative grid gap-4 pb-14 pl-9 last:pb-0 lg:grid-cols-4 lg:gap-0 lg:pl-0 lg:fx:flex lg:fx:w-[34rem] lg:fx:shrink-0 lg:fx:flex-col lg:fx:gap-5 lg:fx:pb-0 lg:fx:pt-12"
            >
              <span
                aria-hidden
                className={`absolute left-0 top-1.5 size-[15px] rounded-full border-2 lg:left-[calc(25%-8px)] lg:fx:left-0 lg:fx:top-0 ${
                  current ? "border-accent bg-accent shadow-[0_0_0_6px_var(--color-accent-soft)]" : "border-line bg-bg"
                }`}
              />

              <div className="lg:pr-12 lg:text-right lg:fx:flex lg:fx:items-center lg:fx:gap-3 lg:fx:pr-0 lg:fx:text-left">
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{t(entry.period, lang)}</p>
                {current ? (
                  <p className="mt-3 inline-flex rounded-full bg-accent px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent-fg lg:fx:mt-0">
                    {tr("experience.current", lang)}
                  </p>
                ) : null}
              </div>

              <div className="lg:col-span-3 lg:pl-12 lg:fx:pl-0">
                <p className="font-mono text-sm font-medium uppercase tracking-[0.15em] text-accent">{entry.company}</p>
                <h3 className="mt-2 max-w-3xl font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-fg sm:text-3xl lg:fx:text-2xl">
                  {t(entry.role, lang)}
                </h3>
                <ul className="mt-5 max-w-3xl space-y-2.5 text-muted lg:fx:space-y-2 lg:fx:text-[15px]">
                  {entry.bullets.map((bullet) => (
                    <li key={bullet.es} className="flex gap-3">
                      <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                      <span className="leading-relaxed">{t(bullet, lang)}</span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
                  {entry.stack.map((tool) => (
                    <li key={tool} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-fg">
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
