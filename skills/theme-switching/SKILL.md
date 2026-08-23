---
name: theme-switching
description: Implement light/dark theme switching in React apps using Zustand for state management with localStorage persistence and Tailwind CSS v4 class-based dark mode. Use this skill whenever the user asks to add dark mode, theme toggle, light/dark mode, night mode, theme switching, color scheme switching, or a dark theme to a React project. Also use when the user mentions persisting theme preferences, SSR-safe theme stores, ThemeProvider components, or wants to convert an existing project to support dark mode. Triggers on phrases like "agregar modo oscuro", "cambiar tema", "dark mode", "toggle theme", "light/dark", "modo noche", even if the user doesn't explicitly say "skill" or "theme-switching".
---

# Theme Switching (Light/Dark Mode)

Implement a complete light/dark theme system in React apps using **Zustand** (state + persistence) + **ThemeProvider** (DOM sync) + **Tailwind CSS v4** (class-based dark mode).

## Architecture

The system works as follows: a Zustand store holds `isDark` and persists it to localStorage. A `ThemeProvider` component subscribes to the store and adds/removes the `dark` class on `<html>`. Tailwind's `dark:` variants activate based on that class. No React Context is needed — the Zustand store is the single source of truth, and any component can read the theme directly.

```
User clicks toggle
  → toggleTheme() updates isDark in Zustand store
  → persist middleware writes to localStorage
  → ThemeProvider re-renders, useEffect adds/removes "dark" class on <html>
  → Tailwind activates all dark: utilities
  → Components re-render with dark colors
```

## Dependencies

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

## Implementation steps

### Step 1 — Configure Tailwind v4 for class-based dark mode

Tailwind v4 is configured entirely in CSS (no `tailwind.config.js`). In the main CSS file:

```css
@import "tailwindcss";

/* Dark mode using the .dark class on <html> */
@custom-variant dark (&:where(.dark, .dark *));
```

The `@custom-variant` line defines the `dark:` variant so it activates when the element or any ancestor has the `.dark` class. This replaces Tailwind v3's `darkMode: 'class'` config.

Define color variables in an `@theme` block. These are for light mode only — dark mode colors come from `dark:` utilities in components, not from separate CSS variables:

```css
@theme {
  --color-cream: #fff5f7;
  --color-warm-white: #fffafa;
  --color-coral: #ff8c94;
  --color-text: #4a4a4a;
  --color-muted: #9b8fa0;
  --color-border: #edd9e5;
  /* Add your project's colors here */
}
```

Set base body styles. The body uses light-mode variables directly; dark backgrounds are applied per-page via `dark:` utilities:

```css
body {
  background-color: var(--color-cream);
  color: var(--color-text);
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
}
```

### Step 2 — Create the Zustand store with persistence

Create `src/store/themeStore.ts`:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// SSR-safe storage: returns no-ops when window is undefined (server render)
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
      name: "app-theme", // localStorage key — change to your project's name
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

Key design decisions:
- **`safeStorage`** prevents crashes during SSR. If the project doesn't use SSR, replace with `createJSONStorage(() => localStorage)`.
- **`isDark: boolean`** is the single source of truth. `false` = light, `true` = dark.
- **`toggleTheme()`** flips the boolean — this is what the toggle button calls.
- **`setDark(value)`** sets the theme explicitly — useful for detecting OS preference.
- **`persist`** automatically syncs the store to localStorage under the given key.
- **`migrate`** handles version upgrades so existing users get sensible defaults.

Any component can access the theme reactively:
```typescript
const { isDark, toggleTheme } = useThemeStore();
```

### Step 3 — Create the ThemeProvider component

Create `src/components/ui/ThemeProvider.tsx`:

