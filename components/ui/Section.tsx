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
  headerClassName = "mb-14 lg:mb-20",
  ...rest
}: {
  id: string;
  index: number;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
} & Record<`data-${string}`, string | boolean>) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative scroll-mt-20 border-t border-line px-5 py-24 sm:px-8 lg:px-16 lg:py-36 ${className}`}
      {...rest}
    >
      {/* Accent line drawn across the section edge as it scrolls in (MotionLayer). */}
      <span aria-hidden data-wipe className="absolute inset-x-0 -top-px hidden h-px origin-left scale-x-0 bg-accent fx:block" />
      <header data-reveal className={`grid gap-5 lg:grid-cols-12 ${headerClassName}`}>
        <p data-scramble className="font-mono text-xs uppercase tracking-[0.25em] text-accent sm:text-sm lg:col-span-3 lg:pt-4">
          {String(index).padStart(2, "0")} / {eyebrow}
        </p>
        <div className="lg:col-span-9">
          <h2
            id={`${id}-title`}
            data-scramble
            data-fill
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
