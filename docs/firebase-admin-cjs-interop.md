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

- firebase-admin **v13** (usado en Proyecto A) funciona con `import admin from 'firebase-admin'`
- firebase-admin **v14** (usado en Proyecto C) cambió la estructura de exports
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

## Referencia: Proyecto A vs Proyecto C

| Aspecto | Proyecto A | Proyecto C (solución final) |
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
7. **Proyecto B** migro de patrón Proyecto A (import estático) a patrón Proyecto C (lazy dynamic) en agosto 2026

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