```typescript
"use client";

import { useLayoutEffect } from "react";
import { useThemeStore } from "../../store/themeStore";

const STORAGE_KEY = "app-theme";

// Reads the persisted theme directly from localStorage.
// Fallback for when Zustand persists hasn't rehydrated yet.
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
    // If store hasn't rehydrated, read localStorage synchronously
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

This component renders nothing — it exists purely for its side effect. It subscribes to `isDark` and, whenever it changes, adds or removes the `dark` class on `document.documentElement` (the `<html>` element). The `"use client"` directive is needed for SSR frameworks (Waku, Next.js); omit it if not using SSR.

Use `useLayoutEffect` (not `useEffect`). In RSC frameworks (Waku, Next.js), navigating to `render: 'dynamic'` pages can cause the server to re-render the root tree, which may remount the ThemeProvider on the client. `useLayoutEffect` applies the `.dark` class synchronously during React's commit phase, before the browser paints, preventing the flash. See "Prevent FOUC" below.

### Step 4 — Mount ThemeProvider at the app root

Mount the provider once, inside `<body>`, in the root layout:

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

### Step 5 — Create the theme toggle UI

A pill-shaped switch button. Extract it into its own component or inline it:

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

The toggle uses `aria-pressed={isDark}` for accessibility (indicates on/off state to screen readers). The white circle slides via `translate-x-5` / `translate-x-0` with a 200ms transition. Adjust the colors (`bg-coral`, `bg-border`) to match the project's palette.

### Step 6 — Apply dark mode styles to components

Dark mode is applied per-component using Tailwind `dark:` variants with the built-in `gray` palette. There are no separate dark-mode CSS variables — each component specifies its own dark colors.

Use this mapping consistently across all components:

| Usage | Light class | Dark class |
|---|---|---|
| Page background | `bg-cream` | `dark:bg-gray-900` |
| Cards / headers | `bg-warm-white` | `dark:bg-gray-800` |
| Input fields | `bg-cream` | `dark:bg-gray-700` |
| Borders | `border-border` | `dark:border-gray-700` |
| Primary text | `text-text` | `dark:text-gray-100` |
| Secondary text | `text-muted` | `dark:text-gray-400` |

Example card with dark mode:
```tsx
<div className="bg-warm-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-xl p-4">
  <h2 className="text-base font-semibold text-text dark:text-gray-100">Title</h2>
  <p className="mt-1 text-sm text-muted dark:text-gray-400">Description</p>
</div>
```

Example input with dark mode:
```tsx
<input
  type="text"
  className="w-full rounded-xl border border-border dark:border-gray-600 bg-cream dark:bg-gray-700 px-4 py-3 text-sm text-text dark:text-gray-100 outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
/>
```

For elements with semantic status colors (e.g. calendar states), define a record with both light and dark classes:
```typescript
const STATUS_INFO = {
  active: {
    color: "text-emerald-800 bg-emerald-100",
    darkColor: "dark:text-emerald-300 dark:bg-emerald-900/40",
  },
};

// Usage:
<span className={`${status.color} ${status.darkColor}`}>{status.label}</span>
```

## Cleanup on logout / account deletion

When a user logs out or deletes their account, clear the theme from localStorage so the next user starts fresh:

```typescript
localStorage.removeItem("app-theme");
```

## Optional improvements

### Prevent FOUC (Flash of Unstyled Content)

**No inline script or `useLayoutEffect` is needed.** The no-flash behavior between page navigations comes from the SPA routing architecture, not from timing tricks. Three conditions must be met:

1. **ThemeProvider must be a leaf component.** It must return `null` and be mounted self-closing (`<ThemeProvider />`). Never wrap `{children}` inside it. If ThemeProvider wraps children, it becomes part of React's reconciliation tree for route changes — any RSC re-evaluation of the root layout (e.g. from a `render: 'dynamic'` layout deeper in the tree) can cause the component to re-mount or its `useEffect` to re-execute, briefly losing the `.dark` class and producing a flash. A leaf component stays isolated from route reconciliation.

2. **Use `<head />` self-closing in `_root.tsx`.** Waku includes the full `<html>` → `<head>` subtree in the RSC payload when `<head>` has explicit children. During client-side navigation, React reconciles this payload and may overwrite the `.dark` class on `<html>`. With `<head />` (self-closing), Waku delegates head management to the framework and excludes the root tree from RSC reconciliation, preserving the `.dark` class across all navigations.

3. **`<html>` must NOT have `className`.** Even with `<head />`, if `<html>` has a `className` prop, React will set it on the real element during initial reconciliation, potentially interfering with the `.dark` class. Remove all `className` from `<html>`; put any needed layout classes on `<body>` instead.

4. **Move head metadata to `_layout.tsx`.** Put `<meta>`, `<link>`, `<title>`, and CSS imports in `_layout.tsx` as React Fragment children (`<>`). React 19 automatically hoists these to `<head>` without involving the root tree in RSC reconciliation.

5. **ThemeProvider lives in the root layout.** Mount it outside the route boundary (in the root layout component, not in page-level components) so it never unmounts during navigation. Its `useEffect` stays active across all page transitions.

Correct mounting pattern:
```tsx
// _root.tsx — minimal, no className, self-closing head
export default function RootElement({ children }) {
  return (
    <html lang="es">
      <head />                          {/* self-closing — Waku manages it */}
      <body className="min-h-screen">
        <ThemeProvider />               {/* leaf, self-closing, no children */}
        <Toaster />
        {children}
      </body>
    </html>
  );
}

