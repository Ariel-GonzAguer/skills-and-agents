---
name: theme-switching
description: Implementa cambio de tema claro/oscuro en apps React usando Zustand para gestión de estado con persistencia en localStorage y modo oscuro basado en clases de Tailwind CSS v4. Usar esta skill cuando el usuario pida agregar modo oscuro, toggle de tema, modo claro/oscuro, modo nocturno, cambio de tema, cambio de esquema de color, o un tema oscuro a un proyecto React. También usar cuando el usuario mencione persistir preferencias de tema, stores de tema seguros para SSR, componentes ThemeProvider, o quiera convertir un proyecto existente para soportar modo oscuro. Activa con frases como "agregar modo oscuro", "cambiar tema", "dark mode", "toggle theme", "light/dark", "modo noche".
---

# Cambio de tema (Modo claro/oscuro)

Implementa un sistema completo de temas claro/oscuro en apps React usando **Zustand** (estado + persistencia) + **ThemeProvider** (sincronización DOM) + **Tailwind CSS v4** (modo oscuro basado en clases).

## Arquitectura

El sistema funciona así: un store de Zustand mantiene `isDark` y lo persiste en localStorage. Un componente `ThemeProvider` se suscribe al store y agrega/remueve la clase `dark` en `<html>`. Las variantes `dark:` de Tailwind se activan basándose en esa clase. No se necesita React Context — el store de Zustand es la fuente única de verdad, y cualquier componente puede leer el tema directamente.

```
Usuario hace clic en toggle
  → toggleTheme() actualiza isDark en el store de Zustand
  → middleware persist escribe en localStorage
  → ThemeProvider re-renderiza, useEffect agrega/remueve clase "dark" en <html>
  → Tailwind activa todas las utilidades dark:
  → Componentes re-renderizan con colores oscuros
```

## Dependencias

```json
{
  "dependencies": {
    "zustand": "^5.0.0",
    "react": "^19.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

## Pasos de implementación

### Paso 1 — Configurar Tailwind v4 para modo oscuro basado en clases

Tailwind v4 se configura completamente en CSS (sin `tailwind.config.js`). En el archivo CSS principal:

```css
@import "tailwindcss";

/* Modo oscuro usando la clase .dark en <html> */
@custom-variant dark (&:where(.dark, .dark *));
```

La línea `@custom-variant` define la variante `dark:` para que se active cuando el elemento o cualquier ancestro tenga la clase `.dark`. Esto reemplaza la configuración `darkMode: 'class'` de Tailwind v3.

Definir variables de color en un bloque `@theme`. Estas son solo para modo claro — los colores del modo oscuro vienen de utilidades `dark:` en los componentes, no de variables CSS separadas:

```css
@theme {
  --color-cream: #fff5f7;
  --color-warm-white: #fffafa;
  --color-coral: #ff8c94;
  --color-text: #4a4a4a;
  --color-muted: #9b8fa0;
  --color-border: #edd9e5;
  /* Agregar los colores del proyecto aquí */
}
```

Establecer estilos base del body. El body usa variables de modo claro directamente; los fondos oscuros se aplican por página vía utilidades `dark:`:

```css
body {
  background-color: var(--color-cream);
  color: var(--color-text);
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
}
```

### Paso 2 — Crear el store de Zustand con persistencia

Crear `src/store/themeStore.ts`:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Storage seguro para SSR: retorna no-ops cuando window es undefined (render del servidor)
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

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      setDark: (value) => set({ isDark: value }),
    }),
    {
      name: "app-theme", // clave de localStorage — cambiar al nombre del proyecto
      storage: safeStorage,
      migrate: (persistedState, version) => {
        if (version === 0) {
          const state = persistedState as ThemeState;
          return { ...state, isDark: state.isDark ?? false };
        }
        return persistedState;
      },
    }
  )
);
```

