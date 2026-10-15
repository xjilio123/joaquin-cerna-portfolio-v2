import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Hero } from "@/components/sections/Hero";
import { SectionStub } from "@/components/sections/SectionStub";
import { SECTIONS, isLocale, tr } from "@/lib/i18n";

export default async function HomePage() {
  const locale = await lang();
  if (!isLocale(locale)) notFound();

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-20 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-fg transition-transform focus:translate-y-0"
      >
        {tr("a11y.skip", locale)}
      </a>
      <SiteHeader lang={locale} />
      <main id="main">
        <Hero lang={locale} />
        {SECTIONS.map((section, index) => (
          <SectionStub
            key={section.id}
            id={section.id}
            index={index + 1}
            label={section.label}
            lang={locale}
          />
        ))}
      </main>
      <SiteFooter lang={locale} />
    </>
  );
}
