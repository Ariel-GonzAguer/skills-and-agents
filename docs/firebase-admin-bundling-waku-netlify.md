# Firebase Admin en Waku + Netlify: el problema de bundling y su solución definitiva

## Resumen

Un proyecto Waku + firebase-admin que despliega en Netlify Lambda falla con `Cannot find package 'firebase-admin'` en producción. La causa: esbuild de Netlify **no resuelve imports dinámicos** de bare module specifiers. La solución es replicar el patrón de Proyecto A: import estático del paquete principal + configuración de Waku que permite que Rollup bundle firebase-admin en los chunks del servidor.

---

## Stack

- **Framework**: Waku 1.0.0-alpha.8
- **Runtime**: Node.js 22 (Netlify Functions)
- **Firebase**: firebase-admin 13.8.0 (server) + firebase 12.12.1 (client)
- **Build**: Vite 8.0.16 / Rolldown (Waku build) + esbuild (Netlify function bundler)
- **Deploy**: Netlify CLI (`netlify deploy --prod`)

---

## Arquitectura de bundling en Waku + Netlify

Entender esto es clave. El build tiene **3 etapas**:

```
[1] Waku build (Rollup/Vite)
     ↓
  dist/server/index.js + dist/server/assets/*.js (chunks)

[2] esbuild (Netlify function bundler)
     ↓
  netlify-functions/serve.mjs (único archivo para Lambda)

[3] Lambda runtime
     ↓
  Ejecuta serve.mjs
```

### Etapa 1: Waku build

Waku ejecuta **4 sub-builds**:
1. **RSC analyze** — analiza React Server Components
2. **SSR analyze** — analiza server-side rendering
3. **RSC build** — genera chunks del servidor (donde vive firebase-admin)
4. **Client build** — genera assets del navegador
5. **SSR build** — genera bundle para pre-rendering

Los chunks de la etapa 3 (`dist/server/assets/*.js`) son los que esbuild re-bundleará en la etapa 2.

### Etapa 2: Netlify esbuild

Netlify toma `netlify-functions/serve.js` como entry point:
```js
const { INTERNAL_runFetch } = await import('../dist/server/index.js');
export default async (request, context) =>
  INTERNAL_runFetch(process.env, request, { context });
```

esbuild sigue `import('../dist/server/index.js')` → encuentra los chunks en `dist/server/assets/` → los bundlea todo en un único `serve.mjs`.

**El problema ocurre aquí**: si los chunks tienen bare imports como `import("firebase-admin/app")`, esbuild **no los resuelve**. Simplemente los deja como están en el bundle final. En runtime, Node.js intenta resolver `firebase-admin/app` pero no hay `node_modules` en el Lambda → error.

### Etapa 3: Runtime

El Lambda ejecuta `serve.mjs`. Si esbuild no bundló firebase-admin, el import dinámico falla.

---

## El error

```
Cannot find package 'firebase-admin' imported from /var/task/netlify-functions/serve.mjs
```

En el navegador:
1. Se intenta inicio de sesión → falla
2. Network muestra: `Cannot find package 'firebase-admin'` 
3. Después muestra: `{"ok":true}` (la respuesta de la API route que no necesita auth)

---

## Por qué esbuild no resuelve imports dinámicos

esbuild, cuando corre como bundler de Netlify Functions, **no sigue imports dinámicos** (`await import("modulo")`) de módulos bare specifier. Esto es diferente a esbuild standalone que sí los sigue.

La evidencia: después de cada intento, el chunk resultante tenía `import("firebase-admin/app")` como texto literal en el bundle, y en runtime fallaba con "Cannot find package".

---

## Intentos que NO funcionaron

### Intento 1: Dynamic imports + default esbuild

```ts
// admin.ts
const { initializeApp, cert, getApps } = await import("firebase-admin/app");
```

**Resultado**: `getApps3 is not a function` — esbuild mete firebase y firebase-admin en el mismo bundle, renombra funciones por colisión de nombres.

**Por qué falla**: Rollup externaliza firebase-admin (via `ssr.external`), los chunks quedan con bare imports, esbuild los re-bundlea junto con firebase client y colisionan.

### Intento 2: `node_bundler = "none"` en netlify.toml

```toml
[functions]
  node_bundler = "none"
```

**Resultado**: `error decoding lambda response`

