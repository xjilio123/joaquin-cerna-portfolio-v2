import type { CSSProperties } from "react";
import type { Lang } from "@/content/types";
import { education, profile, stats } from "@/content";
import { PortraitDots } from "@/components/about/PortraitDots";
import { Section } from "@/components/ui/Section";
import { t, tr } from "@/lib/i18n";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

export function About({ lang, index }: { lang: Lang; index: number }) {
  return (
    <Section id="about" index={index} eyebrow={tr("nav.about", lang)} title={tr("about.title", lang)}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Portrait: redrawn as accent-coloured dots; the photo underneath is the fallback. */}
        <figure data-reveal className="lg:col-span-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-[#060607]">
            <PortraitDots src="/images/portrait-about.webp" alt={tr("about.portraitAlt", lang)} sizes="(min-width: 1024px) 30vw, 100vw" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
            <figcaption className="absolute inset-x-5 bottom-5 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-white/80">
              <span>{tr("about.based", lang)}</span>
              <span>JCR</span>
            </figcaption>
          </div>
        </figure>

        <div className="lg:col-span-8 lg:pl-8">
          <p data-reveal className="font-display text-[clamp(1.75rem,3.4vw,3rem)] font-medium leading-[1.12] tracking-[-0.02em] text-fg">
            {t(profile.bioLead, lang)}
          </p>
          {/* Words light up one by one as the paragraph scrolls through (MotionLayer). */}
          <p data-reveal data-scrub style={delay(100)} className="mt-8 max-w-3xl text-lg leading-relaxed text-fg">
            {t(profile.bio, lang)
              .split(" ")
              .map((word, i) => (
                <span key={i} className="scrub-word">
                  {word}{" "}
                </span>
              ))}
          </p>

          {/* Stats derived from the data, so they can never overstate the record. */}
          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.id} data-reveal style={delay(i * 80)} className="flex flex-col gap-2 bg-bg p-5 sm:p-6">
                <dt className="order-2 text-sm text-fg">{t(stat.label, lang)}</dt>
                <dd
                  data-count={typeof stat.value === "number" ? stat.value : undefined}
                  className="order-1 font-display text-5xl font-bold tracking-[-0.04em] text-accent tabular-nums"
                >
                  {stat.value}
                </dd>
                {stat.note ? <dd className="order-3 text-xs text-muted">{t(stat.note, lang)}</dd> : null}
              </div>
            ))}
          </dl>

          <div className="mt-14">
            <h3 data-reveal className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
              {tr("about.education", lang)}
            </h3>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {education.map((entry, i) => (
                <li key={entry.id} data-reveal style={delay(i * 80)} className="grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:gap-8">
                  <div>
                    <p className="font-display text-xl font-semibold tracking-tight text-fg">{t(entry.program, lang)}</p>
                    <p className="mt-1 text-muted">{entry.institution}</p>
                    {entry.note ? <p className="mt-3 max-w-xl text-sm text-muted">{t(entry.note, lang)}</p> : null}
                  </div>
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted sm:pt-1.5 sm:text-right">
                    {t(entry.period, lang)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
