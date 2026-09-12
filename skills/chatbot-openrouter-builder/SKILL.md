---
name: chatbot-openrouter-builder
description: >
  Construye, migra o corrige chatbots web con OpenRouter Client SDKs, streaming,
  selección de modelos, routing y fallbacks controlados, límites de gasto,
  privacidad, rate limiting y UI accesible. Usa cuando el usuario pida integrar
  OpenRouter, crear un chatbot multi-modelo, migrar un chatbot a OpenRouter o
  depurar su streaming. No aplica a agentes autónomos con bucles de herramientas.
metadata:
  author: Ariel GonzAgüer
  version: "1.0.0"
---

# Chatbot OpenRouter Builder

Construye chatbots de producción sobre la API unificada de OpenRouter sin ocultar las decisiones de modelo, proveedor, privacidad, disponibilidad y costo.

## Límite de alcance

- Usa los Client SDKs para inferencia directa y conserva la orquestación, el historial y la UI en la aplicación.
- Si el usuario necesita bucles multi-turno autónomos, ejecución automática de herramientas o condiciones de parada, propone `@openrouter/agent`; no conviertas un chatbot simple en agente sin autorización.
- Conserva el framework, runtime, diseño y protocolo existentes salvo que el usuario pida cambiarlos.
- No despliegues, compres créditos, crees claves ni cambies guardrails o preferencias de cuenta sin autorización explícita.

## Flujo de trabajo

1. Inspecciona el stack, el package manager, el runtime serverless, el endpoint actual, el protocolo de streaming y las pruebas.
2. Lee y aplica también la skill `chatbot-security` antes de crear o modificar el endpoint.
3. Elige una sola integración principal:
   - TypeScript/JavaScript nuevo: `@openrouter/sdk`.
   - Python: `openrouter`.
   - Go: `github.com/OpenRouterTeam/go-sdk`.
   - Migración mínima de una integración OpenAI existente: compatibilidad OpenAI solo si reduce el cambio y se prueba el comportamiento específico de OpenRouter.
4. Verifica la documentación oficial y los tipos de la versión instalada. Los SDKs son generados desde OpenAPI y sus firmas pueden cambiar; no mezcles ejemplos de versiones distintas.
5. Define el contrato de producto: modelo(s), calidad mínima, latencia, costo máximo, privacidad, política de fallbacks, longitud de contexto y capacidades necesarias.
6. Implementa la llamada exclusivamente en servidor, valida entradas e historial, aplica límites atómicos y transmite un protocolo propio estable hacia el navegador.
7. Añade una UI accesible o integra el endpoint con la UI existente sin cambiar su diseño fuera de alcance.
8. Ejecuta typecheck, tests y validaciones de streaming, errores, cancelación, seguridad y accesibilidad.

Lee [implementation.md](references/implementation.md) para la implementación TypeScript de referencia. Lee [routing-privacy-and-cost.md](references/routing-privacy-and-cost.md) cuando haya que elegir modelos, proveedores, fallbacks o políticas de datos. Lee [testing.md](references/testing.md) para la matriz de verificación.

## Decisiones obligatorias de OpenRouter

### Modelo configurable y verificable

- Obtén el modelo desde `OPENROUTER_MODEL`; no fijes en código un modelo que pueda quedar obsoleto.
- Verifica en el catálogo actual que soporte las modalidades, contexto, parámetros y herramientas requeridas.
- No elijas `openrouter/free`, variantes `:free`, routers automáticos ni un “modelo barato” por defecto para producción. Son decisiones de calidad, disponibilidad, privacidad y costo que deben validarse con casos reales.
- Si hay varios modelos aceptables, configura `OPENROUTER_FALLBACK_MODELS` y registra cuál respondió. Un fallback puede cambiar el comportamiento y el precio.

### Routing explícito cuando importa

- El routing predeterminado prioriza disponibilidad y precio entre proveedores elegibles. No prometas un proveedor concreto sin restringirlo.
- Usa `provider.requireParameters` cuando ignorar un parámetro alteraría el contrato.
- Usa `provider.zdr` o `provider.dataCollection` solo a partir de requisitos de privacidad explícitos; documenta que pueden reducir disponibilidad.
- Deshabilitar fallbacks o limitar proveedores requiere una razón de residencia, cumplimiento, calidad o reproducibilidad.

### Streaming correcto

- Consume el async iterable del SDK en el servidor y emite hacia el cliente un contrato SSE o NDJSON propio.
- No asumas que HTTP 200 implica éxito: un error posterior al inicio puede llegar dentro del stream.
- Trata el frame final de uso como contabilidad, no como otro delta de texto.
- Propaga la desconexión del navegador y un timeout real hasta la petición upstream cuando la versión del SDK/runtime lo permita.
- Mantén el timeout activo hasta consumir o cancelar el stream. Limpiar el timer justo después de `chat.send` solo limita el tiempo hasta recibir headers.
- No reintentes automáticamente una generación que ya emitió texto; puede duplicar contenido y costo.

### Costos y límites

