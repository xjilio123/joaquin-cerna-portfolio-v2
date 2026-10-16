import type { ReactNode } from "react";

/**
 * Shared shell for every content section: anchor, rhythm and the header
 * (index · eyebrow, display title, optional intro) on a 12-column grid.
 */
export function Section({
  id,
  index,
  eyebrow,
  title,
  intro,
  children,
  className = "",
}: {
  id: string;
  index: number;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-20 border-t border-line px-5 py-24 sm:px-8 lg:px-16 lg:py-36 ${className}`}
    >
      <header data-reveal className="mb-14 grid gap-5 lg:mb-20 lg:grid-cols-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent sm:text-sm lg:col-span-3 lg:pt-4">
          {String(index).padStart(2, "0")} / {eyebrow}
        </p>
        <div className="lg:col-span-9">
          <h2
            id={`${id}-title`}
            className="font-display text-[clamp(2.75rem,6.5vw,6rem)] font-bold leading-[0.95] tracking-[-0.04em] text-fg"
          >
            {title}
          </h2>
          {intro ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}
