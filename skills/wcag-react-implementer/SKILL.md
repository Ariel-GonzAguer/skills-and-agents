---
name: wcag-react-implementer
description: Implementa correcciones de accesibilidad WCAG 2.2 Nivel AA en proyectos React + TypeScript + Tailwind CSS. Usar cuando el usuario pida agregar o corregir accesibilidad (a11y), etiquetas ARIA, soporte para lectores de pantalla, navegación por teclado, gestión de foco, modales/diálogos accesibles, anuncios de errores en formularios, o cuando el código use <div>/<span> como elementos interactivos. Activa con "corregir accesibilidad", "etiquetas aria", "lector de pantalla", "a11y", "accesibilidad", "WCAG".
---

# Implementador WCAG para React

Implementación sistemática de patrones de accesibilidad WCAG 2.2 Nivel AA para codebases React + TypeScript + Tailwind CSS, incluyendo todos los atributos ARIA, navegación por teclado, gestión de foco y anuncios para lectores de pantalla.

## Cuándo usar esta skill

- Corregir elementos `<div>` o `<span>` usados como controles interactivos (botones, enlaces)
- Agregar roles, estados y propiedades ARIA a componentes existentes
- Hacer modales/diálogos completamente accesibles (focus trap, tecla Escape, role=dialog)
- Implementar regiones live para mensajes de error y anuncios de estado
- Agregar etiquetas accesibles a campos de formulario, botones de carga, controles con solo ícono
- Hacer grupos de radio/checkbox semánticamente agrupados con `<fieldset><legend>`
- Implementar utilidades `focusRing` para indicadores de foco por teclado visibles
- Auditar y corregir contraste, tamaño de objetivos táctiles y visibilidad del foco
- Anotar enlaces externos con texto "abre en nueva pestaña" solo para lectores de pantalla

---

## Fase 1 — Auditoría

Antes de implementar, leer todos los archivos relevantes y producir una tabla priorizada:

| Prioridad | WCAG | Problema | Archivo | Descripción |
|---|---|---|---|---|
| Alto (A) | 2.1.1 | Sin acceso por teclado | Component.tsx | `<div onClick>` sin manejador de teclado |
| Alto (A) | 4.1.2 | Falta role | Modal.tsx | `<div>` de diálogo sin `role="dialog"` |
| Alto (A) | 1.3.1 | Sin etiqueta de grupo | Form.tsx | Radio buttons sin `<fieldset>` |
| Medio (AA) | 2.4.7 | Sin anillo de foco | Button.tsx | `focus:outline-none` sin reemplazo |
| Medio (AA) | 1.4.3 | Bajo contraste | Button.tsx | `bg-yellow-300 text-white` falla 4.5:1 |
| Medio (AA) | 2.5.8 | Objetivo pequeño | Button.tsx | Altura del botón < 44px |

---

## Fase 2 — Utilidades primero

Siempre crear/verificar `src/utils/a11y.ts` antes de implementar correcciones:

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

Agregar al CSS global (ej: `src/styles/index.css`):

```css
/* WCAG 2.4.7 — indicador de foco de respaldo para navegadores que no soportan :focus-visible */
:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

/* WCAG 1.4.12 / 2.3.3 — respetar preferencias de movimiento reducido */
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

## Fase 3 — Implementaciones de patrones

### Patrón A — Modal / Diálogo (WCAG 2.1.2, 4.1.2)

**Problema**: `<div>` overlay sin role, sin tecla Escape, sin gestión de foco.

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
    // WCAG 2.4.3: Mover foco al modal al abrir
    closeBtnRef.current?.focus();
    // WCAG 2.1.2: Cerrar con Escape
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Backdrop: aria-hidden para que los lectores de pantalla ignoren el overlay
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
        {/* WCAG 2.4.6: Título visible vinculado a la etiqueta del diálogo */}
        <h2 id={titleId} className="text-xl font-bold mb-4 pr-10">{title}</h2>

        {/* Botón de cerrar en la esquina superior derecha */}
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

**Reglas clave**:
- El `div` del backdrop recibe `aria-hidden="true"` — los lectores de pantalla nunca lo ven
- El `div` interior del diálogo recibe `role="dialog" aria-modal="true" aria-labelledby={id} aria-hidden="false"`
- `useId()` para ID único del título (requerido cuando pueden existir múltiples diálogos)
- `useRef` en el botón de cerrar → `.focus()` al abrir
- `useEffect` agrega listener `keydown` para Escape
- `onClick` en el backdrop → cerrar; el div interior detiene la propagación
- Botón de cerrar: `aria-label` + `<span aria-hidden="true">✕</span>`

---

### Patrón B — Formulario accesible (WCAG 1.3.1, 1.3.5, 4.1.2)

```tsx
import { focusRing } from '../utils/a11y';

