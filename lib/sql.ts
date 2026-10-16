/**
 * A tiny, read-only SQL engine for the "query my career" console.
 *
 * It never evaluates code: the query is tokenised and parsed into a small AST,
 * then run against in-memory tables built from /content. Supported:
 *
 *   SELECT * | col [AS alias], COUNT(*) [AS alias] …
 *   FROM table
 *   [WHERE cond (AND|OR cond)…]      cond: col = != <> > < >= <= value | col LIKE 'pa%tern'
 *   [GROUP BY col] [ORDER BY col|alias|n [ASC|DESC]] [LIMIT n]
 *   SHOW TABLES · DESCRIBE table · HELP
 *
 * Table and column names are accepted in Spanish or English, with or without
 * accents, in any case.
 */

export type Value = string | number | boolean | null;

export interface Column {
  key: string;
  es: string;
  en: string;
}

export interface Table {
  key: string;
  es: string;
  en: string;
  columns: Column[];
  rows: Record<string, Value>[];
}

export type Result =
  | { kind: "rows"; columns: string[]; rows: Value[][]; ms: number }
  | { kind: "message"; text: string }
  | { kind: "error"; text: string };

export type Messages = {
  unknownTable: (name: string, tables: string) => string;
  unknownColumn: (name: string, table: string, columns: string) => string;
  syntax: (near: string) => string;
  groupNeedsCount: string;
  onlyRead: string;
  help: string;
  tables: string;
};

const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/* ── Tokens ─────────────────────────────────────────────────────────────── */

type Token =
  | { t: "word"; v: string }
  | { t: "string"; v: string }
  | { t: "number"; v: number }
  | { t: "op"; v: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      let text = "";
      while (j < input.length && input[j] !== quote) text += input[j++];
      if (j >= input.length) throw new SyntaxError(input.slice(i, i + 12));
      tokens.push({ t: "string", v: text });
      i = j + 1;
      continue;
    }
    const number = /^\d+(\.\d+)?/.exec(input.slice(i));
    if (number) {
      tokens.push({ t: "number", v: Number(number[0]) });
      i += number[0].length;
      continue;
    }
    const word = /^[\p{L}_][\p{L}\p{N}_]*/u.exec(input.slice(i));
    if (word) {
      tokens.push({ t: "word", v: word[0] });
      i += word[0].length;
      continue;
    }
    const op = /^(>=|<=|!=|<>|[=<>*(),;])/.exec(input.slice(i));
    if (op) {
      tokens.push({ t: "op", v: op[0] });
      i += op[0].length;
      continue;
    }
    throw new SyntaxError(input.slice(i, i + 12));
  }
  return tokens;
}

/* ── Parser ─────────────────────────────────────────────────────────────── */

interface SelectItem {
  count: boolean;
  column?: string;
  alias?: string;
}
type Condition =
  | { kind: "cmp"; column: string; op: string; value: Value }
  | { kind: "and" | "or"; left: Condition; right: Condition };
interface Query {
  items: SelectItem[] | "*";
  table: string;
  where?: Condition;
  groupBy?: string;
  orderBy?: { ref: string | number; desc: boolean };
  limit?: number;
}

class Parser {
  private i = 0;
  constructor(private tokens: Token[]) {}

  private peek() {
    return this.tokens[this.i];
  }
  private next() {
    return this.tokens[this.i++];
  }
  private isWord(word: string) {
    const token = this.peek();
    return token?.t === "word" && fold(token.v) === word;
  }
  private isOp(op: string) {
    const token = this.peek();
    return token?.t === "op" && token.v === op;
  }
  private expectWord(word: string) {
    if (!this.isWord(word)) throw new SyntaxError(this.near());
    this.i++;
  }
  private expectOp(op: string) {
    if (!this.isOp(op)) throw new SyntaxError(this.near());
    this.i++;
  }
  private ident() {
    const token = this.next();
    if (token?.t !== "word") throw new SyntaxError(this.near(-1));
    return token.v;
  }
  near(offset = 0) {
    const token = this.tokens[this.i + offset];
    return token ? String(token.v) : "fin";
  }

