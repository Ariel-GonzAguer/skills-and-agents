#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const ignoredDirectories = new Set([
  ".git",
  ".netlify",
  ".waku",
  "coverage",
  "dist",
  "node_modules",
]);

const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".toml"]);
const root = resolve(process.argv[2] ?? process.cwd());
const findings = [];

/**
 * Adds one redacted audit finding.
 * @param {string} severity Finding severity.
 * @param {string} code Stable finding code.
 * @param {string} file Relative file path.
 * @param {number | null} line One-based line number.
 * @param {string} message Safe message that contains no secret value.
 * @returns {void}
 * @example
 * addFinding("HIGH", "PUBLIC_DEPLOY_KEY", ".env", 1, "A deploy key uses a public prefix.");
 */
function addFinding(severity, code, file, line, message) {
  findings.push({ severity, code, file, line, message });
}

/**
 * Returns a file extension including its leading dot.
 * @param {string} file File path.
 * @returns {string} Lowercase extension.
 * @example
 * extensionOf("convex/schema.ts"); // ".ts"
 */
function extensionOf(file) {
  const match = /(?:^|\/|\\)[^/\\]+(\.[^.\/\\]+)$/.exec(file);
  return match?.[1]?.toLowerCase() ?? "";
}

/**
 * Recursively lists relevant source and configuration files.
 * @param {string} directory Directory to scan.
 * @returns {string[]} Absolute file paths.
 * @example
 * listFiles(process.cwd());
 */
function listFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(path));
      continue;
    }
    if (entry.isFile() && (sourceExtensions.has(extensionOf(path)) || entry.name.startsWith(".env"))) {
      files.push(path);
    }
  }
  return files;
}

/**
 * Reads UTF-8 text while refusing unusually large files.
 * @param {string} file Absolute path.
 * @returns {string | null} File text or null when skipped.
 * @example
 * readText("C:/project/package.json");
 */
function readText(file) {
  if (statSync(file).size > 1_000_000) return null;
  return readFileSync(file, "utf8");
}

/**
 * Reports matching lines without including matched secret values.
 * @param {string} file Relative file path.
 * @param {string} text File contents.
 * @param {RegExp} pattern Pattern tested against each line.
 * @param {string} severity Finding severity.
 * @param {string} code Stable finding code.
 * @param {string} message Safe finding message.
 * @returns {void}
 * @example
 * findLines(".env", "TOKEN=x", /^TOKEN=/, "HIGH", "SECRET_FILE", "Potential secret file.");
 */
function findLines(file, text, pattern, severity, code, message) {
  text.split(/\r?\n/).forEach((lineText, index) => {
    pattern.lastIndex = 0;
    if (pattern.test(lineText)) addFinding(severity, code, file, index + 1, message);
  });
}

if (!existsSync(root) || !statSync(root).isDirectory()) {
  console.error(`Project directory does not exist: ${root}`);
  process.exit(2);
}

const requiredPaths = ["package.json", "netlify.toml"];
for (const path of requiredPaths) {
  if (!existsSync(join(root, path))) {
    addFinding("MEDIUM", "MISSING_FILE", path, null, `Expected project file is missing: ${path}.`);
  }
}

if (!existsSync(join(root, "convex", "schema.ts"))) {
  addFinding("HIGH", "MISSING_CONVEX_SCHEMA", "convex/schema.ts", null, "Production Convex schema is missing.");
}

if (!existsSync(join(root, "convex", "_generated", "api.d.ts")) && !existsSync(join(root, "convex", "_generated", "api.js"))) {
  addFinding("MEDIUM", "MISSING_GENERATED_API", "convex/_generated", null, "Convex generated API was not found.");
}

for (const absoluteFile of listFiles(root)) {
  const file = relative(root, absoluteFile).replaceAll("\\", "/");
  const text = readText(absoluteFile);
  if (text === null) continue;

  if (basename(file).startsWith(".env")) {
    addFinding("HIGH", "ENV_FILE_PRESENT", file, null, "Environment file exists; verify it is ignored and never tracked. Values were not read or reported.");
    findLines(file, text, /^(?:WAKU_PUBLIC_|VITE_|NEXT_PUBLIC_).*?(?:SECRET|TOKEN|KEY|PASSWORD)\s*=/i, "CRITICAL", "PUBLIC_SECRET_NAME", "A secret-like variable name uses a client-public prefix.");
  }

  findLines(file, text, /schemaValidation\s*:\s*false/, "HIGH", "SCHEMA_VALIDATION_DISABLED", "Convex runtime schema validation appears disabled.");
  findLines(file, text, /Access-Control-Allow-Origin["']?\s*[:=]\s*["']\*["']/, "HIGH", "WILDCARD_CORS", "Wildcard CORS origin requires manual security review.");
  findLines(file, text, /script-src[^\n]*['"]unsafe-inline['"]/, "HIGH", "UNSAFE_INLINE_SCRIPT", "CSP appears to allow inline scripts without relying only on a nonce or hash.");
  findLines(file, text, /connect-src[^\n]*(?:\s\*\s|https:\s)/, "MEDIUM", "BROAD_CONNECT_SRC", "CSP connect-src may be broader than required.");

  if (file.startsWith("convex/") && !file.includes("/_generated/")) {
    findLines(file, text, /\b(?:query|mutation|action)\s*\(\s*(?:async\s*)?\(/, "MEDIUM", "LEGACY_FUNCTION_SYNTAX", "Convex function may use syntax that hides explicit args/returns validators; inspect manually.");
    findLines(file, text, /\.collect\s*\(\s*\)/, "MEDIUM", "UNBOUNDED_COLLECT", "Convex query collects all matching documents; prove a bound or paginate.");
  }
}

const netlifyPath = join(root, "netlify.toml");
if (existsSync(netlifyPath)) {
  const text = readText(netlifyPath) ?? "";
  if (!/publish\s*=\s*["']dist\/public["']/.test(text)) {
    addFinding("HIGH", "WRONG_PUBLISH_DIR", "netlify.toml", null, "Netlify publish directory is not explicitly dist/public.");
  }
  if (/CONVEX_DEPLOY_KEY\s*=/.test(text)) {
    addFinding("CRITICAL", "DEPLOY_KEY_IN_TOML", "netlify.toml", null, "CONVEX_DEPLOY_KEY must not be stored in netlify.toml.");
  }
}

const severityRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
findings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0));

console.log(JSON.stringify({ root, scannedAt: new Date().toISOString(), findings }, null, 2));
process.exit(findings.some((finding) => finding.severity === "CRITICAL" || finding.severity === "HIGH") ? 1 : 0);