export function AccessibleForm() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    // noValidate: deshabilitar la UI de validación por defecto del navegador — la manejamos nosotros
    <form onSubmit={handleSubmit} noValidate>
      {/* WCAG 4.1.3: role=alert anuncia errores a lectores de pantalla inmediatamente */}
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

      {/* Patrón de etiqueta para campo requerido */}
      <label htmlFor="nombre">
        Nombre
        {/* aria-hidden oculta el * visual del SR; sr-only proporciona el texto */}
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

      {/* Campo opcional — no se necesita aria-required */}
      <label htmlFor="notas">Notas</label>
      <textarea
        id="notas"
        className={`text-black bg-blue-100 rounded p-2 ${focusRing()}`}
      />

      {/* Botón de envío/carga */}
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

**Reglas clave**:
- `noValidate` en `<form>` — elimina el tooltip del navegador; tu JS/aria maneja los errores
- Contenedor de error: `role="alert" aria-live="assertive" aria-atomic="true"` — assertive para errores que bloquean el progreso; usar `aria-live="polite"` para estado/éxito
- Campos requeridos: `aria-required="true"` en el input Y patrón visual de asterisco con `aria-hidden="true"` + `sr-only`
- `aria-busy={isLoading}` + `aria-disabled={isLoading}` + `aria-label` dinámico en el botón de envío

---

### Patrón C — Select e inputs agrupados (WCAG 1.3.1)

**Grupos de Radio / Checkbox DEBEN usar `<fieldset>` + `<legend>`**:

```tsx
{/* INCORRECTO ✕ */}
<div>
  <label>Modo:</label>
  <label><input type="radio" name="m" value="a" /> Opción A</label>
  <label><input type="radio" name="m" value="b" /> Opción B</label>
</div>

{/* CORRECTO ✓ */}
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

{/* legend sr-only cuando el contexto visual ya proporciona la etiqueta */}
<fieldset className="border-0 p-0 m-0">
  <legend className="sr-only">Preferencias de notificación</legend>
  ...
</fieldset>
```

**Select con etiqueta accesible**:

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

### Patrón D — Toast / Región live accesible (WCAG 4.1.3)

Usar estas reglas para elegir entre `assertive` y `polite`:

| Situación | aria-live | Cuándo usar |
|---|---|---|
| Error bloqueante | `assertive` | Error que impide continuar (validación, red) |
| Estado de carga | `polite` | "Cargando...", "Guardando..." |
| Éxito / confirmación | `polite` | "¡Guardado correctamente!" |
| Alerta destructiva | `assertive` | "El archivo será eliminado permanentemente" |

**Patrón de anuncio de error estático**:
```tsx
{/* Se monta inmediatamente → el lector de pantalla anuncia de inmediato */}
{error && (
  <p role="alert" aria-live="assertive" aria-atomic="true">
    {error}
  </p>
)}

{/* Estado / éxito */}
{status && (
  <p role="status" aria-live="polite" aria-atomic="true">
    {status}
  </p>
)}
```

