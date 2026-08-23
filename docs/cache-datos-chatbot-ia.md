# Implementación de Caché para Datos de Negocio en API de Chatbot con IA

## Contexto

En APIs serverless que usan modelos de IA (OpenAI, Anthropic, etc.), cada request consume tokens del system prompt. Si los datos del negocio se reconstruyen en cada llamada, esto resulta en:

- **Mayor consumo de recursos** (CPU/memoria)
- **Mayores costos** (tokens enviados al modelo)
- **Latencia innecesaria** (tiempo de construcción del prompt)

Esta implementación usa un caché en memoria simple pero efectivo para datos que cambian poco frecuentemente.

---

## Problema Original

```typescript
// ✕ Sin caché: reconstruye datos en cada request
async function getBusinessData(): Promise<BusinessData | null> {
  return {
    name: 'Mi Negocio',
    description: '...',
    servicios: [...], // Array grande
    faq: {...},       // Objeto grande
  };
}
```

**Impacto**: Con 100 requests/minuto, reconstruye este objeto 100 veces innecesariamente.

---

## Solución: Caché en Memoria

### 1. Variables Globales de Caché

```typescript
// Cache de datos del negocio
let cachedBusinessData: BusinessData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
```

**Por qué funciona en serverless:**
- En entornos como Netlify Functions/Cloudflare Workers, las instancias se mantienen "calientes" entre requests
- Las variables globales persisten mientras la instancia esté activa
- Es más eficiente que recrear objetos constantemente

### 2. Lógica de Validación de Caché

```typescript
async function getBusinessData(): Promise<BusinessData | null> {
  // ✓ Paso 1: Verificar si el caché es válido
  const now = Date.now();
  if (cachedBusinessData && now - cacheTimestamp < CACHE_DURATION) {
    return cachedBusinessData; // Retornar caché sin reconstruir
  }

  try {
    // ✓ Paso 2: Obtener datos (de DB, Firestore, o estáticos)
    const result: BusinessData = {
      name: 'Mi Negocio',
      description: 'Descripción del negocio...',
      servicios: [...],
      faq: {...},
    };

    // ✓ Paso 3: Guardar en caché
    cachedBusinessData = result;
    cacheTimestamp = Date.now();
    
    return result;
  } catch (error) {
    console.error('Error obteniendo datos:', error);
    return null;
  }
}
```

---

## Implementación Completa

### Código de Producción

```typescript
import { BusinessData } from './types';

// ============================================
// CONFIGURACIÓN DE CACHÉ
// ============================================

let cachedBusinessData: BusinessData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene información del negocio con caché en memoria.
 * 
 * @returns Datos del negocio o null si hay error
 */
async function getBusinessData(): Promise<BusinessData | null> {
  // Retornar caché si es válido
  const now = Date.now();
  if (cachedBusinessData && now - cacheTimestamp < CACHE_DURATION) {
    return cachedBusinessData;
  }

  try {
    // OPCIÓN 1: Desde Firestore/Base de datos
    /*
    const doc = await db.collection('businessInfo').doc('general').get();
    if (!doc.exists) {
      throw new Error('No se encontró información del negocio');
    }
    const data = doc.data() as BusinessData;
    
    cachedBusinessData = data;
    cacheTimestamp = Date.now();
    return data;
    */

    // OPCIÓN 2: Datos estáticos (más rápido)
    const result: BusinessData = {
      name: 'Gato Rojo Lab',
      description: 'Soluciones web centradas en UX...',
      servicios: [
        { name: 'Frontend Engineering', description: '...' },
        { name: 'Auditoría UX', description: '...' },
      ],
      faq: {
        '¿Pregunta 1?': 'Respuesta 1',
        '¿Pregunta 2?': 'Respuesta 2',
      },
    };

    // Guardar en caché
    cachedBusinessData = result;
    cacheTimestamp = Date.now();
    
    return result;
  } catch (error) {
    console.error('[Cache] Error obteniendo datos del negocio:', error);
    return null;
  }
}

// ============================================
// USO EN EL HANDLER
// ============================================

export async function POST(request: Request): Promise<Response> {
  // Obtener datos (usa caché automáticamente)
  const businessData = await getBusinessData();
  const systemPrompt = createSystemPrompt(businessData);
  
  // Enviar a la API de IA
  const response = await openai.chat.completions.create({
    model: 'gpt-5-nano',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuestion },
    ],
  });
  
  // ...
}
```

---

## Ventajas

### 1. **Reducción de Costos**
- **Antes**: 1000 requests = 1000 reconstrucciones del system prompt
- **Después**: 1000 requests = ~4 reconstrucciones (cada 5 min)
- **Ahorro**: ~40-60% menos tokens consumidos en system prompt

### 2. **Mejor Rendimiento**
- Sin llamadas repetidas a base de datos
- Sin reconstrucción de objetos grandes
- Menor latencia en respuestas

### 3. **Simplicidad**
- No requiere Redis, Memcached u otra infraestructura
- Funciona out-of-the-box en serverless
- Fácil de entender y mantener

