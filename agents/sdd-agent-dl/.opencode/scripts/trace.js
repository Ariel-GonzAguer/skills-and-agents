#!/usr/bin/env node
/**
 * Matriz de trazabilidad REQ → TASK → VAL y checks de consistencia.
 *
 * Uso: node .opencode/scripts/trace.js [specs/<feature-dir>]
 * Sin argumento, usa el feature dir activo (mismo criterio que status.js).
 * Exit codes: 0 ok, 1 gaps o errores detectados.
 */

const fs = require("fs");
const path = require("path");

function read(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function listFeatureDirs() {
  if (!fs.existsSync("specs")) return [];
  return fs
    .readdirSync("specs", { withFileTypes: true })
    .filter(
      (d) => d.isDirectory() && /^\d{4}-\d{2}-\d{2}-/.test(d.name)
    )
    .map((d) => d.name)
    .sort()
    .reverse();
}

function parseRequirements(content) {
  const reqs = [];
  const sections = content.split(/^## /m);
  for (const section of sections) {
    if (!section.trim().startsWith("Requirements")) continue;
    const blocks = section.split(/^### /m);
    for (const block of blocks) {
      const m = block.match(/^(REQ-\d+)/);
      if (!m) continue;
      const boxes = (block.match(/^- \[[ x]\] /gm) || []).length;
      const done = (block.match(/^- \[x\] /gm) || []).length;
      const hasCriteria = /Acceptance criteria/i.test(block);
      reqs.push({ id: m[1], boxes, done, hasCriteria });
    }
  }
  return reqs;
}

function parsePlan(content) {
  const tasks = [];
  const sections = content.split(/^## /m);
  for (const section of sections) {
    if (!section.trim().startsWith("TASK-")) continue;
    const m = section.match(/^(TASK-\d+) \(([^)]*)\)/);
    if (!m) continue;
    const refs = m[2].split(/[\s,]+/).filter((r) => r && r !== "ALL");
    const boxes = (section.match(/^- \[[ x]\] /gm) || []).length;
    const done = (section.match(/^- \[x\] /gm) || []).length;
    tasks.push({ id: m[1], refs, boxes, done });
  }
  return tasks;
}

function parseValidation(content) {
  const vals = [];
  const sections = content.split(/^### /m);
  for (const section of sections) {
    const m = section.match(/^(VAL-\d+) \(([^)]*)\)/);
    if (!m) continue;
    const refs = m[2].split(/[\s,]+/).filter((r) => r && r !== "ALL");
    const boxes = (section.match(/^- \[[ x]\] /gm) || []).length;
    const done = (section.match(/^- \[x\] /gm) || []).length;
    vals.push({ id: m[1], refs, boxes, done, result: boxes > 0 && done === boxes ? "PASS" : "FAIL" });
  }
  return vals;
}

function pickActive(dir) {
  if (dir) return dir;
  const features = listFeatureDirs();
  if (features.length === 0) {
    console.error("No hay feature dirs bajo specs/.");
    process.exit(1);
  }
  return features[0];
}

function main() {
  const arg = process.argv[2];
  const base = arg
    ? path.isAbsolute(arg)
      ? arg
      : path.join("specs", arg)
    : path.join("specs", pickActive());
  const target = path.basename(base);
  const reqs = parseRequirements(read(path.join(base, "requirements.md")));
  const tasks = parsePlan(read(path.join(base, "plan.md")));
  const vals = parseValidation(read(path.join(base, "validation.md")));

  const errors = [];
  const gaps = [];

  const reqIds = new Set(reqs.map((r) => r.id));
  const seen = new Set();
  for (const r of reqs) {
    if (seen.has(r.id)) errors.push(`ID duplicado: ${r.id}`);
    seen.add(r.id);
  }
  const seenTasks = new Set();
  for (const t of tasks) {
    if (seenTasks.has(t.id)) errors.push(`ID duplicado: ${t.id}`);
    seenTasks.add(t.id);
    for (const ref of t.refs) if (!reqIds.has(ref)) errors.push(`${t.id} referencia REQ inexistente: ${ref}`);
    if (t.refs.length === 0) errors.push(`${t.id} sin referencia a REQ`);
  }
  const seenVals = new Set();
  for (const v of vals) {
    if (seenVals.has(v.id)) errors.push(`ID duplicado: ${v.id}`);
    seenVals.add(v.id);
    for (const ref of v.refs) if (!reqIds.has(ref)) errors.push(`${v.id} referencia REQ inexistente: ${ref}`);
    if (v.refs.length === 0) errors.push(`${v.id} sin referencia a REQ`);
  }

  console.log(`# Traceability Matrix — ${target}\n`);
  console.log("| Requirement | Acceptance | Tasks | Validations | Result |");
  console.log("| ----------- | ---------- | ----- | ----------- | ------ |");
  for (const r of reqs) {
    const rTasks = tasks.filter((t) => t.refs.includes(r.id)).map((t) => t.id);
    const rVals = vals.filter((v) => v.refs.includes(r.id));
    if (rTasks.length === 0) gaps.push(`${r.id}: sin TASK que lo implemente`);
    if (rVals.length === 0) gaps.push(`${r.id}: sin VAL que lo valide`);
    if (!r.hasCriteria) gaps.push(`${r.id}: sin acceptance criteria`);
    const valResult =
      rVals.length > 0 && rVals.every((v) => v.result === "PASS") ? "PASS" : "FAIL";
    console.log(
      `| ${r.id} | ${r.done}/${r.boxes} | ${rTasks.join(", ") || "-"} | ${rVals
        .map((v) => v.id)
        .join(", ") || "-"} | ${valResult} |`
    );
  }

  for (const t of tasks) {
    if (t.refs.length === 0) continue;
    const uncovered = t.refs.filter(
      (r) => !vals.some((v) => v.refs.includes(r))
    );
    if (uncovered.length) {
      gaps.push(`${t.id}: los REQ ${uncovered.join(", ")} no tienen VAL`);
    }
  }

  if (errors.length || gaps.length) {
    console.log("\n## Issues");
    for (const e of errors) console.log(`- [ERROR] ${e}`);
    for (const g of gaps) console.log(`- [GAP] ${g}`);
    process.exit(1);
  }
  console.log("\nSin issues de trazabilidad.");
  process.exit(0);
}

main();
