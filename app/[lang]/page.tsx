import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { CommandPalette } from "@/components/command/CommandPalette";
import { Preloader } from "@/components/intro/Preloader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { About } from "@/components/sections/About";
import { Certifications } from "@/components/sections/Certifications";
import { Contact } from "@/components/sections/Contact";
import { CvSection } from "@/components/sections/CvSection";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { isLocale, tr } from "@/lib/i18n";

export default async function HomePage() {
  const locale = await lang();
  if (!isLocale(locale)) notFound();

  return (
    <>
      <Preloader lang={locale} />
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-20 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-fg transition-transform focus:translate-y-0"
      >
        {tr("a11y.skip", locale)}
      </a>
      <SiteHeader lang={locale} />
      <main id="main">
        <Hero lang={locale} />
        <About lang={locale} index={1} />
        <Skills lang={locale} index={2} />
        <Experience lang={locale} index={3} />
        <Certifications lang={locale} index={4} />
        <Projects lang={locale} index={5} />
        <CvSection lang={locale} index={6} />
        <Contact lang={locale} index={7} />
      </main>
      <SiteFooter lang={locale} />
      <CommandPalette lang={locale} />
      <RevealObserver />
    </>
  );
}