**Por qué falla**: Sin bundler, Lambda ejecuta el JS tal cual pero sin `node_modules` disponible. Los imports de npm packages fallan.

### Intento 3: Imports estáticos de subpaths + rollupOptions.external

```ts
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
```
```ts
// waku.config.ts
vite: {
  build: {
    rollupOptions: {
      external: ["firebase-admin", "firebase-admin/app", "firebase-admin/firestore"]
    }
  }
}
```

**Resultado**: `TypeError: Cannot read properties of undefined (reading 'SDK_VERSION')` durante el build (SSG).

**Por qué falla**: Rollup externaliza firebase-admin pero el SSG intenta evaluar los módulos. Los subpath exports (`firebase-admin/app`) tienen wrappers CJS/ESM que acceden a `default.SDK_VERSION` que no existe en ese contexto.

### Intento 4: `/* @vite-ignore */` + external

```ts
const { initializeApp, cert, getApps } = await import(/* @vite-ignore */ "firebase-admin/app");
```

**Resultado**: `Cannot find package 'firebase-admin'` en runtime.

**Por qué falla**: `/* @vite-ignore */` le dice a Rollup que no procese el import. Los chunks quedan con el bare import literal. esbuild de Netlify tampoco lo resuelve.

### Intento 5: `vite.build.rollupOptions.external` (dentro de `vite`)

```ts
vite: {
  build: {
    rollupOptions: {
      external: ["firebase-admin", "firebase-admin/app", "firebase-admin/firestore"]
    }
  }
}
```

**Resultado**: `Cannot find package 'firebase-admin'` en runtime.

**Por qué falla**: Esto SÍ funciona para Rollup (externaliza firebase-admin, chunks de 47KB). Pero esbuild de Netlify no resuelve los bare imports que quedan en los chunks. **La externalización en Rollup es el problema**: genera chunks con imports que esbuild no puede resolver.

### Intento 6: `external_node_modules` en netlify.toml

```toml
[functions]
  external_node_modules = ["firebase-admin"]
```

**Resultado**: `Cannot find package 'firebase-admin'` en runtime.

**Por qué falla**: `external_node_modules` le dice a esbuild que no bundlee esos paquetes. Pero Lambda no tiene `node_modules` instalado. El paquete no está disponible en runtime.

---

## La solución: patrón de Proyecto A

### Cambio 1: `waku.config.ts`

```ts
export default defineConfig({
  // TOP LEVEL — fuera de `vite`
  ssr: {
    external: ["firebase-admin"],
  },
  build: {
    rollupOptions: {
      external: ["firebase-admin"],
    },
  },
  vite: {
    // Solo config de Vite aquí
  },
});
```

**Por qué funciona**: `ssr` y `build` en el top level de `defineConfig` **no son propiedades válidas del tipo `Config`** de Waku. TypeScript las acepta (el tipo es loose), pero Waku las ignora en runtime. Esto significa:

- `build.rollupOptions.external` **NO se aplica** → Rollup **SÍ bundlea** firebase-admin
- El chunk `wakuAuth` pasa de ~47KB a **~7,469KB** (7.3MB) — firebase-admin está completamente bundleado
- **No quedan bare imports** de firebase-admin en los chunks
- esbuild solo necesita bundlear los chunks que ya tienen todo resuelto

> **Nota**: `ssr.external` en top level SÍ puede ser leído por Waku para el build SSR por separado. Esto es consistente: el SSR bundle (que se usa para pre-rendering) mantiene firebase-admin externalizado, pero el RSC bundle (que es el que usa la función Lambda) lo tiene bundleado.

### Cambio 2: `src/lib/firestore/admin.ts`

**Antes** (dynamic imports de subpaths):
```ts
const { initializeApp, cert, getApps } = await import("firebase-admin/app");
const { getFirestore } = await import("firebase-admin/firestore");
```

**Después** (import estático del paquete principal):
```ts
import admin from "firebase-admin";

export function getFirebaseAdminApp(): admin.app.App {
  const defaultApp = admin.apps.find(
    (app): app is admin.app.App => app !== null && app.name === "[DEFAULT]"
  );
  if (defaultApp) return defaultApp;

  // ... resolve service account ...
  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return admin.firestore(getFirebaseAdminApp());
}

export function getAdminAuth(): admin.auth.Auth {
  return admin.auth(getFirebaseAdminApp());
}
```

