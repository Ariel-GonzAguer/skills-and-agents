---
name: security-audit-webapp
description: |
  Auditoría completa de seguridad para aplicaciones web serverless (Waku/React/Netlify/Firebase).
  Usa esta skill SIEMPRE que el usuario pida: revisar seguridad, auditar vulnerabilidades,
  "puede un atacante robar datos", "revisá el código de seguridad", hardening, o cuando
  mencione OWASP, CSRF, XSS, rate limiting, IDOR, enumeración de emails, token storage,
  o cualquier preocupación de seguridad en una webapp. Aplica a proyectos con Firebase Auth,
  Firestore, Netlify Functions, Waku, React, Zustand, y stacks similares.
---

# Security Audit for Serverless Web Applications

Realiza una auditoría de seguridad exhaustiva siguiendo esta checklist. Cada sección debe revisarse
en orden y reportar hallazgos con severidad (🔴 Alto / 🟡 Medio / 🟢 Bajo / ✅ Correcto).

## 1. Flujo de Autenticación

Revisa la cadena completa de auth:

- ¿Cómo se hace login? (Firebase Auth, custom JWT, OAuth, email/password)
- ¿Cómo se verifica el token en el servidor? (JWKS, `jose`, Web Crypto API, `firebase-admin`)
- ¿Se valida issuer, audience, expiración, `auth_time`?
- ¿El middleware de auth se aplica a TODAS las rutas protegidas?
- ¿Hay rutas de API sin protección?
- ¿El registro público está deshabilitado si no se necesita?

Archivos típicos a revisar:
- `src/lib/auth/*.ts`
- `src/lib/server/verifyToken.ts`
- `src/pages/_api/**/*.ts`
- `netlify-functions/`
- `firebase.json`

## 2. Autorización y Control de Acceso a Datos (IDOR)

Verifica que un usuario no pueda acceder a datos de otro tenant/usuario:

- Cada API route debe resolver el `empresa_id` / `tenant_id` SERVER-SIDE
- NUNCA confiar en IDs enviados por el cliente para scoping
- Verificar RBAC: ¿hay distinción admin vs operador/usuario?
- ¿Las operaciones de escritura requieren rol admin?
- ¿Los objetos anidados (items, clientes, categorías) validan pertenencia a la empresa?

Archivos típicos:
- `src/lib/auth/wakuAuth.ts` o middleware equivalente
- `src/pages/_api/api/**/[id].ts`
- `src/lib/firestore/subcollections.ts`

## 3. Reglas de Firestore / Base de Datos

Si usa Firestore:

- Lee el archivo de reglas (`firestore.rules`, `firebase.json`)
- ¿Usa `request.auth != null` para auth?
- ¿Valida membresía con `get()` al documento de la empresa?
- ¿Las reglas de la DB son consistentes con el middleware de la API?
- ¿Hay reglas demasiado permisivas (`allow read: if true`)?
- ¿Los documentos `meta/sync` tienen write restringido?

## 4. Rate Limiting

- ¿Hay rate limiting en endpoints de autenticación (login, password reset)?
- ¿Hay rate limiting en endpoints de API?
- ¿Distingue entre reads y writes?
- ¿Es persistente (Netlify Blobs, Upstash) o solo en memoria?
- ¿Tiene fallback para desarrollo local?
- ¿Los thresholds son razonables para entornos con NAT compartido?

Archivos típicos:
- `src/lib/security/rateLimit.ts`
- `src/pages/_api/api/contact.ts`

## 5. CSRF y CORS

- ¿Las APIs state-changing (POST/PATCH/PUT/DELETE) validan `Origin` o usan token CSRF?
- ¿Se usa `Authorization: Bearer` (mitiga CSRF básico)?
- ¿Los dominios autorizados están configurados en Firebase Console?
- ¿La API key de Firebase tiene restricción de dominio?

## 6. Enumeración de Información (Information Leakage)

Revisa TODOS los mensajes de error:

- Login: ¿distingue entre "usuario no existe" y "contraseña incorrecta"?
- Password reset: ¿revela si un email está registrado?
- API errors: ¿filtra información sobre membresía, estructura de DB, o emails?
- Errores de token: ¿revelan si la cuenta existe pero no está vinculada?

Regla: si Firebase Auth client-side no se puede controlar (devuelve códigos de Google),
los mensajes de error de login son un riesgo aceptable documentado. El password reset
DEBE mostrar siempre éxito. Los errores de API deben ser genéricos.

## 7. Almacenamiento de Tokens

- ¿El token JWT se guarda en `localStorage`? (⚠️ vulnerable a XSS — un script malicioso puede robarlo)
- ¿Se guarda en `sessionStorage`? (mejor, pero aún vulnerable a XSS)
- ¿Solo en memoria (Zustand/React state)? (✅ ideal — no persiste entre sesiones)
- ¿Firebase Auth SDK maneja la persistencia en IndexedDB? (✅ aceptable)
- ¿Hay refresh token en cookie httpOnly? (✅ más seguro — inaccesible por JS)
- ¿Se usan cookies `SameSite=Strict` o `Lax`? (mitiga CSRF además de XSS)

**Impacto**: si un atacante logra inyectar XSS y el token está en `localStorage`, tiene acceso completo a la cuenta del usuario. Priorizar migración a cookies httpOnly.

## 8. Security Headers

Revisa headers HTTP de seguridad:

