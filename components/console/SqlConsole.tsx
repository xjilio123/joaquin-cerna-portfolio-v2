"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { Lang } from "@/content/types";
import { run, type Messages, type Result, type Value } from "@/lib/sql";
import { buildTables } from "@/lib/sql-tables";

interface Entry {
  id: number;
  query: string;
  result: Result;
}

const COPY = {
  es: {
    label: "Consulta SQL",
    placeholder: "Escribe una consulta y presiona Enter…",
    run: "Ejecutar",
    clear: "Limpiar",
    try: "Prueba",
    welcome: "Consola de solo lectura. Escribe HELP o toca una consulta de abajo.",
    rows: (n: number) => `${n} ${n === 1 ? "fila" : "filas"}`,
    empty: "Sin filas todavía.",
    suggestions: [
      { label: "¿Dónde trabajo?", query: "SELECT empresa, rol FROM experiencia WHERE actual = TRUE;" },
      { label: "Certificados por emisor", query: "SELECT emisor, COUNT(*) AS total FROM certificaciones GROUP BY emisor ORDER BY total DESC;" },
      { label: "Nivel avanzado", query: "SELECT herramienta, nivel FROM habilidades WHERE nivel = 'Avanzado';" },
      { label: "Ver tablas", query: "SHOW TABLES;" },
    ],
    messages: {
      unknownTable: (name, tables) => `La tabla «${name}» no existe. Tablas: ${tables}.`,
      unknownColumn: (name, table, columns) => `La columna «${name}» no existe en ${table}. Columnas: ${columns}.`,
      syntax: (near) => `Error de sintaxis cerca de «${near}». Prueba: SELECT * FROM experiencia;`,
      groupNeedsCount: "Con GROUP BY o COUNT(*), selecciona solo la columna agrupada y COUNT(*).",
      onlyRead: "Esta base es de solo lectura: solo se permite SELECT.",
      help: "Tablas: experiencia, certificaciones, habilidades, formacion, proyectos.\nComandos: SHOW TABLES · DESCRIBE tabla · CLEAR.\nEjemplo: SELECT titulo, fecha FROM certificaciones WHERE tema LIKE '%BI%' ORDER BY fecha DESC;",
      tables: "tabla",
    } satisfies Messages,
  },
  en: {
    label: "SQL query",
    placeholder: "Type a query and press Enter…",
    run: "Run",
    clear: "Clear",
    try: "Try",
    welcome: "Read-only console. Type HELP or tap a query below.",
    rows: (n: number) => `${n} ${n === 1 ? "row" : "rows"}`,
    empty: "No rows yet.",
    suggestions: [
      { label: "Where do I work?", query: "SELECT company, role FROM experience WHERE current = TRUE;" },
      { label: "Certificates by issuer", query: "SELECT issuer, COUNT(*) AS total FROM certifications GROUP BY issuer ORDER BY total DESC;" },
      { label: "Advanced level", query: "SELECT tool, level FROM skills WHERE level = 'Advanced';" },
      { label: "Show tables", query: "SHOW TABLES;" },
    ],
    messages: {
      unknownTable: (name, tables) => `Table “${name}” does not exist. Tables: ${tables}.`,
      unknownColumn: (name, table, columns) => `Column “${name}” does not exist in ${table}. Columns: ${columns}.`,
      syntax: (near) => `Syntax error near “${near}”. Try: SELECT * FROM experience;`,
      groupNeedsCount: "With GROUP BY or COUNT(*), select only the grouped column and COUNT(*).",
      onlyRead: "This database is read-only: only SELECT is allowed.",
      help: "Tables: experience, certifications, skills, education, projects.\nCommands: SHOW TABLES · DESCRIBE table · CLEAR.\nExample: SELECT title, date FROM certifications WHERE topic LIKE '%BI%' ORDER BY date DESC;",
      tables: "table",
    } satisfies Messages,
  },
} as const;

const KEYWORDS = /\b(SELECT|FROM|WHERE|AND|OR|GROUP BY|ORDER BY|LIMIT|COUNT|AS|DESC|ASC|LIKE|TRUE|FALSE|NULL|SHOW TABLES|DESCRIBE)\b/gi;

/** Light syntax colouring for echoed queries: keywords in the accent, strings in fg. */
function Highlight({ query }: { query: string }) {
  const parts: { text: string; tone: "kw" | "str" | "plain" }[] = [];
  const pattern = new RegExp(`('[^']*'?)|${KEYWORDS.source}`, "gi");
  let last = 0;
  for (const match of query.matchAll(pattern)) {
    if (match.index! > last) parts.push({ text: query.slice(last, match.index), tone: "plain" });
    parts.push({ text: match[0], tone: match[1] ? "str" : "kw" });
    last = match.index! + match[0].length;
  }
  if (last < query.length) parts.push({ text: query.slice(last), tone: "plain" });
  return (
    <>
      {parts.map((part, i) => (
        <span key={i} className={part.tone === "kw" ? "text-accent" : part.tone === "str" ? "text-fg" : "text-muted"}>
          {part.text}
        </span>
      ))}
    </>
  );
}

