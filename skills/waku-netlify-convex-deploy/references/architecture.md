# Mapa de arquitectura y auditoría

## Ruta de petición prevista

```text
Browser
  -> Netlify CDN (dist/public)
  -> Waku Netlify Function only when no static asset matches
  -> Convex public API or authenticated client connection
  -> public Convex function
  -> authentication + authorization + validation
  -> database/index/internal function
```

Netlify aloja la aplicación Waku. Convex es un backend desplegado por separado. No enrutes consultas y mutaciones normales de Convex a través de una Netlify Function sin un requisito concreto de solo-servidor; eso agrega latencia y duplica el límite de confianza.

## Inventario del repositorio

Inspecciona estas ubicaciones cuando existan:

| Interés | Archivos |
| --- | --- |
| Cadena de herramientas | `package.json`, `pnpm-lock.yaml`, `.npmrc`, `pnpm-workspace.yaml` |
| Waku | `waku.config.ts`, `src/waku.server.tsx`, `src/pages/**`, `src/pages.gen.ts` |
| Convex | `convex/schema.ts`, `convex/convex.config.ts`, `convex/auth.config.ts`, `convex/http.ts`, `convex/_generated/**`, todos los demás `convex/*.ts` |
| Integración cliente | componente/proveedor cliente raíz, imports de `convex/react`, inicialización de `ConvexReactClient` |
| Netlify | `netlify.toml`, `netlify-functions/**`, `netlify/functions/**`, `netlify/edge-functions/**`, `.netlify/state.json` |
| Seguridad | `.gitignore`, `.env*`, headers, CSP, helpers de auth, rate limits, handlers de webhook |
| Verificación | `tsconfig*.json`, ESLint, Vitest, workflows de CI, scripts de deploy |

## Decisión de renderizado

Usa salida puramente estática solo si cada funcionalidad de tiempo de request puede eliminarse o precomputarse. Se requiere runtime dinámico de Waku para cualquiera de estas:

- Una ruta configurada con `render: "dynamic"`.
- Una ruta dinámica sin `staticPaths` completos.
- Rutas de API dinámicas.
- Server actions.
- Cookies, headers, auth, personalización, middleware, redirecciones o rewrites en tiempo de request.

La reactividad del lado del cliente de Convex no requiere en sí misma SSR de Waku. Un shell Waku estático puede conectarse directamente a Convex. Elige Waku dinámico solo para necesidades reales de runtime del servidor de Waku.

## Matriz de propiedad de entornos

Crea esta matriz usando solo nombres:

| Variable | Propietario | Secreto | Consumidor | Contexto | Scope Netlify / despliegue Convex |
| --- | --- | --- | --- | --- | --- |
| `WAKU_PUBLIC_CONVEX_URL` | Salida de Convex | No | Build del navegador | preview/production | Netlify Builds |
| `CONVEX_DEPLOY_KEY` | Convex | Sí | CLI de Convex durante el build | preview/production | Netlify Builds, secreto |
| Otros secretos del backend | Aplicación/vendor | Sí | Funciones de Convex | por despliegue | Entorno de Convex |
| Secreto de Netlify Function | Aplicación/vendor | Sí | Netlify Function | por contexto | Netlify Functions, secreto |

No dupliques un secreto en Netlify y Convex a menos que ambos runtimes realmente lo consuman.

## Contrato de compatibilidad

Los despliegues no son perfectamente atómicos entre servicios. Las funciones y esquemas nuevos de Convex deben seguir siendo compatibles con el bundle de navegador actualmente desplegado, las pestañas abiertas, los jobs programados y el bundle Waku nuevo. Prefiere cambios aditivos:

1. Agregar campos opcionales o uniones más amplias.
2. Desplegar código de backend compatible.
3. Hacer backfill de datos.
4. Desplegar clientes que usen la nueva forma.
5. Endurecer el esquema y remover el comportamiento antiguo después.

## Lecciones de repositorios de referencia

Los proyectos Waku/Firebase del usuario demuestran patrones útiles de Netlify:

- `netlify-functions/serve.js` importa `dist/server/index.js` y delega en `INTERNAL_runFetch`.
- `preferStatic: true` permite que `dist/public` gane antes del runtime catch-all.
- `netlify.toml` publica `dist/public` y apunta las Functions a `netlify-functions`.
- Una Netlify Edge Function puede inyectar nonces CSP por respuesta cuando Waku emite scripts inline de hidratación.
- Los assets con hash pueden cachearse de forma inmutable mientras el HTML debería revalidarse.
- Los scripts de deploy deberían fallar rápido y ejecutar tests, lint, typecheck/build y verificaciones explícitas de destino.

No copies estas lecciones específicas de Firebase:

- Externalizar `firebase-admin` o fijar versiones de Firebase Admin.
- Archivos de service account de Firebase o `included_files = ["private/**"]` a menos que la aplicación Waku tenga una necesidad no relacionada de archivos privados.
- Orígenes CSP de Firebase.
- Workarounds de verificación de tokens REST de Firebase.

La URL de navegador de Convex es pública por diseño. Las deploy keys de Convex y las variables de entorno del backend son secretos.