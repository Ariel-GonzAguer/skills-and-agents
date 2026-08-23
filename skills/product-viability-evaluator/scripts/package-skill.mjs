#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.resolve(process.argv[2] ?? path.join(path.dirname(directory), "dist"));
const archivePath = path.join(outputDirectory, `${path.basename(directory)}.skill`);

/**
 * Escapes a string for use as a single-quoted PowerShell literal.
 * @param {string} value Raw string.
 * @returns {string} Escaped PowerShell literal content.
 * @example
 * escapePowerShellLiteral("Ariel's"); // "Ariel''s"
 */
function escapePowerShellLiteral(value) {
  return value.replaceAll("'", "''");
}

/**
 * Creates a portable .skill ZIP archive with the Skill directory at its root.
 * @returns {void}
 * @example
 * // node scripts/package-skill.mjs
 */
function packageSkill() {
  fs.mkdirSync(outputDirectory, { recursive: true });
  if (fs.existsSync(archivePath)) fs.rmSync(archivePath);

  const parent = path.dirname(directory);
  const folder = path.basename(directory);
  if (process.platform === "win32") {
    const temporaryArchive = `${archivePath}.zip`;
    if (fs.existsSync(temporaryArchive)) fs.rmSync(temporaryArchive);
    const command = [
      `$source = Join-Path '${escapePowerShellLiteral(parent)}' '${escapePowerShellLiteral(folder)}'`,
      `$destination = '${escapePowerShellLiteral(temporaryArchive)}'`,
      "Compress-Archive -LiteralPath $source -DestinationPath $destination -CompressionLevel Optimal"
    ].join("; ");
    const result = spawnSync("powershell.exe", ["-NoProfile", "-Command", command], { encoding: "utf8" });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || "Unable to create Skill archive.");
    fs.renameSync(temporaryArchive, archivePath);
  } else {
    try {
      execFileSync("zip", ["-qr", archivePath, folder, "-x", `${folder}/evals/*`], { cwd: parent, stdio: "inherit" });
    } catch {
      throw new Error("Unable to create archive: use PowerShell on Windows or install the zip command.");
    }
  }
  console.log(archivePath);
}

packageSkill();
