import type { Lang } from "@/content/types";
import { profile } from "@/content";
import { tr } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-line px-5 py-10 text-sm text-muted sm:px-8 lg:px-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-fg">
            © 2026 {profile.shortName}. {tr("footer.rights", lang)}
          </p>
          <p>{tr("footer.built", lang)}</p>
        </div>
        <a
          href="#top"
          className="group inline-flex items-center gap-3 self-start rounded-full border border-line px-5 py-2.5 text-fg transition-colors hover:border-fg sm:self-auto"
        >
          {tr("footer.backToTop", lang)}
          <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-1">
            ↑
          </span>
        </a>
      </div>
    </footer>
  );
}