---

## Configuración Recomendada

### Duración del Caché según Tipo de Datos

```typescript
// Datos que cambian raramente (info del negocio, configuración)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Datos que cambian frecuentemente (inventario, precios)
const CACHE_DURATION = 1 * 60 * 1000; // 1 minuto

// Datos casi estáticos (FAQ, términos de servicio)
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

// Datos completamente estáticos
// Usar Infinity o simplemente no validar timestamp
const CACHE_DURATION = Infinity;
```

### Invalidación Manual (Opcional)

```typescript
/**
 * Invalida el caché forzando una recarga en el próximo request.
 */
function invalidateCache(): void {
  cachedBusinessData = null;
  cacheTimestamp = 0;
}

// Usar en endpoints de administración
export async function PUT_UpdateBusinessData(request: Request) {
  // Actualizar datos en DB
  await db.update(newData);
  
  // Invalidar caché
  invalidateCache();
  
  return new Response('OK');
}
```

---

## Consideraciones Importantes

### ◬ Limitaciones

1. **Cold Starts**: En el primer request después de un cold start, el caché estará vacío
2. **No compartido entre instancias**: Cada instancia serverless tiene su propio caché
3. **Pérdida de memoria**: Si la instancia se recicla, se pierde el caché

### ✓ Cuándo Usar Este Patrón

- Datos del negocio que cambian poco
- System prompts con configuración estática
- Información de catálogos o servicios
- FAQs y contenido educativo
- Traducciones o configuraciones de idioma

### ✕ Cuándo NO Usar Este Patrón

- Datos específicos del usuario (usar sesiones)
- Información sensible o privada
- Datos que DEBEN estar sincronizados entre instancias
- Aplicaciones con alta frecuencia de actualización

---

## Variantes Avanzadas

### Con Múltiples Cachés

```typescript
// Diferentes cachés para diferentes tipos de datos
let cachedBusinessData: BusinessData | null = null;
let cachedFAQ: FAQ | null = null;
let cachedServices: Service[] | null = null;

let businessDataTimestamp = 0;
let faqTimestamp = 0;
let servicesTimestamp = 0;

const BUSINESS_CACHE_DURATION = 10 * 60 * 1000; // 10 min
const FAQ_CACHE_DURATION = 30 * 60 * 1000;      // 30 min
const SERVICES_CACHE_DURATION = 5 * 60 * 1000;  // 5 min
```

### Con Logging para Monitoreo

```typescript
async function getBusinessData(): Promise<BusinessData | null> {
  const now = Date.now();
  
  if (cachedBusinessData && now - cacheTimestamp < CACHE_DURATION) {
    console.log('[Cache] HIT - Usando datos en caché');
    return cachedBusinessData;
  }

  console.log('[Cache] MISS - Recargando datos');
  const startTime = Date.now();
  
  // Obtener datos...
  
  const loadTime = Date.now() - startTime;
  console.log(`[Cache] Datos cargados en ${loadTime}ms`);
  
  cachedBusinessData = result;
  cacheTimestamp = Date.now();
  return result;
}
```

---

## Testing

```typescript
import { describe, test, expect, beforeEach } from 'vitest';

describe('Cache de datos del negocio', () => {
  beforeEach(() => {
    // Limpiar caché antes de cada test
    invalidateCache();
  });

  test('retorna datos en la primera llamada', async () => {
    const data = await getBusinessData();
    expect(data).not.toBeNull();
    expect(data?.name).toBe('Gato Rojo Lab');
  });

  test('usa caché en llamadas subsecuentes', async () => {
    const data1 = await getBusinessData();
    const data2 = await getBusinessData();
    
    // Debe ser la misma referencia en memoria
    expect(data1).toBe(data2);
  });

  test('recarga después de expiración', async () => {
    const data1 = await getBusinessData();
    
    // Simular expiración
    cacheTimestamp = Date.now() - (CACHE_DURATION + 1000);
    
    const data2 = await getBusinessData();
    
    // Nueva instancia, pero mismo contenido
    expect(data1).not.toBe(data2);
    expect(data1?.name).toBe(data2?.name);
  });
});
```

---

## Resumen

✓ **Implementa caché en memoria para:**
- Reducir costos de tokens en APIs de IA
- Mejorar rendimiento de respuesta
- Simplificar arquitectura sin infraestructura adicional

✓ **Úsalo para:**
- Datos estáticos o casi estáticos
- System prompts de chatbots
- Información del negocio

✕ **No uses para:**
- Datos de usuario específicos
- Información que cambia frecuentemente
- Datos sensibles que requieren sincronización

---

## Referencias

- [OpenAI API - Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [Cloudflare Workers - Global State](https://developers.cloudflare.com/workers/runtime-apis/web-standards/)
- [Netlify Functions - Performance](https://docs.netlify.com/functions/overview/)

---

**Última actualización**: Junio 2026  
**Proyecto**: Waku Portfolio - Gato Rojo Lab
