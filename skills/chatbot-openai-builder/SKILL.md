---
name: chatbot-openai-builder
description: |
  Construye chatbots accesibles con OpenAI GPT, streaming de respuestas, rate limiting y UI flotante. 
  Usa cuando el usuario pida: crear chatbot, integrar OpenAI, asistente virtual, chat con IA, 
  chatbot con streaming, chatbot accesible WCAG, chat flotante, implementar GPT en mi sitio.
---

# Chatbot OpenAI Builder

Construye chatbots de calidad de producción con OpenAI, accesibilidad WCAG 2.1+, streaming de respuestas, rate limiting y experiencia de usuario optimizada.

## Cuándo usar esta skill

Usa esta skill cuando el usuario mencione:
- "crear chatbot", "integrar OpenAI", "asistente virtual"
- "chat con IA", "GPT chatbot", "chatbot con streaming"
- "chatbot accesible", "chat WCAG", "asistente accesible"
- "chat flotante", "widget de chat", "implementar GPT"
- "chatbot para mi sitio", "asistente de negocios"

## Arquitectura del chatbot

### Stack tecnológico recomendado

**Frontend:**
- React con TypeScript (o cualquier framework: Next.js, Waku, Vite)
- Tailwind CSS para estilos
- Manejo de estado con useState

**Backend:**
- API serverless (Netlify Functions, Vercel Edge, Cloudflare Workers)
- OpenAI SDK (gpt-4.1-mini como balance costo/calidad; gpt-4.1 para mayor capacidad)
- Netlify Blobs o similar para rate limiting persistente

**Seguridad:**
- Validación de origen (CSRF)
- Rate limiting por IP
- Sanitización de inputs
- Variables de entorno para API keys

## Implementación paso a paso

### 1. API Serverless (Backend)

#### Estructura del archivo API

```typescript
import OpenAI from 'openai';

// Configuración
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting (Netlify Blobs con fallback en memoria)
const rateLimitMap = new Map();
const RATE_LIMIT = 7; // requests por ventana
const RATE_WINDOW = 60 * 1000; // 1 minuto

async function checkRateLimit(clientIp: string): Promise<boolean> {
  // Implementar con Netlify Blobs o similar para persistencia
  // Fallback a Map en memoria si no está disponible
}

// System prompt optimizado
function createSystemPrompt(businessData): string {
  return `Eres [Nombre], asistente de [Negocio].
  
INFO: [Descripción breve del negocio]
Contacto: [email], WhatsApp [teléfono]

SERVICIOS: [Lista compacta de servicios]

FAQ: [Preguntas frecuentes concatenadas]

