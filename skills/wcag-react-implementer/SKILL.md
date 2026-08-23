---
name: wcag-react-implementer
description: Implement WCAG 2.2 Level AA accessibility fixes in React + TypeScript + Tailwind CSS projects. Use when the user asks to add or fix accessibility (a11y), ARIA labels, screen reader support, keyboard navigation, focus management, accessible modals/dialogs, form error announcements, or when code uses <div>/<span> as interactive elements. Triggers include "fix accessibility", "aria labels", "screen reader", "a11y", "lector de pantalla", "accesibilidad", "WCAG".
---

# WCAG React Implementer

Systematic implementation of WCAG 2.2 Level AA accessibility patterns for React + TypeScript + Tailwind CSS codebases, including all ARIA attributes, keyboard navigation, focus management, and screen reader announcements.

## When to Use This Skill

- Fixing `<div>` or `<span>` elements used as interactive controls (buttons, links)
- Adding ARIA roles, states, and properties to existing components
- Making modals/dialogs fully accessible (focus trap, Escape key, role=dialog)
- Implementing live regions for error messages and status announcements
- Adding accessible labels to form fields, loading buttons, icon-only controls
- Making radio/checkbox groups semantically grouped with `<fieldset><legend>`
- Implementing `focusRing` utilities for visible keyboard focus indicators
- Auditing and fixing contrast, touch target size, and focus visibility issues
- Annotating external links with screen-reader-only "opens in new tab" text

---

## Phase 1 — Audit

Before implementing, read all relevant files and produce a prioritized table:

| Priority | WCAG | Issue | File | Description |
|---|---|---|---|---|
| High (A) | 2.1.1 | No keyboard access | Component.tsx | `<div onClick>` without keyboard handler |
| High (A) | 4.1.2 | Missing role | Modal.tsx | Dialog `<div>` without `role="dialog"` |
| High (A) | 1.3.1 | No group label | Form.tsx | Radio buttons not inside `<fieldset>` |
| Med (AA) | 2.4.7 | No focus ring | Button.tsx | `focus:outline-none` without replacement |
| Med (AA) | 1.4.3 | Low contrast | Button.tsx | `bg-yellow-300 text-white` fails 4.5:1 |
| Med (AA) | 2.5.8 | Small target | Button.tsx | Button height < 44px |

---

## Phase 2 — Utility First

Always create/verify `src/utils/a11y.ts` before implementing fixes:

```ts
/**
 * Devuelve clases de Tailwind para el anillo de foco visible por teclado.
 * Usa focus-visible: para no mostrar el anillo en interacciones táctiles.
 * Las clases son strings completos para que Tailwind las detecte en el escaneo estático.
 *
 * @param colorRing - Color del anillo de foco: 'red' (por defecto) o 'amber'
 * @returns String de clases de Tailwind
 *
 * @example
 * <button className={focusClassName('amber')}>Guardar</button>
 */
export function focusClassName(colorRing: 'red' | 'amber' = 'red'): string {
  // Strings completamente estáticos: Tailwind necesita clases literales para incluirlas en el
  // CSS compilado. Cualquier template literal con variable hace que el scanner las omita.
  if (colorRing === 'red') {
    return 'outline-none rounded font-semibold tracking-wide transition-all duration-500 ease-out hover:ring-4 hover:ring-amber-300 focus-visible:ring-4 focus-visible:ring-red-600 focus-visible:ring-offset-1';
  }
  return 'outline-none rounded font-semibold tracking-wide transition-all duration-500 ease-out hover:ring-4 hover:ring-amber-300 focus-visible:ring-4 focus-visible:ring-amber-300 focus-visible:ring-offset-1';
}
```

Add to global CSS (e.g. `src/styles/index.css`):

