---
name: wcag-react-implementer
description: Implementa correcciones de accesibilidad WCAG 2.2 Nivel AA en proyectos React + TypeScript + Tailwind CSS. Usa cuando el usuario pida agregar o corregir accesibilidad (a11y), etiquetas ARIA, soporte para lectores de pantalla, navegación por teclado, gestión del foco, modales accesibles, anuncios de errores de formularios, o cuando el código usa <div>/<span> como elementos interactivos. Se activa con "fix accessibility", "aria labels", "screen reader", "a11y", "lector de pantalla", "accesibilidad", "WCAG".
metadata:
  author: Ariel GonzAgüer
  version: "1.1.0"
---

# Implementador WCAG en React

Implementación sistemática de patrones de accesibilidad WCAG 2.2 Nivel AA para codebases React + TypeScript + Tailwind CSS, incluyendo todos los atributos ARIA, navegación por teclado, gestión del foco y anuncios para lectores de pantalla.

## Cuándo usar esta skill

- Corregir elementos `<div>` o `<span>` usados como controles interactivos (botones, enlaces)
- Agregar roles, estados y propiedades ARIA a componentes existentes
- Hacer modales/diálogos totalmente accesibles (trampa de foco, tecla Escape, role=dialog)
- Implementar regiones en vivo para mensajes de error y anuncios de estado
- Agregar etiquetas accesibles a campos de formulario, botones de carga, controles solo de ícono
- Agrupar radio/checkbox semánticamente con `<fieldset><legend>`
- Implementar utilidades `focusRing` para indicadores de foco visibles por teclado
- Auditar y corregir contraste, tamaño de objetivo táctil y visibilidad del foco
- Anotar enlaces externos con texto "se abre en nueva pestaña" solo para lectores de pantalla

---

## Fase 1 — Auditoría

Antes de implementar, lee todos los archivos relevantes y produce una tabla priorizada:

| Prioridad | WCAG | Problema | Archivo | Descripción |
|---|---|---|---|---|
| Alta (A) | 2.1.1 | Sin acceso por teclado | Component.tsx | `<div onClick>` sin handler de teclado |
| Alta (A) | 4.1.2 | Falta role | Modal.tsx | `<div>` de diálogo sin `role="dialog"` |
| Alta (A) | 1.3.1 | Sin etiqueta de grupo | Form.tsx | Botones de radio sin `<fieldset>` |
| Media (AA) | 2.4.7 | Sin anillo de foco | Button.tsx | `focus:outline-none` sin reemplazo |
| Media (AA) | 1.4.3 | Bajo contraste | Button.tsx | `bg-yellow-300 text-white` no alcanza 4.5:1 |
| Media (AA) | 2.5.8 | Objetivo pequeño | Button.tsx | Altura del botón < 44px |

---

## Fase 2 — Utilidades primero

Siempre crea/verifica `src/utils/a11y.ts` antes de implementar correcciones:

```ts
/**
 * Devuelve clases de Tailwind para el anillo de foco visible por teclado.
 * Usa focus-visible: para no mostrar el anillo en interacciones táctiles.
 * Las clases son strings completos para que Tailwind las detecte en el escaneo estático.
 *
 * @param colorRing - Color del anillo de foco: 'red' (por defecto), 'amber' o 'white'
 * @returns String de clases de Tailwind
 *
 * @example
 * <button className={focusRing('amber')}>Guardar</button>
 */
export function focusRing(colorRing: 'red' | 'amber' | 'white' = 'red'): string {
  // Strings completamente estáticos: Tailwind necesita clases literales para incluirlas en el
  // CSS compilado. Cualquier template literal con variable hace que el scanner las omita.
  if (colorRing === 'red') {
    return 'outline-none rounded focus-visible:ring-4 focus-visible:ring-red-600 focus-visible:ring-offset-1';
  }
  if (colorRing === 'amber') {
    return 'outline-none rounded focus-visible:ring-4 focus-visible:ring-amber-300 focus-visible:ring-offset-1';
  }
  return 'outline-none rounded focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800';
}
```

Agregar al CSS global (ej. `src/styles/index.css`):

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

## Fase 3 — Implementación de patrones

Usa el patrón relevante como punto de partida, luego verifica el comportamiento en el componente real y el navegador. Lee [react-patterns.md](references/react-patterns.md) cuando necesites comandos detallados, plantillas o ejemplos de implementación.

## Fase 4 — Contraste y objetivo táctil

### Contraste de color (WCAG 1.4.3 — 4.5:1 para texto normal, 3:1 para texto grande)

Pares comunes de Tailwind y su cumplimiento para **texto normal (< 18px sin negrita)**:

| Fondo | Texto | Ratio | Estado |
|---|---|---|---|
| `bg-sky-800` | `text-white` | 9.1:1 | ✅ AA + AAA |
| `bg-green-600` | `text-white` | 5.7:1 | ✅ AA |
| `bg-blue-700` | `text-white` | 7.2:1 | ✅ AA + AAA |
| `bg-red-700` | `text-white` | 6.2:1 | ✅ AA |
| `bg-amber-300` | `text-black` | 11.5:1 | ✅ AA + AAA |
| `bg-yellow-500` | `text-black` | 6.1:1 | ✅ AA |
| `bg-green-400` | `text-white` | 2.8:1 | ❌ FALLA — usar `bg-green-600` |
| `bg-red-400` | `text-white` | 3.0:1 | ❌ FALLA — usar `bg-red-600` |
| `bg-blue-400` | `text-white` | 2.7:1 | ❌ FALLA — usar `bg-blue-700` |
| `bg-yellow-300` | `text-white` | 1.5:1 | ❌ FALLA — usar `text-black` |

