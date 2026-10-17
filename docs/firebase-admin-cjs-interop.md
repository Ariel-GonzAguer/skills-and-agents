# Firebase Admin SDK en Waku + Vite: Error 401 en SSR

## El Problema

Después de hacer login, todos los endpoints que usaban `verifyIdToken()` fallaban con **401 Unauthorized**:

```
GET /verificacionTransaccion?empresa=Prueba%20000&descontar=false 401 (Unauthorized)
Error: "Token de autenticación inválido o expirado"
```

En el servidor, el error real era:

```
TypeError: Cannot read properties of undefined (reading 'length')
    at initializeFirebaseAdmin
```

`admin.auth()` retornaba `undefined` porque `initializeApp()` nunca se ejecutaba.

## La Causa Raíz

** firebase-admin v14 + Vite's SSR Module Runner **

El proyecto usaba `import * as admin from 'firebase-admin'` (namespace import). En el contexto de Vite's module runner (que Waku usa para SSR), los módulos CJS como `firebase-admin` son envueltos en un namespace object donde `admin.apps` queda como `undefined` en vez del array `[]` esperado.

Esto causaba que la función de inicialización retornara temprano sin ejecutar `initializeApp()`:

```typescript
// ❌ admin.apps es undefined en Vite's module runner
if (!admin?.apps) return;  // → retorna sin inicializar
```

### ¿Por qué pasaba?

- `import * as admin from 'firebase-admin'` crea un ES Module namespace object
- Vite's SSR module runner envuelve los CJS exports de forma diferente
- `admin.apps` queda `undefined` en vez de `[]` (array vacío)
- El guard `if (!admin?.apps)` lo detecta como falsy y retorna

### ¿Por qué no pasaba antes?

- firebase-admin **v13** (usado en pasaporte.app) funciona con `import admin from 'firebase-admin'`
- firebase-admin **v14** (usado en superkeg) cambió la estructura de exports
- El `ssr.external` estaba anidado dentro de `vite` en vez de estar a nivel superior de Waku

## La Solución

### 1. Usar Modular Imports (recomendado por Firebase)

Cambiar de namespace import a imports modulares:

```typescript
// ❌ Antes (no funciona en Waku + Vite)
import * as admin from 'firebase-admin';
import admin from 'firebase-admin';

// ✅ Después (funciona correctamente)
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
```

### 2. Configuración correcta de waku.config.ts

`ssr.external` y `build.rollupOptions.external` deben estar a nivel superior de Waku, **no** anidados dentro de `vite`:

```typescript
// ✅ Correcto
export default defineConfig({
  ssr: {
    external: ['firebase-admin', 'firebase-admin/app', 'firebase-admin/auth', 'firebase-admin/firestore'],
  },
  build: {
    rollupOptions: {
      external: ['firebase-admin', 'firebase-admin/app', 'firebase-admin/auth', 'firebase-admin/firestore'],
    },
  },
  vite: {
    plugins: [/* ... */],
  },
});

// ❌ Incorrecto (ssr.external dentro de vite no se procesa igual)
export default defineConfig({
  vite: {
    ssr: {
      external: ['firebase-admin'],  // ← Waku lo ignora
    },
  },
});
```

### 3. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/utils/firebaseAdmin.ts` | Lazy dynamic import con `loadAdmin()`, todas las funciones async |
| `src/utils/serverAuth.ts` | `requireAuth()` async, usa `await getAdminAuth()` |
| `src/pages/_api/verificacionTransaccion.ts` | `ensureDb()` async, `(await ensureDb())` en todas las llamadas |
| `waku.config.ts` | Eliminados `ssr.external` y `build.rollupOptions.external` ( Rollup bundlea firebase-admin directamente) |

> **Nota**: La solución final usa lazy dynamic imports en vez de modular imports. Ver `20-netlify/waku-firebase-admin-bundling-solucion-definitiva.md` para la comparación completa.

## Referencia: pasaporte.app vs superkeg

| Aspecto | pasaporte.app | superkeg (solución final) |
|---------|---------------|---------------------------|
| firebase-admin version | v13.8.0 | v13.8.0 (downgraded de v14.2.0) |
| Import style | `import admin from 'firebase-admin'` (estático) | `await import('firebase-admin')` (lazy dynamic) |
| Config `ssr.external` | Nivel superior Waku (ignorado) | Eliminado |
| Funciones | Síncronas | Todas async |
| ¿Funciona? | ✅ Sí | ✅ Sí |

## Regex: Permitir espacios en nombres de empresa

El endpoint también validaba `empresa` con una regex que no permitía espacios:

```typescript
// ❌ No permitía "Prueba 000"
const FIRESTORE_DOC_ID_REGEX = /^[a-zA-Z0-9_-]{1,1500}$/;

// ✅ Ahora permite espacios
const FIRESTORE_DOC_ID_REGEX = /^[a-zA-Z0-9 _-]{1,1500}$/;
```

## Lecciones Aprendidas

