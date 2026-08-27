---
name: waku-netlify-firebase-deploy
description: Despliega proyectos Waku en Netlify con Firebase Admin SDK. Usar al desplegar Waku en Netlify, configurar netlify-functions/serve.js, configurar netlify.toml para Waku, corregir problemas de empaquetado de firebase-admin, o migrar proyectos Waku de Vercel a Netlify. Cubre el wrapper serve.js, estructura de waku.config.ts, edge functions de nonce CSP y compatibilidad de versiones de firebase-admin.
---

# Desplegar Waku en Netlify con Firebase Admin SDK

Desplegar un proyecto Waku en Netlify con soporte SSR y Firebase Admin SDK.

## Prerrequisitos

- `firebase-admin@13.8.0` (14.x falla con el esbuild de Netlify)
- `jose` (opcional y menos preferido, para verificación de tokens sin auth de firebase-admin)
- Netlify CLI instalado y autenticado

## Archivos a crear

### 1. `netlify-functions/serve.js`

Envuelve el bundle del servidor de Waku como una Netlify Function:

```js
const { INTERNAL_runFetch } = await import("../dist/server/index.js");

export default async (request, context) =>
  INTERNAL_runFetch(process.env, request, { context });

export const config = {
  preferStatic: true,
  path: ['/', '/*', "/RSC/**/*"],
};
```

### 2. `netlify.toml`

```toml
[build]
  command = "pnpm build"
  publish = "dist/public"
  edge_functions = "netlify/edge-functions"

[build.environment]
  NODE_VERSION = "22"

[functions]
  directory = "netlify-functions"

[[edge_functions]]
  function = "csp-nonce"
  path = "/*"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

Puntos clave:
- `publish = "dist/public"` es el directorio de salida estática de Waku
- `functions.directory = "netlify-functions"` le dice a Netlify dónde vive el wrapper del servidor

### 3. Edge Function de CSP Nonce

`netlify/edge-functions/csp-nonce.ts`:

```ts
import type { Context } from '@netlify/edge-functions';

function generateNonce(): string {
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  return btoa(String.fromCharCode(...nonceBytes));
}

export default async (_request: Request, context: Context) => {
  const nonce = generateNonce();
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('text/html')) return response;

  const newHeaders = new Headers(response.headers);
  newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  const csp = [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}'`,
    `script-src-elem 'self' 'nonce-${nonce}' https://apis.google.com https://www.gstatic.com`,
    "script-src-attr 'none'",
    "connect-src 'self' https://firestore.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
  ].join('; ');

  newHeaders.set('Content-Security-Policy', csp);

  const html = await response.text();
  const withNonce = html
    .replace(/<script(?!\s+src=)([^>]*)>/gi, (match, attrs) =>
      attrs.includes('nonce=') ? match : `<script${attrs} nonce="${nonce}">`
    )
    .replace(/<style([^>]*)>/gi, (match, attrs) =>
      attrs.includes('nonce=') ? match : `<style${attrs} nonce="${nonce}">`
    );

  return new Response(withNonce, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};

export const config = { path: '/*' };
```

## Estructura de waku.config.ts

Existen dos patrones dependiendo de la versión de Waku. Ambos funcionan con Waku 1.0.0-beta.9:

**Patrón A — `vite.ssr.external` (actual, usado por proyectos en waku beta.9):**

```ts
import { defineConfig } from 'waku/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    ssr: {
      // firebase-admin es un paquete puro de Node.js, no debe ser empaquetado por Vite.
      // firebase (client SDK) DEBE ser empaquetado para que esté disponible en el bundle SSR.
      external: ['firebase-admin'],
    },
    plugins: [tailwindcss()],
    server: {
      port: 3000,
      headers: {
        // Requerido para que el popup de Firebase Auth se comunique con la ventana hija
        // en navegadores estrictos (COOP). Ver "Problemas conocidos".
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
  },
});
```

**Patrón B — `ssr` de nivel superior + `build` (anterior, estilo pasaporte.app):**

```ts
import { defineConfig } from 'waku/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  ssr: {
    external: ['firebase-admin'],
  },
  build: {
    rollupOptions: {
      external: ['firebase-admin'],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: { port: 3000 },
  },
});
```

Preferir el Patrón A para nuevos proyectos en beta.9: más simple y verificado en producción
(superkeg-web, boucardi-web, monthly-cat-friend).

Solo externalizar `firebase-admin`. NO externalizar subrutas (`firebase-admin/auth`, etc.).

## Importaciones de Firebase Admin

Siempre usar importaciones de namespace. Nunca usar importaciones de subruta o importaciones por defecto:

```ts
// Correcto
import * as admin from 'firebase-admin';
admin.initializeApp({ credential: admin.credential.cert(...) });
admin.firestore.FieldValue.increment(-1);
admin.auth().verifyIdToken(token);

// Incorrecto
import admin from 'firebase-admin';           // importación por defecto falla
import { FieldValue } from 'firebase-admin/firestore';  // subruta causa error __dirname
```

## Inicialización lazy de Firebase Admin

Firebase Admin debe inicializarse de forma lazy para evitar `admin.apps is undefined` durante la fase SSG de Waku:

```ts
let dbInstance: admin.firestore.Firestore | null = null;

export function initializeFirebaseAdmin(): void {
  if (!admin?.apps) return;
  if (admin.apps.length > 0) return;
  // ... leer variables de entorno e inicializar
}

export function getFirestoreDb(): admin.firestore.Firestore {
  if (dbInstance) return dbInstance;
  dbInstance = admin.firestore();
  return dbInstance;
}
```

En rutas de API, llamar la inicialización en tiempo de request, no a nivel de módulo:

```ts
function ensureDb() {
  initializeFirebaseAdmin();
  return getFirestoreDb();
}

// Dentro del handler:
const empresaRef = ensureDb().collection('clientes').doc(empresa);
```

## Script de despliegue

`scripts/deploy-netlify.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

if [ -f ".env" ]; then
  echo "Cargando variables de entorno desde .env"
  set -o allexport
  source ".env"
  set +o allexport
fi

NETLIFY=1 pnpm run build

if [[ -z "${NETLIFY_SITE_ID:-}" ]]; then
  netlify deploy --prod
else
  netlify deploy --prod --site "$NETLIFY_SITE_ID"
fi
```

## Problemas conocidos

- **firebase-admin 13.8.0**: verificado actual en proyectos de producción. 14.x aún falla con el esbuild de Netlify.
- **Popup de Firebase Auth + COOP**: en desarrollo, Firebase Auth con popup falla silenciosamente en navegadores estrictos a menos que el servidor de desarrollo envíe `Cross-Origin-Opener-Policy: same-origin-allow-popups`. Agregarlo a `vite.server.headers` (ver Patrón A).
- **style-src con nonce**: CSP Nivel 3 ignora `unsafe-inline` cuando hay nonce presente. Usar `'unsafe-inline'` sin nonce para estilos si la app tiene estilos inline dinámicos desde JS.
- **Fase SSG**: Waku ejecuta código a nivel de módulo durante el build SSG. Todo uso de firebase-admin debe estar dentro de handlers de request, no a nivel superior del módulo.
- **Aplanamiento de CNAME**: Cloudflare soporta CNAME en apex vía aplanamiento. Usar `apex-loadbalancer.netlify.com` para apex, `superkeg.netlify.app` para www.