**Región live persistente con toast de Sonner** — para librerías que renderizan fuera del árbol de componentes, agregar una región live oculta visualmente y reflejar el mensaje:
```tsx
const [announcement, setAnnouncement] = useState('');

function showSuccess(msg: string) {
  toast.success(msg);           // toast visual
  setAnnouncement(msg);         // anuncio para SR
  setTimeout(() => setAnnouncement(''), 5000);
}

return (
  <>
    {/* región live sr-only — siempre en el DOM */}
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

### Patrón E — Acordeón (WCAG 4.1.2, 2.1.1)

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
            {/* WCAG 4.1.2: el botón controla el panel */}
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
                {/* Indicador visual — oculto del SR ya que aria-expanded lleva el estado */}
                <span aria-hidden="true" className="ml-2">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>
            </h3>

            {/* Panel: oculto del SR y teclado cuando está cerrado */}
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

**Reglas clave**:
- El trigger es siempre un `<button>` (nunca `<div>` o `<h*>` directamente)
- `aria-expanded={boolean}` en el botón
- `aria-controls={panelId}` en el botón; `aria-labelledby={headerId}` en el panel
- Usar atributo `hidden` (no `display:none` vía JS) — los lectores de pantalla respetan `hidden` nativamente
- Flecha visual: `aria-hidden="true"` para que el SR no diga "triángulo abajo"

---

### Patrón F — span/div → button (WCAG 2.1.1, 4.1.2)

**Nunca usar elementos no interactivos como botones**:

```tsx
{/* INCORRECTO ✕ — no accesible por teclado, sin role, sin enter/space */}
<span onClick={handleClick}>Agregar Cliente</span>
<div onClick={handleClick}>Ver más</div>
<p role="button" onClick={handleClick}>Volver</p>

{/* CORRECTO ✓ */}
<button
  type="button"
  onClick={handleClick}
  className={`... min-h-11 ${focusRing()}`}
>
  Agregar Cliente
</button>

{/* CORRECTO ✓ — navegación */}
<button
  type="button"
  onClick={() => navigate('/ruta')}
  className={`... min-h-11 ${focusRing()}`}
>
  Agregar Cliente
</button>
```

**Regla `<a>` vs `<button>`**:
- Usar `<a href="...">` para enlaces que navegan a URLs (rutas internas o externas)
- Usar `<button>` para todo lo que dispara una acción (abrir modal, enviar, toggle)

---

### Patrón G — Enlaces externos (WCAG 2.4.4)

```tsx
{/* CORRECTO ✓ — el lector de pantalla escucha "Ver en YouTube (abre en nueva pestaña)" */}
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

{/* Patrón más corto cuando el texto del enlace ya es descriptivo */}
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

### Patrón H — Botones con imagen / ícono (WCAG 1.1.1)

```tsx
{/* Imagen decorativa dentro de botón — ocultar imagen, etiquetar el botón */}
<button
  type="button"
  aria-label="Actualizar datos"
  onClick={handleUpdate}
  className={`min-h-11 ${focusRing()}`}
>
  <img src="/icon-refresh.svg" alt="" aria-hidden="true" />
</button>

{/* Imagen con significado — usar texto alt */}
<img src="/logo.png" alt="SuperKeg — gestión de kegs de cerveza" />

{/* Imagen decorativa — alt vacío fuerza al SR a saltarla */}
<img src="/decoration.svg" alt="" aria-hidden="true" />
```

---

### Patrón I — Landmarks de navegación (WCAG 1.3.6, 2.4.1)

```tsx
{/* Skip link — primer elemento focusable en la página */}
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
             focus:z-[9999] focus:px-4 focus:py-2 focus:bg-sky-700 focus:text-white
             focus:rounded focus:shadow-lg"
>
  Saltar al contenido principal
</a>

{/* Navegación principal */}
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

{/* Contenido principal destino */}
<main id="main-content" tabIndex={-1} className="focus-visible:outline-none">
  ...
</main>
```

---

### Patrón J — Accesibilidad de tablas / listas (WCAG 1.3.1)

```tsx
{/* Tabla de datos */}
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
          {/* aria-label identifica SOBRE QUÉ elemento actúa el botón */}
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

### Patrón K — Estados de carga y regiones ocupadas (WCAG 4.1.3, 2.2.1)

```tsx
{/* Botón con estado de carga */}
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

{/* Estado ocupado a nivel de sección */}
<section aria-busy={isLoading} aria-label="Lista de productos">
  {isLoading ? <Spinner /> : <ProductList />}
