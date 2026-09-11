---
name: react-viewtransition
description: Implementa, revisa, depura o explica el componente ViewTransition integrado de React. Usa esta skill siempre que una aplicación React necesite animaciones de página, rutas, entrada/salida, elementos compartidos, reordenamiento de listas, revelación con Suspense o Activity que preserve estado mediante la API React View Transition; úsala también ante solicitudes que mencionen ViewTransition, animación con startTransition, pseudoelementos view-transition o movimiento reducido en React. En interfaces controladas por React, prefiere esta skill a llamar manualmente a document.startViewTransition.
metadata:
  author: Ariel GonzAgüer
  version: "1.0.0"
---

# ViewTransition de React

Usa esta skill para que los cambios de interfaz en React se perciban continuos, dejando que React controle el renderizado y la coordinación de las transiciones. La fuente de verdad es la referencia oficial de React: <https://react.dev/reference/react/ViewTransition>.

## Evalúa primero la solicitud

Antes de escribir código, confirma estas condiciones:

1. Confirma que el proyecto usa una versión de React que exporta `ViewTransition`. Si no es así, explica que la API requiere una actualización o utiliza el enfoque de animación ya existente; no añadas una importación incompatible silenciosamente.
2. Identifica la intención visual: `enter`/`exit`, `update`, un elemento compartido con nombre, el reordenamiento de una lista, una revelación de Suspense o un cambio de visibilidad de `Activity`.
3. Identifica la actualización de estado que provoca el cambio visual. Para cambios de estado habituales, colócala en `startTransition(() => ...)`; un `setState` urgente y directo no activa una View Transition de React.
4. Inspecciona la convención de estilos local (CSS, módulos CSS, Tailwind, etc.) y respétala.

No llames manualmente a `document.startViewTransition()` ni a `startViewTransition()` para interfaces controladas por React. React inicia y coordina sus propias transiciones de vista, incluidas las transiciones React pendientes. Mezclar métodos de coordinación puede interrumpir las transiciones.

## Elige el límite útil más pequeño

`<ViewTransition>` anima una imagen renderizada de su límite, en vez de mover cada descendiente por separado. Elige un límite que coincida con el objeto visual que las personas deberían percibir como una sola unidad.

| Intención | Estructura recomendada |
| --- | --- |
| Mostrar u ocultar una región | Envuelve la región; cuando necesites entrada/salida, coloca el límite antes de cualquier nodo DOM dentro del componente. |
| Animar una región existente cuyo contenido o diseño cambia | Envuelve esa región y usa `update` si necesitas una animación personalizada. |
| Mantener continuidad entre dos árboles distintos | Asigna el mismo `name` globalmente único solo a los equivalentes saliente y entrante. |
| Reordenar una colección | Envuelve cada componente de elemento directo, conserva claves estables y actualiza el orden dentro de `startTransition`. |
| Revelar contenido asíncrono | Decide si el intercambio completo entre fallback y contenido debe fundirse (`ViewTransition` fuera de `Suspense`) o si fallback y contenido deben entrar/salir por separado (un límite en cada uno). |
| Mostrar/ocultar sin perder estado del componente | Combina `Activity` con un `ViewTransition` interno. |

Evita envolver una página completa por defecto. Un límite demasiado amplio puede fundir contenido no relacionado y volver el movimiento menos específico. Añade límites anidados solo cuando elementos distintos necesiten verdaderamente su propia continuidad.

## Patrón básico de implementación

```tsx
import { startTransition, useState, ViewTransition } from 'react';

export function DetailsPanel() {
  const [open, setOpen] = useState(false);

  function toggle() {
    startTransition(() => {
      setOpen(previous => !previous);
    });
  }

  return (
    <section>
      <button type="button" onClick={toggle} aria-expanded={open}>
        {open ? 'Ocultar detalles' : 'Mostrar detalles'}
      </button>
      {open ? (
        <ViewTransition enter="slide-up" exit="slide-down" default="none">
          <aside className="details-panel">...</aside>
        </ViewTransition>
      ) : null}
    </section>
  );
}
```

Para que se activen `enter` y `exit`, `ViewTransition` debe ser el primer nodo renderizado en el árbol del componente que se monta o desmonta. Un elemento DOM contenedor por encima impide esas animaciones de entrada/salida.

## Estilos para clases de transición personalizadas

Pasa una clase de transición mediante `enter`, `exit`, `update`, `share` o `default`; después selecciona sus pseudoelementos de View Transition. Prefiere este enfoque basado en clases a asignar manualmente `view-transition-name` en CSS.

```css
::view-transition-group(.slide-up) {
  animation-duration: 220ms;
  animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
}

::view-transition-old(.slide-up) {
  animation: fade-out 160ms ease-out both;
}

::view-transition-new(.slide-up) {
  animation: slide-up 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(0.5rem); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(.slide-up),
  ::view-transition-old(.slide-up),
  ::view-transition-new(.slide-up) {
    animation: none;
  }
}
```

