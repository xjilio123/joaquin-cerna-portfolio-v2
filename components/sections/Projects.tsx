import type { CSSProperties } from "react";
import type { Lang } from "@/content/types";
import { projectCategories, projects } from "@/content";
import { Section } from "@/components/ui/Section";
import { t, tr } from "@/lib/i18n";

const loop = (delayMs: number): CSSProperties => ({
  animation: `bar-grow 4600ms cubic-bezier(0.65, 0, 0.35, 1) ${delayMs}ms infinite`,
});

/**
 * Real work only. While the list is empty the section says so plainly and
 * shows the shape of what is coming, instead of filling the grid with samples.
 */
export function Projects({ lang, index }: { lang: Lang; index: number }) {
  return (
    <Section
      id="projects"
      index={index}
      eyebrow={tr("nav.projects", lang)}
      title={tr("projects.title", lang)}
      intro={tr("projects.intro", lang)}
    >
      {projects.length === 0 ? (
        <div data-reveal className="grid overflow-hidden rounded-[2rem] border border-dashed border-line lg:grid-cols-2">
          <div className="flex flex-col justify-between gap-10 p-8 sm:p-12">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
                <span aria-hidden className="size-2 animate-pulse rounded-full bg-accent" />
                {tr("projects.emptyTitle", lang)}
              </p>
              <p className="mt-6 max-w-lg font-display text-[clamp(1.6rem,2.8vw,2.4rem)] font-medium leading-tight tracking-[-0.02em] text-fg">
                {tr("projects.emptyBody", lang)}
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{tr("projects.coming", lang)}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {projectCategories.map((category) => (
                  <li key={category.id} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-fg">
                    {t(category.label, lang)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* A dashboard still being built: skeleton tiles and bars that keep rising. */}
          <div aria-hidden className="grid grid-cols-6 grid-rows-[auto_1fr] gap-3 border-t border-dashed border-line bg-surface/50 p-8 sm:p-12 lg:border-l lg:border-t-0">
            {[0, 1, 2].map((tile) => (
              <div key={tile} className="col-span-2 flex flex-col gap-3 rounded-2xl border border-line p-4">
                <span className="h-2 w-1/2 rounded-full bg-line" />
                <span className="h-6 w-3/4 animate-pulse rounded-md bg-surface-2" style={{ animationDelay: `${tile * 200}ms` }} />
              </div>
            ))}
            <div className="col-span-6 flex min-h-52 items-end gap-2 rounded-2xl border border-line p-5">
              {[30, 45, 38, 60, 52, 72, 66, 88, 80, 100].map((height, i) => (
                <div key={i} className="flex h-full flex-1 items-end">
                  <div
                    className="loop w-full origin-bottom rounded-t-sm bg-accent/70"
                    style={{ height: `${height}%`, ...loop(i * 120) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id} data-reveal className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-7">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{project.year}</p>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-fg">{t(project.title, lang)}</h3>
              <p className="text-muted">{t(project.summary, lang)}</p>
              <ul className="mt-auto flex flex-wrap gap-2">
                {project.stack.map((tool) => (
                  <li key={tool} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-fg">
                    {tool}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