REGLAS ESTRICTAS:
- Máximo 1-2 oraciones CORTAS
- NO des detalles técnicos sin que pregunten
- NO repitas info ya dicha
- NO solicites información al usuario
- Sé breve y directo`.trim();
}

export async function POST(request: Request): Promise<Response> {
  // 1. Validar origen (CSRF)
  if (!validateOrigin(request, allowedOrigins)) {
    return new Response(JSON.stringify({ error: 'Origen no permitido' }), {
      status: 403,
    });
  }

  // 2. Obtener IP y verificar rate limit
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!(await checkRateLimit(clientIp))) {
    return new Response(JSON.stringify({ 
      error: 'Demasiadas solicitudes. Espera un minuto.' 
    }), {
      status: 429,
      headers: { 'Retry-After': '60' },
    });
  }

  // 3. Parsear y sanitizar input
  const { question, history = [] } = await request.json();
  const sanitized = sanitizeInput(question);

  // Validar historial del cliente (ver chatbot-security): debe ser array, solo roles
  // permitidos y contenido string sanitizado. Nunca aceptar el rol 'system' del cliente.
  const ALLOWED_ROLES = ['user', 'assistant'];
  const historialValido = Array.isArray(history)
    ? history
        .filter(m => m && ALLOWED_ROLES.includes(m.role) && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: sanitizeInput(m.content).slice(0, 2000) }))
        .slice(-10)
    : [];

  // 4. Preparar mensajes (limitar historial para reducir tokens)
  const messages = [
    { role: 'system', content: createSystemPrompt(businessData) },
    ...historialValido, // Últimos 10 mensajes
    { role: 'user', content: sanitized }
  ];

  // 5. Streaming con OpenAI
  const stream = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages,
    max_completion_tokens: 500,
    stream: true,
  }, {
    // Timeout explícito: evita colgar la función serverless si OpenAI no responde.
    signal: AbortSignal.timeout(30_000),
    maxRetries: 1,
  });

  // 6. Crear ReadableStream para respuesta
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            const data = `data: ${JSON.stringify({ content })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

#### Funciones auxiliares críticas

**Sanitización de inputs:**
```typescript
function sanitizeInput(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios
    .slice(0, 500) // Límite de caracteres
    .replace(/[<>'"&]/g, ''); // Remover HTML peligroso
}
```

**Validación de origen:**
```typescript
function validateOrigin(request: Request, allowedOrigins: string[]): boolean {
  const origin = request.headers.get('origin');
  return origin ? allowedOrigins.includes(origin) : false;
}
```

**Cache de datos del negocio:**
```typescript
let cachedBusinessData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function getBusinessData() {
  const now = Date.now();
  if (cachedBusinessData && now - cacheTimestamp < CACHE_DURATION) {
    return cachedBusinessData;
  }
  
  // Obtener de Firestore, API o datos estáticos
  cachedBusinessData = { /* ... */ };
  cacheTimestamp = Date.now();
  return cachedBusinessData;
}
```

### 2. Componente Frontend (UI Flotante)

#### Estructura del componente

```tsx
'use client';
import { useState, useRef, useEffect, useId } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatbotOpenAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus en input al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Cerrar con Escape (WCAG 2.1.2)
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        toggleBtnRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus trap (WCAG 2.4.3)
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    
    const dialog = dialogRef.current;
    const selector = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    
    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(selector));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la respuesta');
      }

      // Leer streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';
      let assistantPlaceholder = false;

      if (!reader) throw new Error('No se pudo leer la respuesta');

      // Crear mensaje vacío del asistente
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '', 
        timestamp: Date.now() 
      }]);
      assistantPlaceholder = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Acumular en buffer: un chunk de red puede cortar un evento SSE por la mitad.
        buffer += decoder.decode(value, { stream: true });
        const partes = buffer.split('\n');
        buffer = partes.pop() ?? '';
        const lines = partes.filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.content;
              if (delta) {
                assistantMessage += delta;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    content: assistantMessage,
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Error parseando chunk:', e);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // Solo remover el placeholder si llegó a crearse; si el error fue antes,
      // slice(0, -1) borraría el mensaje del usuario por error.
      setMessages(prev => (assistantPlaceholder ? [...prev.slice(0, -1)] : prev));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Anuncio de apertura/cierre (WCAG 4.1.3) */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isOpen ? 'Chat abierto' : ''}
      </div>

      {/* Botón flotante */}
      <button
        ref={toggleBtnRef}
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-4 right-6 z-50 bg-blue-600 hover:bg-blue-700 rounded-full p-4 shadow-lg transition-all hover:scale-110 ${isOpen ? 'hidden' : ''}`}
        aria-label="Abrir chat"
        aria-expanded={isOpen}
        aria-controls="chat-window"
        type="button"
      >
        <ChatIcon />
      </button>

      {/* Ventana de chat */}
      <div
        ref={dialogRef}
        id="chat-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!isOpen}
        className={`fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col ${isOpen ? '' : 'hidden'}`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h3 id={titleId} className="font-semibold">Asistente Virtual</h3>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar chat"
            className="hover:bg-white/20 p-1 rounded"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Mensajes (WCAG 4.1.3: aria-live) */}
        <div
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Mensajes del chat"
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <p>¿En qué puedo ayudarte hoy?</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Indicador de escritura */}
          {isLoading && (
            <div className="flex justify-start" role="status" aria-label="Escribiendo">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          )}

          {/* Error (WCAG 4.1.3: role=alert) */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Escribe tu pregunta
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              aria-invalid={!!error}
              className="flex-1 border rounded-lg px-4 py-2 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label={isLoading ? 'Enviando...' : 'Enviar mensaje'}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
```

## Características de accesibilidad (WCAG 2.1+)

### WCAG 2.1.2: Sin trampa de teclado
- ✅ Tecla **Escape** cierra el chat y devuelve el foco al botón flotante

### WCAG 2.4.3: Orden del foco
- ✅ **Focus trap** dentro del modal cuando está abierto
- ✅ Tab/Shift+Tab navegan entre elementos focusables
- ✅ Al llegar al último elemento, Tab vuelve al primero

### WCAG 4.1.2: Nombre, función, valor
- ✅ `role="dialog"` con `aria-modal="true"` para el modal
- ✅ `aria-labelledby` conecta el título con el diálogo
- ✅ `aria-expanded` y `aria-controls` en el botón flotante
- ✅ Labels descriptivos en todos los controles

### WCAG 4.1.3: Mensajes de estado
- ✅ `role="log"` con `aria-live="polite"` para nuevos mensajes
- ✅ `role="alert"` con `aria-live="assertive"` para errores
- ✅ `role="status"` para el indicador de escritura
- ✅ Anuncio de apertura/cierre del chat

### Otras mejoras de accesibilidad
- ✅ `.sr-only` para texto solo para lectores de pantalla
- ✅ `aria-label` descriptivos en botones con íconos
- ✅ `aria-busy` durante carga
- ✅ `aria-invalid` y `aria-errormessage` en inputs con error
- ✅ Focus visible con anillos de enfoque

## Optimizaciones de rendimiento

### 1. Reducción de tokens (costos de OpenAI)
- System prompt compacto y sin redundancias
- Limitar historial a últimos 10-20 mensajes
- `max_completion_tokens` bajo (500-1000)
- Usar modelo económico (gpt-4.1-mini)

### 2. Cache de datos del negocio
```typescript
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function getBusinessData() {
  if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedData;
  }
  cachedData = await fetchFromDB();
  cacheTimestamp = Date.now();
  return cachedData;
}
```

### 3. Rate limiting persistente
```typescript
// Usar Netlify Blobs o similar para persistencia serverless
async function checkRateLimit(ip: string): Promise<boolean> {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore('rate-limits');
  const key = `ratelimit:${ip}`;
  
  const entry = await store.get(key, { type: 'json' });
  const now = Date.now();
  
  if (!entry || now > entry.resetTime) {
    await store.setJSON(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) return false;
  
  await store.setJSON(key, { count: entry.count + 1, resetTime: entry.resetTime });
  return true;
}
```

### 4. Timeout en peticiones
```typescript
const abortController = new AbortController();
const timeoutId = setTimeout(() => abortController.abort(), 30000);

const stream = await openai.chat.completions.create(
  { /* ... */ },
  { signal: abortController.signal }
);

clearTimeout(timeoutId);
```

## System prompt: mejores prácticas

### Estructura optimizada
```typescript
function createSystemPrompt(data: BusinessData): string {
  // Compactar servicios en una línea
  const services = data.servicios
    .map(s => `${s.name}: ${s.description}`)
    .join(' | ');
  
  // Compactar FAQ
  const faq = Object.entries(data.faq)
    .map(([q, a]) => `${q} ${a}`)
    .join(' ');

  return `Eres ${data.assistantName}, asistente de ${data.businessName}.

INFO: ${data.description}
Contacto: ${data.email}, WhatsApp ${data.phone}
Horarios: ${data.hours}

SERVICIOS: ${services}

FAQ: ${faq}

REGLAS ESTRICTAS:
- Máximo 1-2 oraciones CORTAS
- El mensaje de respuesta a la primera interacción debe ser: "${data.greetingMessage}"
- NO des detalles técnicos sin que pregunten
- NO repitas info ya dicha
- NO solicites información al usuario
- NO hagas preguntas de seguimiento
- Solo responde lo mínimo necesario
- Para más info: "Escribe a ${data.email}"
- Sé breve y directo`.trim();
}
```

### Consejos para prompts efectivos
1. **Sé específico con las reglas**: usa "REGLAS ESTRICTAS" para instrucciones críticas
2. **Compacta la información**: concatena en lugar de listar con bullets
3. **Define el tono**: "breve y directo", "amable pero conciso"
4. **Limita el largo de respuestas**: "Máximo 1-2 oraciones"
5. **Evita repetición**: "NO repitas info ya dicha"
6. **Da alternativas de contacto**: email o teléfono para más detalles

## Manejo de errores

### En el servidor
```typescript
try {
  // ... lógica
} catch (error) {
  // Errores específicos de OpenAI
  if (error.status === 401) {
    return new Response(JSON.stringify({ 
      error: 'API key inválida. Contacta al administrador.' 
    }), { status: 502 });
  }
  
  if (error.status === 429) {
    return new Response(JSON.stringify({ 
      error: 'Límite de OpenAI excedido. Intenta más tarde.' 
    }), { status: 502 });
  }
  
  // Error genérico
  return new Response(JSON.stringify({ 
    error: 'Error interno del servidor' 
  }), { status: 500 });
}
```

### En el cliente
```typescript
try {
  // ... fetch y streaming
} catch (err) {
  setError(err instanceof Error ? err.message : 'Error desconocido');
  setMessages(prev => prev.slice(0, -1)); // Remover mensaje vacío del asistente
} finally {
  setIsLoading(false);
}
```

## Variables de entorno necesarias

```bash
# .env.local
OPENAI_API_KEY=sk-proj-...
```

Para Netlify Functions:
```bash
# Netlify UI: Site settings > Environment variables
OPENAI_API_KEY=sk-proj-...
```

## Testing

### Pruebas unitarias del componente
```typescript
// ChatbotOpenAI.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatbotOpenAI from './ChatbotOpenAI';

test('abre y cierra el chat', () => {
  render(<ChatbotOpenAI />);
  const btn = screen.getByLabelText(/abrir chat/i);
  
  fireEvent.click(btn);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeVisible();
});

test('envía mensaje y recibe respuesta', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ 
              done: false, 
              value: new TextEncoder().encode('data: {"content":"Hola"}\n\n') 
            })
            .mockResolvedValueOnce({ done: true }),
        }),
      },
    })
  );
  
  render(<ChatbotOpenAI />);
  fireEvent.click(screen.getByLabelText(/abrir chat/i));
  
  const input = screen.getByPlaceholderText(/escribe tu pregunta/i);
  fireEvent.change(input, { target: { value: '¿Qué servicios ofrecen?' } });
  fireEvent.click(screen.getByLabelText(/enviar mensaje/i));
  
  await waitFor(() => {
    expect(screen.getByText(/Hola/i)).toBeInTheDocument();
  });
});
```

### Pruebas de accesibilidad
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('no tiene violaciones de accesibilidad', async () => {
  const { container } = render(<ChatbotOpenAI />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Pruebas de la API
```typescript
// api-openai.test.ts
import { POST } from './api-openai';

