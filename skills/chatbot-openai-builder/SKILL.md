---
name: chatbot-openai-builder
version: 1.0.0
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
- OpenAI SDK (gpt-5-nano para bajo costo y respuestas rápidas; gpt-4.1-mini como balance costo/calidad)
- Netlify Blobs o similar para rate limiting persistente

**Seguridad:**
- Validación de origen (CSRF)
- Rate limiting por IP
- Sanitización de inputs
- Variables de entorno para API keys

## Implementación paso a paso

Usa el stack del proyecto y las restricciones de seguridad para seleccionar una ruta de implementación. Lee [implementation.md](references/implementation.md) cuando necesites comandos detallados, plantillas o ejemplos de implementación.

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
- Usar modelo económico (gpt-5-nano)

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

Prueba el límite del servidor, la UI con streaming, el rate limiting y la accesibilidad antes de desplegar. Lee [testing.md](references/testing.md) cuando necesites comandos detallados, plantillas o ejemplos de implementación.

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

Mantén las personalizaciones tokenizadas y la configuración de despliegue específica por entorno. Lee [customization-and-deployment.md](references/customization-and-deployment.md) cuando necesites comandos detallados, plantillas o ejemplos de implementación.

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
