import type { CSSProperties, ReactNode } from "react";
import type { Lang } from "@/content/types";
import { profile } from "@/content";
import { CopyEmailButton, RevealPhone } from "@/components/contact/ContactActions";
import { t, tr } from "@/lib/i18n";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

function Row({ label, children, order }: { label: string; children: ReactNode; order: number }) {
  return (
    <div data-reveal style={delay(order * 70)} className="grid items-center gap-3 border-b border-line py-6 sm:grid-cols-[10rem_1fr]">
      <dt className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{label}</dt>
      <dd className="flex flex-wrap items-center justify-between gap-4">{children}</dd>
    </div>
  );
}

/**
 * Contact opens with the word itself, huge and drifting sideways; then the
 * four ways to reach Joaquín, each with the action it needs.
 */
export function Contact({ lang, index }: { lang: Lang; index: number }) {
  const word = tr("contact.title", lang);
  const strip = Array.from({ length: 4 }, () => word);

  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 overflow-hidden border-t border-line py-24 lg:py-36">
      <div className="px-5 sm:px-8 lg:px-16">
        <p data-reveal className="font-mono text-xs uppercase tracking-[0.25em] text-accent sm:text-sm">
          {String(index).padStart(2, "0")} / {tr("nav.contact", lang)}
        </p>
      </div>

      <h2 id="contact-title" className="sr-only">
        {word}
      </h2>
      {/* Two copies of the strip, moved by half their width, loop seamlessly. */}
      <div aria-hidden className="mt-8 flex w-max animate-[marquee_28s_linear_infinite] select-none motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {strip.map((text, i) => (
              <span
                key={i}
                className={`pr-[0.35em] font-display text-[clamp(5rem,16vw,15rem)] font-bold leading-[0.95] tracking-[-0.05em] ${
                  i % 2 ? "text-transparent [-webkit-text-stroke:1.5px_var(--line)]" : "text-fg"
                }`}
              >
                {text}
                <span className="text-accent">.</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:px-16">
        <p data-reveal className="max-w-md text-lg leading-relaxed text-muted lg:col-span-4">
          {tr("contact.intro", lang)}
        </p>

        <dl className="border-t border-line lg:col-span-8">
          <Row label={tr("contact.email", lang)} order={0}>
            <a
              href={`mailto:${profile.email}`}
              className="break-all font-display text-xl font-semibold tracking-tight text-fg transition-colors hover:text-accent sm:text-3xl"
            >
              {profile.email}
            </a>
            <CopyEmailButton lang={lang} />
          </Row>
          <Row label={tr("contact.phone", lang)} order={1}>
            <RevealPhone lang={lang} />
          </Row>
          <Row label={tr("contact.linkedin", lang)} order={2}>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-fg transition-colors hover:text-accent">
              {profile.linkedinLabel}
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              data-cursor={tr("cursor.open", lang)}
              className="rounded-full border border-line px-4 py-2 text-sm text-fg transition-colors hover:border-fg"
            >
              {tr("contact.openLinkedin", lang)} ↗
            </a>
          </Row>
          <Row label={tr("contact.location", lang)} order={3}>
            <span className="text-fg">{t(profile.location, lang)}</span>
          </Row>
        </dl>
      </div>
    </section>
  );
}
