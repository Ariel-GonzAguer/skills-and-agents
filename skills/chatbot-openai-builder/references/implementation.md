# Referencia detallada

Este material se movió desde `SKILL.md` para mantener el workflow cargado enfocado.

## Contenido

- [API serverless](#1-api-serverless-backend)
- [Funciones auxiliares](#funciones-auxiliares-críticas)
- [Componente frontend](#2-componente-frontend-ui-flotante)

## Implementación paso a paso

### 1. API Serverless (Backend)

#### Esqueleto del archivo API

Este ejemplo muestra el flujo y requiere adaptar `checkRateLimit`, `validateOrigin`, `businessData`
y `allowedOrigins` al runtime real. No lo presentes como listo para producción hasta completar y probar esas fronteras.

```typescript
import OpenAI from 'openai';

// Configuración
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Contratos que deben implementarse con las primitivas confiables del runtime.
const RATE_LIMIT = 7; // requests por ventana
const RATE_WINDOW = 60 * 1000; // 1 minuto

declare function consumeRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ allowed: boolean; retryAfterSeconds: number }>;
declare function getTrustedClientIp(request: Request): string;
declare function validateOrigin(request: Request, allowedOrigins: string[]): boolean;

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
  const clientIp = getTrustedClientIp(request);
  const rateLimit = await consumeRateLimit({
    key: `chat:${clientIp}`,
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW,
  });
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ 
      error: 'Demasiadas solicitudes. Espera un minuto.' 
    }), {
      status: 429,
      headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
    });
  }

  // 3. Parsear y validar input
  const { question, history = [] } = await request.json();
  if (typeof question !== 'string' || question.trim().length === 0) {
    return Response.json({ error: 'Pregunta inválida' }, { status: 400 });
  }
  const sanitized = validateInput(question);

  // Validar historial del cliente (ver chatbot-security): debe ser array, solo roles
  // permitidos y contenido string acotado. Nunca aceptar el rol 'system' del cliente.
  const ALLOWED_ROLES = ['user', 'assistant'];
  const historialValido = Array.isArray(history)
    ? history
        .filter(m => m && ALLOWED_ROLES.includes(m.role) && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: validateInput(m.content).slice(0, 2000) }))
        .slice(-10)
    : [];

  // 4. Streaming con Responses API
  const stream = await openai.responses.create({
    model: process.env.OPENAI_MODEL,
    instructions: createSystemPrompt(businessData),
    input: [...historialValido, { role: 'user', content: sanitized }],
    max_output_tokens: 500,
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
          const content = chunk.type === 'response.output_text.delta' ? chunk.delta : '';
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

**Validación y límites de inputs:**
```typescript
function validateInput(text: string): string {
  if (typeof text !== 'string') throw new TypeError('El contenido debe ser texto');
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios
    .slice(0, 500); // Limitar costo y abuso; React escapará el texto al renderizar
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
