import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { Lang, SkillItem } from "@/content/types";
import { skills } from "@/content";
import { Section } from "@/components/ui/Section";
import { t, tr } from "@/lib/i18n";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;
const loop = (name: string, duration: number, delayMs = 0): CSSProperties => ({
  animation: `${name} ${duration}ms cubic-bezier(0.65, 0, 0.35, 1) ${delayMs}ms infinite`,
});

/* ── Micro-visuals: each core tool shows the kind of work it does. ───────── */

function BarsVisual() {
  const heights = [38, 55, 47, 68, 62, 84, 100];
  return (
    <div aria-hidden className="flex h-36 items-end gap-2 sm:gap-3">
      {heights.map((height, i) => (
        <div key={i} className="flex h-full flex-1 items-end">
          <div
            className="loop w-full origin-bottom rounded-t-md bg-accent"
            style={{ height: `${height}%`, opacity: 0.35 + (i / heights.length) * 0.65, ...loop("bar-grow", 4200, i * 90) }}
          />
        </div>
      ))}
    </div>
  );
}

function SqlVisual() {
  const lines = [
    ["SELECT", " region,"],
    ["", "  SUM(ventas) AS total"],
    ["FROM", " fact_ventas"],
    ["GROUP BY", " region;"],
  ];
  return (
    <pre aria-hidden className="font-mono text-[13px] leading-7 text-muted">
      {lines.map(([keyword, rest], i) => (
        <span key={i} className="loop block w-fit" style={loop("type-line", 5200, i * 350)}>
          <span className="text-accent">{keyword}</span>
          <span className="text-fg">{rest}</span>
        </span>
      ))}
      <span className="loop inline-block h-4 w-2 translate-y-0.5 bg-accent" style={{ animation: "caret 1s steps(1) infinite" }} />
    </pre>
  );
}

function CellsVisual() {
  const cells = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div aria-hidden className="grid grid-cols-6 gap-1">
      {cells.map((cell) => (
        <div
          key={cell}
          className="loop h-6 rounded-[4px] border border-line"
          style={loop("cell-fill", 4800, ((cell % 6) + Math.floor(cell / 6)) * 110)}
        />
      ))}
    </div>
  );
}

function PythonVisual() {
  const lines = [
    [["df", "fg"], [" = pd.read_csv(", "muted"], ['"ventas.csv"', "accent"], [")", "muted"]],
    [["df", "fg"], [".dropna()", "muted"]],
    [["df", "fg"], [".groupby(", "muted"], ['"mes"', "accent"], [")[", "muted"], ['"total"', "accent"], ["].sum()", "muted"]],
  ] as const;
  const color = { fg: "text-fg", muted: "text-muted", accent: "text-accent" };
  return (
    <pre aria-hidden className="overflow-hidden font-mono text-[13px] leading-7">
      {lines.map((parts, i) => (
        <span key={i} className="loop block w-fit whitespace-pre" style={loop("type-line", 5600, i * 450)}>
          <span className="mr-3 text-line">{i + 1}</span>
          {parts.map(([text, tone], j) => (
            <span key={j} className={color[tone]}>
              {text}
            </span>
          ))}
        </span>
      ))}
    </pre>
  );
}

const VISUALS: Record<string, { visual: ReactNode; span: string }> = {
  "Power BI": { visual: <BarsVisual />, span: "lg:col-span-7" },
  SQL: { visual: <SqlVisual />, span: "lg:col-span-5" },
  Excel: { visual: <CellsVisual />, span: "lg:col-span-5" },
  "Python · Pandas": { visual: <PythonVisual />, span: "lg:col-span-7" },
};

function CoreCard({ item, lang, order }: { item: SkillItem; lang: Lang; order: number }) {
  const config = VISUALS[item.name];
  return (
    <article
      data-reveal
      style={delay(order * 90)}
      className={`group flex min-h-72 flex-col justify-between gap-10 rounded-3xl border border-line bg-surface p-6 transition-colors duration-500 hover:border-accent/50 sm:p-8 ${config?.span ?? "lg:col-span-6"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl font-bold tracking-[-0.03em] text-fg sm:text-4xl">{item.name}</h3>
          {item.level ? (
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">{t(item.level, lang)}</p>
          ) : null}
        </div>
        {item.logo ? (
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f7f6f2] p-2.5 transition-transform duration-500 ease-out-expo group-hover:-rotate-6 group-hover:scale-105">
            <Image src={item.logo} alt="" width={256} height={256} className="size-full object-contain" />
          </span>
        ) : null}
      </div>
      {config?.visual}
    </article>
  );
}

export function Skills({ lang, index }: { lang: Lang; index: number }) {
  const core = skills.flatMap((group) => group.items.filter((item) => item.featured));
  const groups = skills
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.featured) }))
    .filter((group) => group.items.length > 0);
  const marquee = skills.filter((group) => group.id !== "languages").flatMap((group) => group.items.map((item) => item.name));

  return (
    <Section
      id="skills"
      index={index}
      eyebrow={tr("nav.skills", lang)}
      title={tr("skills.title", lang)}
      intro={tr("skills.intro", lang)}
    >
      <h3 className="sr-only">{tr("skills.core", lang)}</h3>
      <div className="grid gap-4 lg:grid-cols-12">
        {core.map((item, i) => (
          <CoreCard key={item.name} item={item} lang={lang} order={i} />
        ))}
      </div>

      {/* Every tool on one endless strip; it pauses under the cursor. */}
      <div
        aria-hidden
        className="group relative -mx-5 my-12 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)] sm:-mx-8 lg:-mx-16"
      >
        <div className="flex w-max animate-[marquee_45s_linear_infinite] group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {marquee.map((name) => (
                <span key={name} className="flex items-center">
                  <span className="px-6 font-display text-3xl font-semibold tracking-[-0.02em] text-muted transition-colors hover:text-fg sm:text-4xl">
                    {name}
                  </span>
                  <span className="text-accent">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, i) => (
          <article key={group.id} data-reveal style={delay((i % 3) * 80)} className="rounded-3xl border border-line p-6 sm:p-7">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{t(group.label, lang)}</h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-fg transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  {item.name}
                  {item.level ? <span className="ml-2 text-muted">· {t(item.level, lang)}</span> : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
