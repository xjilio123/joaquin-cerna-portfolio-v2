import type { Lang } from "@/content/types";
import { profile } from "@/content";
import { t, tr } from "@/lib/i18n";

/**
 * Phase 1 hero: final type, colour and layout. The particle field that orders
 * itself into a chart arrives in phase 2 and sits behind this content.
 */
export function Hero({ lang }: { lang: Lang }) {
  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden px-5 pb-14 pt-32 sm:px-8 lg:px-16 lg:pb-20"
    >
      {/* Dot grid, faded towards the edges: the "data" ground the particles will live on. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(70%_60%_at_70%_40%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(55%_45%_at_78%_30%,var(--color-accent-soft),transparent_70%)]"
      />

      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent sm:text-sm">
          {tr("hero.eyebrow", lang)}
        </p>

        <h1 className="mt-6 font-display text-[clamp(3.6rem,12vw,11rem)] font-bold leading-[0.88] tracking-[-0.045em] text-fg">
          Joaquín
          <br />
          Cerna Rojas
        </h1>

        <div className="mt-10 flex flex-col gap-10 border-t border-line pt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-display text-2xl font-medium leading-tight tracking-tight text-fg sm:text-3xl">
              {profile.headline[lang].join(" ")}
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{t(profile.tagline, lang)}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={profile.cvPath}
              download={profile.cvFileName}
              className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-fg transition-transform duration-300 ease-out-expo hover:-translate-y-0.5"
            >
              {tr("hero.downloadCv", lang)}
            </a>
            <a
              href="#projects"
              className="inline-flex h-12 items-center rounded-full border border-line px-6 text-sm font-semibold text-fg transition-colors duration-300 hover:border-fg"
            >
              {tr("hero.viewProjects", lang)}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
