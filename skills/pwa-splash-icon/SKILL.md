---
name: pwa-splash-icon
description: >
  Genera un icono de splash screen para PWA con el tamaño correcto a partir del logo existente de la app.
  Agrega padding alrededor del icono para que no recorte por la máscara circular del navegador,
  establece un color de fondo personalizado y actualiza el manifiesto y el service worker.
  Usar cuando el usuario pida corregir un icono de PWA recortado, ajustar el tamaño del icono
  de pantalla de carga, cambiar el color de fondo del splash, generar un icono de splash para PWA,
  o mencione que el icono de la app aparece cortado en la pantalla de carga. Activa con frases como
  "splash screen", "pwa icon cropped", "icon cortado", "pantalla de carga", "loading screen icon",
  "fondo del splash".
---

# Generador de Icono Splash para PWA

Genera un icono de splash screen para PWA con el tamaño correcto, padding y color de fondo personalizado, luego actualiza el manifiesto y el service worker.

## Problema

Los navegadores generan automáticamente una splash screen nativa a partir del icono en `manifest.webmanifest`. Si el icono ocupa todo el canvas, la máscara circular del navegador (Android Chrome) recorta los bordes. Resultado: un logo cortado en la pantalla de carga.

## Solución

Crear un nuevo icono de 512x512 con el logo centrado al ~55% del canvas, rodeado de padding, sobre un color de fondo sólido que coincida con el `background_color` del manifiesto.

## Prerrequisitos

- Node.js instalado
- Un icono existente de la app (PNG recomendado, cualquier tamaño)
- `sharp` como dependencia de desarrollo (se instala temporalmente, se elimina después de la generación)

## Pasos de implementación

### Paso 1 — Recopilar datos de entrada

Antes de empezar, confirmar estos valores con el usuario:

| Parámetro | Ejemplo | Notas |
|---|---|---|
| Ruta del icono fuente | `public/imagenes/logo.png` | El icono existente de la app |
| Color de fondo | `emerald-200` / `#d7efe6` | Cualquier nombre de color Tailwind o hex |
| Proporción del icono | `0.55` | Qué porción del canvas de 512px ocupa el icono (0.4–0.6 típico) |
| Nombre del archivo de salida | `logo-splash.png` | Mantenerlo distinto del original |

Si el usuario no especifica una proporción, usar `0.55` (55%) por defecto. Esto da suficiente padding para máscaras circulares sin hacer el icono muy pequeño.

### Paso 2 — Instalar sharp temporalmente

```bash
pnpm add -D sharp
```

### Paso 3 — Crear y ejecutar el script de redimensión

Crear un script temporal `scripts/resize-splash.cjs`:

```javascript
const sharp = require('sharp');
const path = require('path');

// ── Configurar estos valores ──────────────────────────────────────────
const SRC = path.join(__dirname, '..', 'public', 'imagenes', 'logo.png');
const DEST = path.join(__dirname, '..', 'public', 'imagenes', 'logo-splash.png');
const BG = { r: 0xd7, g: 0xef, b: 0xe6 }; // emerald-200 = #d7efe6
const CANVAS = 512;
const ICON_RATIO = 0.55;
// ────────────────────────────────────────────────────────────────────

const iconSize = Math.round(CANVAS * ICON_RATIO);

(async () => {
  try {
    const resized = await sharp(SRC)
      .resize(iconSize, iconSize, {
        fit: 'contain',
        background: [BG.r, BG.g, BG.b, 255],
      })
      .toBuffer();

    const offset = Math.round((CANVAS - iconSize) / 2);

    await sharp({
      create: {
        width: CANVAS,
        height: CANVAS,
        channels: 4,
        background: { ...BG, alpha: 1 },
      },
    })
      .composite([{ input: resized, left: offset, top: offset }])
      .png()
      .toFile(DEST);

    console.log(`Created: ${DEST}`);
    console.log(`Canvas: ${CANVAS}x${CANVAS} | Icon: ${iconSize}x${iconSize} | Offset: ${offset}px`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
```

Ejecutarlo:

```bash
node scripts/resize-splash.cjs
```

Verificar la salida visualmente — el icono debería estar centrado con padding generoso en todos los lados.

### Paso 4 — Actualizar `manifest.webmanifest`

Cambiar `background_color` y apuntar los iconos a la nueva imagen de splash:

```json
{
  "background_color": "#d7efe6",
  "icons": [
    {
      "src": "/imagenes/logo-splash.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/imagenes/logo-splash.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

Mantener el icono original para favicon, logo de la barra lateral y otros usos dentro de la app — solo los iconos del manifiesto deben apuntar a la versión splash.

### Paso 5 — Actualizar la caché del service worker

Si el proyecto tiene un service worker con una lista de assets pre-cacheados, agregar el nuevo icono de splash:

```javascript
const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/imagenes/logo.png',
  '/imagenes/logo-splash.png'  // ← agregar esto
];
```

### Paso 6 — Limpieza

Eliminar el script temporal y sharp:

```bash
del scripts\resize-splash.cjs    # Windows
rm scripts/resize-splash.cjs     # macOS/Linux
pnpm remove sharp
```

## Puntos de personalización

| Qué | Cómo |
|---|---|
| Proporción del icono | Cambiar `ICON_RATIO` (0.4 = más padding, 0.6 = menos padding) |
| Tamaño del canvas | Cambiar `CANVAS` (512 es estándar para Android, usar 1024 para iOS) |
| Color de fondo | Cambiar los valores RGB de `BG` para coincidir con cualquier color Tailwind o hex |
| Formato de salida | Cambiar `.png()` a `.webp()` o `.jpeg()` para menor tamaño de archivo |

## Referencia de colores Tailwind comunes

| Nombre | Hex | RGB |
|---|---|---|
| emerald-50 | `#ecfdf5` | 236, 253, 245 |
| emerald-100 | `#d1fae5` | 209, 250, 229 |
| emerald-200 | `#d7efe6` | 215, 239, 230 |
| slate-100 | `#f1f5f9` | 241, 245, 249 |
| gray-100 | `#f3f4f6` | 243, 244, 246 |
| white | `#ffffff` | 255, 255, 255 |

## Lista de verificación

Después de aplicar esta skill:

- [ ] El nuevo icono de splash existe en `public/imagenes/` (512x512, centrado, con padding)
- [ ] El `background_color` del `manifest.webmanifest` coincide con el fondo del icono
- [ ] Los iconos del `manifest.webmanifest` apuntan a la nueva imagen de splash
- [ ] La caché del service worker incluye el nuevo icono de splash (si aplica)
- [ ] El icono original se sigue usando para favicon, barra lateral y referencias dentro de la app
- [ ] El script temporal y la dependencia `sharp` fueron eliminados
- [ ] Se reconstruye el proyecto para propagar los cambios a `dist/`

## Suposiciones

- El proyecto usa una configuración PWA estándar con `manifest.webmanifest` en `public/`.
- El service worker está en `public/sw.js` o similar.
- Node.js está disponible en el entorno.
- El proyecto usa pnpm (adaptar comandos para npm/yarn si es necesario).
