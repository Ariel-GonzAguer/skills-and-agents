# Detailed reference

This material was moved from `SKILL.md` to keep the loaded workflow focused.

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
{/* WRONG ❌ */}
<div>
  <label>Modo:</label>
  <label><input type="radio" name="m" value="a" /> Opción A</label>
  <label><input type="radio" name="m" value="b" /> Opción B</label>
</div>

{/* CORRECT ✅ */}
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
{/* WRONG ❌ — not keyboard accessible, no role, no enter/space */}
<span onClick={handleClick}>Agregar Cliente</span>
<div onClick={handleClick}>Ver más</div>
<p role="button" onClick={handleClick}>Volver</p>

{/* CORRECT ✅ */}
<button
  type="button"
  onClick={handleClick}
  className={`... min-h-11 ${focusRing()}`}
>
  Agregar Cliente
</button>

{/* CORRECT ✅ — navigation */}
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
{/* CORRECT ✅ — screen reader hears "Ver en YouTube (abre en nueva pestaña)" */}
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
