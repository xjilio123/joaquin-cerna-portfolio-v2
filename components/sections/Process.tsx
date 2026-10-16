import type { CSSProperties, ReactNode } from "react";
import type { Lang } from "@/content/types";
import { processSteps } from "@/content";
import { DashboardVisual, ModelVisual, TableVisual } from "@/components/process/ProcessVisuals";
import { Section } from "@/components/ui/Section";
import { t, tr } from "@/lib/i18n";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

/**
 * "From messy data to a decision", told twice:
 * - default (phones, reduced motion): four cards, each with its own picture;
 * - lg with the motion layer on (`fx`): the section pins, the steps sit in a
 *   column and one stage turns the raw table into a clean one, a star schema
 *   and a dashboard as the visitor scrolls (MotionLayer, step 3b).
 */
export function Process({ lang, index }: { lang: Lang; index: number }) {
  const pictures: Record<(typeof processSteps)[number]["id"], ReactNode> = {
    extract: <TableVisual lang={lang} mode="raw" />,
    clean: <TableVisual lang={lang} mode="clean" />,
    model: <ModelVisual className="aspect-[16/10]" />,
    decide: <DashboardVisual lang={lang} />,
  };

  return (
    <Section
      id="process"
      index={index}
      eyebrow={tr("nav.process", lang)}
      title={tr("process.title", lang)}
      intro={tr("process.intro", lang)}
      data-process=""
      className="lg:fx:flex lg:fx:min-h-svh lg:fx:flex-col lg:fx:justify-center lg:fx:py-14 lg:fx:short:py-10"
      headerClassName="mb-14 lg:mb-20 lg:fx:mb-10 lg:fx:short:mb-8 lg:fx:short:[&>div>p]:hidden"
    >
      <div className="lg:fx:grid lg:fx:grid-cols-12 lg:fx:items-center lg:fx:gap-12">
        <ol className="relative grid gap-5 sm:grid-cols-2 lg:fx:col-span-5 lg:fx:grid-cols-1 lg:fx:gap-7 lg:fx:pl-9 lg:fx:short:gap-4">
          {/* Progress rail (desktop story only) */}
          <span aria-hidden className="absolute bottom-2 left-[7px] top-2 hidden w-px bg-line lg:fx:block" />
          <span aria-hidden data-process-rail className="absolute bottom-2 left-[7px] top-2 hidden w-px origin-top bg-accent lg:fx:block" />

          {processSteps.map((step, i) => (
            <li
              key={step.id}
              data-reveal
              data-process-step
              style={delay(i * 70)}
              className="relative flex flex-col gap-3 rounded-3xl border border-line bg-surface p-6 sm:p-7 lg:fx:gap-1.5 lg:fx:rounded-none lg:fx:border-0 lg:fx:bg-transparent lg:fx:p-0"
            >
              <span aria-hidden data-process-dot className="absolute -left-9 top-1.5 hidden size-[15px] rounded-full border-2 border-line bg-bg lg:fx:block" />
              <div data-step-body className="flex flex-col gap-3 lg:fx:gap-1.5">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  {String(i + 1).padStart(2, "0")} · {step.tools}
                </p>
                <h3 className="font-display text-3xl font-bold tracking-[-0.03em] text-fg lg:fx:text-[1.75rem]">{t(step.title, lang)}</h3>
                <p className="leading-relaxed text-muted lg:fx:text-[15px] lg:fx:short:text-sm lg:fx:short:leading-snug">{t(step.body, lang)}</p>
                <div className="mt-4 rounded-2xl border border-line bg-bg p-4 sm:p-5 lg:fx:hidden">{pictures[step.id]}</div>
              </div>
            </li>
          ))}
        </ol>

        {/* Desktop stage: decorative, the steps above carry the meaning. */}
        <div
          aria-hidden
          data-process-stage
          className="relative hidden h-[min(28rem,58svh)] lg:fx:short:h-[min(26rem,56svh)] overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl shadow-black/20 lg:fx:col-span-7 lg:fx:block"
        >
          <p className="absolute right-5 top-4 font-mono text-[10px] uppercase tracking-wider text-muted">{tr("process.sample", lang)}</p>
          <div data-layer="table" className="absolute inset-8 flex items-center">
            <TableVisual lang={lang} mode="live" />
          </div>
          <div data-layer="model" className="absolute inset-8 opacity-0">
            <ModelVisual live className="h-full" />
          </div>
          <div data-layer="dash" className="absolute inset-8 opacity-0">
            <DashboardVisual lang={lang} live />
          </div>
        </div>
      </div>
    </Section>
  );
}