  parse(): Query {
    this.expectWord("select");
    let items: SelectItem[] | "*";
    if (this.isOp("*")) {
      this.i++;
      items = "*";
    } else {
      items = [this.item()];
      while (this.isOp(",")) {
        this.i++;
        items.push(this.item());
      }
    }
    this.expectWord("from");
    const query: Query = { items, table: this.ident() };
    if (this.isWord("where")) {
      this.i++;
      query.where = this.or();
    }
    if (this.isWord("group")) {
      this.i++;
      this.expectWord("by");
      query.groupBy = this.ident();
    }
    if (this.isWord("order")) {
      this.i++;
      this.expectWord("by");
      const token = this.next();
      if (!token || (token.t !== "word" && token.t !== "number")) throw new SyntaxError(this.near(-1));
      let desc = false;
      if (this.isWord("desc")) {
        desc = true;
        this.i++;
      } else if (this.isWord("asc")) this.i++;
      query.orderBy = { ref: token.v as string | number, desc };
    }
    if (this.isWord("limit")) {
      this.i++;
      const token = this.next();
      if (token?.t !== "number") throw new SyntaxError(this.near(-1));
      query.limit = token.v;
    }
    if (this.isOp(";")) this.i++;
    if (this.peek()) throw new SyntaxError(this.near());
    return query;
  }

  private item(): SelectItem {
    let item: SelectItem;
    if (this.isWord("count")) {
      this.i++;
      this.expectOp("(");
      this.expectOp("*");
      this.expectOp(")");
      item = { count: true };
    } else item = { count: false, column: this.ident() };
    if (this.isWord("as")) {
      this.i++;
      item.alias = this.ident();
    }
    return item;
  }

  private or(): Condition {
    let left = this.and();
    while (this.isWord("or")) {
      this.i++;
      left = { kind: "or", left, right: this.and() };
    }
    return left;
  }

  private and(): Condition {
    let left = this.cmp();
    while (this.isWord("and")) {
      this.i++;
      left = { kind: "and", left, right: this.cmp() };
    }
    return left;
  }

  private cmp(): Condition {
    if (this.isOp("(")) {
      this.i++;
      const inner = this.or();
      this.expectOp(")");
      return inner;
    }
    const column = this.ident();
    let op: string;
    if (this.isWord("like")) {
      this.i++;
      op = "like";
    } else {
      const token = this.next();
      if (token?.t !== "op" || !["=", "!=", "<>", ">", "<", ">=", "<="].includes(token.v)) {
        throw new SyntaxError(this.near(-1));
      }
      op = token.v;
    }
    const token = this.next();
    let value: Value;
    if (token?.t === "string" || token?.t === "number") value = token.v;
    else if (token?.t === "word" && ["true", "verdadero"].includes(fold(token.v))) value = true;
    else if (token?.t === "word" && ["false", "falso"].includes(fold(token.v))) value = false;
    else if (token?.t === "word" && fold(token.v) === "null") value = null;
    else throw new SyntaxError(this.near(-1));
    return { kind: "cmp", column, op, value };
  }
}

/* ── Execution ──────────────────────────────────────────────────────────── */

const findTable = (tables: Table[], name: string) => {
  const key = fold(name);
  return tables.find((table) => [table.key, table.es, table.en].some((n) => fold(n) === key));
};

const findColumn = (table: Table, name: string) => {
  const key = fold(name);
  return table.columns.find((column) => [column.key, column.es, column.en].some((n) => fold(n) === key));
};

function compare(a: Value, b: Value) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a === null) return b === null ? 0 : -1;
  if (b === null) return 1;
  return fold(String(a)).localeCompare(fold(String(b)));
}

function test(row: Record<string, Value>, condition: Condition, table: Table, messages: Messages, lang: "es" | "en"): boolean {
  if (condition.kind !== "cmp") {
    const left = test(row, condition.left, table, messages, lang);
    return condition.kind === "and" ? left && test(row, condition.right, table, messages, lang) : left || test(row, condition.right, table, messages, lang);
  }
  const column = findColumn(table, condition.column);
  if (!column) throw new ReferenceError(messages.unknownColumn(condition.column, table[lang], table.columns.map((c) => c[lang]).join(", ")));
  const value = row[column.key];
  if (condition.op === "like") {
    const pattern = fold(String(condition.value))
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/%/g, ".*")
      .replace(/_/g, ".");
    return new RegExp(`^${pattern}$`).test(fold(String(value ?? "")));
  }
  if (typeof value === "boolean" || typeof condition.value === "boolean") {
    const equal = value === condition.value;
    return condition.op === "=" ? equal : condition.op === "!=" || condition.op === "<>" ? !equal : false;
  }
  const diff = compare(value, condition.value);
  switch (condition.op) {
    case "=":
      return diff === 0;
    case "!=":
    case "<>":
      return diff !== 0;
    case ">":
      return diff > 0;
    case "<":
      return diff < 0;
    case ">=":
      return diff >= 0;
    case "<=":
      return diff <= 0;
  }
  return false;
}

