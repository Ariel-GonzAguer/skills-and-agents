#!/usr/bin/env node
/**
 * Mantener CHANGELOG.md a partir del historial de commits de git.
 *
 * Uso:
 *   node .opencode/scripts/changelog.js
 *
 * Si CHANGELOG.md no existe, lo crea con todos los commits.
 * Si existe, antepone los commits más nuevos que la última fecha registrada.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHANGELOG = path.resolve("CHANGELOG.md");

function gitLog(sinceDate) {
  const args = ["log", "--format=%ad|%s", "--date=short"];
  if (sinceDate) {
    args.push(`--after=${sinceDate}`);
  }
  const output = execSync(["git", ...args].join(" "), {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "ignore"],
  });
  const byDate = new Map();
  for (const line of output.trim().split("\n")) {
    const sep = line.indexOf("|");
    if (sep === -1) continue;
    const date = line.slice(0, sep).trim();
    const subject = line.slice(sep + 1).trim();
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push(subject);
  }
  return byDate;
}

function lastDateInChangelog() {
  if (!fs.existsSync(CHANGELOG)) return null;
  for (const line of fs.readFileSync(CHANGELOG, "utf8").split("\n")) {
    if (line.startsWith("## ")) {
      const candidate = line.slice(3).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

function renderSections(byDate) {
  const lines = [];
  const dates = Array.from(byDate.keys()).sort().reverse();
  for (const date of dates) {
    lines.push(`\n## ${date}\n`);
    for (const subject of byDate.get(date)) {
      lines.push(`- ${subject}\n`);
    }
  }
  return lines;
}

function main() {
  if (!fs.existsSync(CHANGELOG)) {
    const byDate = gitLog();
    if (byDate.size === 0) {
      console.log("No se encontraron commits — nada que escribir.");
      process.exit(0);
    }
    const content = ["# Changelog\n", ...renderSections(byDate)];
    fs.writeFileSync(CHANGELOG, content.join(""));
    const total = Array.from(byDate.values()).reduce((sum, list) => sum + list.length, 0);
    console.log(`Creado CHANGELOG.md con ${total} entradas en ${byDate.size} fecha(s).`);
    return;
  }

  const last = lastDateInChangelog();
  const byDate = gitLog(last);
  byDate.delete(last);

  if (byDate.size === 0) {
    console.log("No hay commits nuevos desde la última entrada — CHANGELOG.md está actualizado.");
    process.exit(0);
  }

  const existing = fs.readFileSync(CHANGELOG, "utf8");
  const lines = existing.split(/(?<=\n)/);
  let insertAt = 0;
  if (lines.length > 0 && lines[0].startsWith("# ")) {
    insertAt = 1;
  }
  const updated = [
    ...lines.slice(0, insertAt),
    ...renderSections(byDate),
    ...lines.slice(insertAt),
  ].join("");
  fs.writeFileSync(CHANGELOG, updated);
  const total = Array.from(byDate.values()).reduce((sum, list) => sum + list.length, 0);
  console.log(`Agregadas ${total} entradas nuevas a CHANGELOG.md.`);
}

main();
