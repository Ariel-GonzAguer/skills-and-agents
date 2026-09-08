#!/usr/bin/env node
/**
 * Detectar el estado del flujo SDD de forma determinista y mostrarlo.
 *
 * Uso: node .opencode/scripts/status.js
 * Exit codes: 0 ok, 1 inconsistencia detectada (state.md ausente, estado
 * desconocido, branch divergente).
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const CONSTITUTION = [
  "specs/constitution/mission.md",
  "specs/constitution/tech-stack.md",
  "specs/constitution/roadmap.md",
];

const VALID_STATES = [
  "specifying",
  "approved",
  "implementing",
  "implemented",
  "validating",
  "validated",
  "merged",
];

function exists(p) {
  return fs.existsSync(p);
}

function read(p) {
  return exists(p) ? fs.readFileSync(p, "utf8") : "";
}

function git(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function parseFrontmatter(content) {
  const out = {
    state: null,
    feature: null,
    branch: null,
    base: null,
    updated: null,
    blockers: [],
  };
  const lines = content.split(/\r?\n/);
  if (lines[0] !== "---") return out;
  let inBlockers = false;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === "---") break;
    const m = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (m) {
      const key = m[1].toLowerCase();
      const val = m[2].trim();
      if (key === "blockers") {
        inBlockers = val === "" || val === "[]" || val === "null";
        if (val && val !== "[]" && val !== "null") {
          out.blockers.push(val.replace(/^\[\s*/, "").replace(/\s*\]$/, ""));
        }
      } else if (key === "state") {
        out.state = val;
      } else if (key === "feature") {
        out.feature = val;
      } else if (key === "branch") {
        out.branch = val;
      } else if (key === "base") {
        out.base = val;
      } else if (key === "updated") {
        out.updated = val;
      }
    } else if (inBlockers && /^-\s*\S/.test(line)) {
      out.blockers.push(line.trim().replace(/^-\s*/, ""));
    }
  }
  return out;
}

function listFeatureDirs() {
  if (!exists("specs")) return [];
  return fs
    .readdirSync("specs", { withFileTypes: true })
    .filter(
      (d) => d.isDirectory() && /^\d{4}-\d{2}-\d{2}-/.test(d.name)
    )
    .map((d) => d.name)
    .sort()
    .reverse();
}

function counts(featureDir) {
  const req = read(path.join(featureDir, "requirements.md"));
  const plan = read(path.join(featureDir, "plan.md"));
  const val = read(path.join(featureDir, "validation.md"));
  return {
    reqs: (req.match(/^### (REQ-\d+)/gm) || []).length,
    totalTasks: (plan.match(/^- \[[ x]\] /gm) || []).length,
    doneTasks: (plan.match(/^- \[x\] /gm) || []).length,
    totalVals: (val.match(/^- \[[ x]\] /gm) || []).length,
    doneVals: (val.match(/^- \[x\] /gm) || []).length,
    blocking: (req.match(/^[-*] .*BLOCKING.*$/gm) || []).filter(
      (l) => !/resuelto|resolved/i.test(l)
    ).length,
  };
}

function main() {
  const inconsistencies = [];
  const hasConstitution = CONSTITUTION.every(exists);
  const currentBranch = git(["branch", "--show-current"]);
  const features = listFeatureDirs();

  console.log("SDD STATUS");

  if (!hasConstitution) {
    console.log("Project state: no-constitution");
    console.log("Feature: -");
    console.log("Next action: Crear la constitución (/sdd-dl-constitution).");
    console.log("Human approval required: Sí (entrevista de constitución).");
    process.exit(0);
  }

  console.log("Project state: constituted");

  let active = null;
  let meta = null;
  for (const dir of features) {
    const fm = parseFrontmatter(read(path.join("specs", dir, "state.md")));
    if (fm.state && fm.state !== "merged") {
      active = dir;
      meta = fm;
      break;
    }
  }
  if (!active && features.length > 0) {
    active = features[0];
    meta = parseFrontmatter(read(path.join("specs", active, "state.md")));
  }

  if (!active) {
    console.log("Feature: -");
    console.log("State: -");
    console.log(
      "Next action: Buscar la siguiente fase incompleta del roadmap y crear feature spec (/sdd-dl-feature-spec)."
    );
    console.log("Human approval required: No.");
    process.exit(0);
  }

  const { reqs, totalTasks, doneTasks, totalVals, doneVals, blocking } =
    counts(path.join("specs", active));

  let state = meta.state;
  if (!state) {
    state =
      totalVals > 0 && doneVals === totalVals
        ? "validated"
        : totalTasks > 0 && doneTasks === totalTasks
          ? "implemented"
          : doneTasks > 0
            ? "implementing"
            : "specifying";
    inconsistencies.push(
      `state.md ausente en specs/${active} — estado derivado de los artefactos: ${state}`
    );
  }
  if (!VALID_STATES.includes(state)) {
    inconsistencies.push(`estado desconocido en state.md: ${state}`);
  }
  if (meta.branch && currentBranch && meta.branch !== currentBranch) {
    inconsistencies.push(
      `state.md registra branch ${meta.branch} pero la rama actual es ${currentBranch}`
    );
  }

  const blockers = meta.blockers.filter(Boolean);
  const totalBlocking = blockers.length + blocking;

  console.log(`Feature: ${active}`);
  console.log(`State: ${state}${blockers.length ? " (blocked)" : ""}`);
  console.log(`Requirements: ${reqs}`);
  console.log(`Implemented: ${doneTasks}/${totalTasks} tareas de plan`);
  console.log(`Validated: ${doneVals}/${totalVals} checks`);
  console.log(
    `Blocking issues: ${totalBlocking}${
      blockers.length
        ? ` — ${blockers.join("; ")}`
        : blocking
          ? " — BLOCKING sin resolver en Clarifications"
          : ""
    }`
  );
  console.log(`Branch: ${currentBranch || "-"}`);

  const nextAction = {
    specifying: "Completar clarification gate y pedir aprobación humana.",
    approved: "Implementar el plan (/sdd-dl-implement).",
    implementing: "Continuar implementación de los TASK pendientes.",
    implemented: "Ejecutar validación independiente (/sdd-dl-validate).",
    validating: "Completar la validación independiente.",
    validated: "Actualizar changelog y mergear (/sdd-dl-merge).",
    merged: "Iniciar la siguiente fase del roadmap o detenerse.",
  }[state];
  console.log(`Next action: ${nextAction || "Resolver las inconsistencias reportadas."}`);

  const approval =
    blockers.length > 0
      ? "Sí (resolver blockers)"
      : state === "specifying"
        ? "Sí (aprobar la spec)"
        : state === "validated"
          ? "Sí (mergear)"
          : "No.";
  console.log(`Human approval required: ${approval}`);

  if (inconsistencies.length) {
    console.log("\nInconsistencias:");
    for (const item of inconsistencies) console.log(`- ${item}`);
    process.exit(1);
  }
  process.exit(0);
}

main();
