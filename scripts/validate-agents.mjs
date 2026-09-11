#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const agentRoots = [
  path.join(root, 'agents'),
  path.join(root, 'agents', 'sdd-agent-dl', '.opencode', 'agents'),
];
const allowedKeys = new Set(['description', 'version', 'mode', 'model', 'temperature', 'color', 'permission', 'tools']);
const allowedModes = new Set(['all', 'primary', 'subagent']);
const readOnlyAgents = new Set([
  'architecture-reviewer',
  'chatbot-security-reviewer',
  'code-reviewer',
  'firestore-auditor',
  'netlify-costs',
  'viability-commercial-analyst',
  'viability-financial-analyst',
  'viability-product-analyst',
  'viability-researcher',
  'viability-skeptic',
  'viability-synthesizer',
  'waku-deploy-auditor',
  'sdd-dl-validator',
]);

function parseFrontmatter(text, relative) {
  const lines = text.split(/\r?\n/);
  if (lines[0].replace(/^\uFEFF/, '') !== '---') throw new Error(`${relative}: falta frontmatter`);
  const end = lines.indexOf('---', 1);
  if (end === -1) throw new Error(`${relative}: falta cierre de frontmatter`);
  const block = lines.slice(1, end);
  const topLevel = block.filter((line) => /^[a-zA-Z][\w-]*:/.test(line));
  const values = Object.fromEntries(topLevel.map((line) => {
    const separator = line.indexOf(':');
    return [line.slice(0, separator), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')];
  }));
  return { block, keys: Object.keys(values), values };
}

async function collectAgents() {
  const files = [];
  const topEntries = await readdir(agentRoots[0], { withFileTypes: true });
  for (const entry of topEntries) {
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(path.join(agentRoots[0], entry.name));
  }
  const nestedEntries = await readdir(agentRoots[1], { withFileTypes: true });
  for (const entry of nestedEntries) {
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(path.join(agentRoots[1], entry.name));
  }
  return files;
}

const failures = [];
const warnings = [];
const files = await collectAgents();
const evalDocument = JSON.parse(await readFile(path.join(root, 'agents', 'evals', 'evals.json'), 'utf8'));
const evalNames = new Set();

for (const item of evalDocument.evals ?? []) {
  if (!item.agent || evalNames.has(item.agent)) failures.push(`agents/evals/evals.json: agent duplicado o ausente (${item.agent ?? '?'})`);
  evalNames.add(item.agent);
  if (!item.prompt || !Array.isArray(item.assertions) || item.assertions.length < 2) {
    failures.push(`agents/evals/evals.json: eval incompleta para ${item.agent ?? '?'}`);
  }
}

for (const file of files.sort()) {
  const relative = path.normalize(path.relative(root, file));
  const name = path.basename(file, '.md');
  const text = await readFile(file, 'utf8');
  let frontmatter;
  try {
    frontmatter = parseFrontmatter(text, relative);
  } catch (error) {
    failures.push(error.message);
    continue;
  }

  const unexpected = frontmatter.keys.filter((key) => !allowedKeys.has(key));
  if (unexpected.length) failures.push(`${relative}: campos desconocidos ${unexpected.join(', ')}`);
  if (!frontmatter.values.description) failures.push(`${relative}: falta description`);
  if (!/^\d+\.\d+\.\d+$/.test(frontmatter.values.version ?? '')) failures.push(`${relative}: version no es SemVer`);
  if (!allowedModes.has(frontmatter.values.mode)) failures.push(`${relative}: mode ausente o inválido`);
  if ('model' in frontmatter.values) failures.push(`${relative}: model hardcodeado; debe heredar la sesión`);
  if (!frontmatter.block.includes('permission:')) failures.push(`${relative}: falta contrato permission`);
  if (readOnlyAgents.has(name) && !frontmatter.block.some((line) => /^\s{2}edit:\s*deny\s*$/.test(line))) {
    failures.push(`${relative}: agente read-only sin edit: deny`);
  }
  if (readOnlyAgents.has(name) && !frontmatter.block.some((line) => /^\s{2}["']?\*["']?:\s*deny\s*$/.test(line))) {
    failures.push(`${relative}: agente read-only sin default deny`);
  }
  if (!evalNames.has(name)) failures.push(`${relative}: falta eval conductual`);
  if (/Authorization:\s*Bearer\s+\$TOKEN|pegar el token/i.test(text)) failures.push(`${relative}: patrón inseguro de credencial`);
}

for (const evalName of evalNames) {
  if (!files.some((file) => path.basename(file, '.md') === evalName)) warnings.push(`eval sin agente: ${evalName}`);
}

for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const failure of failures) console.error(`FAIL  ${failure}`);
console.log(`${files.length} agentes validados; ${evalNames.size} evals; ${failures.length} errores; ${warnings.length} advertencias`);
process.exit(failures.length ? 1 : 0);
