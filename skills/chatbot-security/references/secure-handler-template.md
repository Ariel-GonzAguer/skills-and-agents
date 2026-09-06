# Detailed reference

This material was moved from `SKILL.md` to keep the loaded workflow focused.

## Complete Secure Handler Template

Copy this as the starting point for any new chatbot API endpoint:

```typescript
import OpenAI from 'openai';
import { info as logInfo, warn as logWarn, error as logError } from '../../utils/logger/logger';
import { validateOrigin, applySecurityHeaders } from '../../utils/security/security';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ALLOWED_ORIGINS = ['https://yoursite.com', 'http://localhost:3000'];
const RATE_LIMIT = 7;
const RATE_WINDOW = 60_000;
const ALLOWED_ROLES = ['user', 'assistant'] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function sanitizeInput(text: string): string {
  return text.trim().replace(/\s+/g, ' ').slice(0, 500).replace(/[<>'"&]/g, '');
}

async function checkRateLimit(ip: string): Promise<boolean> {
  const now = Date.now();
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('rate-limits');
    const entry = await store.get(`rl:${ip}`, { type: 'json' }) as { count: number; resetTime: number } | null;
    if (!entry || now > entry.resetTime) { await store.setJSON(`rl:${ip}`, { count: 1, resetTime: now + RATE_WINDOW }); return true; }
    if (entry.count >= RATE_LIMIT) return false;
    await store.setJSON(`rl:${ip}`, { count: entry.count + 1, resetTime: entry.resetTime });
    return true;
  } catch { /* fallback */ }
  const e = rateLimitMap.get(ip);
  if (!e || now > e.resetTime) { rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW }); return true; }
  if (e.count >= RATE_LIMIT) return false;
  e.count++;
  return true;
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
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
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

  // 4. Sanitize inputs
  const sanitizedQuestion = sanitizeInput(question);
  logInfo(`[chatbot] Question: "${sanitizedQuestion.slice(0, 50)}${sanitizedQuestion.length > 50 ? '...' : ''}"`);

  // 5. Build history with role whitelist + token budget
  const MAX_HISTORY_TOKENS = 2000;
  let tokenCount = 0;
  const filteredHistory: { role: AllowedRole; content: string }[] = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    const role: AllowedRole = ALLOWED_ROLES.includes(msg.role) ? msg.role : 'user';
    const content = sanitizeInput(msg.content || '');
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
    stream = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'System prompt here' },
          ...filteredHistory,
          { role: 'user', content: sanitizedQuestion },
        ],
        max_completion_tokens: 500,
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
          const content = chunk.choices[0]?.delta?.content ?? '';
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