**Por qué**:
- `import admin from 'firebase-admin'` es un **import estático del paquete principal**
- Rollup puede resolverlo y bundlearlo correctamente (CJS/ESM interop funciona con el export default)
- Subpaths (`firebase-admin/app`, `firebase-admin/firestore`) tienen wrappers ESM que causan errores (`SDK_VERSION`) cuando Rollup los bundla
- Las funciones ahora son **síncronas** (no async), lo cual es más simple y evita problemas de inicialización

### Cambio 3: `src/lib/firestore/fieldValue.ts`

**Antes** (dynamic import):
```ts
async function loadFirestore() {
  const mod = await import("firebase-admin/firestore");
  _FieldValue = mod.FieldValue;
}
```

**Después** (directo del paquete principal):
```ts
import admin from "firebase-admin";

export function increment(n: number) {
  return admin.firestore.FieldValue.increment(n);
}

export function deleteField() {
  return admin.firestore.FieldValue.delete();
}
```

**Por qué**: Mismo principio. Sin imports dinámicos de subpaths.

### Cambio 4: `netlify.toml` (sin cambios)

```toml
[functions]
  included_files = ["private/**"]
  directory = "netlify-functions"
```

Igual que Proyecto A. Sin `node_bundler`, sin `external_node_modules`.

---

## Por qué funciona el patrón de Proyecto A

| Factor | Proyecto A (funciona) | Proyecto B anterior (no funcionaba) |
|---|---|---|
| Import de firebase-admin | `import admin from 'firebase-admin'` (estático, paquete principal) | `await import("firebase-admin/app")` (dinámico, subpath) |
| Config de externals | Top level de `defineConfig` (ignorado por Waku) | Dentro de `vite` (efectivo para Rollup) |
| Rollup bundlea firebase-admin | Sí (chunk admin = 7.4MB) | No (chunk wakuAuth = 47KB, bare imports) |
| esbuild resuelve imports | No necesita — todo está en los chunks | Falla — bare imports no resueltos |
| Errores CJS/ESM | No hay (usa el main export) | SDK_VERSION con subpaths |

### La clave: Rollup DEBE bundlear firebase-admin

El flujo correcto es:
```
Rollup bundlea firebase-admin en los chunks
  → Chunks de ~7.4MB con todo incluido
    → esbuild re-bundlea los chunks (ya no hay bare imports)
      → Lambda ejecuta el bundle completo
```

El flujo incorrecto era:
```
Rollup externaliza firebase-admin
  → Chunks de ~47KB con bare imports
    → esbuild no resuelve los bare imports
      → Lambda falla: "Cannot find package"
```

---

## Verificación post-fix

Después del fix, el chunk `wakuAuth` pasó de **~47KB** a **~7,469KB** (7.3MB):

```
dist/server/assets/wakuAuth-DKC6YWiQ.js  7,469.37 kB
```

Y `grep` confirma que no hay bare imports de firebase-admin:

```
grep "firebase-admin/app" wakuAuth-*.js → 0 matches
grep "firebase-admin/firestore" wakuAuth-*.js → 0 matches
```

---

## Reglas para futuros proyectos Waku + Firebase + Netlify

1. **Usar lazy dynamic imports** para firebase-admin (`await import('firebase-admin')`), nunca imports estáticos
2. **Nunca** usar subpaths como `firebase-admin/app` o `firebase-admin/firestore` (solo el paquete principal)
3. **Nunca** poner `rollupOptions.external` o `ssr` **dentro de `vite`** en `waku.config.ts`
4. `netlify.toml` solo necesita `included_files = ["private/**"]`
5. **No** usar `node_bundler = "none"` ni `external_node_modules`
6. Verificar que el chunk de firebase-admin pese **~5MB+** (indica que está bundleado correctamente)

---

## Referencia: Proyecto A

El proyecto Proyecto A es la referencia canónica. Su configuración:

- `waku.config.ts`: `ssr` y `build` en top level, `vite` solo con plugins y server config
- `admin.ts`: `import admin from 'firebase-admin'` con init síncrono
- `netlify.toml`: `included_files = ["private/**"]`, sin node_bundler
- Chunk admin: 7,418.34 KB (firebase-admin bundleado)

---

## Alternativa: lazy dynamic imports (patrón Proyecto C)

Existe una segunda solución que funciona igual de bien. En vez de import estático del paquete principal, usa **lazy dynamic imports** con `await import('firebase-admin')`.