</section>
```

---

## Fase 4 — Checklist de contraste y objetivos táctiles

### Contraste de color (WCAG 1.4.3 — 4.5:1 para texto normal, 3:1 para texto grande)

Pares comunes de Tailwind y su cumplimiento para **texto normal (< 18px no negrita)**:

| Fondo | Texto | Ratio | Estado |
|---|---|---|---|
| `bg-sky-800` | `text-white` | 9.1:1 | ✓ AA + AAA |
| `bg-green-600` | `text-white` | 5.7:1 | ✓ AA |
| `bg-blue-700` | `text-white` | 7.2:1 | ✓ AA + AAA |
| `bg-red-700` | `text-white` | 6.2:1 | ✓ AA |
| `bg-amber-300` | `text-black` | 11.5:1 | ✓ AA + AAA |
| `bg-yellow-500` | `text-black` | 6.1:1 | ✓ AA |
| `bg-green-400` | `text-white` | 2.8:1 | ✕ FALLA — usar `bg-green-600` |
| `bg-red-400` | `text-white` | 3.0:1 | ✕ FALLA — usar `bg-red-600` |
| `bg-blue-400` | `text-white` | 2.7:1 | ✕ FALLA — usar `bg-blue-700` |
| `bg-yellow-300` | `text-white` | 1.5:1 | ✕ FALLA — usar `text-black` |

### Objetivos táctiles (WCAG 2.5.8 — 24×24px mínimo, 2.5.5 AAA — 44×44px)

```tsx
{/* Mínimo (AA) — 24px */}
className="min-h-6 min-w-6"

{/* Recomendado (AAA) — 44px — usar esto por defecto */}
className="min-h-11 min-w-11"   // Tailwind: min-h-11 = 44px
```

**Regla**: Todos los elementos interactivos (botones, enlaces, inputs) deben tener `min-h-11` a menos que el espacio esté deliberadamente restringido (ej: ícono inline en tabla densa).

---

## Fase 5 — Formato de salida de la auditoría

Después de completar las correcciones, generar este resumen:

```
## Auditoría de Accesibilidad — Reporte post-corrección

### Corregidos (N problemas)
| WCAG | Componente | Corrección aplicada |
|---|---|---|
| 2.1.1 | BotonAyudaVideos | Modal se cierra con tecla Escape |
| 4.1.2 | Clientes | <span onClick> → <button type="button"> |
| 1.3.1 | Clientes | Radio buttons envueltos en <fieldset><legend> |
| 2.4.3 | BotonAyudaVideos | El foco se mueve al botón de cerrar al abrir el modal |
| 4.1.3 | FormularioLlenarKeg | El div de error tiene role="alert" aria-live="assertive" |
| 1.4.3 | SeleccionAccion | Colores de botón cambiados para cumplir ratio de contraste 4.5:1 |
| 2.5.8 | Todos los botones | Agregado min-h-11 (objetivo táctil de 44px) |
| 2.4.7 | Todos los interactivos | Utilidad focusRing() aplicada |

