# CSP con Nonces — Netlify Edge Functions

Content Security Policy (CSP) con nonces generados dinámicamente por request para máxima seguridad.

---

## ¿Por qué nonces?

Un nonce es un valor aleatorio único por request que permite ejecutar scripts específicos sin usar `'unsafe-inline'`. Cada request genera un nonce distinto, lo que invalida cualquier intento de inyección de scripts.

---

## Implementación en Netlify

### 1. Crear la Edge Function

```typescript
// netlify/edge-functions/csp-nonce.ts
import type { Context } from 'netlify:edge';

export default async function handler(req: Request, context: Context) {
  const response = await context.next();

  // Generar nonce aleatorio y seguro
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));

  // Construir la CSP
  const csp = [
    `default-src 'none'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `script-src-elem 'self' 'nonce-${nonce}'`,
    `connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com`,
    `img-src 'self' data: https:`,
    `style-src 'self' 'unsafe-inline'`,  // Necesario para Tailwind
    `font-src 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Nonce', nonce); // Para acceder desde el HTML si hace falta

  return response;
}
```

### 2. Configurar `netlify.toml`

```toml
[[edge_functions]]
  path = "/*"
  function = "csp-nonce"
```

### 3. Usar el nonce en scripts

```html
<!-- En el HTML generado por el servidor -->
<script nonce="VALOR_DEL_NONCE">
  // Solo este script puede ejecutarse
</script>
```

---

## Cabeceras de seguridad adicionales recomendadas

```typescript
// Agregar junto a la CSP en la Edge Function
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
```

> **Nota**: Si la app necesita cámara (ej: QR scanner), cambiar `camera=()` por `camera=(self)` para permitir acceso solo al mismo origen.

---

## Limitaciones

- Esta implementación **solo funciona en Netlify** (Edge Functions de Netlify con Deno)
- En desarrollo local (`netlify dev`), la edge function puede no ejecutarse igual
- No compatible con Vercel sin adaptar a Vercel Edge Functions (diferente API)

---

## Alternativa estática (sin nonces)

Si el proyecto es completamente estático y no necesita scripts inline:

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self'"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

## Verificación

1. Desplegar en Netlify
2. Abrir DevTools → Network → cualquier request
3. En Response Headers verificar `Content-Security-Policy`
4. En la consola no deben aparecer errores de CSP

---

## Recursos

- [MDN — Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Netlify Edge Functions docs](https://docs.netlify.com/edge-functions/overview/)
- [CSP Evaluator (Google)](https://csp-evaluator.withgoogle.com/)
