#!/usr/bin/env node
/**
 * Mantener CHANGELOG.md desde el historial de git sin perder commits del
 * mismo día. El cursor es un SHA, no una fecha.
 *
 * Uso:
 *   node .opencode/scripts/changelog.js [--base <ref>]
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHANGELOG = path.resolve("CHANGELOG.md");
const MARKER_RE = /<!--\s*sdd-changelog:last-commit=([0-9a-fA-F]+)\s*-->/;

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "inherit"],
  }).trim();
}

function parseArgs(args) {
  if (args.length === 0) return { base: null };
  if (args.length === 2 && args[0] === "--base" && args[1]) {
    return { base: args[1] };
  }
  console.error("Uso: node .opencode/scripts/changelog.js [--base <ref>]");
  process.exit(1);
}

function resolveRef(ref) {
  if (!ref) return null;
  try {
    return git(["rev-parse", "--verify", ref]);
  } catch {
    console.error(`No se pudo resolver la referencia base: ${ref}`);
    process.exit(1);
  }
}

function readMarker(content) {
  const match = content.match(MARKER_RE);
  return match ? match[1] : null;
}

function gitLog(from) {
  const args = ["log", "--format=%H%x1f%ad%x1f%s", "--date=short"];
  if (from) args.push(`${from}..HEAD`);
  const output = git(args);
  if (!output) return [];
  return output.split("\n").flatMap((line) => {
    const [sha, date, subject] = line.split("\x1f");
    return sha && date && subject ? [{ sha, date, subject }] : [];
  });
}

function renderSections(commits) {
  const byDate = new Map();
  for (const commit of commits) {
    if (!byDate.has(commit.date)) byDate.set(commit.date, []);
    byDate.get(commit.date).push(commit.subject);
  }
  const lines = [];
  for (const [date, subjects] of byDate) {
    lines.push(`\n## ${date}\n`);
    for (const subject of subjects) lines.push(`- ${subject}\n`);
  }
  return lines.join("");
}

function setMarker(content, sha) {
  const marker = `<!-- sdd-changelog:last-commit=${sha} -->`;
  if (MARKER_RE.test(content)) return content.replace(MARKER_RE, marker);
  const newline = content.startsWith("# ") ? content.indexOf("\n") + 1 : 0;
  return `${content.slice(0, newline)}\n${marker}\n${content.slice(newline)}`;
}

function main() {
  const { base } = parseArgs(process.argv.slice(2));
  const existing = fs.existsSync(CHANGELOG)
    ? fs.readFileSync(CHANGELOG, "utf8")
    : "";
  const marker = readMarker(existing);
  const start = marker || resolveRef(base);

  if (existing && !marker && !base) {
    console.error(
      "CHANGELOG.md no tiene marcador SHA. Ejecutá de nuevo con --base <ref> para establecer un cursor seguro."
    );
    process.exit(1);
  }

  const commits = gitLog(start);
  if (commits.length === 0) {
    console.log("No hay commits nuevos — CHANGELOG.md está actualizado.");
    return;
  }

  const latestSha = commits[0].sha;
  if (!existing) {
    fs.writeFileSync(
      CHANGELOG,
      setMarker(`# Changelog\n${renderSections(commits)}`, latestSha)
    );
  } else {
    const withMarker = setMarker(existing, latestSha);
    const markerEnd = withMarker.indexOf("\n", withMarker.indexOf("-->")) + 1;
    const updated = `${withMarker.slice(0, markerEnd)}${renderSections(commits)}${withMarker.slice(markerEnd)}`;
    fs.writeFileSync(CHANGELOG, updated);
  }

  console.log(`Agregadas ${commits.length} entradas nuevas a CHANGELOG.md.`);
}

main();
