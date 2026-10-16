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
import { Process } from "@/components/sections/Process";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { SqlSection } from "@/components/sections/SqlSection";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { ScrambleIn } from "@/components/motion/ScrambleIn";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { certifications, education, experience, profile, skills } from "@/content";
import { isLocale, t, tr } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export default async function HomePage() {
  const locale = await lang();
  if (!isLocale(locale)) notFound();

  /** Structured data: the same facts the page states, in a form search engines read. */
  const current = experience.find((entry) => /Actualidad|Present/.test(entry.period.es));
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.shortName,
    jobTitle: current ? t(current.role, locale) : t(profile.title, locale),
    worksFor: current ? { "@type": "Organization", name: current.company } : undefined,
    description: t(profile.metaDescription, locale),
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}/images/portrait-about.webp`,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Lima", addressCountry: "PE" },
    alumniOf: education.map((entry) => ({ "@type": "EducationalOrganization", name: entry.institution })),
    knowsAbout: skills.filter((group) => group.id !== "languages").flatMap((group) => group.items.map((item) => item.name)),
    knowsLanguage: ["es", "en"],
    hasCredential: certifications.map((certification) => ({
      "@type": "EducationalOccupationalCredential",
      name: t(certification.title, locale),
      credentialCategory: "certificate",
      dateCreated: certification.date,
    })),
    sameAs: [profile.linkedin],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so a "<" in any content field cannot close the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
      />
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
        <Process lang={locale} index={3} />
        <Experience lang={locale} index={4} />
        <Certifications lang={locale} index={5} />
        <SqlSection lang={locale} index={6} />
        <Projects lang={locale} index={7} />
        <CvSection lang={locale} index={8} />
        <Contact lang={locale} index={9} />
      </main>
      <SiteFooter lang={locale} />
      <CommandPalette lang={locale} />
      <RevealObserver />
      <MotionLayer />
      <ScrambleIn />
      <CustomCursor />
      {/* Film grain: static, decorative, never intercepts the pointer. */}
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[80]" />
    </>
  );
}
