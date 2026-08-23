# Solución: Race Condition en Rate Limiting

## Problema Identificado

El rate limiting actual con Netlify Blobs permite más peticiones de las configuradas (14 en lugar de 10) debido a una **race condition**.

### ¿Por qué ocurre?

```typescript
// Peticiones simultáneas:
// 1. Petición A lee count = 9
// 2. Petición B lee count = 9 (antes de que A actualice)
// 3. Petición C lee count = 9 (antes de que A y B actualicen)
// 4. Todas pasan porque 9 < 10
// 5. Todas incrementan y escriben → resultado: 12 peticiones procesadas
```

Las operaciones `get` → verificar → `setJSON` **no son atómicas**, permitiendo lecturas concurrentes del mismo valor.

---

## Solución 1: Upstash Rate Limit (Recomendada)

Upstash ofrece rate limiting distribuido y atómico diseñado para serverless.

### Instalación

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

### Configuración

1. Crear cuenta gratuita en [Upstash](https://console.upstash.com/)
2. Crear una base de datos Redis
3. Copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
4. Agregar a variables de entorno en Netlify:

```bash
# Netlify Dashboard → Site settings → Environment variables
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxx
```

### Implementación

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configurar Redis y Rate Limiter
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 peticiones por minuto
  analytics: true, // Opcional: métricas en Upstash
});

/**
 * Verifica rate limit usando Upstash (atómico y distribuido)
 */
async function checkRateLimit(clientIp: string): Promise<boolean> {
  try {
    const { success } = await ratelimit.limit(clientIp);
    return success;
  } catch (error) {
    logError('[RateLimit] Error con Upstash:', error);
    // Opción 1: Permitir la petición (fail open)
    return true;
    // Opción 2: Bloquear la petición (fail closed)
    // return false;
  }
}
```

### Uso en el handler

```typescript
export async function POST(request: Request): Promise<Response> {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!(await checkRateLimit(clientIp))) {
    return new Response(
      JSON.stringify({ error: 'Demasiadas solicitudes. Por favor espera un minuto.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ... resto del handler
}
```

### Ventajas

✅ Operaciones atómicas → **sin race conditions**  
✅ Distribuido → funciona con múltiples instancias serverless  
✅ Algoritmos avanzados: sliding window, token bucket, fixed window  
✅ Analytics incluido  
✅ Plan gratuito: 10,000 comandos/día  

---

## Solución 2: Mejorar Netlify Blobs con Check-Increment

Si prefieres mantener Netlify Blobs, puedes reducir (pero no eliminar completamente) las race conditions agregando una verificación post-incremento:

```typescript
async function checkRateLimit(clientIp: string): Promise<boolean> {
  const now = Date.now();
  const key = `ratelimit:${clientIp}`;

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('rate-limits');
    const raw = await store.get(key, { type: 'json' });
    const entry = raw as RateLimitEntry | null;

    // Reset si expiró
    if (!entry || now > entry.resetTime) {
      await store.setJSON(key, { count: 1, resetTime: now + RATE_WINDOW });
      return true;
    }

    // Verificación PRE-incremento
    if (entry.count >= RATE_LIMIT) {
      logWarn(`[RateLimit] ${clientIp} excedió el límite (${entry.count}/${RATE_LIMIT})`);
      return false;
    }

    // Incrementar
    const newCount = entry.count + 1;
    await store.setJSON(key, { count: newCount, resetTime: entry.resetTime });

    // Verificación POST-incremento (mitigación de race condition)
    const checkRaw = await store.get(key, { type: 'json' });
    const checkEntry = checkRaw as RateLimitEntry | null;
    
    if (checkEntry && checkEntry.count > RATE_LIMIT) {
      logWarn(`[RateLimit] ${clientIp} detectado post-incremento (${checkEntry.count}/${RATE_LIMIT})`);
      return false;
    }

    return true;
  } catch {
    logWarn('[OpenAI] Netlify Blobs no disponible, usando rate limit en memoria');
  }

  // Fallback en memoria (sin cambios)
  const entry = rateLimitMap.get(clientIp);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}
```

### Limitaciones

⚠️ **No es 100% atómico** → aún puede haber race conditions (reducidas)  
⚠️ Requiere una lectura adicional → más lento  
⚠️ Si múltiples peticiones incrementan entre la primera y segunda lectura, aún pasarán  

---

## Solución 3: Rate Limit Más Conservador

Ajustar el límite para compensar las race conditions:

```typescript
const RATE_LIMIT = 8; // En lugar de 10, para tener margen de error
const RATE_WINDOW = 60 * 1000;
```

✅ Simple  
⚠️ No resuelve el problema real  
⚠️ Reduce la capacidad real para usuarios legítimos  

---

## Recomendación Final

**Usa Upstash Rate Limit** (Solución 1). Es la única que garantiza atomicidad en entornos serverless distribuidos y es lo que se usa en producción para este tipo de casos.

Si quieres mantener Netlify Blobs por simplicidad, considera:
1. Ajustar el límite a 7-8 (Solución 3)
2. Implementar la verificación post-incremento (Solución 2)
3. Aceptar que 1-4 peticiones adicionales pueden pasar ocasionalmente

---

## Próximos Pasos

1. Decidir qué solución implementar
2. Si eliges Upstash:
   - Crear cuenta y base de datos
   - Configurar variables de entorno
   - Actualizar código en `src/pages/_api/api-openai.ts`
   - Actualizar tests en `src/__tests__/api/api-openai.test.ts`
3. Desplegar y probar con 20 peticiones rápidas
4. Verificar logs para confirmar que el límite se respeta