- Aplica un límite propio de solicitudes, concurrencia y presupuesto de entrada/salida aunque OpenRouter también imponga límites.
- Distingue `402` (créditos o límite monetario) de `429` (rate limit) y conserva `Retry-After` cuando exista.
- Registra duración, modelo solicitado, modelo/proveedor efectivo, tokens y costo reportado sin almacenar prompts ni PII por defecto.
- Usa límites de crédito por clave o workspace como defensa adicional, no como sustituto de controles de la aplicación.

### Privacidad y atribución

- `OPENROUTER_API_KEY` vive solo en servidor y nunca usa prefijos públicos del frontend.
- `HTTP-Referer` y `X-OpenRouter-Title`/opciones equivalentes del SDK sirven para atribución de la app; no son controles de autorización ni validación CSRF.
- ZDR afecta el routing de inferencia, pero no garantiza la política de herramientas o plugins de terceros.
- No habilites debug del SDK ni eco del request upstream en producción; puede revelar headers, prompts o datos internos.

## Variables de entorno

```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=<modelo-validado>

# Opcionales, según el contrato del producto
OPENROUTER_FALLBACK_MODELS=<modelo-2,modelo-3>
OPENROUTER_SITE_URL=https://example.com
OPENROUTER_APP_TITLE=Mi Asistente
OPENROUTER_REQUIRE_ZDR=false
```

Valida los booleanos y listas de entorno; no uses `Boolean(process.env.OPENROUTER_REQUIRE_ZDR)`, porque la cadena `"false"` es truthy.

## UI accesible

Mantén los mismos mínimos que un chatbot accesible WCAG 2.2 AA:

- diálogo con nombre accesible, `aria-modal`, foco inicial, focus trap y restauración de foco;
- cierre con Escape sin trampa de teclado;
- `role="log"`/`aria-live="polite"` para mensajes y `role="alert"` para errores;
- estado ocupado, botón cancelar, labels, foco visible y contraste suficiente;
- salida del modelo renderizada como texto no confiable o Markdown sanitizado;
- soporte de `prefers-reduced-motion` y scroll que no desoriente.

Centraliza el cierre en una sola función que marque el diálogo como cerrado, cancele la petición activa y restaure el foco. Un handler global no debe mover el foco ante cualquier tecla. Si un tooltip vive dentro de un botón, no añadas otro `tabIndex` al contenido ni detengas Escape antes de que llegue al diálogo.

## Manejo de errores

Mapea errores a mensajes seguros sin devolver detalles del proveedor al navegador:

- `400`: solicitud o modelo inválido;
- `401`: clave inválida;
- `402`: créditos o límite de gasto agotado;
- `403`: guardrail, permisos o moderación;
- `408`/timeout local: upstream tardó demasiado;
- `429`: límite de OpenRouter, proveedor o aplicación;
- `502`/`503`: proveedor inválido o ninguno elegible;
- error mid-stream: evento de error de la aplicación y cierre limpio del stream.

Registra identificadores de correlación como `X-Generation-Id` cuando estén disponibles, pero no los expongas como diagnóstico sensible sin necesidad.

## Checklist de entrega

### Backend

- [ ] SDK y forma de request coinciden con la versión instalada y el proyecto compila.
- [ ] Clave y modelo se leen del entorno del servidor.
- [ ] Historial acepta solo roles permitidos y tiene límites de tamaño/presupuesto.
- [ ] Rate limiting y concurrencia usan una primitiva atómica apropiada al runtime.
- [ ] Timeout y cancelación llegan al upstream; no son solo `Promise.race` cosmético.
- [ ] Streaming detecta errores antes y después de comprometer la respuesta.
- [ ] Routing, privacidad y fallbacks están configurados según requisitos explícitos.
- [ ] Errores públicos no filtran prompts, metadata o credenciales.

### Frontend

- [ ] Parser incremental conserva eventos partidos entre chunks.
- [ ] No borra el mensaje del usuario si falla antes de crear el placeholder.
- [ ] Cancelar aborta la petición y el estado vuelve a reposo.
- [ ] La salida se renderiza con encoding/sanitización apropiada.
- [ ] Teclado, lector de pantalla, foco, contraste y reduced motion fueron verificados.

### Verificación

- [ ] Typecheck, lint y tests del proyecto pasan.
- [ ] Se probaron éxito, 400, 401, 402, 403, 429, timeout, desconexión y 5xx.
- [ ] Se probó error mid-stream con HTTP 200 y stream sin contenido.
- [ ] Se verificó el modelo/proveedor efectivo y el uso reportado.
- [ ] Cualquier prueba real con costo fue autorizada y acotada.

## Fuentes oficiales

- [Client SDKs](https://openrouter.ai/docs/client-sdks/overview)
- [TypeScript SDK](https://openrouter.ai/docs/client-sdks/typescript/overview)
- [Streaming](https://openrouter.ai/docs/api_reference/streaming)
- [Errores y debugging](https://openrouter.ai/docs/api_reference/errors-and-debugging)
- [Provider routing](https://openrouter.ai/docs/guides/routing/provider-selection)
- [Model fallbacks](https://openrouter.ai/docs/guides/routing/model-fallbacks)
- [Zero Data Retention](https://openrouter.ai/docs/guides/features/zdr)
- [App attribution](https://openrouter.ai/docs/app-attribution)
