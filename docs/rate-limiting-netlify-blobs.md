# Rate Limiting Serverless con Netlify Blobs

## Problema

En funciones serverless (Netlify Functions), el rate limiting en memoria con `Map` no funciona porque:

- Cada invocacion de funcion corre en una instancia separada
- Las cold starts reinician el estado completamente
- No hay memoria compartida entre instancias

## Solucion: Netlify Blobs

Netlify Blobs es un almacenamiento clave-valor persistente, nativo de Netlify, sin costo adicional en el plan gratuito. Perfecto para rate limiting serverless.

### Instalacion

```bash
pnpm add @netlify/blobs
```

No requiere configuracion adicional en `netlify.toml`.

### Implementacion

```typescript
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const RATE_LIMIT = 7;         // requests (conservador por race conditions)
const RATE_WINDOW = 60_000;   // 1 minuto en ms

// Fallback en memoria cuando Netlify Blobs no esta disponible
const rateLimitMap = new Map<string, RateLimitEntry>();

async function checkRateLimit(clientIp: string): Promise<boolean> {
  const now = Date.now();
  const key = `ratelimit:${clientIp}`;

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('rate-limits');
    const raw = await store.get(key, { type: 'json' });
    const entry = raw as RateLimitEntry | null;

    if (!entry || now > entry.resetTime) {
      await store.setJSON(key, { count: 1, resetTime: now + RATE_WINDOW });
      return true;
    }

    if (entry.count >= RATE_LIMIT) return false;

    await store.setJSON(key, { count: entry.count + 1, resetTime: entry.resetTime });
    return true;
  } catch {
    // Fallback: rate limit en memoria (desarrollo local o entorno sin Netlify)
  }

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

  // ... logica del handler
}
```

### Pruebas

En tests, haz mock de `@netlify/blobs` para forzar el fallback a memoria:

```typescript
vi.mock('@netlify/blobs', () => ({}));
```

Esto hace que `getStore` sea `undefined`, lanzando el `catch` y usando el `Map` en memoria, que es deterministico y facil de testear.

### Comportamiento

| Entorno | Almacenamiento | Persistente |
|---|---|---|
| Produccion (Netlify) | Netlify Blobs | Si |
| Desarrollo local (Netlify CLI) | Netlify Blobs | Si |
| Tests | Memoria (fallback) | No, pero deterministico |
| Otros entornos | Memoria (fallback) | No |

### Notas

- `getStore('rate-limits')` crea el store automaticamente en el primer uso
- Los nombres de store deben ser unicos por proyecto
- Netlify Blobs tiene un limite de 100MB en el plan gratuito
- Las keys expiran con TTL implicito segun `resetTime`

### ◬ Limitación: Race Conditions

Netlify Blobs no ofrece operaciones atómicas, por lo que peticiones concurrentes pueden causar race conditions (permitir más peticiones del límite configurado). Por esto:

- El límite se ajusta a **7 en lugar de 10** para compensar el margen de error. Actualmente está permitiendo hasta un 30% más de lo configurado, pero es un trade-off necesario para evitar rechazos injustos.
- Si necesitas atomicidad estricta, considera un almacén externo con operaciones atómicas (por ejemplo, Upstash Redis o similar).
- Ver análisis completo en [Análisis completo de la race condition](./race-condition-rate-limiting.md)
