#!/usr/bin/env node

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const allowedFrontmatter = new Set([
  'name',
  'description',
  'license',
  'compatibility',
  'metadata',
  'allowed-tools',
]);
const skillsWithoutStructuredEvals = new Set([
  path.normalize('skills/waku-netlify-firebase-deploy/SKILL.md'),
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else if (entry.name === 'SKILL.md') files.push(target);
  }
  return files;
}

function parseFrontmatter(text, relativePath) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') throw new Error(`${relativePath}: falta apertura de frontmatter`);
  const end = lines.indexOf('---', 1);
  if (end === -1) throw new Error(`${relativePath}: falta cierre de frontmatter`);
  const block = lines.slice(1, end);
  const keys = block
    .filter((line) => /^[-\w]+:/.test(line))
    .map((line) => line.slice(0, line.indexOf(':')));
  const nameLine = block.find((line) => line.startsWith('name:'));
  const versionLine = block.find((line) => /^\s{2}version:\s*/.test(line));
  return {
    keys,
    name: nameLine?.slice('name:'.length).trim(),
    version: versionLine?.replace(/^\s{2}version:\s*/, '').replace(/^['"]|['"]$/g, ''),
  };
}

async function exists(target) {
  try {
    return (await stat(target)).isFile();
  } catch {
    return false;
  }
}

const failures = [];
const warnings = [];
const skillFiles = await walk(root);
const readme = await readFile(path.join(root, 'README.md'), 'utf8');

for (const skillFile of skillFiles.sort()) {
  const relative = path.normalize(path.relative(root, skillFile));
  const text = await readFile(skillFile, 'utf8');
  let frontmatter;
  try {
    frontmatter = parseFrontmatter(text, relative);
  } catch (error) {
    failures.push(error.message);
    continue;
  }

  const unexpected = frontmatter.keys.filter((key) => !allowedFrontmatter.has(key));
  if (unexpected.length) failures.push(`${relative}: campos superiores no permitidos: ${unexpected.join(', ')}`);
  if (!frontmatter.name) failures.push(`${relative}: falta name`);
  if (!frontmatter.version || !/^\d+\.\d+\.\d+$/.test(frontmatter.version)) {
    failures.push(`${relative}: falta metadata.version SemVer`);
  }

  const skillDirectory = path.dirname(skillFile);
  const directoryName = path.basename(skillDirectory);
  if (frontmatter.name !== directoryName) {
    failures.push(`${relative}: name (${frontmatter.name}) no coincide con el directorio (${directoryName})`);
  }

  const manifestPath = path.join(skillDirectory, 'skill.json');
  if (await exists(manifestPath)) {
    try {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      if (manifest.name !== frontmatter.name) failures.push(`${relative}: name difiere de skill.json`);
      if (manifest.version !== frontmatter.version) failures.push(`${relative}: version difiere de skill.json`);
    } catch (error) {
      failures.push(`${path.relative(root, manifestPath)}: JSON inválido (${error.message})`);
    }
  }

  const packagedSddEval = frontmatter.name === 'sdd-agent-dl-workflow'
    ? path.join(root, 'agents', 'sdd-agent-dl', 'evals', 'run-evals.js')
    : null;
  const evalPath = path.join(skillDirectory, 'evals', 'evals.json');
  if (await exists(evalPath)) {
    try {
      const evaluation = JSON.parse(await readFile(evalPath, 'utf8'));
      if (evaluation.skill_name !== frontmatter.name) failures.push(`${relative}: skill_name de evals no coincide`);
      for (const item of evaluation.evals ?? []) {
        if (!Array.isArray(item.assertions) || item.assertions.length === 0) {
          failures.push(`${path.relative(root, evalPath)}: eval ${item.id ?? '?'} no contiene assertions`);
        }
      }
    } catch (error) {
      failures.push(`${path.relative(root, evalPath)}: JSON inválido (${error.message})`);
    }
  } else if (skillsWithoutStructuredEvals.has(relative)) {
    warnings.push(`${relative}: no tiene evals/evals.json`);
  } else if (!(packagedSddEval && await exists(packagedSddEval))) {
    failures.push(`${relative}: falta evals/evals.json`);
  }

  if (!readme.includes(`\`${frontmatter.name}\``)) failures.push(`${relative}: no está indexada en README.md`);

  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = match[1].split('#')[0];
    if (!href || href === 'path' || /^[a-z]+:/i.test(href) || href.includes('{') || href.startsWith('#')) continue;
    const target = path.resolve(skillDirectory, decodeURIComponent(href));
    if (!(await exists(target))) failures.push(`${relative}: enlace local roto ${href}`);
  }
}

for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const failure of failures) console.error(`FAIL  ${failure}`);
console.log(`${skillFiles.length} skills validadas; ${failures.length} errores; ${warnings.length} advertencias`);
process.exit(failures.length ? 1 : 0);