test('rechaza origen no permitido', async () => {
  const request = new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'origin': 'http://malicious.com' },
  });
  
  const response = await POST(request);
  expect(response.status).toBe(403);
});

test('rate limit funciona', async () => {
  const requests = Array(10).fill(null).map(() => 
    POST(createMockRequest({ ip: '1.2.3.4' }))
  );
  
  const responses = await Promise.all(requests);
  const tooMany = responses.filter(r => r.status === 429);
  expect(tooMany.length).toBeGreaterThan(0);
});
```

## Checklist de implementación

### Backend ✅
- [ ] Endpoint serverless creado (`/api/chat-openai`)
- [ ] OpenAI SDK instalado (`npm install openai`)
- [ ] API key en variables de entorno
- [ ] Rate limiting implementado (Netlify Blobs o fallback)
- [ ] Validación de origen (CSRF)
- [ ] Sanitización de inputs
- [ ] System prompt optimizado
- [ ] Streaming configurado
- [ ] Timeout de 30s
- [ ] Manejo de errores específicos
- [ ] Logging de métricas (tokens, duración)

### Frontend ✅
- [ ] Componente React con TypeScript
- [ ] Botón flotante con z-index alto
- [ ] Modal con `role="dialog"` y `aria-modal="true"`
- [ ] Focus trap implementado
- [ ] Tecla Escape cierra el chat
- [ ] Auto-focus en input al abrir
- [ ] Devuelve foco al botón al cerrar
- [ ] Auto-scroll a último mensaje
- [ ] Indicador de escritura (typing dots)
- [ ] Manejo de streaming SSE
- [ ] Historial de conversación
- [ ] Botón de limpiar conversación
- [ ] Mensajes de error visibles
- [ ] `aria-live` para anuncios
- [ ] `role="alert"` para errores

### Accesibilidad ✅
- [ ] WCAG 2.1.2: Sin trampa de teclado (Escape)
- [ ] WCAG 2.4.3: Focus trap y orden del foco
- [ ] WCAG 4.1.2: Roles y labels correctos
- [ ] WCAG 4.1.3: Anuncios con aria-live
- [ ] Labels en todos los controles
- [ ] Texto descriptivo en botones
- [ ] Focus visible con anillos
- [ ] Alto contraste (ratio 4.5:1+)

### Seguridad ✅
- [ ] Validación de origen implementada
- [ ] Rate limiting activo
- [ ] Inputs sanitizados
- [ ] API key nunca expuesta al frontend
- [ ] Headers de seguridad configurados

### Optimización ✅
- [ ] System prompt compacto
- [ ] Historial limitado (últimos 10-20 mensajes)
- [ ] `max_completion_tokens` configurado
- [ ] Cache de datos del negocio
- [ ] Timeout en peticiones
- [ ] Modelo económico elegido

## Personalización del chatbot

### Cambiar colores
```tsx
// Botón flotante
className="bg-red-600 hover:bg-amber-300"

