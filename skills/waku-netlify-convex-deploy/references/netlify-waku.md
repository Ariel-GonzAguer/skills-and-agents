# Waku en Netlify

## Elegir salida estática o dinámica

Los despliegues Waku puramente estáticos usan el adaptador de Netlify actual con `static: true` y publican `dist/public`. Esto elimina el runtime de Waku en tiempo de request. Es válido solo cuando cada ruta y respuesta de API puede generarse en tiempo de build.

Los despliegues dinámicos producen assets estáticos más la salida del servidor y una Netlify Function. La salida actual generada por Waku históricamente ha usado:

```js
const { INTERNAL_runFetch } = await import("../dist/server/index.js");

export default async (request, context) =>
  INTERNAL_runFetch(process.env, request, { context });

export const config = {
  preferStatic: true,
  path: ["/", "/*", "/RSC/**/*"],
};
```

`INTERNAL_runFetch` y las rutas generadas son internas/sensibles a versiones. Prefiere la salida generada por el adaptador instalado de Waku. Si se requiere un wrapper commiteado, compáralo con la fuente del adaptador oficial actual antes de editarlo.

## Configuración base

La salida dinámica típica requiere estos conceptos, no necesariamente este archivo exacto:

```toml
[build]
  command = "pnpm build"
  publish = "dist/public"
  edge_functions = "netlify/edge-functions"

[build.environment]
  NODE_VERSION = "22"

[functions]
  directory = "netlify-functions"
```

Si `netlify.toml` ya existe, Waku puede no fusionarlo ni reemplazarlo. Audítalo contra la salida generada. No agregues `included_files = ["private/**"]` solo porque proyectos antiguos de Firebase lo usaban.

El directorio fuente de las Functions debe permanecer fuera de `dist/public`.

## Comandos de build y deploy

La documentación actual de Waku usa una señal de build de Netlify al compilar manualmente:

```bash
NETLIFY=1 pnpm build
pnpm exec netlify deploy
```

El entorno de build alojado de Netlify ya suministra el contexto de plataforma. Verifica el comportamiento actual de Waku antes de agregar `NETLIFY=1` a scripts de paquete multiplataforma.

Los deploys draft y de producción de la CLI de Netlify son distintos. Inspecciona `pnpm exec netlify deploy --help` antes de invocarlo. La producción normalmente usa `--prod`, pero nunca inferas intención de producción.

## Scopes y contextos de entorno

Los contextos de Netlify incluyen `production`, `deploy-preview`, `branch-deploy` y `dev`. Los valores pueden diferir por contexto y scope.

- Las deploy keys de Convex son secretos de tiempo de build: scope Builds.
- Los secretos de runtime de Netlify Function requieren scope Functions.
- Un valor en `netlify.toml` no es un secreto de runtime seguro y no está disponible automáticamente para Functions.
- Los archivos `.env` del repositorio no son un almacén de secretos de producción.
- Cambiar una variable de Function requiere un nuevo deploy para capturar el valor.

Audita nombres y metadata con comandos como:

```bash
pnpm exec netlify env:list --scope builds --context production
pnpm exec netlify env:list --scope builds --context deploy-preview
pnpm exec netlify build --context production
```

No redirijas listados de entorno a archivos durante una auditoría.

## Routing

- Publica el `dist/public` completo; la navegación cliente de Waku puede depender de payloads RSC generados.
- No agregues un fallback SPA genérico a `/index.html` para el enrutamiento basado en archivos de Waku.
- Con una Function catch-all, conserva `preferStatic: true` para que ganen los archivos de CDN.
- Verifica navegación directa, refresh, navegación cliente, rutas dinámicas, rutas de API y peticiones `/RSC/`.
- Remueve árboles legacy de endpoints de Vercel o Netlify duplicados solo después de rastrear cada consumidor.

## Headers y CSP

Los headers base recomendados dependen del comportamiento de la app:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- HSTS solo cuando se entienden HTTPS y las implicaciones de subdominios.
- `frame-ancestors` en CSP, con `X-Frame-Options` como defensa legacy donde sea útil.
- Una `Permissions-Policy` de menor privilegio.
- Headers de aislamiento cross-origin solo cuando se requieran y se prueben con popups de auth o recursos embebidos.

El SSR/hidratación de Waku puede emitir scripts inline. Un nonce CSP estático en `netlify.toml` es inútil. Si hay scripts inline, usa una Edge Function de nonce por respuesta que:

1. Genere un nonce criptográficamente aleatorio.
2. Llame a `context.next()`.
3. Cambie solo respuestas HTML.
4. Agregue el nonce al CSP y a las etiquetas script/style inline correspondientes.
5. Preserve el status, los headers de respuesta y la semántica del body.
6. Evite `unsafe-inline` amplio para scripts.

Para Convex, deriva `connect-src` de la URL de despliegue real y del proveedor de auth, no de orígenes copiados de Firebase. Prueba el CSP en las consolas de navegador de preview y producción.

## Caché

- Assets con hash: `public, max-age=31536000, immutable`.
- HTML y manifests/service workers mutables: revalidar o no-cache según el comportamiento de actualización.
- Nunca apliques caching inmutable a `/*`.
- Verifica que un deploy nuevo no sirva un shell HTML antiguo que referencie assets removidos.

## Smoke test post-deploy

1. Carga la URL de producción en una sesión de navegador limpia.
2. Refresca cada ruta directa crítica.
3. Navega del lado del cliente y verifica las peticiones RSC.
4. Inicia y cierra sesión.
5. Ejecuta una lectura real de Convex y una escritura autorizada.
6. Confirma que una operación cross-user no autorizada falla.
7. Inspecciona los headers de seguridad de la respuesta y la consola CSP.
8. Inspecciona los logs de Netlify Function y Convex sin exponer datos.
9. Verifica el caching de assets y HTML.
10. Verifica el commit desplegado y los identificadores de sitio/despliegue.

Fuentes oficiales:

- https://waku.gg/guides/static-deployments
- https://docs.netlify.com/build/functions/configuration/
- https://docs.netlify.com/build/functions/environment-variables/
- https://docs.netlify.com/deploy/deploy-overview/