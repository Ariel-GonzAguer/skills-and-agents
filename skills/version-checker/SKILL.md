---
name: version-checker
description: >
  Implement a real-time version checking system for React web apps using
  Zustand + Firebase Firestore + toast notifications. Compares a local
  package version against a remote Firestore document and shows an update
  banner when a new version is available. Use when the user asks to "add
  version checking", "auto-update detection", "version checker", "new
  version banner", "real-time version sync", "detect remote updates", or
  any request to notify users when a new app version is deployed.
---

# Version Checker — Real-time Update Detection for React Apps

This skill implements a production-ready version checking system that compares
a local app version against a remote version stored in Firebase Firestore and
prompts the user to update when a new version is available.

## Architecture Overview

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  version.ts  │────▶│ useVersionStore   │────▶│ UpdateBanner    │
│  (constant)  │     │ (Zustand+persist) │     │ (UI component)  │
└──────────────┘     └──────────────────┘     └─────────────────┘
                              ▲                        │
                              │                        │
                     ┌────────┴──────────┐             │
                     │ useVersionWebApp  │             │
                     │ (Firestore hook)  │◀────────────┘
                     └───────────────────┘
                              │
                     ┌────────▼──────────┐
                     │  Firebase         │
                     │  Firestore        │
                     │  version/version  │
                     └───────────────────┘
```

## Prerequisites

- React 18+ or 19+
- Zustand (`zustand` v4+ or v5)
- Firebase SDK (`firebase/firestore`, `firebase/auth`)
- A toast library (`sonner` recommended, or `react-hot-toast`)
- An existing Firebase project with Firestore enabled
- An existing Firebase auth setup (the version listener is auth-gated)

## Firestore Document

Create a Firestore document at path `version/version` with:

```json
{
  "version": "1.0.0"
}
```

This is the **only** backend requirement. No Cloud Functions needed.

## Implementation Steps

### Step 1: Create `src/version.ts`

This file is the single source of truth for the local version. It must be
kept in sync with `package.json` manually (or via a build script).

```typescript
/**
 * App version. Keep in sync with package.json.
 * Used as the initial local version in the version store.
 */
export const APP_VERSION = "1.0.0" as const;
```

### Step 2: Create `src/store/useVersionStore.ts`

Zustand store with localStorage persistence. Handles local vs remote version
state with SSR safety and schema migration support.

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
  /** Local app version (persisted in localStorage). */
  versionLocal: string;
  /** Remote version from Firestore (not persisted). */
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

**Key design decisions:**
- `safeStorage` prevents SSR crashes by providing a no-op storage when
  `window` is undefined.
- `partialize` only persists `versionLocal` — the remote version is
  ephemeral and re-fetched on each session.
- `version: 1` with `migrate` enables future store schema upgrades.

### Step 3: Create `src/hooks/useVersionWebApp.ts`

Hook that listens to the Firestore document in real-time. Auth-gated:
only subscribes after the user is authenticated.

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

**Key design decisions:**
- Auth-gated: Firestore rules typically require auth; this avoids permission
  errors for anonymous visitors.
- Cleanup pattern: inner `unsubscribeSnapshot` is cleaned up on both unmount
  and auth state change (user logs out → subscription cancelled).
- Real-time: `onSnapshot` fires immediately and on every remote change, so
  the user sees the update banner within seconds of a deployment.

### Step 4: Create `src/components/ui/UpdateBanner.tsx`

Visual banner that shows when versions differ. On "Update" click, persists
the remote version locally and reloads the page.

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

**Note:** Adapt the Tailwind classes to match your design system (colors,
spacing, etc.). The example uses amber tones as a generic "info" style.

### Step 5: Create `src/components/ui/VersionChecker.tsx`

Orchestrator component that wires everything together.

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

### Step 6: Mount `<VersionChecker />` in the root layout

Add the component to your root layout so it's active on every page:

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

### Step 7: Update `package.json` and `src/version.ts`

When releasing a new version, update **both** files:

```bash
# Example: bump to 1.1.0
# 1. Update package.json "version" field
# 2. Update src/version.ts APP_VERSION constant
# 3. Deploy the app
# 4. Update the Firestore document version/version to { "version": "1.1.0" }
```

## Deployment Workflow

1. Bump version in `package.json` and `src/version.ts` (keep them in sync).
2. Build and deploy the app.
3. Update the Firestore document `version/version` with the new version
   string. This can be done manually in the Firebase Console, via a
   post-deploy script, or via the Firebase Admin SDK in CI.

**Order matters:** Deploy the app first, then update Firestore. If you
update Firestore first, existing users will see the update banner but the
"new version" they download will be the old one.

## Customization Points

| What | Where | How |
|---|---|---|
| Toast library | `useVersionWebApp.ts` | Replace `sonner` with `react-hot-toast`, `react-toastify`, etc. |
| Banner styling | `UpdateBanner.tsx` | Replace Tailwind classes with your design system |
| Forced update | `UpdateBanner.tsx` | Add a modal that blocks interaction instead of a dismissible banner |
| Version comparison | `useVersionWebApp.ts` | Use semver comparison (`semver.gt()`) instead of strict equality |
| Polling instead of realtime | `useVersionWebApp.ts` | Replace `onSnapshot` with `getDoc` on an interval |
| Firestore path | `useVersionWebApp.ts` | Change `doc(db, "version", "version")` to your preferred path |
| Non-Firebase backend | `useVersionWebApp.ts` | Replace Firestore listener with a fetch/WebSocket to your API |

## File Checklist

After applying this skill, you should have these files:

- [ ] `src/version.ts` — version constant
- [ ] `src/store/useVersionStore.ts` — Zustand store with persistence
- [ ] `src/hooks/useVersionWebApp.ts` — Firestore real-time listener
- [ ] `src/components/ui/UpdateBanner.tsx` — update banner UI
- [ ] `src/components/ui/VersionChecker.tsx` — orchestrator component
- [ ] Root layout mounts `<VersionChecker />`
- [ ] Firestore document `version/version` exists with `{ "version": "..." }`

## Assumptions

- Firebase is already configured in `src/lib/firebase.ts` exporting `auth`
  and `db`.
- Zustand is already installed.
- A toast library (sonner or equivalent) is already installed.
- Tailwind CSS is used for styling (adapt if using CSS modules, styled-
  components, etc.).