Considera siempre `prefers-reduced-motion`; React no desactiva estas animaciones automáticamente. Favorece movimientos breves y con propósito, y no alteres la navegación con teclado ni la gestión del foco.

## Elementos compartidos con nombre

Usa `name` solo para una transición de elemento compartido: un límite coincidente sale del árbol mientras otro entra dentro de la misma transición de React.

```tsx
const productImageTransitionName = `product-image-${product.id}`;

<ViewTransition name={productImageTransitionName} share="product-image">
  <ProductImage product={product} />
</ViewTransition>
```

- Usa un espacio de nombres estable y único en toda la aplicación, por ejemplo `product-image-${id}`.
- Asegúrate de que nunca haya más de un `ViewTransition` montado con el mismo nombre en ninguna parte de la aplicación.
- La pareja compartida debe insertarse y eliminarse dentro de la misma transición; un fallback de Suspense entre ambos evita que se forme la pareja de elemento compartido.
- Si alguno de los equivalentes está fuera del viewport, React no forma una pareja compartida. No dependas de `name` para reordenar listas.
- Una animación `share` tiene prioridad sobre animaciones `enter` y `exit` que también pudieran aplicar.

## Tipos y dirección de navegación

Cuando la navegación tiene una dirección semántica (por ejemplo, avanzar o volver), usa los tipos de transición de React mediante la integración del router de la aplicación. Después, selecciona clases por tipo en lugar de duplicar componentes de ruta.

```tsx
<ViewTransition
  default="none"
  enter={{ forward: 'slide-from-right', back: 'slide-from-left', default: 'auto' }}
  exit="auto"
>
  <Page />
</ViewTransition>
```

No inventes una API para el router. Primero inspecciona su versión y el mecanismo de navegación existente; la referencia de React orienta a autores de routers, pero las aplicaciones deben usar la integración de View Transition que su router admita.

## Animación controlada con JavaScript

Usa callbacks de eventos solo cuando CSS no pueda expresar el comportamiento requerido. Cada callback recibe la instancia de transición y la lista de tipos activos, y debe devolver una función de limpieza que cancele o elimine su trabajo.

```tsx
<ViewTransition
  onEnter={(instance) => {
    const animation = instance.new.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 180, easing: 'ease-out' },
    );
    return () => animation.cancel();
  }}
>
  <Notice />
</ViewTransition>
```

`onShare` tiene prioridad sobre `onEnter` y `onExit`. React dispara como máximo un evento de View Transition por límite en una transición determinada.

## Patrón para reordenar listas

```tsx
function reorder() {
  startTransition(() => {
    setItems(previous => [...previous].sort(compareItems));
  });
}

return items.map(item => (
  <ViewTransition key={item.id} update="item-reorder">
    <ListItem item={item} />
  </ViewTransition>
));
```

Mantén claves de elementos estables. No añadas un contenedor DOM adicional a cada elemento si evita que el límite del elemento sea un hermano directo; de lo contrario, React puede animar el fundido cruzado del padre en vez del movimiento individual.

## Suspense y Activity

- Con `<ViewTransition><Suspense fallback={<Placeholder />}><Content /></Suspense></ViewTransition>`, el intercambio de fallback a contenido es una transición `update`, normalmente un fundido cruzado.
- Con un ViewTransition alrededor de cada rama de fallback y contenido, las ramas pueden usar `enter`/`exit` en su lugar.
- Una fuente o imagen que aún se carga dentro de un ViewTransition puede retrasar la animación para evitar un salto visual. No trates esa demora como un error sin comprobar antes la carga del recurso.
- Usa `<Activity mode={visible ? 'visible' : 'hidden'}>` alrededor de un ViewTransition interno cuando el contenido deba conservar su estado al salir y volver a entrar.

## Lista de verificación

Después de implementar o revisar, comprueba todos los puntos que apliquen:

- La actualización que debe animarse se ejecuta dentro de `startTransition`, o se activa adecuadamente mediante Suspense, `useDeferredValue` o Activity.
- La ubicación del límite coincide con el disparador deseado; los límites de entrada/salida están en el nivel superior de su subárbol montado o desmontado.
- Los límites con nombre son auténticos elementos compartidos y sus nombres son únicos globalmente.
- Las listas reordenadas usan claves estables y límites en elementos directos.
- El CSS selecciona clases de View Transition y no entra en conflicto manualmente con los nombres generados por React.
- `prefers-reduced-motion` desactiva o reduce de forma sustancial la animación personalizada.
- Las interacciones, el foco, la semántica y el comportamiento de respaldo siguen siendo utilizables si la animación no está disponible o está desactivada.
- Se probó el flujo pertinente: mostrar/ocultar, dirección de navegación, reordenamiento, revelación de datos o un caso límite del viewport.

## Explica las decisiones con claridad

Al responder, indica el tipo de transición elegido, la ubicación del límite y por qué la actualización que la activa es elegible. Señala cualquier limitación de versión o del router antes de proponer una alternativa. No afirmes que una versión de navegador o React admite la función sin verificarlo en el proyecto o en la documentación oficial.
