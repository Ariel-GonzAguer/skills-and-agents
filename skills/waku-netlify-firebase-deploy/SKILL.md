---
name: waku-netlify-firebase-deploy
description: Deploy Waku projects to Netlify with Firebase Admin SDK. Use when deploying Waku to Netlify, setting up netlify-functions/serve.js, configuring netlify.toml for Waku, fixing firebase-admin bundling issues, or migrating Waku projects from Vercel to Netlify. Covers serve.js wrapper, waku.config.ts structure, CSP nonce edge functions, and firebase-admin version compatibility.
---

# Deploy Waku to Netlify with Firebase Admin SDK

Deploy a Waku project to Netlify with SSR support and Firebase Admin SDK.

## Prerequisites

- `firebase-admin@13.8.0` (14.x breaks with Netlify esbuild)
- `jose` (optional and least preferred, for token verification without firebase-admin auth)
- Netlify CLI installed and authenticated

## Files to create

### 1. `netlify-functions/serve.js`

Wraps Waku's server bundle as a Netlify Function:

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

Key points:
- `publish = "dist/public"` is the Waku static output directory
- `functions.directory = "netlify-functions"` tells Netlify where the server wrapper lives

### 3. CSP Nonce Edge Function

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

## waku.config.ts structure

Put `ssr` and `build` at the **top level** of `defineConfig`, NOT inside `vite`:

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

Only externalize `firebase-admin`. Do NOT externalize subpaths (`firebase-admin/auth`, etc.).

## Firebase Admin imports

Always use namespace imports. Never use subpath imports or default imports:

```ts
// Correct
import * as admin from 'firebase-admin';
admin.initializeApp({ credential: admin.credential.cert(...) });
admin.firestore.FieldValue.increment(-1);
admin.auth().verifyIdToken(token);

// Incorrect
import admin from 'firebase-admin';           // default import fails
import { FieldValue } from 'firebase-admin/firestore';  // subpath causes __dirname error
```

## Lazy Firebase Admin initialization

Firebase Admin must be initialized lazily to avoid `admin.apps is undefined` during Waku's SSG phase:

```ts
let dbInstance: admin.firestore.Firestore | null = null;

export function initializeFirebaseAdmin(): void {
  if (!admin?.apps) return;
  if (admin.apps.length > 0) return;
  // ... read env vars and initialize
}

export function getFirestoreDb(): admin.firestore.Firestore {
  if (dbInstance) return dbInstance;
  dbInstance = admin.firestore();
  return dbInstance;
}
```

In API routes, call initialization at request time, not module level:

```ts
function ensureDb() {
  initializeFirebaseAdmin();
  return getFirestoreDb();
}

// Inside handler:
const empresaRef = ensureDb().collection('clientes').doc(empresa);
```

## Deploy script

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

## Known gotchas

- **firebase-admin 14.x**: esbuild can't resolve module exports. Use 13.8.0.
- **style-src with nonce**: CSP Level 3 ignores `unsafe-inline` when nonce is present. Use `'unsafe-inline'` without nonce for styles if the app has dynamic inline styles from JS.
- **SSG phase**: Waku runs module-level code during SSG build. All firebase-admin usage must be inside request handlers, not at module top level.
- **CNAME flattening**: Cloudflare supports CNAME at apex via flattening. Use `apex-loadbalancer.netlify.com` for apex, `superkeg.netlify.app` for www.