Decisiones clave de diseño:
- **`safeStorage`** previene crashes durante SSR. Si el proyecto no usa SSR, reemplazar con `createJSONStorage(() => localStorage)`.
- **`isDark: boolean`** es la fuente única de verdad. `false` = claro, `true` = oscuro.
- **`toggleTheme()`** invierte el booleano — esto es lo que llama el botón toggle.
- **`setDark(value)`** establece el tema explícitamente — útil para detectar la preferencia del SO.
- **`persist`** sincroniza automáticamente el store con localStorage bajo la clave dada.
- **`migrate`** maneja actualizaciones de versión para que los usuarios existentes obtengan valores predeterminados sensatos.

Cualquier componente puede acceder al tema reactivamente:
```typescript
const { isDark, toggleTheme } = useThemeStore();
```

### Paso 3 — Crear el componente ThemeProvider

Crear `src/components/ui/ThemeProvider.tsx`:

```typescript
"use client";

import { useLayoutEffect } from "react";
import { useThemeStore } from "../../store/themeStore";

const STORAGE_KEY = "app-theme";

// Lee el tema persistido directamente de localStorage.
// Respaldo para cuando Zustand persist no se ha rehidratado aún.
function readPersistedTheme() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.isDark ?? null;
  } catch {
    return null;
  }
}

export function ThemeProvider() {
  const { isDark } = useThemeStore();

  useLayoutEffect(() => {
    // Si el store no se ha rehidratado, leer localStorage sincrónicamente
    const dark = readPersistedTheme() ?? isDark;
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return null;
}
```

Este componente no renderiza nada — existe puramente por su efecto secundario. Se suscribe a `isDark` y, cuando cambia, agrega o remueve la clase `dark` en `document.documentElement` (el elemento `<html>`). La directiva `"use client"` es necesaria para frameworks SSR (Waku, Next.js); omitir si no se usa SSR.

Usar `useLayoutEffect` (no `useEffect`). En frameworks RSC (Waku, Next.js), navegar a páginas con `render: 'dynamic'` puede causar que el servidor re-renderice el árbol raíz, lo que puede remontar el ThemeProvider en el cliente. `useLayoutEffect` aplica la clase `.dark` sincrónicamente durante la fase de commit de React, antes de que el navegador pinte, previniendo el flash. Ver "Prevenir FOUC" más abajo.

### Paso 4 — Montar ThemeProvider en la raíz de la app

Montar el proveedor una vez, dentro de `<body>`, en el layout raíz:

```tsx
import { ThemeProvider } from "../components/ui/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head />
      <body className="min-h-screen bg-cream">
        <ThemeProvider />
        {children}
      </body>
    </html>
  );
}
```

### Paso 5 — Crear la UI del toggle de tema

Un botón con forma de píldora. Extraerlo a su propio componente o inlinarlo:

```tsx
import { useThemeStore } from "../../store/themeStore";

function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-2">
      <p>☀️</p>
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
          isDark ? "bg-coral" : "bg-border"
        }`}
        aria-pressed={isDark}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <p>🌙</p>
    </div>
  );
}
```

El toggle usa `aria-pressed={isDark}` para accesibilidad (indica estado on/off a lectores de pantalla). El círculo blanco se desliza vía `translate-x-5` / `translate-x-0` con una transición de 200ms. Ajustar los colores (`bg-coral`, `bg-border`) para coincidir con la paleta del proyecto.

### Paso 6 — Aplicar estilos de modo oscuro a los componentes

El modo oscuro se aplica por componente usando variantes `dark:` de Tailwind con la paleta `gray` incorporada. No hay variables CSS separadas para modo oscuro — cada componente especifica sus propios colores oscuros.

Usar este mapeo consistentemente en todos los componentes:

| Uso | Clara | Oscura |
|---|---|---|
| Fondo de página | `bg-cream` | `dark:bg-gray-900` |
| Tarjetas / encabezados | `bg-warm-white` | `dark:bg-gray-800` |
| Campos de input | `bg-cream` | `dark:bg-gray-700` |
| Bordes | `border-border` | `dark:border-gray-700` |
| Texto primario | `text-text` | `dark:text-gray-100` |
| Texto secundario | `text-muted` | `dark:text-gray-400` |

Ejemplo de tarjeta con modo oscuro:
```tsx
<div className="bg-warm-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-xl p-4">
  <h2 className="text-base font-semibold text-text dark:text-gray-100">Título</h2>
  <p className="mt-1 text-sm text-muted dark:text-gray-400">Descripción</p>
