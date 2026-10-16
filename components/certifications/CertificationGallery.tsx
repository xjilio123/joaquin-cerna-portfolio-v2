"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Certification, CertificationIssuer, CertificationTopic, Lang } from "@/content/types";
import { activeIssuers, activeTopics, certifications, certificationTopics, issuers } from "@/content";
import { t, tr } from "@/lib/i18n";

/** Intrinsic sizes of the scans, so layout never jumps while they load. */
const SCAN_SIZE: Record<string, [number, number]> = {
  "/certificates/huawei-seeds.webp": [1600, 700],
  "/certificates/cisco-cyber.webp": [1600, 991],
  "/certificates/santander-data-science.webp": [1600, 1000],
  "/certificates/santander-iot.webp": [1600, 1000],
  "/certificates/camcop-excel.webp": [1600, 1144],
  "/certificates/certiprof-bi.webp": [1600, 1159],
};
const sizeOf = (src: string) => SCAN_SIZE[src] ?? [1600, 1132];
const MAIN_BUNDLE = "/certificates/CERTIFICADOS_JCR.pdf";

function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-300 ${
        active ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:border-fg hover:text-fg"
      }`}
    >
      {children}
      {count !== undefined ? <span className="ml-1.5 font-mono text-xs opacity-70">{count}</span> : null}
    </button>
  );
}

function NoScan({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center">
      <svg aria-hidden viewBox="0 0 24 24" className="size-7 text-muted" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{tr("certifications.noScan", lang)}</p>
      {compact ? null : <p className="max-w-sm text-sm text-muted">{tr("certifications.noScanBody", lang)}</p>}
    </div>
  );
}

export function CertificationGallery({ lang }: { lang: Lang }) {
  const [issuer, setIssuer] = useState<CertificationIssuer | null>(null);
  const [topic, setTopic] = useState<CertificationTopic | null>(null);
  const [open, setOpen] = useState<Certification | null>(null);
  const [page, setPage] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const visible = useMemo(
    () =>
      certifications.filter(
        (certification) =>
          (!issuer || certification.issuer === issuer) && (!topic || certification.topics.includes(topic)),
      ),
    [issuer, topic],
  );

  const countBy = (key: CertificationIssuer) => certifications.filter((c) => c.issuer === key).length;

  function show(certification: Certification) {
    setOpen(certification);
    setPage(0);
    dialogRef.current?.showModal();
  }

  const pages = open?.images ?? [];
  const turn = (step: number) => setPage((current) => (current + step + pages.length) % pages.length);

  function onDialogKey(event: KeyboardEvent<HTMLDialogElement>) {
    if (pages.length < 2) return;
    if (event.key === "ArrowRight") turn(1);
    if (event.key === "ArrowLeft") turn(-1);
  }

  return (
    <>
      <div data-reveal className="flex flex-col gap-5 border-y border-line py-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <p className="w-32 shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {tr("certifications.byIssuer", lang)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip active={issuer === null} onClick={() => setIssuer(null)}>
              {tr("certifications.all", lang)}
            </Chip>
            {activeIssuers.map((key) => (
              <Chip key={key} active={issuer === key} onClick={() => setIssuer(issuer === key ? null : key)} count={countBy(key)}>
                {issuers[key].name}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <p className="w-32 shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {tr("certifications.byTopic", lang)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip active={topic === null} onClick={() => setTopic(null)}>
              {tr("certifications.all", lang)}
            </Chip>
            {activeTopics.map((key) => (
              <Chip key={key} active={topic === key} onClick={() => setTopic(topic === key ? null : key)}>
                {t(certificationTopics[key], lang)}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <p aria-live="polite" className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        {tr("certifications.showing", lang)} <span className="text-fg">{visible.length}</span>{" "}
        {tr("certifications.of", lang)} {certifications.length}
      </p>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-fg">{tr("certifications.emptyTitle", lang)}</p>
          <p className="mt-2 text-muted">{tr("certifications.emptyBody", lang)}</p>
          <button
            type="button"
            onClick={() => {
              setIssuer(null);
              setTopic(null);
            }}
            className="mt-6 rounded-full border border-line px-5 py-2 text-sm text-fg hover:border-fg"
          >
            {tr("certifications.reset", lang)}
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((certification) => {
            const cover = certification.images?.[0];
            return (
              <li key={certification.id}>
                <button
                  type="button"
                  data-tilt
                  onClick={() => show(certification)}
                  aria-label={`${tr("certifications.open", lang)}: ${t(certification.title, lang)}`}
                  className="group flex size-full flex-col overflow-hidden rounded-3xl border border-line bg-surface text-left transition-[border-color,translate] duration-500 ease-out-expo hover:-translate-y-1 hover:border-accent/60"
                >
                  <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#f4f2ec]">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-contain p-4 transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-surface-2">
                        <NoScan lang={lang} compact />
                      </div>
                    )}
                    {certification.highlight ? (
                      <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-accent-fg">
                        {tr("certifications.featured", lang)}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{issuers[certification.issuer].name}</p>
                    <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-fg">{t(certification.title, lang)}</h3>
                    <p className="mt-auto pt-2 text-sm text-muted">
                      {t(certification.dateLabel, lang)}
                      {certification.detail ? ` · ${t(certification.detail, lang)}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={open ? t(open.title, lang) : tr("certifications.open", lang)}
        data-lenis-prevent
        className="sheet m-auto w-[min(94vw,1100px)]"
        onKeyDown={onDialogKey}
        onClose={() => setOpen(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        {open ? (
          <div className="flex max-h-[92dvh] flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{t(issuers[open.issuer].full, lang)}</p>
                <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">{t(open.title, lang)}</h3>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label={tr("certifications.close", lang)}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-fg hover:border-fg"
              >
                <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5 5 15" />
                </svg>
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-auto bg-[#f4f2ec] p-4 sm:p-6">
              {pages.length ? (
                <Image
                  key={pages[page]}
                  src={pages[page]}
                  alt={`${tr("certifications.scanAlt", lang)} ${t(open.title, lang)}`}
                  width={sizeOf(pages[page])[0]}
                  height={sizeOf(pages[page])[1]}
                  sizes="(min-width: 1100px) 1050px, 94vw"
                  className="mx-auto h-auto max-h-[62dvh] w-auto max-w-full object-contain"
                />
              ) : (
                <div className="h-64 text-[#4a4f59]">
                  <NoScan lang={lang} />
                </div>
              )}
              {pages.length > 1 ? (
                <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
                  <button type="button" onClick={() => turn(-1)} aria-label={tr("certifications.prevPage", lang)} className="grid size-10 place-items-center rounded-full bg-[#0b0c0f] text-[#f2f0ea]">
                    ←
                  </button>
                  <span className="rounded-full bg-[#0b0c0f] px-3 py-1.5 font-mono text-xs text-[#f2f0ea]">
                    {tr("certifications.page", lang)} {page + 1} / {pages.length}
                  </span>
                  <button type="button" onClick={() => turn(1)} aria-label={tr("certifications.nextPage", lang)} className="grid size-10 place-items-center rounded-full bg-[#0b0c0f] text-[#f2f0ea]">
                    →
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-line px-5 py-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>
                {t(open.dateLabel, lang)}
                {open.detail ? ` · ${t(open.detail, lang)}` : ""}
                {open.code ? (
                  <>
                    {" · "}
                    {tr("certifications.code", lang)} <span className="font-mono text-fg">{open.code}</span>
                  </>
                ) : null}
              </p>
              {open.images?.length ? (
                <a
                  href={open.pdf ?? MAIN_BUNDLE}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-full border border-line px-4 py-2 text-fg hover:border-fg"
                >
                  {tr("certifications.openPdf", lang)} ↗
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
