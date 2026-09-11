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
metadata:
  author: Ariel GonzAgüer
  version: "1.1.0"
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
- `sharp` disponible como dependencia de desarrollo del proyecto durante la generación

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

### Paso 2 — Preparar `sharp`

```bash
pnpm add -D sharp
```

Si el proyecto ya incluye `sharp`, no volver a instalarlo. No eliminar una dependencia que existía antes de ejecutar esta skill.

### Paso 3 — Ejecutar el generador incluido

La skill incluye `scripts/resize-splash.cjs`. Ejecutarlo desde la raíz del proyecto con cuatro argumentos: origen, destino, fondo y proporción.

```bash
node <ruta-de-la-skill>/scripts/resize-splash.cjs \
  public/imagenes/logo.png \
  public/imagenes/logo-maskable.png \
  '#d7efe6' \
  0.55
```

El script resuelve `sharp` desde el proyecto actual, valida todos los argumentos y crea un PNG de 512x512. Verificar la salida visualmente: el icono debe estar centrado y conservar completa su silueta dentro de la zona segura central.

### Paso 4 — Actualizar `manifest.webmanifest`

Cambiar `background_color` y declarar por separado el icono adaptable (`maskable`) y el icono convencional (`any`). No etiquetar un mismo archivo como ambos propósitos salvo que haya sido diseñado y verificado para los dos:

```json
{
  "background_color": "#d7efe6",
  "icons": [
    {
      "src": "/imagenes/logo.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/imagenes/logo-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

Mantener el icono original para favicon, logo de la barra lateral y otros usos dentro de la app. La variante con padding es específicamente el icono `maskable`.

### Paso 5 — Actualizar la caché del service worker

Si el proyecto tiene un service worker con una lista de assets pre-cacheados, agregar el nuevo icono de splash:

```javascript
const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/imagenes/logo.png',
  '/imagenes/logo-maskable.png'  // ← agregar esto
];
```

### Paso 6 — Limpieza

Si `sharp` se instaló exclusivamente para esta ejecución, se puede retirar con `pnpm remove sharp`. No hay que copiar ni eliminar el script incluido en la skill.

## Puntos de personalización

| Qué | Cómo |
|---|---|
| Proporción del icono | Cambiar `ICON_RATIO` (0.4 = más padding, 0.6 = menos padding) |
| Tamaño del canvas | El generador produce 512x512; para otros tamaños, crear archivos adicionales y declararlos con su tamaño real |
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
- [ ] El manifiesto usa archivos separados para `purpose: "any"` y `purpose: "maskable"`
- [ ] La variante `maskable` conserva el contenido importante dentro de la zona segura central
- [ ] La caché del service worker incluye el nuevo icono de splash (si aplica)
- [ ] El icono original se sigue usando para favicon, barra lateral y referencias dentro de la app
- [ ] Si `sharp` se instaló temporalmente, fue retirado; si ya era dependencia, se conservó
- [ ] Se reconstruye el proyecto para propagar los cambios a `dist/`

## Suposiciones

- El proyecto usa una configuración PWA estándar con `manifest.webmanifest` en `public/`.
- El service worker está en `public/sw.js` o similar.
- Node.js está disponible en el entorno.
- El proyecto usa pnpm (adaptar comandos para npm/yarn si es necesario).
