# Referencia detallada

Este material se movió desde `SKILL.md` para mantener el workflow cargado enfocado.

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

## Solución de problemas

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
4. Usar modelo económico (gpt-5-nano)
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

## Despliegue

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
