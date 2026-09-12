# Implementación TypeScript de referencia

Usa esta referencia al crear o migrar un chatbot React/TypeScript. Adapta nombres, rutas y primitivas al proyecto; los helpers declarados representan fronteras que deben implementarse, no stubs listos para producción.

## 1. Instalar y comprobar el SDK

```bash
pnpm add @openrouter/sdk
```

`@openrouter/sdk` es ESM-only. En CommonJS usa un import dinámico o migra ese módulo a ESM. Antes de escribir el endpoint, inspecciona la versión instalada y su definición de `chat.send`.

La forma conservadora documentada para versiones actuales envuelve el payload en `chatRequest`:

```typescript
const result = await openRouter.chat.send({
  chatRequest: {
    model,
    messages,
    stream: true,
  },
});
```

Algunas páginas o versiones muestran los campos directamente. No alternes entre ambas formas por intuición: deja que TypeScript y la versión instalada definan el contrato.

## 2. Configuración validada

```typescript
function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta la variable ${name}`);
  return value;
}

function envBoolean(name: string, fallback = false): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (raw === undefined || raw === '') return fallback;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  throw new Error(`${name} debe ser true o false`);
}

function fallbackModels(): string[] {
  return (process.env.OPENROUTER_FALLBACK_MODELS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 3);
}
```

No registres el valor de `OPENROUTER_API_KEY` cuando falle la configuración.

## 3. Cliente en servidor

```typescript
import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({
  apiKey: requiredEnv('OPENROUTER_API_KEY'),
  httpReferer: process.env.OPENROUTER_SITE_URL,
  appTitle: process.env.OPENROUTER_APP_TITLE,
});
```

La atribución es opcional para llamar a la API. Si se configura, usa la URL y el nombre reales de la app; no confundas `httpReferer` con el `Origin` entrante que valida CSRF.

## 4. Contratos del endpoint

```typescript
type ClientMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type OutboundEvent =
  | { type: 'delta'; text: string }
  | { type: 'usage'; promptTokens?: number; completionTokens?: number }
  | { type: 'done' }
  | { type: 'error'; code: string; message: string };

declare function validateOrigin(request: Request): boolean;
declare function getTrustedPrincipal(request: Request): string;
declare function consumeRateLimit(key: string): Promise<{
  allowed: boolean;
  retryAfterSeconds: number;
}>;
declare function applySecurityHeaders(headers: Headers): void;
```

Usa un esquema del proyecto (Zod, Valibot u otro) si ya existe. La validación manual mínima debe comprobar que el body sea un objeto, `question` sea texto no vacío, `history` sea array, cada `role` esté permitido y el presupuesto total sea acotado.

```typescript
function validateText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') throw new TypeError('Contenido inválido');
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized || normalized.length > maxLength) {
    throw new RangeError('Contenido fuera de límites');
  }
  return normalized;
}

function validateHistory(value: unknown): ClientMessage[] {
  if (!Array.isArray(value)) throw new TypeError('Historial inválido');

  let budget = 0;
  const accepted: ClientMessage[] = [];
  for (const candidate of value.slice(-20)) {
    if (!candidate || typeof candidate !== 'object') continue;
    const role = (candidate as { role?: unknown }).role;
    if (role !== 'user' && role !== 'assistant') continue;
    const content = validateText((candidate as { content?: unknown }).content, 2_000);
    budget += Math.ceil(content.length / 4);
    if (budget > 2_000) break;
    accepted.push({ role, content });
  }
  return accepted;
}
```

## 5. Crear la solicitud

```typescript
function buildChatRequest(question: string, history: ClientMessage[]) {
  const model = requiredEnv('OPENROUTER_MODEL');
  const fallbacks = fallbackModels();
  const models = [model, ...fallbacks];

  return {
    // Usa `model` para una sola opción y `models` para fallbacks ordenados.
    ...(models.length === 1 ? { model } : { models }),
    messages: [
      {
        role: 'system' as const,
        content: 'Responde de forma útil, breve y dentro del alcance del producto.',
      },
      ...history,
      { role: 'user' as const, content: question },
    ],
    provider: {
      requireParameters: true,
      ...(envBoolean('OPENROUTER_REQUIRE_ZDR') ? { zdr: true } : {}),
    },
    stream: true as const,
  };
}
```

No aceptes `model`, `models`, `provider`, `plugins`, `tools`, system messages ni parámetros de costo directamente desde un cliente anónimo. Si el producto permite selección de modelo, mapea un ID público a una allowlist del servidor.

## 6. Streaming del servidor al navegador

Este esqueleto normaliza la salida como NDJSON. Puedes usar SSE si el proyecto ya tiene un parser SSE correcto.

```typescript
const encoder = new TextEncoder();