// Mensajes del usuario
className="bg-red-600 text-white"

// Mensajes del asistente
className="bg-gray-100 text-gray-800"

// Header
className="bg-red-600 text-black"
```

### Cambiar posición
```tsx
// Esquina inferior derecha (default)
className="fixed bottom-4 right-6"

// Esquina inferior izquierda
className="fixed bottom-4 left-6"

// Centrado en la parte inferior
className="fixed bottom-4 left-1/2 -translate-x-1/2"
```

### Cambiar tamaño del modal
```tsx
// Pequeño (mobile-first)
className="w-80 h-96"

// Mediano (default)
className="w-96 h-[600px]"

// Grande
className="w-[32rem] h-[700px]"

// Responsivo
className="w-[min(90vw,24rem)] h-[min(85vh,600px)]"
```

### Personalizar el mensaje de bienvenida
```typescript
// En el system prompt
const greetingMessage = "¡Hola! Soy Mandarino, el asistente virtual de Gato Rojo Lab. ¿En qué puedo ayudarte hoy?";

// En el componente
{messages.length === 0 && (
  <div className="text-center text-gray-500 mt-20">
    <p className="text-lg mb-2">¡Hola, soy Mandarino 😸!</p>
    <p>¿En qué puedo ayudarte hoy?</p>
  </div>
)}
```

## Troubleshooting

### El streaming no funciona
**Problema:** Los mensajes no aparecen gradualmente.

**Solución:**
1. Verificar que el servidor envía `Content-Type: text/event-stream`
2. Asegurarse de que cada chunk tiene formato `data: {...}\n\n`
3. Verificar que el cliente parsea correctamente los eventos SSE

### Rate limit no persiste entre requests
**Problema:** El rate limiting solo funciona en memoria.

**Solución:**
1. Implementar Netlify Blobs o similar para persistencia
2. Verificar que la IP del cliente se obtiene correctamente (`x-forwarded-for`)

### El chat no es accesible con teclado
**Problema:** No se puede navegar con Tab o cerrar con Escape.

**Solución:**
1. Verificar que el focus trap está implementado
2. Asegurarse de que los event listeners están correctamente configurados
3. Verificar que todos los elementos interactivos son focusables

### Los mensajes no se anuncian a lectores de pantalla
**Problema:** Los usuarios con lectores de pantalla no escuchan los nuevos mensajes.

**Solución:**
1. Añadir `role="log"` con `aria-live="polite"` al contenedor de mensajes
2. Usar `role="alert"` con `aria-live="assertive"` para errores
3. Verificar que los mensajes están dentro de la región live

### Costos de OpenAI muy altos
**Problema:** La factura de OpenAI es mayor a lo esperado.

**Solución:**
1. Reducir `max_completion_tokens` a 500-1000
2. Limitar historial a últimos 10 mensajes
3. Compactar el system prompt
4. Usar modelo económico (gpt-4.1-mini)
5. Implementar cache de datos del negocio

## Integración con datos del negocio

### Opción 1: Firestore
```typescript
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

