# Referencia detallada

Este material se movió desde `SKILL.md` para mantener el workflow cargado enfocado.

## Esqueleto de handler seguro

Adapta este esqueleto al runtime. `consumeRateLimit` y `getTrustedClientIp` representan
integraciones obligatorias con APIs confiables del proveedor; no son helpers opcionales.

```typescript
import OpenAI from 'openai';
import { info as logInfo, warn as logWarn, error as logError } from '../../utils/logger/logger';
import { validateOrigin, applySecurityHeaders } from '../../utils/security/security';
import { consumeRateLimit, getTrustedClientIp } from '../../utils/security/rate-limit';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ALLOWED_ORIGINS = ['https://yoursite.com', 'http://localhost:3000'];
const RATE_LIMIT = 7;
const RATE_WINDOW = 60_000;
const ALLOWED_ROLES = ['user', 'assistant'] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function validateInput(text: string): string {
  if (typeof text !== 'string') throw new TypeError('El contenido debe ser texto');
  return text.trim().replace(/\s+/g, ' ').slice(0, 500);
}

async function checkRateLimit(ip: string): Promise<boolean> {
  return consumeRateLimit({ key: ip, limit: RATE_LIMIT, windowMs: RATE_WINDOW });
}

export async function POST(request: Request): Promise<Response> {
  // 1. CSRF
  if (!validateOrigin(request, ALLOWED_ORIGINS)) {
    logWarn('[chatbot] Origin rejected');
    const h = new Headers({ 'Content-Type': 'application/json' });
    applySecurityHeaders(h);
    return new Response(JSON.stringify({ error: 'Origen no permitido' }), { status: 403, headers: h });
  }

  // 2. Rate limit
  const clientIp = getTrustedClientIp(request);
  if (!(await checkRateLimit(clientIp))) {
    logWarn(`[chatbot] Rate limit exceeded for ${clientIp}`);
    const h = new Headers({ 'Content-Type': 'application/json' });
    applySecurityHeaders(h);
    h.set('Retry-After', String(RATE_WINDOW / 1000));
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Espera un minuto.' }), { status: 429, headers: h });
  }

  // 3. Parse & validate body
  const body = await request.json();
  const { question, history = [] } = body;

  if (!question || typeof question !== 'string') {
    const h = new Headers({ 'Content-Type': 'application/json' });
    applySecurityHeaders(h);
    return new Response(JSON.stringify({ error: 'Pregunta requerida' }), { status: 400, headers: h });
  }

  if (!Array.isArray(history)) {
    const h = new Headers({ 'Content-Type': 'application/json' });
    applySecurityHeaders(h);
    return new Response(JSON.stringify({ error: 'Formato inválido' }), { status: 400, headers: h });
  }

  // 4. Validate and bound inputs. Do not log user content by default.
  const sanitizedQuestion = validateInput(question);
  logInfo('[chatbot] Valid request received');

  // 5. Build history with role whitelist + token budget
  const MAX_HISTORY_TOKENS = 2000;
  let tokenCount = 0;
  const filteredHistory: { role: AllowedRole; content: string }[] = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (!msg || typeof msg.content !== 'string' || !ALLOWED_ROLES.includes(msg.role)) continue;
    const role: AllowedRole = msg.role;
    const content = validateInput(msg.content);
    const tokens = Math.ceil(content.length / 4);
    if (tokenCount + tokens > MAX_HISTORY_TOKENS) break;
    filteredHistory.unshift({ role, content });
    tokenCount += tokens;
  }

  // 6. Call LLM with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  let stream;
  try {
    stream = await openai.responses.create(
      {
        model: process.env.OPENAI_MODEL,
        instructions: 'System prompt here',
        input: [
          ...filteredHistory,
          { role: 'user', content: sanitizedQuestion },
        ],
        max_output_tokens: 500,
        stream: true,
      },
      { signal: controller.signal },
    );
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if ((err as { name?: string }).name === 'AbortError') {
      const h = new Headers({ 'Content-Type': 'application/json' });
      applySecurityHeaders(h);
      return new Response(JSON.stringify({ error: 'Timeout. Intenta de nuevo.' }), { status: 504, headers: h });
    }
    logError('[chatbot] LLM call failed:', err);
    throw err;
  }
  clearTimeout(timeoutId);

  // 7. Stream response with security headers
  const encoder = new TextEncoder();
  const responseHeaders = new Headers({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
  applySecurityHeaders(responseHeaders);

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.type === 'response.output_text.delta' ? chunk.delta : '';
          if (content) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        logError('[chatbot] Streaming error:', err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, { headers: responseHeaders });
}
```

---
