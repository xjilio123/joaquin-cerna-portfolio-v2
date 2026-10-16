import type { Lang } from "@/content/types";
import { activeIssuers, certifications } from "@/content";
import { CertificationGallery } from "@/components/certifications/CertificationGallery";
import { Section } from "@/components/ui/Section";
import { tr } from "@/lib/i18n";

export function Certifications({ lang, index }: { lang: Lang; index: number }) {
  return (
    <Section
      id="certifications"
      index={index}
      eyebrow={tr("nav.certifications", lang)}
      title={tr("certifications.title", lang)}
      intro={tr("certifications.intro", lang)}
    >
      <div data-reveal className="mb-10 flex flex-wrap gap-x-12 gap-y-4">
        <p className="flex items-baseline gap-3">
          <span className="font-display text-6xl font-bold tracking-[-0.04em] text-accent tabular-nums">{certifications.length}</span>
          <span className="text-muted">{tr("certifications.credentials", lang)}</span>
        </p>
        <p className="flex items-baseline gap-3">
          <span className="font-display text-6xl font-bold tracking-[-0.04em] text-fg tabular-nums">{activeIssuers.length}</span>
          <span className="text-muted">{tr("certifications.issuers", lang)}</span>
        </p>
      </div>
      <CertificationGallery lang={lang} />
    </Section>
  );
}
