// Smoke tests for the console's SQL engine against the real content.
// Usage: npm run check:sql   (exits 1 on the first failed expectation)
import { run, type Messages, type Result } from "../lib/sql";
import { buildTables } from "../lib/sql-tables";

const messages: Messages = {
  unknownTable: (name) => `unknown table ${name}`,
  unknownColumn: (name) => `unknown column ${name}`,
  syntax: (near) => `syntax near ${near}`,
  groupNeedsCount: "group needs count",
  onlyRead: "read only",
  help: "help",
  tables: "tables",
};

let failures = 0;
function expect(label: string, result: Result, check: (r: Result) => boolean) {
  const ok = check(result);
  if (!ok) failures++;
  const summary = result.kind === "rows" ? `${result.rows.length} rows · ${result.columns.join(", ")}` : `${result.kind}: ${result.text}`;
  console.log(`${ok ? "ok  " : "FAIL"} ${label.padEnd(44)} ${summary}`);
}
const rows = (r: Result) => (r.kind === "rows" ? r.rows : []);

const es = buildTables("es");
const en = buildTables("en");

expect("show tables", run("SHOW TABLES;", es, messages, "es"), (r) => rows(r).length === 5);
expect("select * experiencia", run("select * from experiencia", es, messages, "es"), (r) => rows(r).length === 4);
expect("current role", run("SELECT empresa, rol FROM experiencia WHERE actual = TRUE;", es, messages, "es"), (r) => rows(r).length === 1 && rows(r)[0][0] === "PREDIQT");
expect("count by issuer", run("SELECT emisor, COUNT(*) AS total FROM certificaciones GROUP BY emisor ORDER BY total DESC LIMIT 3", es, messages, "es"), (r) => rows(r)[0]?.[0] === "Netzun" && rows(r)[0]?.[1] === 5);
expect("count all", run("SELECT COUNT(*) FROM certificaciones", es, messages, "es"), (r) => rows(r)[0]?.[0] === 12);
expect("like + accents", run("SELECT herramienta FROM habilidades WHERE nivel LIKE 'avanz%'", es, messages, "es"), (r) => rows(r).length >= 2);
expect("english names", run("SELECT company FROM experience WHERE current = true", en, messages, "en"), (r) => rows(r)[0]?.[0] === "PREDIQT");
expect("mixed language names", run("select titulo from certifications where emisor = 'UNI'", es, messages, "es"), (r) => rows(r).length === 1);
expect("or / and", run("SELECT titulo FROM certificaciones WHERE emisor = 'Huawei' OR (emisor = 'Cisco' AND fecha < '2022')", es, messages, "es"), (r) => rows(r).length === 2);
expect("order by ordinal", run("SELECT titulo, fecha FROM certificaciones ORDER BY 2 LIMIT 1", es, messages, "es"), (r) => String(rows(r)[0]?.[1]).startsWith("2021"));
expect("empty projects", run("SELECT * FROM proyectos", es, messages, "es"), (r) => r.kind === "rows" && rows(r).length === 0);
expect("describe", run("DESCRIBE habilidades", es, messages, "es"), (r) => rows(r).length === 3);
expect("write rejected", run("DELETE FROM experiencia", es, messages, "es"), (r) => r.kind === "error" && r.text === "read only");
expect("unknown table", run("SELECT * FROM salarios", es, messages, "es"), (r) => r.kind === "error");
expect("unknown column", run("SELECT sueldo FROM experiencia", es, messages, "es"), (r) => r.kind === "error");
expect("syntax error", run("SELECT FROM", es, messages, "es"), (r) => r.kind === "error");
expect("unterminated string", run("SELECT * FROM experiencia WHERE empresa = 'PRED", es, messages, "es"), (r) => r.kind === "error");

console.log(failures ? `\n${failures} failing` : "\nAll SQL checks pass");
process.exit(failures ? 1 : 0);
