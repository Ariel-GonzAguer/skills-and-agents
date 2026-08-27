---
name: version-checker
description: >
  Implementa un sistema de verificación de versión en tiempo real para apps web React
  usando Zustand + Firebase Firestore + notificaciones toast. Compara la versión local
  del paquete contra un documento remoto de Firestore y muestra un banner de actualización
  cuando hay una nueva versión disponible. Usar cuando el usuario pida "agregar verificación
  de versión", "detección de auto-actualización", "version checker", "banner de nueva versión",
  "sincronización de versión en tiempo real", "detectar actualizaciones remotas", o cualquier
  solicitud para notificar a los usuarios cuando se despliega una nueva versión de la app.
---

# Version Checker — Detección de actualizaciones en tiempo real para apps React

Esta skill implementa un sistema de verificación de versión listo para producción que compara
la versión local de la app contra una versión remota almacenada en Firebase Firestore y
solicita al usuario actualizar cuando hay una nueva versión disponible.

## Visión de la arquitectura

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  version.ts  │────▶│ useVersionStore   │────▶│ UpdateBanner    │
│  (constante) │     │ (Zustand+persist) │     │ (componente UI) │
└──────────────┘     └──────────────────┘     └─────────────────┘
                              ▲                        │
                              │                        │
                      ┌───────┴───────────┐            │
                      │ useVersionWebApp  │            │
                      │ (hook Firestore)  │◀───────────┘
                      └───────────────────┘
                              │
                      ┌───────▼───────────┐
                      │  Firebase         │
                      │  Firestore        │
                      │  version/version  │
                      └───────────────────┘
```

## Prerrequisitos

- React 18+ o 19+
- Zustand (`zustand` v4+ o v5)
- Firebase SDK (`firebase/firestore`, `firebase/auth`)
- Una librería de toast (`sonner` recomendado, o `react-hot-toast`)
- Un proyecto Firebase existente con Firestore habilitado
- Una configuración de auth de Firebase existente (el listener de versión está limitado por auth)

## Documento de Firestore

Crear un documento de Firestore en la ruta `version/version` con:

```json
{
  "version": "1.0.0"
}
```

Este es el **único** requisito del backend. No se necesitan Cloud Functions.

## Pasos de implementación

### Paso 1: Crear `src/version.ts`

Este archivo es la fuente única de verdad para la versión local. Debe mantenerse
sincronizado con `package.json` manualmente (o vía un script de build).

```typescript
/**
 * Versión de la app. Mantener sincronizado con package.json.
 * Usado como versión local inicial en el store de versión.
 */
export const APP_VERSION = "1.0.0" as const;
```

### Paso 2: Crear `src/store/useVersionStore.ts`

Store de Zustand con persistencia en localStorage. Maneja el estado de versión local vs remota
con seguridad SSR y soporte de migración de esquema.

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { APP_VERSION } from "../version";

const safeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
});

interface VersionState {
  /** Versión local de la app (persistida en localStorage). */
  versionLocal: string;
  /** Versión remota de Firestore (no persistida). */
  versionRemota: string | null;
  setVersionLocal: (v: string) => void;
  setVersionRemota: (v: string) => void;
}

export const useVersionStore = create<VersionState>()(
  persist(
    (set) => ({
      versionLocal: APP_VERSION,
      versionRemota: null,
      setVersionLocal: (versionLocal) => set({ versionLocal }),
      setVersionRemota: (versionRemota) => set({ versionRemota }),
    }),
    {
      name: "app-version",
      storage: safeStorage,
      version: 1,
      partialize: (state) => ({ versionLocal: state.versionLocal }),
      migrate: (persistedState, version) => {
        const state = persistedState as { versionLocal?: string };
        if (version === 0) {
          return {
            versionLocal: state.versionLocal ?? APP_VERSION,
          };
        }
        return state;
      },
    }
  )
);
```

**Decisiones clave de diseño:**
- `safeStorage` previene crashes de SSR proporcionando un storage no-op cuando
  `window` es undefined.
- `partialize` solo persiste `versionLocal` — la versión remota es
  efímera y se re-obtiene en cada sesión.
- `version: 1` con `migrate` permite futuras actualizaciones del esquema del store.

### Paso 3: Crear `src/hooks/useVersionWebApp.ts`

Hook que escucha el documento de Firestore en tiempo real. Limitado por auth:
solo se suscribe después de que el usuario se autentica.

```typescript
import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import { auth, db } from "../lib/firebase";
import { useVersionStore } from "../store/useVersionStore";

export function useVersionWebApp(versionLocal: string | null): void {
  const setVersionRemota = useVersionStore((s) => s.setVersionRemota);

  useEffect(() => {
    if (!db || !auth) return;

    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeSnapshot?.();
      unsubscribeSnapshot = null;

      if (!user) return;

      const ref = doc(db, "version", "version");

      unsubscribeSnapshot = onSnapshot(ref, (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        const remote = data?.version;

        if (typeof remote !== "string" || !remote) return;

        setVersionRemota(remote);

        if (versionLocal && remote !== versionLocal) {
          toast.info(`Nueva versión disponible: ${remote}`, {
            description: "Actualiza la app para obtener los últimos cambios.",
            duration: 10000,
          });
        }
      });
    });

    return () => {
      unsubscribeSnapshot?.();
      unsubscribeAuth();
    };
  }, [versionLocal, setVersionRemota]);
}
```

**Decisiones clave de diseño:**
- Limitado por auth: las reglas de Firestore típicamente requieren auth; esto evita
  errores de permisos para visitantes anónimos.