export function run(input: string, tables: Table[], messages: Messages, lang: "es" | "en"): Result {
  const started = performance.now();
  const text = input.trim().replace(/;+\s*$/, "");
  const command = fold(text);

  if (!text) return { kind: "message", text: "" };
  if (command === "help" || command === "ayuda") return { kind: "message", text: messages.help };
  if (command === "show tables" || command === "mostrar tablas") {
    return {
      kind: "rows",
      columns: [messages.tables],
      rows: tables.map((table) => [table[lang]]),
      ms: performance.now() - started,
    };
  }
  const describe = /^(describe|desc|describir)\s+([\p{L}_][\p{L}\p{N}_]*)$/u.exec(command);
  if (describe) {
    const table = findTable(tables, describe[2]);
    if (!table) return { kind: "error", text: messages.unknownTable(describe[2], tables.map((t) => t[lang]).join(", ")) };
    return {
      kind: "rows",
      columns: [lang === "es" ? "columna" : "column", lang === "es" ? "ejemplo" : "example"],
      rows: table.columns.map((column) => [column[lang], table.rows[0]?.[column.key] ?? null]),
      ms: performance.now() - started,
    };
  }
  if (/^(insert|update|delete|drop|alter|create|truncate|replace|merge)\b/.test(command)) {
    return { kind: "error", text: messages.onlyRead };
  }

  let query: Query;
  try {
    query = new Parser(tokenize(text)).parse();
  } catch (error) {
    return { kind: "error", text: messages.syntax(error instanceof Error ? error.message : "") };
  }

  const table = findTable(tables, query.table);
  if (!table) return { kind: "error", text: messages.unknownTable(query.table, tables.map((t) => t[lang]).join(", ")) };

  try {
    const resolve = (name: string) => {
      const column = findColumn(table, name);
      if (!column) throw new ReferenceError(messages.unknownColumn(name, table[lang], table.columns.map((c) => c[lang]).join(", ")));
      return column;
    };

    const rows = table.rows.filter((row) => (query.where ? test(row, query.where, table, messages, lang) : true));

    let columns: string[];
    let out: Value[][];
    const items = query.items;
    const counting = items !== "*" && items.some((item) => item.count);

    if (query.groupBy || counting) {
      if (items === "*") throw new ReferenceError(messages.groupNeedsCount);
      const groupColumn = query.groupBy ? resolve(query.groupBy) : null;
      const groups = new Map<string, Record<string, Value>[]>();
      for (const row of rows) {
        const key = groupColumn ? String(row[groupColumn.key]) : "*";
        groups.set(key, [...(groups.get(key) ?? []), row]);
      }
      if (!groupColumn && groups.size === 0) groups.set("*", []);
      columns = items.map((item) => item.alias ?? (item.count ? "count" : resolve(item.column!)[lang]));
      out = [...groups.values()].map((group) =>
        items.map((item) => {
          if (item.count) return group.length;
          const column = resolve(item.column!);
          if (groupColumn && column.key !== groupColumn.key) throw new ReferenceError(messages.groupNeedsCount);
          return group[0]?.[column.key] ?? null;
        }),
      );
    } else {
      const picked = items === "*" ? table.columns.map((column) => ({ column, alias: undefined as string | undefined })) : items.map((item) => ({ column: resolve(item.column!), alias: item.alias }));
      columns = picked.map(({ column, alias }) => alias ?? column[lang]);
      out = rows.map((row) => picked.map(({ column }) => row[column.key]));
    }

    if (query.orderBy) {
      const ref = query.orderBy.ref;
      let index = typeof ref === "number" ? ref - 1 : columns.findIndex((name) => fold(name) === fold(ref));
      if (index < 0 && typeof ref === "string") {
        const column = resolve(ref);
        index = columns.findIndex((name) => fold(name) === fold(column[lang]));
      }
      if (index < 0 || index >= columns.length) throw new ReferenceError(messages.unknownColumn(String(ref), table[lang], columns.join(", ")));
      const sign = query.orderBy.desc ? -1 : 1;
      out = [...out].sort((a, b) => sign * compare(a[index], b[index]));
    }
    if (query.limit !== undefined) out = out.slice(0, query.limit);
    return { kind: "rows", columns, rows: out, ms: performance.now() - started };
  } catch (error) {
    return { kind: "error", text: error instanceof Error ? error.message : String(error) };
  }
}