- Content-Security-Policy (CSP): ¿tiene nonces? ¿`script-src-attr 'none'`? ¿`require-trusted-types-for 'script'`?
- X-Frame-Options: ¿`SAMEORIGIN` o `DENY`?
- X-Content-Type-Options: ¿`nosniff`?
- Referrer-Policy
- Strict-Transport-Security (HSTS): ¿max-age suficiente?
- Cross-Origin-Opener-Policy (COOP)
- Permissions-Policy

**CSP mínimo recomendado para XSS:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'nonce-{random}';
  img-src 'self' data:;
  require-trusted-types-for 'script';
```

Archivos típicos:
- `netlify.toml`
- `netlify/edge-functions/csp-nonce.ts`

## 9. Input Sanitization & XSS Prevention

### 9.1 Attack Surface Inventory

Mapea TODOS los puntos de entrada de usuario en la app antes de auditar:

- **URL**: path segments, query params, hash fragment
- **Headers**: `Referer`, `User-Agent`, custom headers
- **Cookies**: valores legibles por JS (no httpOnly)
- **Form fields**: text, textarea, select, file uploads
- **postMessage**: datos recibidos de iframes o ventanas padre/hijo
- **WebSocket messages**: datos en tiempo real
- **localStorage / sessionStorage**: valores que el atacante puede setear

Archivos típicos a revisar:
- `src/pages/**/*.{ts,tsx}` — rutas y componentes
- `src/lib/**/*.{ts,js}` — helpers y utilidades
- `public/**/*.html` — HTML estático

### 9.2 Input Validation (server-side)

- ¿Se sanitiza TODO input de usuario? (trim, length limits, regex)
- ¿Hay protección contra NoSQL injection? (Firestore es inmune, pero verificar)
- ¿Los campos opcionales usan helpers tipo `optionalString()`, `truncateMax()`?
- ¿Se validan tipos (email, URL, phone)?
- ¿Los parámetros de URL se validan antes de usarlos?

### 9.3 Output Encoding (la defensa #1 contra XSS)

Input sanitization NO es suficiente. OWASP recomienda **output encoding** como primera línea de defensa:

- **HTML context**: encode `<`, `>`, `&`, `"`, `'` → `&lt;`, `&gt;`, `&amp;`, `&quot;`, `&#x27;`
- **JavaScript context**: encode con `\xHH` o Unicode escape
- **URL context**: encode con `encodeURIComponent()`
- **CSS context**: encode caracteres especiales
- **HTML attribute context**: encode comillas y signos de interrogación

¿Se usa encoding al renderizar datos del usuario en:
- Texto dentro de tags HTML
- Atributos `href`, `src`, `action`
- Bloques `<script>` o `<style>`
- Templates server-side (Handlebars, EJS, etc.)

### 9.4 Sanitization Libraries

- ¿Se usa DOMPurify (o equivalente) para sanitizar HTML antes de insertar en el DOM?
- ¿La configuración de DOMPurify es restrictiva? (DEFAULT_CONFIG permite太多)
- ¿Se evita `ALLOWED_TAGS` con `script`, `iframe`, `object`, `embed`?
- ¿Se evita `ALLOWED_ATTR` con `on*` (event handlers)?
- ¿Se usa Trusted Types policy como capa adicional?

```javascript
// Configuración segura de DOMPurify
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
  ALLOWED_ATTR: ['href'],
});
```

### 9.5 DOM XSS (source→sink)

- ¿Se usa `location.hash`, `location.search`, `document.referrer` sin sanitizar?
- ¿Se pasa datos de URL directamente a `innerHTML`, `eval()`, `document.write`?
- ¿Los `postMessage` handlers validan `event.origin`?
- ¿Se usa `setTimeout(string)` o `setInterval(string)` (implica eval)?

Archivos típicos:
- `src/components/**/*.tsx` — componentes que leen de URL
- `src/lib/analytics/**/*.ts` — tracking con query params
- `src/pages/_api/**/*.ts` — APIs que reflejan input

## 10. Infraestructura y Configuración

- Firebase Console: ¿API key restringida por dominio?
- Firebase Console: ¿dominios OAuth autorizados correctos?
- Netlify: ¿variables de entorno sensibles en `.env` (no en código)?
- `private/` directory: ¿incluido en deploy pero no servido públicamente?
- Service account: ¿se lee desde env var `FIREBASE_SERVICE_ACCOUNT_JSON` o archivo?

## 11. Dependencias

- ¿Hay dependencias con vulnerabilidades conocidas?
- Revisar `pnpm audit` o `npm audit`

## Formato del Reporte

Estructura la respuesta así:

```
## Arquitectura de seguridad actual
[Descripción breve del flujo de auth y datos]

## Vulnerabilidades encontradas

### 🔴 Riesgo alto
- [Hallazgo con explicación y archivo específico]

### 🟡 Riesgo medio
- [Hallazgo]

### 🟢 Riesgo bajo / Buenas prácticas existentes
- [Lo que ya está bien]

## ¿Puede un atacante robar datos?
[Respuesta directa con escenarios concretos]

## Correcciones prioritarias
1. [Acción más urgente]
2. [Siguiente]
3. [Siguiente]
```

## Stack Específico

Esta skill está optimizada para:
- **Frontend**: React 19 + Waku + Zustand
- **Backend**: Waku API routes (server-side) + Netlify Functions
- **Auth**: Firebase Auth (email/password) + `jose` para verificación server-side
- **Database**: Firestore (multi-tenant con subcolecciones)
- **Hosting**: Netlify con edge functions CSP
- **Rate Limiting**: Netlify Blobs (producción) + Map en memoria (fallback)