- Patrón de limpieza: el `unsubscribeSnapshot` interno se limpia tanto al desmontar
  como al cambiar el estado de auth (usuario cierra sesión → suscripción cancelada).
- Tiempo real: `onSnapshot` se dispara inmediatamente y en cada cambio remoto, así
  que el usuario ve el banner de actualización segundos después de un despliegue.

### Paso 4: Crear `src/components/ui/UpdateBanner.tsx`

Banner visual que se muestra cuando las versiones difieren. Al hacer clic en "Actualizar",
persiste la versión remota localmente y recarga la página.

```typescript
"use client";

import { toast } from "sonner";
import { useVersionStore } from "../../store/useVersionStore";

export function UpdateBanner() {
  const versionLocal = useVersionStore((s) => s.versionLocal);
  const versionRemota = useVersionStore((s) => s.versionRemota);
  const setVersionLocal = useVersionStore((s) => s.setVersionLocal);

  if (!versionRemota || versionRemota === versionLocal) return null;

  const remote = versionRemota;

  function handleUpdate() {
    setVersionLocal(remote);
    toast.success(`Versión actualizada a ${remote}`, {
      description: "Recargando la aplicación...",
    });
    setTimeout(() => window.location.reload(), 1500);
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div>
        <p className="font-medium">Nueva versión disponible: {versionRemota}</p>
        <p className="text-amber-700">Versión actual: {versionLocal}</p>
      </div>
      <button
        onClick={handleUpdate}
        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
      >
        Actualizar
      </button>
    </div>
  );
}
```

**Nota:** Adaptar las clases de Tailwind para coincidir con el sistema de diseño (colores,
espaciado, etc.). El ejemplo usa tonos ámbar como estilo genérico de "info".

### Paso 5: Crear `src/components/ui/VersionChecker.tsx`

Componente orquestador que conecta todo.

```typescript
"use client";

import { useVersionStore } from "../../store/useVersionStore";
import { useVersionWebApp } from "../../hooks/useVersionWebApp";
import { UpdateBanner } from "./UpdateBanner";

export function VersionChecker() {
  const versionLocal = useVersionStore((s) => s.versionLocal);
  useVersionWebApp(versionLocal);

  return <UpdateBanner />;
}
```

### Paso 6: Montar `<VersionChecker />` en el layout raíz

Agregar el componente al layout raíz para que esté activo en cada página:

```typescript
import { VersionChecker } from "../components/ui/VersionChecker";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ...metadata, etc... */}
      <VersionChecker />
      {children}
    </>
  );
}
```

### Paso 7: Actualizar `package.json` y `src/version.ts`

Al lanzar una nueva versión, actualizar **ambos** archivos:

```bash
# Ejemplo: subir a 1.1.0
# 1. Actualizar campo "version" de package.json
# 2. Actualizar constante APP_VERSION en src/version.ts
# 3. Desplegar la app
# 4. Actualizar documento Firestore version/version a { "version": "1.1.0" }
```

## Flujo de despliegue

1. Subir versión en `package.json` y `src/version.ts` (mantenerlos sincronizados).
2. Construir y desplegar la app.
3. Actualizar el documento Firestore `version/version` con el nuevo string de versión.
   Esto puede hacerse manualmente en la Firebase Console, vía un script post-despliegue,
   o vía el Firebase Admin SDK en CI.

**El orden importa:** Desplegar la app primero, luego actualizar Firestore. Si se
actualiza Firestore primero, los usuarios existentes verán el banner de actualización pero la
"nueva versión" que descarguen será la anterior.

## Puntos de personalización

| Qué | Dónde | Cómo |
|---|---|---|
| Librería de toast | `useVersionWebApp.ts` | Reemplazar `sonner` con `react-hot-toast`, `react-toastify`, etc. |
| Estilo del banner | `UpdateBanner.tsx` | Reemplazar clases de Tailwind con el sistema de diseño |
| Actualización forzada | `UpdateBanner.tsx` | Agregar un modal que bloquee la interacción en vez de un banner descartable |
| Comparación de versión | `useVersionWebApp.ts` | Usar comparación semver (`semver.gt()`) en vez de igualdad estricta |
| Polling en vez de tiempo real | `useVersionWebApp.ts` | Reemplazar `onSnapshot` con `getDoc` en un intervalo |
| Ruta de Firestore | `useVersionWebApp.ts` | Cambiar `doc(db, "version", "version")` a la ruta preferida |
| Backend no Firebase | `useVersionWebApp.ts` | Reemplazar listener de Firestore con un fetch/WebSocket a tu API |

## Lista de verificación

Después de aplicar esta skill, se deben tener estos archivos:

- [ ] `src/version.ts` — constante de versión
- [ ] `src/store/useVersionStore.ts` — store de Zustand con persistencia
- [ ] `src/hooks/useVersionWebApp.ts` — listener en tiempo real de Firestore
- [ ] `src/components/ui/UpdateBanner.tsx` — UI del banner de actualización
- [ ] `src/components/ui/VersionChecker.tsx` — componente orquestador
- [ ] El layout raíz monta `<VersionChecker />`
- [ ] El documento Firestore `version/version` existe con `{ "version": "..." }`

## Suposiciones

- Firebase ya está configurado en `src/lib/firebase.ts` exportando `auth` y `db`.
- Zustand ya está instalado.
- Una librería de toast (sonner o equivalente) ya está instalada.
- Se usa Tailwind CSS para estilos (adaptar si se usan CSS modules, styled-components, etc.).