### Objetivos táctiles (WCAG 2.5.8 — 24×24px mínimo, 2.5.5 AAA — 44×44px)

```tsx
{/* Mínimo (AA) — 24px */}
className="min-h-6 min-w-6"

{/* Recomendado (AAA) — 44px — usar por defecto */}
className="min-h-11 min-w-11"   // Tailwind: min-h-11 = 44px
```

**Regla**: Verifica primero el mínimo AA de 24×24px y sus excepciones de espaciado, equivalencia, controles inline, controles del user agent y tamaño esencial. Prefiere 44×44px como mejora AAA o criterio de diseño del producto, no como requisito AA universal.

---

## Fase 5 — Formato de salida de auditoría

Después de completar las correcciones, genera este resumen:

```
## Auditoría de Accesibilidad — Reporte post-corrección

### Corregido (N problemas)
| WCAG | Componente | Corrección aplicada |
|---|---|---|
| 2.1.1 | BotonAyudaVideos | Modal se cierra con tecla Escape |
| 4.1.2 | Clientes | <span onClick> → <button type="button"> |
| 1.3.1 | Clientes | Botones de radio envueltos en <fieldset><legend> |
| 2.4.3 | BotonAyudaVideos | El foco se mueve al botón de cerrar al abrir el modal |
| 4.1.3 | FormularioLlenarKeg | div de error con role="alert" aria-live="assertive" |
| 1.4.3 | SeleccionAccion | Colores de botón cambiados para alcanzar ratio 4.5:1 |
| 2.5.8 | Todos los botones | Agregado min-h-11 (objetivo táctil de 44px) |
| 2.4.7 | Todos los interactivos | Utilidad focusRing() aplicada |

### Pendiente (si hay)
- Problema X: Requiere corrección de librería de terceros o decisión de diseño
```

---

## Reglas Críticas (Nunca quebrar)

1. **Nunca uses `onClick` solo** en un elemento no interactivo — siempre convierte a `<button>` o `<a>`
2. **Nunca uses `aria-hidden="true"` en elementos con foco** — esto crea trampas de teclado
3. **`role="dialog"` requiere `aria-labelledby` o `aria-label`**
4. **Las regiones `aria-live` deben estar en el DOM antes de que cambie el contenido** — renderiza vacía primero, luego actualiza
5. **`aria-required` NO reemplaza el atributo HTML `required`** — usa ambos
6. **NO uses `tabIndex={0}`** en elementos que ya reciben foco nativamente (botones, inputs, enlaces)
7. **`useId()` para cualquier ID que identifique relación** entre elementos (`htmlFor`, `aria-labelledby`, `aria-controls`, `aria-describedby`) — previene duplicados en listas
8. **`aria-disabled` ≠ `disabled`** — prefiere `disabled` en controles nativos. Usa `aria-disabled` solo cuando el control deba seguir en el orden de tabulación y bloquea también su acción en JavaScript.
9. **Usa `noValidate` solo cuando la validación personalizada reemplaza intencionalmente la validación nativa** y ofrece mensajes equivalentes o mejores.
10. **`alt=""` en imágenes decorativas** — no `alt="decorative"` o faltante; cadena vacía indica al lector de pantalla que lo omita
11. **`aria-live` debe estar en un contenedor, nunca en `<img>` o elementos vacíos** — colocarlo en `<img src="loader.svg" aria-live="polite">` es ignorado silenciosamente por todos los lectores de pantalla; mueve el atributo al `<p>` o `<div>` contenedor
12. **Los valores de `aria-label` deben usar lenguaje natural** — guiones y guiones bajos se verbalizan literalmente; `aria-label="Contact-Form"` se lee como "Contact guión Form"; usa `aria-label="Contact Form"`
13. **Los modificadores de opacidad reducen el contraste** — `text-gray-300/60` sobre fondo oscuro NO es el mismo ratio que `text-gray-300`; siempre calcula el contraste sobre el color mezclado: `efectivo = opacidad * fg + (1-opacidad) * bg`
14. **Los enlaces sobre fondos oscuros necesitan valores azul más claros** — `text-blue-600` (#2563eb) sobre negro casi puro produce ~3.78:1 (falla AA para texto normal); usa `text-blue-300` o `text-blue-400` en su lugar

---

## Patrón E — Chat en vivo accesible / Chatbot (WCAG 4.1.2, 4.1.3, 2.1.2)

```tsx
import { useId, useRef, useState, useEffect } from 'react';
import { focusRing } from '../utils/a11y';

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
        className={focusRing('amber')}
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

**Reglas clave para chat en vivo**:
- `role="log"` (no `role="region"`) en el contenedor de mensajes — los lectores de pantalla saben que es una transcripción
- `aria-live="polite" aria-relevant="additions"` — solo se anuncian mensajes nuevos, no ediciones
- `role="status"` en el indicador de carga — menos intrusivo que `role="alert"`
- Div de anuncio `aria-live` (`sr-only`) para cambios de estado de apertura/cierre
- `aria-expanded` + `aria-controls` en el botón de alternar
- El foco va a `inputRef` cuando el chat se abre; regresa a `toggleBtnRef` cuando se cierra

---

## Patrón F — Toast accesible con pausa al pasar el cursor (WCAG 2.2.1, 4.1.3)

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

**Reglas clave**:
- `role="alert"` + `aria-live="assertive"` solo para errores; `role="status"` + `aria-live="polite"` para el resto
- `onMouseEnter`/`onFocus` pausan el temporizador de auto-cierre (WCAG 2.2.1)
- `onMouseLeave`/`onBlur` reanudan — pero los errores nunca se cierran automáticamente
- `<span className="sr-only">` etiqueta el tipo de variante antes del texto del mensaje
- Botón de cerrar: `aria-label` + `aria-hidden` en el símbolo decorativo ×
