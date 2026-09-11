---
name: security-audit-webapp
description: |
  Auditoría completa de seguridad para aplicaciones web serverless (Waku/React/Netlify/Firebase).
  Usa esta skill SIEMPRE que el usuario pida: revisar seguridad, auditar vulnerabilidades,
  "puede un atacante robar datos", "revisá el código de seguridad", hardening, o cuando
  mencione OWASP, CSRF, XSS, rate limiting, IDOR, enumeración de emails, token storage,
  o cualquier preocupación de seguridad en una webapp. Aplica a proyectos con Firebase Auth,
  Firestore, Netlify Functions, Waku, React, Zustand, y stacks similares.
metadata:
  author: Ariel GonzAgüer
  version: "1.1.0"
---

# Auditoría de seguridad para aplicaciones web serverless

Realiza una auditoría basada en evidencia siguiendo esta checklist. Cada hallazgo debe incluir archivo y línea, escenario de abuso, impacto, confianza y corrección propuesta. No afirmar que existe una vulnerabilidad si no se inspeccionó el flujo relevante; marcar lo no comprobado como “requiere verificación”.

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

- Cada API route debe derivar el principal autenticado en el servidor.
- Los IDs enviados por el cliente pueden identificar un recurso, pero el servidor debe comprobar su pertenencia al tenant y la autorización de la operación.
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
- ¿Es distribuido y atómico? La persistencia por sí sola no evita carreras de read-modify-write.
- ¿Tiene fallback para desarrollo local?
- ¿Los thresholds son razonables para entornos con NAT compartido?

Archivos típicos:
- `src/lib/security/rateLimit.ts`
- `src/pages/_api/api/contact.ts`

## 5. CSRF y CORS

- ¿Las APIs state-changing (POST/PATCH/PUT/DELETE) validan `Origin` o usan token CSRF?
- ¿Se usa `Authorization: Bearer` (mitiga CSRF básico)?
- ¿Los dominios autorizados están configurados en Firebase Console?
- ¿Las restricciones de API key y App Check se usan como defensa adicional, sin tratarlas como autorización?

## 6. Enumeración de Información (Information Leakage)

Revisa TODOS los mensajes de error:

- Login: ¿distingue entre "usuario no existe" y "contraseña incorrecta"?
- Password reset: ¿revela si un email está registrado?
- API errors: ¿filtra información sobre membresía, estructura de DB, o emails?
- Errores de token: ¿revelan si la cuenta existe pero no está vinculada?

No declarar automáticamente “aceptable” una filtración del SDK. Evaluar si la configuración de protección contra enumeración está disponible y mostrar mensajes uniformes en la UI. En recuperación de contraseña, responder de forma indistinguible exista o no la cuenta. Mantener el detalle diagnóstico solo en telemetría protegida.

## 7. Almacenamiento de Tokens

- ¿El token JWT se guarda en `localStorage`? (◬ vulnerable a XSS — un script malicioso puede robarlo)
- ¿Se guarda en `sessionStorage`? (mejor, pero aún vulnerable a XSS)
- ¿Solo en memoria (Zustand/React state)? (✓ ideal — no persiste entre sesiones)
- ¿Firebase Auth SDK maneja la persistencia? IndexedDB mejora la ergonomía, pero sigue expuesto al código que se ejecute en el origen y no neutraliza XSS.
- ¿La arquitectura permite una sesión en cookie `HttpOnly`, `Secure` y con alcance mínimo? No recomendar migrarla sin evaluar CSRF, SSR y revocación.
- ¿Se usan cookies `SameSite=Strict` o `Lax`? (mitiga CSRF además de XSS)

**Impacto**: un XSS puede actuar con los privilegios de la sesión y, si el token es legible por JavaScript, también exfiltrarlo. Priorizar la prevención de XSS y elegir el mecanismo de sesión según el modelo de amenazas completo.

## 8. Security Headers

Revisa headers HTTP de seguridad:

- Content-Security-Policy (CSP): ¿tiene nonces? ¿`script-src-attr 'none'`? ¿`require-trusted-types-for 'script'`?
- X-Frame-Options: ¿`SAMEORIGIN` o `DENY`?
- X-Content-Type-Options: ¿`nosniff`?
- Referrer-Policy
- Strict-Transport-Security (HSTS): ¿max-age suficiente?
- Cross-Origin-Opener-Policy (COOP)
- Permissions-Policy

**Punto de partida para CSP (adaptar y probar en Report-Only):**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'nonce-{random}';
  img-src 'self' data:;
  require-trusted-types-for 'script';
```

No copiar esta política literalmente: orígenes, estilos, workers, conexiones y soporte de Trusted Types dependen del proyecto. Verificar que el nonce sea criptográficamente aleatorio por respuesta y que se propague a todos los scripts autorizados.

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

- ¿Se valida todo input en el límite de confianza (tipo, tamaño, formato y reglas de negocio)? Sanitizar solo cuando el contexto lo requiera; no mutilar texto válido como defensa genérica.
- ¿Las consultas y nombres de campo se construyen desde allowlists? Firestore reduce algunos vectores clásicos de inyección, pero no elimina consultas manipuladas, abuso de filtros ni autorización defectuosa.
- ¿Los campos opcionales usan helpers tipo `optionalString()`, `truncateMax()`?
- ¿Se validan tipos (email, URL, phone)?
- ¿Los parámetros de URL se validan antes de usarlos?

### 9.3 Output Encoding (la defensa #1 contra XSS)

Input sanitization NO es suficiente. OWASP recomienda **output encoding** como primera línea de defensa:

- **HTML context**: encode `<`, `>`, `&`, `"`, `'` → `&lt;`, `&gt;`, `&amp;`, `&quot;`, `&#x27;`
- **JavaScript context**: encode con `\xHH` o Unicode escape
- **URL context**: encode con `encodeURIComponent()`
- **CSS context**: encode caracteres especiales
- **HTML attribute context**: usar APIs/frameworks que escapen atributos y validar especialmente URLs y nombres dinámicos

¿Se usa encoding al renderizar datos del usuario en:
- Texto dentro de tags HTML
- Atributos `href`, `src`, `action`
- Bloques `<script>` o `<style>`
- Templates server-side (Handlebars, EJS, etc.)

En React, interpolar texto y atributos normalmente aplica escape. Auditar con especial atención `dangerouslySetInnerHTML`, URLs controlables, parsers Markdown/HTML y escapes deliberados del framework.

### 9.4 Sanitization Libraries

- ¿Se usa DOMPurify (o equivalente) para sanitizar HTML antes de insertar en el DOM?
- ¿La configuración de DOMPurify es restrictiva? (DEFAULT_CONFIG permite demasiado)
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

- Firebase Console: ¿restricciones de API key y App Check configuradas como capas adicionales? Recordar que la API key web identifica el proyecto y no sustituye Auth ni Security Rules.
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

### 🟢 Riesgo bajo
- [Lo que ya está bien]

### ✓ Controles verificados
- [Control, evidencia y alcance comprobado]

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
- **Rate Limiting**: proveedor distribuido con operación atómica; memoria solo para desarrollo o una única instancia

## Reglas de evidencia

- Diferenciar `confirmado`, `probable` y `requiere verificación`.
- No asignar severidad por el nombre de una tecnología; demostrar precondiciones e impacto.
- Si una comprobación requiere consola externa, tráfico real o secretos, indicar exactamente qué debe revisar el humano.
- No cambiar archivos, reglas, dependencias ni configuración durante una auditoría salvo que el usuario también solicite remediación.