// _layout.tsx — head metadata + CSS import
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

Wrong mounting patterns that cause flash on SPA navigation:
```tsx
<html className="min-h-screen">      {/* React overwrites className → removes .dark */}
  <head>
    <meta ... />                      {/* explicit head — Waku includes root in RSC payload */}
    <title>Mi App</title>
  </head>
  <body>
    <ThemeProvider>                   {/* wrapper — becomes part of route reconciliation */}
      {children}
    </ThemeProvider>
  </body>
</html>
```

Use `useLayoutEffect` (not `useEffect`) in the ThemeProvider. This is critical for `render: 'dynamic'` pages: navigating to them triggers an RSC server re-render that may remount the ThemeProvider on the client. `useLayoutEffect` applies the `.dark` class synchronously during React's commit phase, before the browser paints. With `useEffect`, the re-mount would cause a visible `dark → light → dark` flash because the effect runs asynchronously after paint.

The initial-load flash (hard refresh) is masked by the app's loading state (e.g. a "Verifying session…" placeholder) rather than by an inline script. `useLayoutEffect` does not cause SSR hydration warnings because `ThemeProvider` returns `null` — there is no DOM to mismatch on the server vs. client.

### Detect OS preference

To respect the user's system theme preference, add a `'system'` option to the store alongside `'light'` and `'dark'`. A `resolveTheme()` helper converts `'system'` to a concrete value by querying `matchMedia`:

```typescript
type Theme = 'light' | 'dark' | 'system';

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
```

The `ThemeProvider` calls `resolveTheme()` in its `useEffect` and, when `theme === 'system'`, adds a `matchMedia` change listener so the DOM updates live when the user toggles their OS theme. Default the store to `'system'` so new visitors follow their OS preference automatically.

### Alternative: CSS variables for dark mode

Instead of `dark:` utilities, you can define CSS variables that change with the `.dark` class:

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

Then use them in Tailwind v4: `bg-[var(--bg-primary)]`. This centralizes dark colors but requires all components to use the variable-based classes.

## Checklist

- [ ] Install `zustand` and `tailwindcss` v4 with `@tailwindcss/vite`
- [ ] Configure `@custom-variant dark` in the main CSS file
- [ ] Define color variables in `@theme`
- [ ] Create `themeStore.ts` with `persist` and `safeStorage`
- [ ] Create `ThemeProvider.tsx` with `useEffect`
- [ ] Mount `<ThemeProvider />` at the app root
- [ ] Create the toggle component
- [ ] Apply `dark:` variants to all components
- [ ] Mount ThemeProvider in root layout (outside route boundary) — prevents FOUC between page navigations without inline scripts
- [ ] (Optional) Add `prefers-color-scheme` detection
- [ ] Clear localStorage on logout / account deletion
- [ ] Audit all components for dark mode coverage
