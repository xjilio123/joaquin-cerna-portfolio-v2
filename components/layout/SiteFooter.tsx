import type { Lang } from "@/content/types";
import { profile } from "@/content";
import { tr } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="flex flex-col gap-2 border-t border-line px-5 py-10 text-sm text-muted sm:flex-row sm:justify-between sm:px-8 lg:px-16">
      <p>
        © 2026 {profile.shortName}. {tr("footer.rights", lang)}
      </p>
      <a href={profile.linkedin} className="transition-colors hover:text-fg">
        {profile.linkedinLabel}
      </a>
    </footer>
  );
}
