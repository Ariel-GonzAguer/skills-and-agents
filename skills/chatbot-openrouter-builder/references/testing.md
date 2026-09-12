# Pruebas del chatbot OpenRouter

Adapta la suite al framework existente. Las pruebas unitarias y de integración local deben usar un upstream falso; una prueba real requiere autorización, clave fuera del repositorio y presupuesto acotado.

## Matriz mínima

### Configuración y tipos

- falta `OPENROUTER_API_KEY` o `OPENROUTER_MODEL`;
- booleano o lista de fallbacks inválidos;
- typecheck de la firma real de `chat.send`;
- proyecto CommonJS detecta o adapta el SDK ESM-only;
- modelo del cliente fuera de allowlist.

### Validación y seguridad

- body no JSON, `history` no array y `question` no string;
- entradas de historial `null`, primitivas, contenido no string y roles privilegiados;
- pregunta vacía, mensaje demasiado largo y presupuesto total excedido;
- roles `system`, `developer` o `tool` enviados por el cliente son rechazados/ignorados según contrato;
- Origin no permitido;
- rate limit concurrente y `Retry-After`;
- respuesta del modelo con HTML se renderiza como texto o Markdown sanitizado;
- logs no incluyen API key, prompt, historial ni PII.

### Streaming

- deltas separados y varios deltas en el mismo chunk de red;
- línea NDJSON/SSE dividida entre chunks;
- caracteres UTF-8 divididos entre chunks;
- frame de uso sin texto;
- `done` una sola vez;
- stream vacío;
- error antes del primer byte con status 4xx/5xx;
- error dentro del stream después de HTTP 200;
- desconexión del navegador y cancelación explícita;
- timeout upstream;
- chunk retrasado después de recibir headers, para demostrar que el timeout cubre toda la generación;
- no hay retry automático después de emitir texto.

### Routing y costos

- modelo único envía `model`, fallbacks envían `models` en orden;
- política ZDR/data collection se activa solo desde configuración válida;
- proveedor/modelo efectivo se registra;
- 402 y 429 producen mensajes distintos;
- límites de input/output y concurrencia se aplican antes de gastar tokens.

### Accesibilidad

- abrir mueve foco al diálogo/input y cerrar lo devuelve al activador;
- Escape cierra y Tab/Shift+Tab no escapan del diálogo;
- otras teclas no mueven el foco al activador oculto;
- cerrar con botón, Escape y cancelación restaura el foco de la misma forma;
- tooltips dentro de botones no crean un segundo tab stop ni interceptan Escape;
- mensajes se anuncian sin releer todo el historial;
- error usa `role="alert"`, carga/cancelación tienen nombre accesible;
- foco visible, contraste, zoom 200 %, mobile y reduced motion.

## Upstream falso

Modela al menos estas secuencias:

```typescript
const successfulFrames = [
  { choices: [{ delta: { content: 'Hola' } }] },
  { choices: [{ delta: { content: ' mundo' } }] },
  {
    choices: [{ delta: { content: '' }, finishReason: 'stop' }],
    usage: { promptTokens: 12, completionTokens: 2 },
  },
];

const midStreamErrorFrames = [
  { choices: [{ delta: { content: 'Respuesta parcial' } }] },
  {
    error: { code: 429, message: 'Rate limit exceeded' },
    choices: [{ delta: { content: '' }, finishReason: 'error' }],
  },
];
```

No hagas assertions sobre textos exactos del modelo. Verifica eventos, estado, límites, selección de configuración y ausencia de filtraciones. Las pruebas estáticas deben leer el archivo real; una constante como `const safePattern = '{msg.content}'` no demuestra qué renderiza el componente.

## Prueba real opcional

Cuando esté autorizada:

1. usa una clave de desarrollo con límite monetario bajo;
2. selecciona un modelo barato validado explícitamente para la prueba;
3. envía una entrada corta y limita el output;
4. comprueba streaming, modelo/proveedor efectivo, usage y generation ID;
5. elimina los artefactos de respuesta que contengan datos sensibles.

No conviertas esta prueba en requisito de CI si consume créditos o depende de disponibilidad externa.

## Criterio de salida

La implementación está lista cuando compila contra la versión instalada, todas las rutas de error cierran el stream de forma determinista, la cancelación llega al upstream, los límites resisten concurrencia y la UI pasa las verificaciones de teclado y lector de pantalla.