function Cell({ value }: { value: Value }) {
  if (value === null) return <span className="text-muted/70">NULL</span>;
  if (typeof value === "boolean") return <span className="text-accent">{value ? "TRUE" : "FALSE"}</span>;
  return <>{String(value)}</>;
}

/**
 * "Query my profile": a terminal over read-only tables built from /content.
 * The first time it scrolls into view it types and runs a sample query.
 */
export function SqlConsole({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  const tables = useMemo(() => buildTables(lang), [lang]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [typing, setTyping] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  const execute = (query: string) => {
    const text = query.trim();
    if (!text) return;
    if (/^(clear|limpiar)\s*;?$/i.test(text)) {
      setEntries([]);
      setInput("");
      return;
    }
    const result = run(text, tables, copy.messages, lang);
    setEntries((list) => [...list.slice(-11), { id: nextId.current++, query: text, result }]);
    setInput("");
    setHistoryIndex(-1);
  };

  // Keep the newest answer in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [entries]);

  // First time on screen: type a sample query, then run it.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sample = COPY[lang].suggestions[0].query;
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (reduce) return;
        let i = 0;
        setTyping(true);
        timer = setInterval(() => {
          i++;
          setInput(sample.slice(0, i));
          if (i >= sample.length) {
            clearInterval(timer);
            setTyping(false);
            setTimeout(() => {
              setEntries((list) => [...list, { id: nextId.current++, query: sample, result: run(sample, buildTables(lang), COPY[lang].messages, lang) }]);
              setInput("");
            }, 250);
          }
        }, 28);
      },
      { threshold: 0.5 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [lang]);

  const history = entries.map((entry) => entry.query);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" && history.length) {
      event.preventDefault();
      const index = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setInput(history[index]);
    } else if (event.key === "ArrowDown" && historyIndex >= 0) {
      event.preventDefault();
      const index = historyIndex + 1;
      if (index >= history.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(index);
        setInput(history[index]);
      }
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    execute(input);
  }

  return (
    <div ref={rootRef} className="overflow-hidden rounded-3xl border border-line bg-surface font-mono text-[13px] shadow-2xl shadow-black/20 sm:text-sm">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
        <span aria-hidden className="size-3 rounded-full bg-line" />
        <span aria-hidden className="size-3 rounded-full bg-line" />
        <span aria-hidden className="size-3 rounded-full bg-line" />
        <span className="ml-3 truncate text-muted">portfolio.sql — joaquin-cerna</span>
        <button
          type="button"
          onClick={() => setEntries([])}
          className="ml-auto rounded-full px-3 py-1 text-xs text-muted transition-colors hover:text-fg"
        >
          {copy.clear}
        </button>
      </div>

      <div ref={logRef} role="log" aria-live="polite" data-lenis-prevent className="max-h-[26rem] min-h-56 overflow-y-auto px-5 py-4">
        {entries.length === 0 ? <p className="text-muted">{copy.welcome}</p> : null}
        {entries.map((entry) => (
          <div key={entry.id} className="mb-5 last:mb-0">
            <p className="whitespace-pre-wrap break-words">
              <span aria-hidden className="text-accent">jcr=# </span>
              <Highlight query={entry.query} />
            </p>
            {entry.result.kind === "rows" ? (
              <div className="mt-2">
                {entry.result.rows.length ? (
                  <div className="overflow-x-auto" data-lenis-prevent>
                    <table className="w-max min-w-full border-collapse text-left">
                      <thead>
                        <tr>
                          {entry.result.columns.map((column, i) => (
                            <th key={i} scope="col" className="border-b border-line py-1.5 pr-6 font-medium uppercase tracking-wider text-muted">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {entry.result.rows.map((row, r) => (
                          <tr key={r}>
                            {row.map((value, c) => (
                              <td key={c} className="py-1 pr-6 text-fg">
                                <Cell value={value} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">{copy.empty}</p>
                )}
                <p className="mt-1.5 text-xs text-muted">
                  ({copy.rows(entry.result.rows.length)} · {entry.result.ms.toFixed(1)} ms)
                </p>
              </div>
            ) : entry.result.kind === "error" ? (
              <p role="alert" className="mt-2 whitespace-pre-wrap text-[#ff6b70] in-data-[theme=light]:text-[#b0262c]">
                {entry.result.text}
              </p>
            ) : entry.result.text ? (
              <p className="mt-2 whitespace-pre-wrap text-muted">{entry.result.text}</p>
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-3 border-t border-line px-5 py-3">
        <span aria-hidden className="text-accent">jcr=#</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          readOnly={typing}
          aria-label={copy.label}
          placeholder={copy.placeholder}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-fg outline-none placeholder:text-muted/70"
        />
        <button type="submit" className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-fg">
          {copy.run}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3.5">
        <span className="mr-1 text-xs uppercase tracking-[0.2em] text-muted">{copy.try}</span>
        {copy.suggestions.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => execute(suggestion.query)}
            className="min-h-10 rounded-full border border-line px-3.5 py-1.5 font-sans text-sm text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}
