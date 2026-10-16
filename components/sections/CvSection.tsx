import Image from "next/image";
import type { Lang } from "@/content/types";
import { profile } from "@/content";
import { Magnetic } from "@/components/ui/Magnetic";
import { Section } from "@/components/ui/Section";
import { tr } from "@/lib/i18n";

export function CvSection({ lang, index }: { lang: Lang; index: number }) {
  return (
    <Section id="cv" index={index} eyebrow={tr("nav.cv", lang)} title={tr("cv.title", lang)}>
      <div className="grid items-center gap-14 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-5">
          <p className="max-w-md font-display text-[clamp(1.6rem,2.6vw,2.25rem)] font-medium leading-tight tracking-[-0.02em] text-fg">
            {tr("cv.intro", lang)}
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">{tr("cv.pages", lang)}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <a
                href={profile.cvPath}
                download={profile.cvFileName}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-fg"
              >
                {tr("cv.download", lang)}
                <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
                </svg>
              </a>
            </Magnetic>
            <a
              href={profile.cvPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center rounded-full border border-line px-6 text-sm font-semibold text-fg transition-colors hover:border-fg"
            >
              {tr("cv.openInTab", lang)} ↗
            </a>
          </div>
          <p className="mt-8 max-w-md text-sm text-muted">{tr("cv.noteRedacted", lang)}</p>
        </div>

        {/* Two pages fanned out; they straighten when hovered. */}
        <a
          href={profile.cvPath}
          target="_blank"
          rel="noreferrer"
          aria-label={tr("cv.openInTab", lang)}
          data-reveal
          className="group relative mx-auto block w-full max-w-xl lg:col-span-7"
        >
          <div className="relative aspect-[1100/1556] w-[78%] translate-x-[22%] rotate-[5deg] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-black/25 transition-transform duration-700 ease-out-expo group-hover:translate-x-[26%] group-hover:rotate-[7deg]">
            <Image src="/cv/preview-2.webp" alt={`${tr("cv.previewAlt", lang)} 2`} fill sizes="(min-width: 1024px) 30vw, 70vw" className="object-cover" />
          </div>
          <div className="absolute left-0 top-0 aspect-[1100/1556] w-[78%] -rotate-[3deg] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-black/30 transition-transform duration-700 ease-out-expo group-hover:-translate-y-2 group-hover:rotate-0">
            <Image src="/cv/preview-1.webp" alt={`${tr("cv.previewAlt", lang)} 1`} fill sizes="(min-width: 1024px) 30vw, 70vw" className="object-cover" />
          </div>
        </a>
      </div>
    </Section>
  );
}
