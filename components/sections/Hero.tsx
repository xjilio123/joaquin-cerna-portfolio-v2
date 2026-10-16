import type { CSSProperties } from "react";
import type { Lang } from "@/content/types";
import { profile } from "@/content";
import { ChartLabels } from "@/components/hero/ChartLabels";
import { HeroName } from "@/components/hero/HeroName";
import { LimaClock } from "@/components/hero/LimaClock";
import { ParticleField } from "@/components/hero/ParticleField";
import { Magnetic } from "@/components/ui/Magnetic";
import { t, tr } from "@/lib/i18n";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

/**
 * The hero is pinned while the visitor scrolls through it: that scroll is what
 * sorts the scattered particles into the chart of Joaquín's trajectory. The
 * stage exposes progress as --p, which the labels and the headline read.
 */
export function Hero({ lang }: { lang: Lang }) {
  const headline = profile.headline[lang];
  const lead = headline.slice(0, -1).join(" ");
  const payoff = headline[headline.length - 1];

  return (
    <section id="top" data-hero className="relative h-[165svh] lg:h-[200svh]">
      <div
        data-hero-stage
        className="sticky top-0 flex h-svh flex-col justify-end overflow-hidden px-5 pb-8 pt-20 sm:px-8 lg:px-16 lg:pb-12 lg:pt-28"
      >
        {/* Dot grid, faded towards the edges: the ground the data lives on. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(70%_60%_at_70%_35%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(55%_45%_at_75%_30%,var(--color-accent-soft),transparent_70%)]"
        />

        <div role="img" aria-label={tr("hero.chartAlt", lang)} className="absolute inset-0">
          <ParticleField />
        </div>

        {/* The chart's own box: the free space above the copy on phones, the
            upper-right quadrant on desktop. Particles and markers both read it. */}
        <div
          data-chart-box
          className="relative mb-6 min-h-28 flex-1 [@media(max-height:720px)]:mb-3 lg:absolute lg:left-[53%] lg:top-[13%] lg:mb-0 lg:h-[40%] lg:w-[42%] lg:flex-none"
        >
          <ChartLabels lang={lang} />
        </div>

        <div data-hero-copy className="relative">
          <p data-scramble className="reveal font-mono text-xs uppercase tracking-[0.25em] text-accent sm:text-sm" style={delay(0)}>
            {tr("hero.eyebrow", lang)}
          </p>

          <div className="mt-3 sm:mt-5">
            <HeroName />
          </div>

          <div
            className="reveal mt-6 flex flex-col gap-6 border-t border-line pt-5 sm:mt-8 sm:gap-8 sm:pt-7 [@media(max-height:720px)]:mt-4 [@media(max-height:720px)]:gap-4 [@media(max-height:720px)]:pt-4 lg:flex-row lg:items-end lg:justify-between"
            style={delay(450)}
          >
            <div className="max-w-2xl">
              <p data-scramble className="font-display text-2xl font-medium leading-tight tracking-tight text-fg sm:text-3xl">
                {lead}{" "}
                <span className="[color:color-mix(in_oklch,var(--accent)_calc(var(--p,0)*100%),var(--fg))]">
                  {payoff}
                </span>
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg [@media(max-height:720px)]:hidden">{t(profile.tagline, lang)}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Magnetic>
                <a
                  href={profile.cvPath}
                  download={profile.cvFileName}
                  data-cursor={tr("cursor.download", lang)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg sm:h-12 sm:px-6"
                >
                  {tr("hero.downloadCv", lang)}
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
                  </svg>
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="#projects"
                  className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-semibold text-fg sm:h-12 sm:px-6 transition-colors duration-300 hover:border-fg"
                >
                  {tr("hero.viewProjects", lang)}
                </a>
              </Magnetic>
            </div>
          </div>

          <div
            className="reveal mt-6 flex items-center justify-between gap-4 sm:mt-8 [@media(max-height:720px)]:mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:text-xs"
            style={delay(650)}
          >
            <LimaClock label={tr("hero.localTime", lang)} />
            <p className="flex items-center gap-3">
              <span>
                {tr("hero.sorting", lang)} <span data-sorted-value className="tabular-nums text-fg">000</span>%
              </span>
              <span aria-hidden className="hidden h-px w-10 bg-line sm:block" />
              <span className="hidden opacity-[calc(1_-_var(--p,0)*1.5)] sm:inline">{tr("hero.scrollHint", lang)}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
