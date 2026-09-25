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
const fs = require("fs");
const os = require("os");
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
  {
    name: "G — VAL (ALL) cubre todos los REQ sin gap",
    fixture: "fixtures/g-all-transversal",
    script: "trace.js",
    exit: 0,
    expect: ["REQ-002", "VAL-002, VAL-004", "Sin issues de trazabilidad"],
  },
  {
    name: "H — approved sin decisión humana → gate bloquea",
    fixture: "fixtures/h-approval-missing",
    script: "status.js",
    exit: 1,
    expect: ["State: approved", "approved requiere una aprobación o decisión"],
  },
  {
    name: "I — validated sin TASK/VAL válidos → gate bloquea",
    fixture: "fixtures/i-validated-invalid",
    script: "status.js",
    exit: 1,
    expect: [
      "State: validated",
      "validated requiere todos los TASK completos (1/2)",
      "validated requiere todos los VAL en PASS con evidencia (0/1)",
    ],
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

function run(command, args, cwd, env) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function changelogSameDayEval() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-changelog-"));
  const sameDay = "2026-09-10T12:00:00+00:00";
  const gitEnv = { GIT_AUTHOR_DATE: sameDay, GIT_COMMITTER_DATE: sameDay };
  const git = (args, env) => run("git", args, temp, env);
  const fail = (message) => ({ ok: false, message });

  if (git(["init", "-q"]).status !== 0) return fail("git init falló");
  git(["config", "user.email", "eval@example.test"]);
  git(["config", "user.name", "SDD Eval"]);
  fs.writeFileSync(path.join(temp, "base.txt"), "base\n");
  git(["add", "base.txt"]);
  if (git(["commit", "-qm", "base"], gitEnv).status !== 0) return fail("commit base falló");
  const base = git(["rev-parse", "HEAD"]).stdout.trim();

  fs.writeFileSync(path.join(temp, "first.txt"), "first\n");
  git(["add", "first.txt"]);
  if (git(["commit", "-qm", "feat: first same-day commit"], gitEnv).status !== 0) return fail("primer commit falló");
  const first = run(process.execPath, [path.join(SCRIPTS, "changelog.js"), "--base", base], temp);
  if (first.status !== 0) return fail(`primer changelog falló: ${first.stderr}`);

  fs.writeFileSync(path.join(temp, "second.txt"), "second\n");
  git(["add", "second.txt"]);
  if (git(["commit", "-qm", "fix: second same-day commit"], gitEnv).status !== 0) return fail("segundo commit falló");
  const second = run(process.execPath, [path.join(SCRIPTS, "changelog.js")], temp);
  if (second.status !== 0) return fail(`segundo changelog falló: ${second.stderr}`);

  const changelog = fs.readFileSync(path.join(temp, "CHANGELOG.md"), "utf8");
  const head = git(["rev-parse", "HEAD"]).stdout.trim();
  const bothCommits =
    changelog.includes("feat: first same-day commit") &&
    changelog.includes("fix: second same-day commit");
  const markerUpdated = changelog.includes(`sdd-changelog:last-commit=${head}`);
  return bothCommits && markerUpdated
    ? { ok: true }
    : fail("faltan commits del mismo día o el marcador SHA no quedó actualizado");
}

const changelog = changelogSameDayEval();
if (!changelog.ok) failed++;
console.log(`${changelog.ok ? "PASS" : "FAIL"}  J — changelog conserva dos commits del mismo día`);
if (!changelog.ok) console.log(`      ${changelog.message}`);

const validatorSource = fs.readFileSync(
  path.join(__dirname, "..", ".opencode", "agents", "sdd-dl-validator.md"),
  "utf8"
);
const buildAllowed = ["npm run build*", "pnpm run build*", "yarn run build*"].every(
  (command) => validatorSource.includes(command)
);
if (!buildAllowed) failed++;
console.log(`${buildAllowed ? "PASS" : "FAIL"}  K — validator permite build con npm, pnpm y yarn`);

const total = cases.length + 2;
console.log(`\n${total - failed}/${total} evals PASS`);
process.exit(failed ? 1 : 0);
