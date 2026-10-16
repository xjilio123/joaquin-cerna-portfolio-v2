import type { Lang } from "@/content/types";
import { SqlConsole } from "@/components/console/SqlConsole";
import { Section } from "@/components/ui/Section";
import { tr } from "@/lib/i18n";

export function SqlSection({ lang, index }: { lang: Lang; index: number }) {
  return (
    <Section id="sql" index={index} eyebrow={tr("nav.sql", lang)} title={tr("sql.title", lang)} intro={tr("sql.intro", lang)}>
      <div data-reveal className="mx-auto max-w-4xl">
        <SqlConsole lang={lang} />
      </div>
    </Section>
  );
}