</div>
```

Ejemplo de input con modo oscuro:
```tsx
<input
  type="text"
  className="w-full rounded-xl border border-border dark:border-gray-600 bg-cream dark:bg-gray-700 px-4 py-3 text-sm text-text dark:text-gray-100 outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
/>
```

Para elementos con colores de estado semánticos (ej: estados de calendario), definir un registro con ambas clases clara y oscura:
```typescript
const STATUS_INFO = {
  active: {
    color: "text-emerald-800 bg-emerald-100",
    darkColor: "dark:text-emerald-300 dark:bg-emerald-900/40",
  },
};

// Uso:
<span className={`${status.color} ${status.darkColor}`}>{status.label}</span>
```

## Limpieza al cerrar sesión / eliminar cuenta

Cuando un usuario cierra sesión o elimina su cuenta, limpiar el tema de localStorage para que el siguiente usuario empiece limpio:

```typescript
localStorage.removeItem("app-theme");
```

## Mejoras opcionales

### Prevenir FOUC (Flash de contenido sin estilo)

**No se necesita script inline ni `useLayoutEffect`.** El comportamiento sin flash entre navegaciones de página viene de la arquitectura de routing SPA, no de trucos de temporización. Tres condiciones deben cumplirse:

1. **ThemeProvider debe ser un componente hoja.** Debe retornar `null` y montarse auto-cerrado (`<ThemeProvider />`). Nunca envolver `{children}` dentro de él. Si ThemeProvider envuelve hijos, se convierte parte del árbol de reconciliación de React para cambios de ruta — cualquier re-evaluación RSC del layout raíz (ej: de un layout `render: 'dynamic'` más profundo en el árbol) puede causar que el componente se remonte o que su `useEffect` se re-ejecute, perdiendo brevemente la clase `.dark` y produciendo un flash. Un componente hoja permanece aislado de la reconciliación de rutas.

2. **Usar `<head />` auto-cerrado en `_root.tsx`.** Waku incluye el subárbol completo `<html>` → `<head>` en el payload RSC cuando `<head>` tiene hijos explícitos. Durante la navegación del lado del cliente, React reconcilia este payload y puede sobrescribir la clase `.dark` en `<html>`. Con `<head />` (auto-cerrado), Waku delega la gestión del head al framework y excluye el árbol raíz de la reconciliación RSC, preservando la clase `.dark` en todas las navegaciones.

3. **`<html>` NO debe tener `className`.** Incluso con `<head />`, si `<html>` tiene una prop `className`, React la establecerá en el elemento real durante la reconciliación inicial, interfiriendo potencialmente con la clase `.dark`. Remover todo `className` de `<html>`; poner cualquier clase de layout necesaria en `<body>` en su lugar.

4. **Mover metadata del head a `_layout.tsx`.** Poner `<meta>`, `<link>`, `<title>` e importaciones de CSS en `_layout.tsx` como hijos de React Fragment (`<>`). React 19 automáticamente sube estos a `<head>` sin involucrar el árbol raíz en la reconciliación RSC.

5. **ThemeProvider vive en el layout raíz.** Montarlo fuera del límite de ruta (en el componente del layout raíz, no en componentes a nivel de página) para que nunca se desmonte durante la navegación. Su `useEffect` permanece activo en todas las transiciones de página.

Patrón de montaje correcto:
```tsx
// _root.tsx — mínimo, sin className, head auto-cerrado
export default function RootElement({ children }) {
  return (
    <html lang="es">
      <head />                          {/* auto-cerrado — Waku lo gestiona */}
      <body className="min-h-screen">
        <ThemeProvider />               {/* hoja, auto-cerrado, sin hijos */}
        <Toaster />
        {children}
      </body>
    </html>
  );
}

