import type { Lang } from "@/content/types";
import { tr, type UiKey } from "@/lib/i18n";

/** Anchored placeholder for a section that is built in a later phase. */
export function SectionStub({
  id,
  index,
  label,
  lang,
}: {
  id: string;
  index: number;
  label: UiKey;
  lang: Lang;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line px-5 py-24 sm:px-8 lg:px-16 lg:py-32">
      <div className="grid gap-6 lg:grid-cols-12">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent lg:col-span-3">
          {String(index).padStart(2, "0")} / {tr(label, lang)}
        </p>
        <div className="lg:col-span-9">
          <h2 className="font-display text-5xl font-bold tracking-[-0.03em] text-fg sm:text-6xl">
            {tr(label, lang)}
          </h2>
          <p className="mt-4 text-muted">{tr("section.building", lang)}</p>
        </div>
      </div>
    </section>
  );
}
