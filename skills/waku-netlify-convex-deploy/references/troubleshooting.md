# Matriz de troubleshooting

## `error decoding lambda response`

Esto es un síntoma del wrapper, no una causa raíz. Inspecciona los logs de la Netlify Function en busca de la primera excepción de import/runtime.

Verifica:

- El wrapper importa la entrada del servidor generado que realmente existe.
- El adaptador de Waku y el wrapper commiteado coinciden para la versión instalada.
- Las dependencias de runtime están en `dependencies`, no solo en `devDependencies`.
- Los paquetes requeridos por SSR no fueron externalizados incorrectamente.
- Las variables requeridas de la Function tienen scope Functions y el deploy se reconstruyó después de configurarlas.
- La respuesta de la Function es válida y el consumo de body/streaming es soportado por el runtime actual.

Los repositorios de referencia de Firebase corrigieron un caso al no externalizar el SDK de navegador de Firebase. No traduzcas eso a externalizar o empaquetar Convex a ciegas; inspecciona el import que falla y el empaquetado actual de Waku/Convex.

## La página estática funciona, pero el refresh o la ruta dinámica fallan

- Un redirect SPA genérico está enmascarando el enrutamiento de Waku.
- La ruta dinámica carece de runtime o de `staticPaths`.
- La ruta de la Function catch-all omite la base RSC actual.
- `dist/public` se desplegó parcialmente.
- El directorio de Functions o la ruta de publicación difieren de la salida generada.

## Convex funciona localmente pero no después del deploy

- La URL pública de Convex estaba ausente durante el build del cliente Waku.
- Se usó un prefijo público de Waku incorrecto.
- El build de preview/producción usó la `CONVEX_DEPLOY_KEY` incorrecta.
- El CSP bloquea la conexión a Convex.
- El proveedor de auth no permite el origen desplegado.
- Los valores de entorno del backend de Convex se configuraron solo en desarrollo.
- Los contratos de frontend y backend son incompatibles.

Inspecciona el bundle del navegador solo para la URL pública. Nunca busques un secreto en assets desplegados haciendo echo del propio secreto; busca nombres de variables conocidos y marcadores sospechosos de keys.

## El deploy de Convex rechaza el esquema

- Los documentos existentes no coinciden con el nuevo validador.
- Se introdujo un campo requerido antes del backfill.
- Una unión removió una variante aún persistida.
- Un cambio de índice o esquema entra en conflicto con los datos actuales.

Usa expandir, migrar, contraer. No deshabilites `schemaValidation` para bypasear errores de datos de producción.

## Errores de tipo en `convex/_generated`

- Los archivos generados están obsoletos o fueron editados.
- Las versiones de CLI/paquete de Convex no coinciden.
- El código del backend falló generación/typecheck.
- La configuración de TypeScript excluye o transforma incorrectamente módulos generados.

Ejecuta el comando de dev/codegen de un solo uso de la CLI instalada contra un despliegue no productivo. Nunca parchees salida generada a mano.

## La preview de Netlify tocó producción de Convex

Trata esto como un incidente de seguridad:

1. Detén más builds de preview.
2. Revoca/rota la deploy key de producción expuesta.
3. Audita el historial de despliegue, funciones, esquema y escrituras de datos de Convex.
4. Configura una key específica de preview en el scope de Builds de deploy-preview.
5. Verifica que los builds de producción y preview resuelvan URLs de despliegue distintas.
6. Evalúa si el código de preview no confiable pudo leer cualquier otro secreto de build.

## Violaciones de CSP

- Confirma que el origen/recurso bloqueado es esperado y necesario.
- Para scripts Waku inline, confirma que un nonce por respuesta aparece tanto en CSP como en el markup.
- No agregues `unsafe-inline` de scripts ni `https:`/`*` amplios solo para silenciar errores.
- Agrega solo los orígenes exactos de Convex, auth, analytics, imágenes, fuentes o API usados por la app.
- Recuerda que Report-Only no impone; úsalo para rollout y luego impón después de la revisión.

## Página obsoleta después de un deploy exitoso

- El HTML tiene caching de larga duración o inmutable.
- Un service worker sirve un shell antiguo.
- El HTML nuevo referencía assets con hash removidos.
- El CDN/navegador no fue forzado a revalidar recursos mutables.

Cachea assets inmutables con hash agresivamente, pero haz explícito el comportamiento de actualización de HTML y service worker y prueba una actualización desde la versión anterior.

## La consulta de Convex es lenta o costosa

- `.collect()` escanea un conjunto sin límite.
- El filtrado ocurre después de la recuperación en vez de a través de un índice.
- Los campos/orden del índice no coinciden con las restricciones de igualdad y rango.
- La UI crea suscripciones o peticiones duplicadas.
- Ocurren lecturas N+1 de documentos por resultado.
- Documentos grandes o arrays se transfieren repetidamente.

Confirma con la forma real de la consulta y las métricas del dashboard de Convex antes de cambiar el modelo de datos.