async function getBusinessData() {
  const doc = await db.collection('businessInfo').doc('general').get();
  return doc.data();
}
```

### Opción 2: Datos estáticos
```typescript
async function getBusinessData() {
  return {
    name: 'Mi Negocio',
    description: 'Descripción del negocio',
    hours: 'Lunes a viernes: 9am - 6pm',
    email: 'info@minegocio.com',
    phone: '+1234567890',
    servicios: [
      { name: 'Servicio 1', description: 'Descripción breve' },
      { name: 'Servicio 2', description: 'Descripción breve' },
    ],
    faq: {
      '¿Pregunta 1?': 'Respuesta 1',
      '¿Pregunta 2?': 'Respuesta 2',
    },
  };
}
```

### Opción 3: API externa
```typescript
async function getBusinessData() {
  const response = await fetch('https://api.minegocio.com/info');
  return response.json();
}
```

## Deployment

### Netlify
1. Crear archivo `netlify/functions/chat-openai.ts`
2. Configurar en `netlify.toml`:
```toml
[[redirects]]
  from = "/api/chat-openai"
  to = "/.netlify/functions/chat-openai"
  status = 200
```
3. Añadir variables de entorno en Netlify UI

### Vercel
1. Crear archivo `pages/api/chat-openai.ts`
2. Añadir variables de entorno en Vercel UI

### Cloudflare Workers
1. Crear Worker con la lógica de la API
2. Usar Durable Objects para rate limiting persistente

## Recursos adicionales

- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Netlify Blobs Documentation](https://docs.netlify.com/blobs/overview/)
- [React Streaming SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

## Ejemplo completo de referencia

Una implementación completa y funcional de este patrón existe en producción en Gato Rojo Lab (asistente virtual del estudio): endpoint serverless con rate limiting persistente, componente React con streaming y suite de tests. La implementación es privada, pero la estructura esperada es:

- `netlify-functions/api-openai.ts` — endpoint con validación, rate limit y streaming SSE
- `src/components/ChatbotOpenAI/` — UI accesible (diálogo con foco gestionado, anuncios ARIA)
- `src/__tests__/ChatbotOpenAI.test.tsx` — tests del componente y del manejo de errores