### Diferencia clave

| | Patrón Proyecto A | Patrón Proyecto C |
|---|---|---|
| Import | `import admin from 'firebase-admin'` (estático) | `const admin = await import('firebase-admin')` (dinámico lazy) |
| Funciones | Síncronas | Todas `async` |
| Config externals | Top level (ignorado por Waku) | **Eliminados** de `waku.config.ts` |
| Complejidad | Menor | Mayor (todas las funciones son async) |

### Cambio 1: `waku.config.ts` — sin externals

**En vez de** mover externals al top level, simplemente **eliminarlos**:

```ts
import { defineConfig } from 'waku/config';

export default defineConfig({
  vite: {
    // Sin ssr.external, sin build.rollupOptions.external
    // Rollup SÍ bundlea firebase-admin en los chunks
  },
});
```

**Por qué funciona**: Sin externals, Rollup bundlea firebase-admin directamente en los chunks del servidor. esbuild de Netlify re-bundlea esos chunks (ya no hay bare imports). Lambda ejecuta el bundle completo.

### Cambio 2: `src/utils/firebaseAdmin.ts` — lazy dynamic imports

```ts
let adminModule: typeof import('firebase-admin') | null = null;

async function loadAdmin() {
  if (!adminModule) {
    adminModule = await import('firebase-admin');
    if (!adminModule.apps.length) {
      adminModule.initializeApp({
        credential: adminModule.credential.cert({ ... }),
      });
    }
  }
  return adminModule;
}

export async function getAdminAuth() {
  const admin = await loadAdmin();
  return admin.auth();
}

export async function getFirestoreDb() {
  const admin = await loadAdmin();
  return admin.firestore();
}

export async function incrementFieldValue(amount: number) {
  const admin = await loadAdmin();
  return admin.firestore.FieldValue.increment(amount);
}
```

### Cambio 3: Todos los consumidores deben ser async

```ts
// serverAuth.ts
export async function requireAuth(headers: Headers) {
  const auth = await getAdminAuth();
  return auth.verifyIdToken(token);
}

// verificacionTransaccion.ts
async function ensureDb() {
  await initializeFirebaseAdmin();
  return getFirestoreDb();
}

const db = await ensureDb();
const snap = await db.collection('clientes').doc(empresa).get();
```

### Por qué funciona

1. `await import('firebase-admin')` es un **dynamic import de bare specifier**
2. Rollup lo resuelve y bundela en el chunk (firebase-admin ~7MB en el chunk)
3. esbuild re-bundlea el chunk (ya tiene todo resuelto)
4. Lambda ejecuta el bundle completo

### Cuándo usar cada patrón

- **Patrón Proyecto A** (import estático): Proyectos nuevos, funciones síncronas, menos complejidad
- **Patrón Proyecto C** (lazy dynamic): Proyectos existentes con funciones async, o cuando se quiere lazy loading de firebase-admin

---

## Archivos modificados

### Proyecto B (patrón lazy dynamic)

| Archivo | Cambio |
|---|---|
| `waku.config.ts` | Eliminado `ssr.external` de dentro de `vite` |
| `src/lib/firestore/admin.ts` | Lazy dynamic import con `loadAdmin()`, todas las funciones async |
| `src/lib/firestore/fieldValue.ts` | Lazy dynamic import para `increment()` y `deleteField()`, funciones async |
| `src/lib/firestore/subcollections.ts` | Eliminado import estático de `FieldValue`, `itemDeleteMap`/`clienteDeleteMap`/`categoriaDeleteMap` ahora async |
| `src/pages/_api/api/*.ts` | Agregado `await` a llamadas de `increment()` y `*DeleteMap()` |
| `netlify.toml` | Sin cambios |

### Proyecto C (patrón lazy dynamic)

| Archivo | Cambio |
|---|---|
| `waku.config.ts` | Eliminados `ssr.external` y `build.rollupOptions.external` |
| `src/utils/firebaseAdmin.ts` | Lazy dynamic import con `loadAdmin()`, todas las funciones async |
| `src/utils/serverAuth.ts` | `requireAuth` ahora es async, usa `await getAdminAuth()` |
| `src/pages/_api/verificacionTransaccion.ts` | `ensureDb()` async, `(await ensureDb())` en todas las llamadas |
| `netlify.toml` | Agregado `camera=(self)` en Permissions-Policy (para QR scanner) |