### Aún pendientes (si los hay)
- Problema X: Requiere corrección de librería de terceros o decisión de diseño
```

---

## Reglas críticas (Nunca romper)

1. **Nunca usar `onClick` solo** en un elemento no interactivo — siempre convertir a `<button>` o `<a>`
2. **Nunca usar `aria-hidden="true"` en elementos con foco** — esto crea trampas de teclado
3. **`role="dialog"` requiere `aria-labelledby` o `aria-label`**
4. **Las regiones `aria-live` deben estar en el DOM antes de que el contenido cambie** — montarlas vacías, luego actualizar
5. **`aria-required` NO reemplaza el atributo HTML `required`** — usar ambos
6. **NO usar `tabIndex={0}`** en elementos que ya reciben foco nativamente (botones, inputs, enlaces)
7. **`useId()` para cualquier ID que identifique relación** entre elementos (`htmlFor`, `aria-labelledby`, `aria-controls`, `aria-describedby`) — previene duplicados en listas
8. **`aria-disabled` ≠ `disabled`** — `disabled` remueve el elemento del orden de tabulación; `aria-busy` + `aria-disabled` lo mantiene en el orden de tabulación mientras comunica el estado ocupado
9. **`noValidate` en cada formulario** donde se maneja la validación manualmente
10. **`alt=""` en imágenes decorativas** — no `alt="decorative"` o faltante; string vacío le dice al SR que la salte
11. **`aria-live` debe estar en un contenedor, nunca en `<img>` o elementos void** — ponerlo en `<img src="loader.svg" aria-live="polite">` es ignorado silenciosamente por todos los lectores de pantalla; mover el atributo al `<p>` o `<div>` contenedor
12. **Los valores de `aria-label` deben usar lenguaje natural** — guiones y guiones bajos se verbalizan literalmente; `aria-label="Contact-Form"` se lee como "Contact guion Form"; usar `aria-label="Contact Form"`
13. **Los modificadores de opacidad reducen el contraste** — `text-gray-300/60` sobre fondo oscuro NO es el mismo ratio que `text-gray-300`; siempre calcular el contraste sobre el color mezclado: `efectivo = opacidad * fg + (1-opacidad) * bg`
14. **Los enlaces sobre fondos oscuros necesitan valores de azul más claros** — `text-blue-600` (#2563eb) sobre casi negro da ~3.78:1 (falla AA para texto normal); usar `text-blue-300` o `text-blue-400` en su lugar

---

## Patrón E — Chat en vivo / Chatbot accesible (WCAG 4.1.2, 4.1.3, 2.1.2)

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

  // WCAG 2.4.3: gestión de foco — input al abrir, botón toggle al cerrar
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    else if (!isOpen) toggleBtnRef.current?.focus();
  }, [isOpen]);

  // WCAG 2.1.2: Escape cierra el diálogo
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  return (
    <>
      {/* WCAG 4.1.3: anunciar apertura/cierre a lectores de pantalla */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isOpen ? 'Chat abierto' : ''}
      </div>

      {/* Botón toggle */}
      <button
        ref={toggleBtnRef}
        onClick={() => setIsOpen(p => !p)}
        aria-label="Abrir chat de asistencia"
        aria-expanded={isOpen}
        aria-controls="chat-window"
        type="button"
        className={focusClassName('amber')}
      >
        {/* ícono */}
      </button>

      {/* Ventana de chat — WCAG 4.1.2: role=dialog + aria-modal */}
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

        {/* WCAG 4.1.3: role=log para transcripción del chat */}
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

          {/* WCAG 4.1.3: role=status para indicador de carga */}
          {isLoading && (
            <div role="status" aria-label="El asistente está escribiendo">
              {/* puntos animados */}
            </div>
          )}
        </div>

        {/* Formulario de input */}
        <form onSubmit={() => {}}>
          <input
            ref={inputRef}
            type="text"
            aria-label="Escribe tu mensaje"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} aria-label="Enviar mensaje">
            {/* ícono de enviar */}
          </button>
        </form>
      </div>
    </>
  );
}
```

**Reglas clave para chat en vivo**:
- `role="log"` (no `role="region"`) en el contenedor de mensajes — los lectores de pantalla saben que es una transcripción
- `aria-live="polite" aria-relevant="additions"` — solo se anuncian mensajes nuevos, no ediciones
- `role="status"` en el indicador de carga — menos intrusivo que `role="alert"`
- Div de anuncio `aria-live` (`sr-only`) para cambios de estado de apertura/cierre
- `aria-expanded` + `aria-controls` en el botón toggle
- El foco va a `inputRef` cuando el chat se abre; retorna a `toggleBtnRef` cuando se cierra

---

## Patrón F — Toast accesible con pausa al pasar el mouse (WCAG 2.2.1, 4.1.3)

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

  // WCAG 2.2.1: temporizador pausable
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
    // los errores nunca se auto-cierran
    if (variant !== 'error') startTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const variantLabel = { success: 'Éxito', error: 'Error', warning: 'Advertencia', info: 'Información' };

  return (
    <div
      // WCAG 4.1.3: assertive para errores, polite para todo lo demás
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-describedby={msgId}
      // WCAG 2.2.1: pausar temporizador al pasar el mouse y al enfocar
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocus={pauseTimer}
      onBlur={resumeTimer}
    >
      {/* Etiqueta de variante solo para lectores de pantalla */}
      <span className="sr-only">{variantLabel[variant]}:</span>

      <p id={msgId}>{message}</p>

      <button
        onClick={() => onDismiss(id)}
        aria-label="Cerrar notificación"
        // WCAG 2.5.8: objetivo mínimo 24x24px
        className="min-w-11 min-h-11"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
```

**Reglas clave**:
- `role="alert"` + `aria-live="assertive"` solo para errores; `role="status"` + `aria-live="polite"` para el resto
- `onMouseEnter`/`onFocus` pausan el temporizador de auto-cierre (WCAG 2.2.1)
- `onMouseLeave`/`onBlur` reanudan — pero los errores nunca se auto-cierran
- `<span className="sr-only">` etiqueta el tipo de variante antes del texto del mensaje
- Botón de cerrar: `aria-label` + `aria-hidden` en el símbolo × decorativo
