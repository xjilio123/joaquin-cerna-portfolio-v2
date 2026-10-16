"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Lang } from "@/content/types";
import { profile } from "@/content";
import { currentMode, switchAccent, switchMode, useMode } from "@/components/theme/use-theme-state";
import { COMMAND_EVENT } from "@/lib/command";
import { SECTIONS, tr } from "@/lib/i18n";
import { flagLanguageSwitch, scrollToId } from "@/lib/scroll";
import { ACCENTS } from "@/lib/preferences";

type Group = "navigate" | "preferences" | "actions";

interface Command {
  id: string;
  group: Group;
  label: string;
  keywords: string;
  icon?: ReactNode;
  /** Plain commands run and close the palette; "copy-email" answers in place first. */
  run: (() => void) | "copy-email";
}

const GROUPS: Group[] = ["navigate", "preferences", "actions"];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const Swatch = ({ name }: { name: string }) => (
  <span aria-hidden className="size-3.5 rounded-full" style={{ background: `var(--a-${name})` }} />
);

/**
 * Ctrl/⌘ + K palette: jump to a section, change mode, colour or language,
 * download the CV, copy the email. A native modal <dialog> handles focus and
 * Escape; the list follows the ARIA combobox + listbox pattern.
 */
export function CommandPalette({ lang }: { lang: Lang }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const mode = useMode();

  const commands = useMemo<Command[]>(() => {
    const other: Lang = lang === "es" ? "en" : "es";
    const go = (hash: string) => () => scrollToId(hash);
    return [
      { id: "top", group: "navigate", label: tr("cmd.top", lang), keywords: "home inicio hero", run: go("top") },
      ...SECTIONS.map<Command>((section) => ({
        id: section.id,
        group: "navigate",
        label: tr(section.label, lang),
        keywords: section.id,
        run: go(section.id),
      })),
      {
        id: "mode",
        group: "preferences",
        label: tr(mode === "light" ? "theme.toDark" : "theme.toLight", lang),
        keywords: "modo tema theme dark light oscuro claro",
        run: () => {
          // Let the dialog leave the top layer before the view transition snapshots the page.
          requestAnimationFrame(() => switchMode(currentMode() === "dark" ? "light" : "dark"));
        },
      },
      ...ACCENTS.map<Command>((name) => ({
        id: `accent-${name}`,
        group: "preferences",
        label: `${tr("cmd.accent", lang)}: ${tr(`theme.accent.${name}`, lang)}`,
        keywords: `color colour acento accent ${name}`,
        icon: <Swatch name={name} />,
        run: () => requestAnimationFrame(() => switchAccent(name)),
      })),
      {
        id: "language",
        group: "preferences",
        label: tr("cmd.toLanguage", lang),
        keywords: "idioma language english espanol ingles",
        run: () => {
          const target = pathname.replace(/^\/(es|en)(?=\/|$)/, `/${other}`) || `/${other}`;
          flagLanguageSwitch();
          router.push(target + window.location.hash, { scroll: false });
        },
      },
      {
        id: "cv",
        group: "actions",
        label: tr("hero.downloadCv", lang),
        keywords: "cv resume curriculum pdf descargar download",
        run: () => {
          const link = document.createElement("a");
          link.href = profile.cvPath;
          link.download = profile.cvFileName;
          link.click();
        },
      },
      {
        id: "email",
        group: "actions",
        label: tr("cmd.copyEmail", lang),
        keywords: `correo email mail contacto contact ${profile.email}`,
        run: "copy-email",
      },
      {
        id: "linkedin",
        group: "actions",
        label: tr("cmd.linkedin", lang),
        keywords: "linkedin perfil profile red social",
        run: () => {
          window.open(profile.linkedin, "_blank", "noopener,noreferrer");
        },
      },
    ];
  }, [lang, mode, pathname, router]);

  const results = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    if (!tokens.length) return commands;
    return commands.filter((command) => {
      const haystack = normalize(`${command.label} ${command.keywords}`);
      return tokens.every((token) => haystack.includes(token));
    });
  }, [commands, query]);

  // Global shortcut and the open event.
  useEffect(() => {
    const open = () => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open) return;
      dialog.showModal();
      inputRef.current?.focus();
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (dialogRef.current?.open) dialogRef.current.close();
        else open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(COMMAND_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(COMMAND_EVENT, open);
    };
  }, []);

  const execute = (command: Command | undefined) => {
    if (!command) return;
    if (command.run === "copy-email") {
      navigator.clipboard
        ?.writeText(profile.email)
        .then(() => {
          setStatus(tr("cmd.copied", lang));
          setTimeout(() => dialogRef.current?.close(), 900);
        })
        .catch(() => {
          window.location.href = `mailto:${profile.email}`;
        });
      return;
    }
    command.run();
    dialogRef.current?.close();
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      execute(results[activeIndex]);
    }
  };

  // Keep the highlighted option in view.
  useEffect(() => {
    const active = results[activeIndex];
    if (active) document.getElementById(`${listId}-${active.id}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, results, listId]);

  const activeId = results[activeIndex] ? `${listId}-${results[activeIndex].id}` : undefined;

  return (
    <dialog
      ref={dialogRef}
      aria-label={tr("cmd.title", lang)}
      data-lenis-prevent
      className="sheet mx-auto mt-[12vh] w-[min(92vw,600px)]"
      onClose={() => {
        setQuery("");
        setActiveIndex(0);
        setStatus(null);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl shadow-black/30">
        <div className="flex items-center gap-3 border-b border-line px-5">
          <svg aria-hidden viewBox="0 0 20 20" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="9" cy="9" r="5.5" />
            <path d="m13 13 4 4" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder={tr("cmd.placeholder", lang)}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            className="h-14 w-full bg-transparent text-base text-fg outline-none placeholder:text-muted"
          />
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted sm:block">Esc</kbd>
        </div>

        <ul id={listId} role="listbox" aria-label={tr("cmd.title", lang)} className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li role="presentation" className="px-3 py-8 text-center text-sm text-muted">
              {tr("cmd.empty", lang)}
            </li>
          ) : (
            GROUPS.map((group) => {
              const items = results.filter((command) => command.group === group);
              if (!items.length) return null;
              return (
                <li key={group} role="presentation">
                  <p className="px-3 pb-1 pt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    {tr(`cmd.group.${group}`, lang)}
                  </p>
                  <ul role="presentation">
                    {items.map((command) => {
                      const index = results.indexOf(command);
                      const selected = index === activeIndex;
                      return (
                        <li
                          key={command.id}
                          id={`${listId}-${command.id}`}
                          role="option"
                          aria-selected={selected}
                          onPointerMove={() => setActiveIndex(index)}
                          onClick={() => execute(command)}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                            selected ? "bg-surface-2 text-fg" : "text-muted"
                          }`}
                        >
                          <span className="grid size-5 place-items-center">
                            {command.icon ?? <span aria-hidden className={`size-1.5 rounded-full ${selected ? "bg-accent" : "bg-line"}`} />}
                          </span>
                          <span className="flex-1">{command.label}</span>
                          {selected ? (
                            <kbd aria-hidden className="font-mono text-[11px] text-muted">
                              ↵
                            </kbd>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 font-mono text-[11px] text-muted">
          <p aria-live="polite" className="text-accent">
            {status}
          </p>
          <p className="hidden gap-4 sm:flex">
            <span>↑↓ {tr("cmd.hintNavigate", lang)}</span>
            <span>↵ {tr("cmd.hintSelect", lang)}</span>
            <span>Esc {tr("cmd.hintClose", lang)}</span>
          </p>
        </div>
      </div>
    </dialog>
  );
}