function encodeEvent(event: OutboundEvent): Uint8Array {
  return encoder.encode(`${JSON.stringify(event)}\n`);
}

export async function POST(request: Request): Promise<Response> {
  const jsonHeaders = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
  applySecurityHeaders(jsonHeaders);

  if (!validateOrigin(request)) {
    return Response.json({ error: 'Origen no permitido' }, { status: 403, headers: jsonHeaders });
  }

  const limit = await consumeRateLimit(getTrustedPrincipal(request));
  if (!limit.allowed) {
    jsonHeaders.set('Retry-After', String(limit.retryAfterSeconds));
    return Response.json(
      { error: 'Demasiadas solicitudes' },
      { status: 429, headers: jsonHeaders },
    );
  }

  let question: string;
  let history: ClientMessage[];
  try {
    const body = await request.json();
    question = validateText(body?.question, 1_000);
    history = validateHistory(body?.history ?? []);
  } catch {
    return Response.json({ error: 'Solicitud inválida' }, { status: 400, headers: jsonHeaders });
  }

  let upstream;
  try {
    upstream = await openRouter.chat.send({
      chatRequest: buildChatRequest(question, history),
    });
  } catch (error: unknown) {
    return mapPreStreamError(error, jsonHeaders);
  }

  const streamHeaders = new Headers({
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
  });
  applySecurityHeaders(streamHeaders);

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const rawChunk of upstream) {
          const chunk = rawChunk as {
            error?: { code?: number | string; message?: string };
            choices?: Array<{ delta?: { content?: string | null } }>;
            usage?: { promptTokens?: number; completionTokens?: number };
          };

          if (chunk.error) {
            controller.enqueue(encodeEvent({
              type: 'error',
              code: 'upstream_stream_error',
              message: 'La generación se interrumpió. Intenta de nuevo.',
            }));
            controller.close();
            return;
          }

          const text = chunk.choices?.[0]?.delta?.content;
          if (text) controller.enqueue(encodeEvent({ type: 'delta', text }));

          if (chunk.usage) {
            controller.enqueue(encodeEvent({ type: 'usage', ...chunk.usage }));
          }
        }

        controller.enqueue(encodeEvent({ type: 'done' }));
        controller.close();
      } catch {
        controller.enqueue(encodeEvent({
          type: 'error',
          code: 'stream_transport_error',
          message: 'La conexión se interrumpió.',
        }));
        controller.close();
      }
    },
    cancel() {
      // Conecta esta cancelación con la API soportada por la versión instalada
      // para cerrar la petición upstream, no solo el stream hacia el navegador.
    },
  });

  return new Response(body, { status: 200, headers: streamHeaders });
}
```

Implementa `mapPreStreamError` con las clases/campos reales de la versión instalada. Nunca envíes `error.message`, `metadata`, el request transformado o detalles de proveedor directamente al cliente.

## 7. Timeout y cancelación reales

Comprueba el `RequestOptions` de la versión instalada y conecta una señal compuesta por:

- desconexión de `request.signal`;
- timeout del endpoint;
- cancelación explícita del usuario.

Si el SDK instalado no permite propagar la señal en esa operación, usa `fetch` directo para ese endpoint o una versión compatible. Un `Promise.race` que solo deja de esperar pero mantiene la petición upstream no cumple este requisito y puede seguir facturando.

El timer debe limpiarse en un `finally` que abarque la iteración completa del stream. No lo limpies al resolver `chat.send`: en streaming esa promesa puede resolver cuando apenas llegaron los headers. El callback `ReadableStream.cancel()` también debe abortar el mismo controller.

## 8. Parser NDJSON incremental en React

```typescript
async function consumeChatStream(
  response: Response,
  onEvent: (event: OutboundEvent) => void,
): Promise<void> {
  if (!response.ok) throw new Error('La solicitud no pudo completarse');
  if (!response.body) throw new Error('Respuesta sin stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      onEvent(JSON.parse(line) as OutboundEvent);
    }

    if (done) break;
  }

  if (buffer.trim()) onEvent(JSON.parse(buffer) as OutboundEvent);
}
```

El cliente debe diferenciar `error`, `done` y aborto deliberado. No debe presentar una respuesta parcial como completa ni reintentarla silenciosamente.

No intentes recuperar objetos JSON contando llaves: una llave dentro de un string JSON rompe ese algoritmo. Usa el framing del protocolo y conserva solo la línea/evento incompleto en el buffer.
