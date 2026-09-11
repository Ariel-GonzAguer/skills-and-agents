#!/usr/bin/env node
/**
 * Evals deterministas del SDD Agent: corre status.js/trace.js contra fixtures
 * y compara la salida esperada. Los escenarios de comportamiento LLM (C, G, H)
 * están documentados en README.md como checklist manual.
 *
 * Uso: node evals/run-evals.js
 * Exit: 0 todos PASS, 1 al menos un FAIL.
 */

const { spawnSync } = require("child_process");
const path = require("path");

const SCRIPTS = path.join(__dirname, "..", ".opencode", "scripts");

const cases = [
  {
    name: "A — proyecto sin constitución → proponer constitución",
    fixture: "fixtures/a-no-constitution",
    script: "status.js",
    exit: 0,
    expect: ["Project state: no-constitution", "Crear la constitución"],
  },
  {
    name: "B — constitución sin feature → proponer feature spec",
    fixture: "fixtures/b-constituted",
    script: "status.js",
    exit: 0,
    expect: ["Project state: constituted", "crear feature spec"],
  },
  {
    name: "D — REQ sin VAL → traceability gap",
    fixture: "fixtures/d-traceability-gap",
    script: "trace.js",
    exit: 1,
    expect: ["REQ-003: sin VAL"],
  },
  {
    name: "E — checks sin pasar → no mergeable",
    fixture: "fixtures/e-failing-validation",
    script: "status.js",
    exit: 0,
    expect: ["State: validating", "Validated: 0/1"],
  },
  {
    name: "F — sesión nueva → reconstruye estado",
    fixture: "fixtures/f-resume",
    script: "status.js",
    exit: 0,
    expect: ["State: implementing", "Implemented: 1/2"],
  },
];

let failed = 0;
for (const c of cases) {
  const res = spawnSync(process.execPath, [path.join(SCRIPTS, c.script)], {
    cwd: path.join(__dirname, c.fixture),
    encoding: "utf8",
  });
  const out = `${res.stdout}\n${res.stderr}`;
  const executionError = res.error ? `${res.error.name}: ${res.error.message}` : "";
  const okExit = res.status === c.exit;
  const missing = c.expect.filter((s) => !out.includes(s));
  const ok = okExit && missing.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${c.name}`);
  if (executionError) console.log(`      no se pudo ejecutar: ${executionError}`);
  if (!okExit) console.log(`      exit esperado ${c.exit}, real ${res.status}`);
  for (const m of missing) console.log(`      falta: "${m}"`);
}
console.log(`\n${cases.length - failed}/${cases.length} evals PASS`);
process.exit(failed ? 1 : 0);