// _layout.tsx — metadata del head + importación de CSS
export default function RootLayout({ children }) {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <title>Mi App</title>
      {children}
    </>
  );
}
```

Patrones de montaje incorrectos que causan flash en navegación SPA:
```tsx
<html className="min-h-screen">      {/* React sobrescribe className → remueve .dark */}
  <head>
    <meta ... />                      {/* head explícito — Waku incluye raíz en payload RSC */}
    <title>Mi App</title>
  </head>
  <body>
    <ThemeProvider>                   {/* wrapper — se convierte parte de reconciliación de ruta */}
      {children}
    </ThemeProvider>
  </body>
</html>
```

Usar `useLayoutEffect` (no `useEffect`) en el ThemeProvider. Esto es crítico para páginas `render: 'dynamic'`: navegar a ellas dispara un re-render del servidor RSC que puede remontar el ThemeProvider en el cliente. `useLayoutEffect` aplica la clase `.dark` sincrónicamente durante la fase de commit de React, antes de que el navegador pinte. Con `useEffect`, el re-mount causaría un flash visible `dark → light → dark` porque el efecto se ejecuta asíncronamente después de pintar.

El flash de carga inicial (hard refresh) se enmascara por el estado de carga de la app (ej: un placeholder "Verificando sesión...") en vez de un script inline. `useLayoutEffect` no causa advertencias de hidratación de SSR porque `ThemeProvider` retorna `null` — no hay DOM que no coincida entre servidor y cliente.

### Detectar preferencia del SO

Para respetar la preferencia de tema del sistema del usuario, agregar una opción `'system'` junto a `'light'` y `'dark'` en el store. Un helper `resolveTheme()` convierte `'system'` a un valor concreto consultando `matchMedia`:

```typescript
type Theme = 'light' | 'dark' | 'system';

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
```

El `ThemeProvider` llama a `resolveTheme()` en su `useEffect` y, cuando `theme === 'system'`, agrega un listener de cambio de `matchMedia` para que el DOM se actualice en vivo cuando el usuario cambia el tema del SO. Establecer el store por defecto a `'system'` para que los nuevos visitantes sigan automáticamente la preferencia de su SO.

### Alternativa: Variables CSS para modo oscuro

En vez de utilidades `dark:`, se pueden definir variables CSS que cambian con la clase `.dark`:

```css
:root {
  --bg-primary: #fff5f7;
  --text-primary: #4a4a4a;
}
.dark {
  --bg-primary: #111827;
  --text-primary: #f3f4f6;
}
```

Luego usarlas en Tailwind v4: `bg-[var(--bg-primary)]`. Esto centraliza los colores oscuros pero requiere que todos los componentes usen las clases basadas en variables.

## Checklist

- [ ] Instalar `zustand` y `tailwindcss` v4 con `@tailwindcss/vite`
- [ ] Configurar `@custom-variant dark` en el archivo CSS principal
- [ ] Definir variables de color en `@theme`
- [ ] Crear `themeStore.ts` con `persist` y `safeStorage`
- [ ] Crear `ThemeProvider.tsx` con `useEffect`
- [ ] Montar `<ThemeProvider />` en la raíz de la app
- [ ] Crear el componente toggle
- [ ] Aplicar variantes `dark:` a todos los componentes
- [ ] Montar ThemeProvider en el layout raíz (fuera del límite de ruta) — previene FOUC entre navegaciones de página sin scripts inline
- [ ] (Opcional) Agregar detección de `prefers-color-scheme`
- [ ] Limpiar localStorage al cerrar sesión / eliminar cuenta
- [ ] Auditar todos los componentes para cobertura de modo oscuro