```css
/* WCAG 2.4.7 — fallback focus indicator for browsers that don't support :focus-visible */
:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

/* WCAG 1.4.12 / 2.3.3 — respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Phase 3 — Pattern Implementations

### Pattern A — Modal / Dialog (WCAG 2.1.2, 4.1.2)

**Problem**: `<div>` overlay without role, no Escape key, no focus management.

```tsx
import { useEffect, useId, useRef } from 'react';
import { focusRing } from '../utils/a11y';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AccessibleModal({ isOpen, onClose, title, children }: ModalProps) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // WCAG 2.4.3: Move focus to modal on open
    closeBtnRef.current?.focus();
    // WCAG 2.1.2: Close on Escape
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Backdrop: aria-hidden so screen readers skip the overlay itself
    <div
      aria-hidden="true"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* WCAG 4.1.2: role=dialog + aria-modal + aria-labelledby */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden="false"
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        {/* WCAG 2.4.6: Visible heading tied to dialog label */}
        <h2 id={titleId} className="text-xl font-bold mb-4 pr-10">{title}</h2>

        {/* Close button in top-right corner */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar diálogo"
          className={`absolute top-3 right-3 min-h-11 px-3 rounded ${focusRing()}`}
        >
          <span aria-hidden="true">✕</span>
        </button>

        {children}

        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className={`bg-gray-600 text-white px-4 py-2 rounded min-h-11 ${focusRing('white')}`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Key rules**:
- Backdrop `div` gets `aria-hidden="true"` — screen readers never see it
- Inner dialog `div` gets `role="dialog" aria-modal="true" aria-labelledby={id} aria-hidden="false"`
- `useId()` for unique title ID (required when multiple dialogs can exist)
- `useRef` on close button → `.focus()` on open
- `useEffect` adds `keydown` listener for Escape
- `onClick` on backdrop → close; inner div stops propagation
- Close button: `aria-label` + `<span aria-hidden="true">✕</span>`

---

### Pattern B — Accessible Form (WCAG 1.3.1, 1.3.5, 4.1.2)

```tsx
import { focusRing } from '../utils/a11y';

export function AccessibleForm() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    // noValidate: disable browser default validation UI — we handle it ourselves
    <form onSubmit={handleSubmit} noValidate>
      {/* WCAG 4.1.3: role=alert announces errors to screen readers immediately */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="bg-red-100 text-red-700 px-4 py-3 rounded"
        >
          {error}
        </div>
      )}

      {/* Required field label pattern */}
      <label htmlFor="nombre">
        Nombre
        {/* aria-hidden hides the visual * from SR; sr-only provides the text */}
        <span aria-hidden="true" className="text-red-400 ml-1">*</span>
        <span className="sr-only">(requerido)</span>
      </label>
      <input
        id="nombre"
        type="text"
        required
        aria-required="true"
        className={`text-black bg-blue-100 rounded p-2 ${focusRing()}`}
      />

      {/* Optional field — no aria-required needed */}
      <label htmlFor="notas">Notas</label>
      <textarea
        id="notas"
        className={`text-black bg-blue-100 rounded p-2 ${focusRing()}`}
      />

      {/* Loading/submit button */}
      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        aria-disabled={isLoading}
        aria-label={isLoading ? 'Guardando, por favor espere' : 'Guardar'}
        className={`min-h-11 px-4 py-2 bg-blue-600 text-white rounded ${focusRing('white')}`}
      >
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

**Key rules**:
- `noValidate` on `<form>` — removes browser tooltip; your JS/aria handles errors
- Error container: `role="alert" aria-live="assertive" aria-atomic="true"` — assertive for errors that block progress; use `aria-live="polite"` for status/success
- Required fields: `aria-required="true"` on the input AND visual asterisk pattern with `aria-hidden="true"` + `sr-only`
- `aria-busy={isLoading}` + `aria-disabled={isLoading}` + dynamic `aria-label` on submit button

---

### Pattern C — Select & Grouped Inputs (WCAG 1.3.1)

**Radio / Checkbox groups MUST use `<fieldset>` + `<legend>`**:

```tsx
{/* WRONG ✕ */}
<div>
  <label>Modo:</label>
  <label><input type="radio" name="m" value="a" /> Opción A</label>
  <label><input type="radio" name="m" value="b" /> Opción B</label>
</div>

{/* CORRECT ✓ */}
<fieldset className="border-0 p-0 m-0">
  <legend className="font-semibold mb-1">Modo de vista</legend>
  <div className="flex gap-4">
    <label className="flex items-center gap-2">
      <input type="radio" name="viewMode" value="cards" />
      Tarjetas
    </label>
    <label className="flex items-center gap-2">
      <input type="radio" name="viewMode" value="list" />
      Lista
    </label>
  </div>
</fieldset>

{/* sr-only legend when visual context already provides the label */}
<fieldset className="border-0 p-0 m-0">
  <legend className="sr-only">Preferencias de notificación</legend>
  ...
</fieldset>
```

**Select with accessible label**:

```tsx
<label htmlFor="producto">
  Producto
  <span aria-hidden="true" className="text-red-400 ml-1">*</span>
  <span className="sr-only">(requerido)</span>
</label>
<select
  id="producto"
  aria-required="true"
  required
  className={`text-black rounded p-2 ${focusRing()}`}
>
  <option value="">-- Seleccione un producto --</option>
  {productos.map(p => (
    <option key={p.id} value={p.id}>{p.nombre}</option>
  ))}
</select>
```

---

### Pattern D — Accessible Toast / Live Region (WCAG 4.1.3)

Use these rules when choosing between `assertive` and `polite`:

| Situation | aria-live | When to use |
|---|---|---|
| Error bloqueante | `assertive` | Error que impide continuar (validación, red) |
| Estado de carga | `polite` | "Cargando...", "Guardando..." |
| Éxito / confirmación | `polite` | "¡Guardado correctamente!" |
| Alerta destructiva | `assertive` | "El archivo será eliminado permanentemente" |

**Static error announcement pattern**:
```tsx
{/* Mounts immediately → screen reader announces right away */}
{error && (
  <p role="alert" aria-live="assertive" aria-atomic="true">
    {error}
  </p>
)}

{/* Status / success */}
{status && (
  <p role="status" aria-live="polite" aria-atomic="true">
    {status}
  </p>
)}
```

**Persistent live region with Sonner toast** — for libraries that render outside the component tree, add a visually hidden live region and mirror the message:
```tsx
const [announcement, setAnnouncement] = useState('');

function showSuccess(msg: string) {
  toast.success(msg);           // visual toast
  setAnnouncement(msg);         // SR announcement
  setTimeout(() => setAnnouncement(''), 5000);
}

return (
  <>
    {/* sr-only live region — always in the DOM */}
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
    ...
  </>
);
```

---

### Pattern E — Accordion (WCAG 4.1.2, 2.1.1)

```tsx
function Accordion({ items }: { items: { title: string; content: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => {
        const panelId = `panel-${i}`;
        const headerId = `header-${i}`;
        const isOpen = openIndex === i;

        return (
          <div key={i} className="border-b">
            {/* WCAG 4.1.2: button controls the panel */}
            <h3>
              <button
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className={`w-full text-left py-3 px-4 font-semibold min-h-11 ${focusRing()}`}
              >
                {item.title}
                {/* Visual indicator — hidden from SR since aria-expanded carries the state */}
                <span aria-hidden="true" className="ml-2">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>
            </h3>

            {/* Panel: hidden from SR and keyboard when closed */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className="px-4 py-3"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**Key rules**:
- Trigger is always a `<button>` (never `<div>` or `<h*>` directly)
- `aria-expanded={boolean}` on the button
- `aria-controls={panelId}` on the button; `aria-labelledby={headerId}` on the panel
- Use `hidden` attribute (not `display:none` via JS) — screen readers respect `hidden` natively
- Visual arrow: `aria-hidden="true"` so SR doesn't say "triangle down"

---

### Pattern F — span/div → button (WCAG 2.1.1, 4.1.2)

**Never use non-interactive elements as buttons**:

```tsx
{/* WRONG ✕ — not keyboard accessible, no role, no enter/space */}
<span onClick={handleClick}>Agregar Cliente</span>
<div onClick={handleClick}>Ver más</div>
<p role="button" onClick={handleClick}>Volver</p>

{/* CORRECT ✓ */}
<button
  type="button"
  onClick={handleClick}
  className={`... min-h-11 ${focusRing()}`}
>
  Agregar Cliente
</button>

{/* CORRECT ✓ — navigation */}
<button
  type="button"
  onClick={() => navigate('/ruta')}
  className={`... min-h-11 ${focusRing()}`}
>
  Agregar Cliente
</button>
```

**`<a>` vs `<button>` rule**:
- Use `<a href="...">` for links that navigate to URLs (internal routes or external)
- Use `<button>` for everything that triggers an action (open modal, submit, toggle)

---

### Pattern G — External Links (WCAG 2.4.4)

```tsx
{/* CORRECT ✓ — screen reader hears "Ver en YouTube (abre en nueva pestaña)" */}
<a
  href="https://youtube.com/..."
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Ver tutorial de Llenar Keg (abre en nueva pestaña)"
  className={`... ${focusRing()}`}
>
  Ver tutorial
  <span className="sr-only">(abre en nueva pestaña)</span>
</a>

{/* Shorter pattern when link text is already descriptive */}
<a
  href={wazeUrl}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`Navegar a ${cliente.nombre} en Waze (abre en nueva pestaña)`}
  className={focusRing()}
>
  Waze
  <span className="sr-only">(abre en nueva pestaña)</span>
</a>
```

---

### Pattern H — Image / Icon Buttons (WCAG 1.1.1)

```tsx
{/* Decorative image inside button — hide image, label the button */}
<button
  type="button"
  aria-label="Actualizar datos"
  onClick={handleUpdate}
  className={`min-h-11 ${focusRing()}`}
>
  <img src="/icon-refresh.svg" alt="" aria-hidden="true" />
</button>

{/* Meaningful image — use alt text */}
<img src="/logo.png" alt="SuperKeg — gestión de kegs de cerveza" />

{/* Decorative image — empty alt forces SR to skip it */}
<img src="/decoration.svg" alt="" aria-hidden="true" />
```

---

### Pattern I — Navigation Landmarks (WCAG 1.3.6, 2.4.1)

```tsx
{/* Skip link — first focusable element on the page */}
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
             focus:z-[9999] focus:px-4 focus:py-2 focus:bg-sky-700 focus:text-white
             focus:rounded focus:shadow-lg"
>
  Saltar al contenido principal
</a>

{/* Main navigation */}
<nav aria-label="Navegación principal">
  <ul role="list">
    {links.map(link => (
      <li key={link.to}>
        <a
          href={link.to}
          aria-current={currentPath === link.to ? 'page' : undefined}
          className={focusRing()}
        >
          {link.label}
        </a>
      </li>
    ))}
  </ul>
</nav>

{/* Main content target */}
<main id="main-content" tabIndex={-1} className="focus-visible:outline-none">
  ...
</main>
```

---

### Pattern J — Table / List Accessibility (WCAG 1.3.1)

```tsx
{/* Data table */}
<table>
  <caption className="sr-only">Lista de clientes con sus kegs asignados</caption>
  <thead>
    <tr>
      <th scope="col">Cliente</th>
      <th scope="col">Kegs</th>
      <th scope="col">
        <span className="sr-only">Acciones</span>
      </th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr key={item.id}>
        <td>{item.nombre}</td>
        <td>{item.kegs}</td>
        <td>
          {/* aria-label identifies WHICH item the button acts on */}
          <button
            aria-label={`Editar ${item.nombre}`}
            className={`... ${focusRing()}`}
          >
            Editar
          </button>
          <button
            aria-label={`Eliminar ${item.nombre}`}
            className={`... ${focusRing()}`}
          >
            Eliminar
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### Pattern K — Loading States & Busy Regions (WCAG 4.1.3, 2.2.1)

```tsx
{/* Button with loading state */}
<button
  type="submit"
  disabled={isLoading}
  aria-busy={isLoading}
  aria-disabled={isLoading}
  aria-label={
    isLoading
      ? 'Actualizando keg, por favor espere'
      : 'Actualizar Keg'
  }
  className={`... min-h-11 ${focusRing('white')}`}
>
  {isLoading ? 'Actualizando...' : 'Actualizar Keg'}
</button>

{/* Section-level busy state */}
<section aria-busy={isLoading} aria-label="Lista de productos">
  {isLoading ? <Spinner /> : <ProductList />}
</section>
```

---

## Phase 4 — Contrast & Touch Target Checklist

### Color Contrast (WCAG 1.4.3 — 4.5:1 for body text, 3:1 for large text)

Common Tailwind pairs and their compliance for **normal text (< 18px not bold)**:

| Background | Text | Ratio | Status |
|---|---|---|---|
| `bg-sky-800` | `text-white` | 9.1:1 | ✓ AA + AAA |
| `bg-green-600` | `text-white` | 5.7:1 | ✓ AA |
| `bg-blue-700` | `text-white` | 7.2:1 | ✓ AA + AAA |
| `bg-red-700` | `text-white` | 6.2:1 | ✓ AA |
| `bg-amber-300` | `text-black` | 11.5:1 | ✓ AA + AAA |
| `bg-yellow-500` | `text-black` | 6.1:1 | ✓ AA |
| `bg-green-400` | `text-white` | 2.8:1 | ✕ FAIL — use `bg-green-600` |
| `bg-red-400` | `text-white` | 3.0:1 | ✕ FAIL — use `bg-red-600` |
| `bg-blue-400` | `text-white` | 2.7:1 | ✕ FAIL — use `bg-blue-700` |
| `bg-yellow-300` | `text-white` | 1.5:1 | ✕ FAIL — use `text-black` |

### Touch Targets (WCAG 2.5.8 — 24×24px minimum, 2.5.5 AAA — 44×44px)

```tsx
{/* Minimum (AA) — 24px */}
className="min-h-6 min-w-6"

{/* Recommended (AAA) — 44px — use this by default */}
className="min-h-11 min-w-11"   // Tailwind: min-h-11 = 44px
```

**Rule**: All interactive elements (buttons, links, inputs) must have `min-h-11` unless space is deliberately constrained (e.g. inline icon in dense table).

---

## Phase 5 — Audit Output Format

After completing fixes, generate this summary:

```
## Accessibility Audit — Post-Fix Report

### Fixed (N issues)
| WCAG | Component | Fix Applied |
|---|---|---|
| 2.1.1 | BotonAyudaVideos | Modal closes on Escape key |
| 4.1.2 | Clientes | <span onClick> → <button type="button"> |
| 1.3.1 | Clientes | Radio buttons wrapped in <fieldset><legend> |
| 2.4.3 | BotonAyudaVideos | Focus moves to close button on modal open |
| 4.1.3 | FormularioLlenarKeg | Error div has role="alert" aria-live="assertive" |
| 1.4.3 | SeleccionAccion | Button colors changed to meet 4.5:1 contrast ratio |
| 2.5.8 | All buttons | Added min-h-11 (44px touch target) |
| 2.4.7 | All interactive | focusRing() utility applied |

### Still Pending (if any)
- Issue X: Requires third-party library fix or design decision
```

---

## Critical Rules (Never Break)

1. **Never use `onClick` alone** on a non-interactive element — always convert to `<button>` or `<a>`
2. **Never use `aria-hidden="true"` on focused elements** — this creates keyboard traps
3. **`role="dialog"` requires `aria-labelledby` or `aria-label`**
4. **`aria-live` regions must be in the DOM before content changes** — mount them empty, then update
5. **`aria-required` does NOT replace the HTML `required` attribute** — use both
6. **Do NOT use `tabIndex={0}`** on elements that already receive focus natively (buttons, inputs, links)
7. **`useId()` for any ID that identifies relationship** between elements (`htmlFor`, `aria-labelledby`, `aria-controls`, `aria-describedby`) — prevents duplicates in lists
8. **`aria-disabled` ≠ `disabled`** — `disabled` removes the element from tab order; `aria-busy` + `aria-disabled` keeps it in tab order while communicating the busy state
9. **`noValidate` on every form** where you handle validation manually
10. **`alt=""` on decorative images** — not `alt="decorative"` or missing; empty string tells SR to skip
11. **`aria-live` must be on a container, never on `<img>` or void elements** — placing it on `<img src="loader.svg" aria-live="polite">` is silently ignored by all screen readers; move the attribute to the wrapping `<p>` or `<div>`
12. **`aria-label` values must use natural language** — hyphens and underscores are verbalized literally; `aria-label="Contact-Form"` reads as "Contact hyphen Form"; use `aria-label="Contact Form"`
13. **Opacity modifiers lower contrast** — `text-gray-300/60` on a dark background is NOT the same ratio as `text-gray-300`; always calculate contrast on the blended color: `effective = opacity * fg + (1-opacity) * bg`
14. **Links on dark backgrounds need lighter blue values** — `text-blue-600` (#2563eb) on near-black yields ~3.78:1 (fails AA for normal text); use `text-blue-300` or `text-blue-400` instead

---

## Pattern E — Accessible Live Chat / Chatbot (WCAG 4.1.2, 4.1.3, 2.1.2)

```tsx
import { useId, useRef, useState, useEffect } from 'react';
import { focusClassName } from '../utils/a11y';

export function AccessibleChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const titleId = useId();
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // WCAG 2.4.3: focus management — input on open, toggle button on close
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    else if (!isOpen) toggleBtnRef.current?.focus();
  }, [isOpen]);

  // WCAG 2.1.2: Escape closes the dialog
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  return (
    <>
      {/* WCAG 4.1.3: announce open/close to screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isOpen ? 'Chat abierto' : ''}
      </div>

      {/* Toggle button */}
      <button
        ref={toggleBtnRef}
        onClick={() => setIsOpen(p => !p)}
        aria-label="Abrir chat de asistencia"
        aria-expanded={isOpen}
        aria-controls="chat-window"
        type="button"
        className={focusClassName('amber')}
      >
        {/* icon */}
      </button>

      {/* Chat window — WCAG 4.1.2: role=dialog + aria-modal */}
      <div
        ref={dialogRef}
        id="chat-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!isOpen}
        className={isOpen ? '' : 'hidden'}
      >
        <h3 id={titleId}>Asistente Virtual</h3>

        {/* WCAG 4.1.3: role=log for chat transcript */}
        <div
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Mensajes del chat"
        >
          {messages.map((msg, i) => (
            <div key={i}>
              <p>{msg.content}</p>
            </div>
          ))}

          {/* WCAG 4.1.3: role=status for loading indicator */}
          {isLoading && (
            <div role="status" aria-label="El asistente está escribiendo">
              {/* animated dots */}
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={() => {}}>
          <input
            ref={inputRef}
            type="text"
            aria-label="Escribe tu mensaje"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} aria-label="Enviar mensaje">
            {/* send icon */}
          </button>
        </form>
      </div>
    </>
  );
}
```

**Key rules for live chat**:
- `role="log"` (not `role="region"`) on the messages container — screen readers know it's a transcript
- `aria-live="polite" aria-relevant="additions"` — only new messages are announced, not edits
- `role="status"` on the loading indicator — less intrusive than `role="alert"`
- `aria-live` announcement div (`sr-only`) for open/close state changes
- `aria-expanded` + `aria-controls` on the toggle button
- Focus goes to `inputRef` when chat opens; returns to `toggleBtnRef` when it closes

---

## Pattern F — Accessible Toast with Pause-on-Hover (WCAG 2.2.1, 4.1.3)

```tsx
import { useEffect, useRef, useId } from 'react';

interface ToastProps {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss: (id: string) => void;
}

export function AccessibleToast({ id, message, variant, duration = 5000, onDismiss }: ToastProps) {
  const msgId = useId();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);
  const startRef = useRef(Date.now());
  const remainingRef = useRef(duration);

  // WCAG 2.2.1: pausable timer
  function startTimer() {
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(id), remainingRef.current);
  }

  function pauseTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    remainingRef.current -= Date.now() - startRef.current;
    pausedRef.current = true;
  }

  function resumeTimer() {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    startTimer();
  }

  useEffect(() => {
    // errors never auto-dismiss
    if (variant !== 'error') startTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const variantLabel = { success: 'Éxito', error: 'Error', warning: 'Advertencia', info: 'Información' };

  return (
    <div
      // WCAG 4.1.3: assertive for errors, polite for everything else
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-describedby={msgId}
      // WCAG 2.2.1: pause timer on hover and focus
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocus={pauseTimer}
      onBlur={resumeTimer}
    >
      {/* Screen-reader-only variant label */}
      <span className="sr-only">{variantLabel[variant]}:</span>

      <p id={msgId}>{message}</p>

      <button
        onClick={() => onDismiss(id)}
        aria-label="Cerrar notificación"
        // WCAG 2.5.8: minimum 24x24px target
        className="min-w-11 min-h-11"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
```

**Key rules**:
- `role="alert"` + `aria-live="assertive"` for errors only; `role="status"` + `aria-live="polite"` for the rest
- `onMouseEnter`/`onFocus` pause the auto-dismiss timer (WCAG 2.2.1)
- `onMouseLeave`/`onBlur` resume — but errors never auto-dismiss
- `<span className="sr-only">` labels the variant type before the message text
- Dismiss button: `aria-label` + `aria-hidden` on the decorative × symbol