1. **Nunca usar `import * as admin from 'firebase-admin'`** en Waku + Vite SSR
2. **Usar lazy dynamic imports** (`await import('firebase-admin')`) con `loadAdmin()` y manejo de `.default`
3. **Nunca** imports estáticos de subpaths (`firebase-admin/app`, `firebase-admin/firestore`) — causan `__dirname is not defined`
4. **`ssr.external`** dentro de `vite` es ignorado por Waku — mejor eliminarlo y usar lazy dynamic imports
5. **Verificar la versión** de firebase-admin antes de elegir el patrón de import
6. **Waku + Vite 8** tiene diferentes comportamientos de CJS interop según dónde se configure
7. **Boucardi** migro de patrón pasaporte.app (import estático) a patrón superkeg (lazy dynamic) en agosto 2026

---

## Regreso del bug (Vite 8.2.0 - Agosto 2026)

### Problema

El mismo error `Cannot read properties of undefined (reading 'length')` en `initializeFirebaseAdmin` reapareció después de una actualización a **Vite 8.2.0**. Los endpoints autenticados volvieron a fallar con 401.

### Causa

Vite 8 module runner cambió la interop ESM/CJS. `loadAdmin()` usaba `await import('firebase-admin')` que ahora retorna un namespace ESM:

```typescript
// ❌ admin.apps es undefined — el módulo viene envuelto
const imported = await import('firebase-admin');
// imported = { default: { apps: [...], initializeApp: ..., ... } }
// imported.apps → undefined
```

### Solución

Verificar si `apps` existe directamente en el módulo importado. Si no, usar `.default`:

```typescript
async function loadAdmin(): Promise<typeof import('firebase-admin')> {
  if (!adminModule) {
    const imported = await import('firebase-admin');
    const mod = imported as Record<string, unknown>;
    adminModule = (mod.apps ? imported : mod.default) as typeof import('firebase-admin');
  }
  return adminModule;
}
```

### Lección

Vite 8 module runner envuelve CJS en namespace ESM: `{ default: { apps, ... } }`. Siempre detectar si el export real está en `.default` al hacer dynamic imports de paquetes CJS.

---

## Firestore roto con bundle inline (2026): `GrpcClient is not a constructor`

### Problema

Proyecto Waku + React 19 + pnpm desplegado en Netlify con la CLI desde Windows. En producción, `POST /redeem-invitation` devolvía `500` con `{"ok":false,"reason":"unavailable"}` y los logs no mostraban nada útil porque los `catch` eran silenciosos.

### Causa raíz (corrección importante)

**No es un problema de versión y no es un problema de configuración.** Es un problema de **orden de inicialización de módulos** en el bundle:

- El build de Waku fuerza `resolve.noExternal: true` (`node_modules/waku/dist/lib/vite-plugins/environments.js`: `noExternal: env.command === 'build' ? true : [...]`).
- Consecuencia: Rolldown inlinea `firebase-admin` en el bundle del servidor, y con él `google-gax` y `@grpc/grpc-js`.
- En el bundle generado, el objeto de exports de `google-gax` tiene la propiedad `GrpcClient` **presente pero con valor `undefined`**: la asignación del export corre antes de inicializar el binding de la clase.
- Al construir el cliente de Firestore: `TypeError: this._gaxModule.GrpcClient is not a constructor`.

### Evidencia

Instrumentando la línea `this._gaxModule = opts.fallback ? gaxInstance.fallback : gaxInstance;`:

| Bundle | Resultado del log |
|---|---|
| Roto | `GrpcClient=undefined \| propExiste=true \| keys=42` |
| Funcionando | `GrpcClient=function \| propExiste=true \| keys=42` |

El código generado alrededor de esa línea y las definiciones de los wrappers son byte-idénticos en ambos casos. Solo cambia el orden de inicialización.

### Por qué el fallo parecía parcial y confuso

- Auth sigue funcionando: `verifyIdToken()` no usa gRPC, solo Firestore sí.
- `waku dev` nunca lo reproduce: en desarrollo las dependencias quedan externas.

### Qué NO funciona

Declarar solo `vite.ssr.external: ['firebase-admin']`: Vite evalúa `resolve.external` antes que `noExternal`, pero el bloque `ssr.*` solo aplica al entorno `ssr`, no a `rsc`, que es donde se compilan las rutas `_api`.

### Solución: externo por entorno

Config real de `waku.config.ts` (proyecto pasaporte-birra-web):

```ts
export default defineConfig({
  vite: {
    ssr: {
      external: ["firebase-admin"],
    },
    environments: {
      rsc: { resolve: { external: ["firebase-admin"] } },
      ssr: { resolve: { external: ["firebase-admin"] } },
    },
  },
});
```

### Versiones descartadas como causa

`firebase-admin` 13.8.0 y 14.5.0, `google-gax` 4.6.1, `@grpc/grpc-js` 1.14.6, y vite 8.0.16 / rolldown 1.0.3 frente a vite 8.3.4 / rolldown 1.2.13 se comportan igual. Bajar `firebase-admin` de 14.5.0 a 13.8.0 **no** fue la solución.

> **Nota**: esta sección actualiza las lecciones anteriores de este documento. Con la API de `environments` de Vite, externalizar `firebase-admin` por entorno es el enfoque recomendado, junto con `nodeLinker: hoisted` en pnpm para el deploy desde Windows (ver [20-netlify/waku-firebase-admin-bundling-solucion-definitiva.md](../20-netlify/waku-firebase-admin-bundling-solucion-definitiva.md) y [20-netlify/pnpm-windows-symlinks-netlify-functions.md](../20-netlify/pnpm-windows-symlinks-netlify-functions.md)).
