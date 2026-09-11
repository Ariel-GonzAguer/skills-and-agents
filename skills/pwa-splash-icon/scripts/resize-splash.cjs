#!/usr/bin/env node

const path = require('node:path');
const { createRequire } = require('node:module');

const [sourceArg, destinationArg, backgroundArg = '#ffffff', ratioArg = '0.55'] = process.argv.slice(2);
const ratio = Number(ratioArg);

if (!sourceArg || !destinationArg) {
  console.error('Uso: node resize-splash.cjs <origen> <destino> [#rrggbb] [proporción]');
  process.exit(1);
}

if (!/^#[0-9a-f]{6}$/i.test(backgroundArg)) {
  console.error('El fondo debe ser un color hexadecimal con formato #rrggbb.');
  process.exit(1);
}

if (!Number.isFinite(ratio) || ratio < 0.4 || ratio > 0.6) {
  console.error('La proporción debe ser un número entre 0.4 y 0.6.');
  process.exit(1);
}

const projectRequire = createRequire(path.join(process.cwd(), 'package.json'));
let sharp;

try {
  sharp = projectRequire('sharp');
} catch {
  console.error('No se encontró sharp en el proyecto actual. Instálelo con: pnpm add -D sharp');
  process.exit(1);
}

const source = path.resolve(sourceArg);
const destination = path.resolve(destinationArg);
const canvas = 512;
const iconSize = Math.round(canvas * ratio);
const offset = Math.round((canvas - iconSize) / 2);

async function main() {
  const resized = await sharp(source)
    .resize(iconSize, iconSize, { fit: 'contain', background: backgroundArg })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: backgroundArg,
    },
  })
    .composite([{ input: resized, left: offset, top: offset }])
    .png()
    .toFile(destination);

  console.log(JSON.stringify({ destination, canvas, iconSize, offset }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
