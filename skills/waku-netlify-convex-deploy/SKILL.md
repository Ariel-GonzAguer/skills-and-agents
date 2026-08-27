---
name: waku-netlify-convex-deploy
description: Ayuda a crear, mantener, auditar, reparar, probar, previsualizar y desplegar aplicaciones Waku usando Convex en Netlify. Usar cuando un usuario inicia un proyecto Waku + Convex + Netlify, agrega funcionalidades, cambia esquemas o autenticación, corrige fallos de build/tiempo de ejecución, revisa preparación para producción, configura variables de entorno, CSP, Netlify Functions, previsualizaciones de deploy o despliegue a producción. Usar esta skill incluso cuando el usuario mencione solo archivos como waku.config.ts, convex/schema.ts, convex/_generated/api, netlify.toml o netlify-functions/serve.js. Puede aplicar correcciones mínimas y ejecutar previsualización o despliegue a producción solo después de que sus puertas de seguridad pasen.
compatibilidad: Requiere Node.js 22+, pnpm, y CLIs específicos del proyecto de Convex y Netlify. Se recomienda Context7 o documentación oficial web antes de cambiar configuración sensible a versiones.
---

# Waku + Convex + Netlify

Auditar y reparar el camino completo desde un cliente Waku y rutas renderizadas en servidor, a través del backend tipeado de Convex, hasta el build y runtime de Netlify. Tratar un build exitoso como evidencia necesaria pero no suficiente de preparación para producción.

## Contrato de operación

1. Identificar el modo de operación: inicializar, mantener, auditar, previsualizar o despliegue a producción.
2. Inspeccionar el repositorio y worktree actual antes de cambiar cualquier cosa. Para un proyecto nuevo, inspeccionar el directorio destino y confirmar que está vacío o preservar archivos existentes.
3. Obtener documentación oficial actual de Waku, Convex y Netlify antes de cambiar APIs, comandos, adaptadores o configuración sensible a versiones. No copiar ciegamente los repositorios de referencia.
4. Nunca revelar, imprimir, copiar o commitear valores secretos. Reportar solo nombres y ámbitos de variables.
5. **Pedir aprobación explícita antes de cualquier efecto secundario.** Esto incluye editar o eliminar archivos, instalar/actualizar dependencias, regenerar archivos, cambiar variables/configuración de Netlify o Convex, aprovisionar o modificar un despliegue de Convex, crear una previsualización de Netlify y desplegar a producción. La inspección de solo lectura y comandos de diagnóstico están permitidos antes de la aprobación.
6. Antes de preguntar, presentar la auditoría, causas raíz confirmadas, archivos/comandos propuestos, riesgos esperados y si la acción apunta a local, previsualización, staging o producción. No pedir permiso vago como "¿debería continuar?".
7. Aplicar solo el alcance aprobado. Si un nuevo problema o efecto secundario aparece fuera de ese alcance, detenerse y preguntar de nuevo.
8. Corregir problemas confirmados con el cambio mantenible más pequeño. Preservar cambios no relacionados del worktree.
9. Ejecutar todas las puertas de calidad y despliegue aplicables. No reclamar éxito cuando una puerta fue omitida o falló.
10. El despliegue a producción es un efecto secundario externo. Ejecutarlo solo cuando el usuario aprobó explícitamente el despliegue a producción en la conversación actual, las credenciales apuntan al sitio/despliegue intencionado, y cada puente bloqueante pasa.

## Modos de operación

Seleccionar un modo antes de actuar. Si la solicitud abarca modos, completar el descubrimiento para todos ellos y pedir aprobación con el alcance exacto.

| Modo | Cuándo usar | Resultado por defecto |
| --- | --- | --- |
| `inicializar` | Iniciar un proyecto nuevo Waku + Convex + Netlify | Proyecto listo para desarrollo local |
| `mantener` | Agregar funcionalidades, corregir bugs, cambiar esquema, auth o dependencias | Cambio local verificado, listo para previsualización cuando se solicite |
| `auditar` | Revisar un proyecto existente sin cambiarlo | Reporte redactado |
| `previsualizar` | Usuario solicita una previsualización de deploy | URL de previsualización verificada, nunca producción |
| `producción` | Usuario solicita explícitamente despliegue a producción | Despliegue a producción solo después de todas las puertas y aprobación |

Leer `references/initialization.md` para `inicializar` y `references/maintenance.md` para `mantener`.

## Inicializar

Para un proyecto nuevo:

1. Confirmar el directorio destino, nombre del proyecto, gestor de paquetes, versión de Node.js, proveedor de autenticación, dominios de datos y si Waku necesita salida estática o SSR dinámico.
2. Verificar documentación oficial actual de Waku, Convex y Netlify y las versiones de CLI instaladas o seleccionadas antes de elegir comandos.
3. Andamiaje de Waku con el generador oficial actual, luego agregar Convex y la integración de Netlify apropiada para el modelo de renderizado seleccionado.
4. Establecer el `convex/schema.ts` más pequeño y útil, tipos generados, proveedor de cliente y una sola ruta de lectura/escritura autenticada solo cuando sean parte del alcance solicitado.
5. Crear `.env.example`, `.gitignore`, `netlify.toml` y scripts sin valores secret. Mantener claves de deploy y secretos del backend fuera de archivos fuente.
6. Agregar tests base para validadores y autorización antes de agregar funcionalidades de dominio.
7. Ejecutar las puertas locales descubiertas desde `package.json`: generación, typecheck, tests, lint, build e inspección de la salida generada.
8. Detenerse en un resultado local o listo para previsualización a menos que el usuario solicite y apruebe explícitamente un destino de despliegue.

No inventar una arquitectura inicial, proveedor de autenticación, esquema de dominio o despliegue alojado cuando el usuario no los ha especificado. Hacer una pregunta enfocada para la decisión faltante.

## Mantener

Para cambios en un proyecto existente:

1. Leer las instrucciones del proyecto relevantes, estado, scripts de paquete, versiones actuales, archivos generados de Convex y contextos de despliegue antes de editar.
2. Clasificar el cambio como frontend, renderizado Waku, función/esquema/auth de Convex, runtime/configuración de Netlify, dependencia o capa cruzada.
3. Preservar el contrato de compatibilidad cliente/backend. Para datos persistidos, usar cambios aditivos, backfill y limpieza posterior en vez de romper el cliente actualmente desplegado.
4. Para cada nueva función pública de Convex, agregar validación de argumentos, validación de retorno donde sea práctico, autenticación, autorización de recursos, consultas acotadas y tests negativos.
5. Regenerar `convex/_generated` con la CLI instalada cuando los contratos del backend cambien. Nunca editar archivos generados manualmente.
6. Para bugs, reproducir el fallo, identificar el primer error de causa raíz, hacer la corrección más pequeña y agregar un test de regresión o explicar por qué no es factible.
7. Para actualizaciones de dependencias, inspeccionar changelogs y requisitos de pares, cambiar solo los paquetes solicitados, preservar el lockfile y ejecutar la puerta completa aplicable.
8. Re-ejecutar las verificaciones más estrechas y relevantes después de cada reparación, luego la secuencia de verificación completa antes de proponer una previsualización o despliegue a producción.

No remover integraciones legacy, debilitar controles de seguridad, deshabilitar validación de esquema o agregar código de compatibilidad sin rastrear un consumidor real.

## Cargar referencias progresivamente

- Leer [references/architecture.md](references/architecture.md) para cada auditoría completa o configuración inicial.
- Leer [references/convex.md](references/convex.md) al tocar `convex/`, autenticación, acceso a datos, tipos generados, previsualizaciones o despliegue del backend.
- Leer [references/netlify-waku.md](references/netlify-waku.md) al tocar renderizado Waku, adaptadores, `netlify.toml`, Functions, Edge Functions, headers, redirecciones, salida de build o comandos de deploy.
- Leer [references/security.md](references/security.md) para cada revisión de preparación para producción y antes de desplegar.
- Leer [references/troubleshooting.md](references/troubleshooting.md) solo para builds fallidos, funciones fallidas, errores de enrutamiento, violaciones de CSP o problemas de conexión cliente/backend.
- Usar [references/report-template.md](references/report-template.md) para el reporte final.

## Fase 1: Descubrir

Establecer hechos antes de proponer cambios:

1. Leer instrucciones del repositorio, `package.json`, lockfile, `waku.config.*`, `src/waku.server.*`, `netlify.toml`, directorios de funciones, `convex/`, configuración de TypeScript, configuración de tests, archivos de ignorar y workflows de CI.
2. Registrar gestor de paquetes y versiones exactas instaladas de Waku, Convex, React, TypeScript, paquetes de Netlify y las CLIs realmente invocadas por los scripts.
3. Inspeccionar `git status` e identificar cambios existentes del usuario. Nunca sobrescribirlos.
4. Clasificar la salida de Waku como puramente estática o SSR dinámico. Rutas dinámicas, acciones del servidor, auth en tiempo de request, rutas de API, cookies o middleware requieren un runtime.
5. Identificar despliegues de Convex y contextos de Netlify intencionados: desarrollo local, previsualización de deploy, deploy de rama, staging y producción.
6. Mapear cada variable de entorno por propietario, visibilidad, contexto y alcance. Registrar solo nombres.
7. Ejecutar el escáner de solo lectura incluido cuando Node.js esté disponible:

```bash
node <skill-directory>/scripts/audit-project.mjs <project-directory>
```

Tratar la salida del escáner como pistas, no como prueba. Confirmar cada hallazgo en el código fuente y la documentación oficial.

## Puerta de aprobación

Después del descubrimiento de solo lectura y la auditoría, detenerse antes de la Fase 3. Hacer exactamente una pregunta enfocada que incluya el alcance propuesto. Por ejemplo:

> Encontré estos bloqueos: `convex/schema.ts` no existe y `netlify.toml:12` expone una variable de despliegue. Propongo modificar `convex/schema.ts`, `netlify.toml` y `package.json`, ejecutar typecheck/tests/build, y crear solo un deploy preview con una clave Convex de preview. ¿Autorizás exactamente esos cambios y ese preview?

Interpretar la aprobación de forma estrecha:

- "Sí" autoriza solo los archivos, comandos, contextos y destino de despliegue listados.
- La aprobación para corregir código no autoriza instalar paquetes, cambiar variables alojadas, aprovisionar Convex ni desplegar.
- La aprobación para una previsualización no autoriza despliegue a producción.
- La aprobación para configurar variables no autoriza leer o mostrar sus valores.
- Nunca continuar después de una respuesta ambigua. Pedir al usuario que confirme el alcance faltante.

Si el usuario solicita solo auditoría, devolver el reporte sin pedir cambios. Si el usuario solicita explícitamente despliegue a producción, aún pedir aprobación después de presentar la auditoría y antes del primer efecto secundario.

## Fase 2: Auditar

Auditar todos los dominios, no solo el fallo reportado.

### Waku

- Confirmar que los scripts usan la CLI instalada de Waku y que el modelo de renderizado seleccionado coincide con las funcionalidades de la app.
- Confirmar que toda la salida `dist/public` se publica, incluyendo payloads RSC. Rechazar respuestas SPA genéricas que ocultan errores de ruta.
- Para salida dinámica, confirmar que la salida generada actual del adaptador de Netlify o las rutas wrapper preceden a los archivos estáticos antes del runtime catch-all.
- Confirmar que los módulos solo-servidor y secretos no pueden entrar en componentes del cliente o prefijos de entorno públicos.
- Confirmar que la configuración de Waku está tipeada e incluida por TypeScript donde sea apropiado.

### Convex

- Requerir `convex/schema.ts` para datos de producción y mantener la validación de esquema en runtime habilitada.
- Requerir tipos generados de `convex/_generated`; nunca escribir sustitutos a mano ni editar archivos generados.
- Requerir validadores `args` para cada función pública y validadores `returns` donde sea práctico, especialmente para registros sensibles.
- Minimizar funciones públicas. Usar `internalQuery`, `internalMutation` e `internalAction` para detalles de implementación y flujos privilegiados.
- Verificar autenticación y autorización a nivel de recursos al inicio de cada operación pública. IDs proporcionados por el cliente, email, tenant, propietario o rol no son evidencia de autorización.
- Verificar que los índices coincidan con las rutas de acceso de consultas. Señalar llamadas `.collect()` amplias, conjuntos de resultados sin acotar, filtrado después de la colección y lecturas N+1 evitables.
- Validar acciones HTTP manualmente: método, tipo de contenido, body, auth, autorización, firmas de webhook, CORS, respuesta y controles de abuso.
- Verificar que los despliegues de desarrollo, previsualización y producción tengan datos, claves y variables de entorno aislados.

### Netlify

- Confirmar que el comando de build, directorio de publicación, directorio de Functions, versión de Node, headers, redirecciones y rutas de Edge Functions coincidan con la salida generada.
- Confirmar que las variables necesarias durante el build tengan alcance de Builds y las variables de runtime de funciones tengan alcance de Functions. No poner secretos en `netlify.toml`.
- Requerir diferentes valores de `CONVEX_DEPLOY_KEY` para contextos de producción y deploy-preview. Una previsualización nunca debe heredar una clave de deploy de producción.
- Confirmar que el código fuente de funciones está fuera del directorio público de publicación.
- Revisar CSP contra las conexiones reales de Waku y Convex. Preferir una política restrictiva; agregar orígenes solo cuando la evidencia de fuente o runtime lo requiera.
- Verificar caché inmutable solo para assets con hash y comportamiento de revalidación/no-cache para HTML donde shells obsoletos son inseguros.

### Repositorio y cadena de suministro

- Confirmar que `.env*`, estado de deploy, credenciales, claves privadas, `.netlify/`, estado local de Convex y salida de build generada están ignorados apropiadamente.
- Buscar en el historial de Git o usar el escáner de secretos del repositorio si un archivo de credenciales aparece rastreado. Nunca mostrar su contenido.
- Ejecutar la auditoría del gestor de paquetes sin aplicar automáticamente actualizaciones que rompan compatibilidad. Juzgar explotabilidad e impacto de despliegue.
- Remover código legacy de Firebase/Vercel solo cuando se confirme que no se usa y esté dentro del alcance; la coexistencia frecuentemente causa endpoints incorrectos, secretos duplicados o errores de empaquetado.

## Severidad y bloqueantes

Usar estos niveles:

- `CRÍTICO`: credencial expuesta, clave de producción disponible para previsualizaciones no confiables, acceso cross-tenant a datos, mutación privilegiada sin autenticación o despliegue apuntando al recurso de producción incorrecto.
- `ALTO`: autorización faltante, función admin pública, validación de esquema de runtime deshabilitada, secreto en bundle del cliente, previsualización conectada a datos de producción o CSP roto que requiere ampliación insegura.
- `MEDIO`: validadores de retorno faltantes, consultas sin acotar, índices faltantes, caché HTML obsoleta, headers incompletos, desajuste de alcance de entorno o manejo débil de fallos.
- `BAJO`: mantenibilidad, documentación, observabilidad no bloqueante o deriva menor de configuración.

Bloquear producción para cada `CRÍTICO` o `ALTO` sin resolver, test/typecheck/lint/build fallido, destino de despliegue incierto, variable de producción requerida faltante o incapacidad de verificar los health checks desplegados.

## Fase 3: Reparar

1. Explicar internamente la causa raíz confirmada antes de editar; no parchear síntomas a ciegas.
2. Priorizar límites de seguridad y corrección de datos, luego configuración de build/runtime, luego rendimiento y mantenibilidad.
3. Usar funciones declaradas con JSDoc para nuevas funciones del proyecto cuando sea consistente con las instrucciones del repositorio.
4. Agregar o actualizar tests para límites de autorización, validadores, comportamiento de esquema, rutas cambiadas y regresiones.
5. Nunca debilitar validación de esquema, autenticación, CSP, CORS, escaneo de secretos o tests simplemente para que el despliegue pase.
6. No crear capas de compatibilidad para comportamiento removido de Firebase/Vercel sin un consumidor identificado.
7. Re-ejecutar las verificaciones más estrechas y relevantes después de cada reparación, luego la puerta completa.

## Fase 4: Verificar

Descubrir nombres de script reales de `package.json`; no asumirlos. Ejecutar equivalentes aplicables en este orden:

1. Instalar con `pnpm install --frozen-lockfile` solo cuando las dependencias estén ausentes o hayan cambiado.
2. Generación de Convex y validación del backend contra un despliegue no productivo, normalmente `pnpm exec convex dev --once` o el equivalente documentado del proyecto.
3. Typecheck.
4. Tests unitarios/de integración, incluyendo tests negativos de autorización usando identidades distintas.
5. Lint con cero errores y sin nuevas advertencias.
6. Verificación de formato, no formatear, a menos que formatear archivos sea parte de la corrección solicitada.
7. Auditoría de dependencias y secretos.
8. Dry run de producción de Convex donde se soporte: `pnpm exec convex deploy --dry-run` con el entorno no-secreto intencionado ya configurado.
9. Build de producción local de Netlify donde se soporte: `pnpm exec netlify build --context production`.
10. Inspeccionar `dist/public` generado, salida del servidor y manifiesto de Functions. Asegurar que los secretos estén ausentes de los assets del cliente.

`convex-test` es un runtime mock. Que pase no prueba límites de producción, comportamiento de búsqueda, comportamiento de cron, IDs reales o configuración de despliegue. Usar un backend real aislado o previsualización para verificación sensible a producción.

## Fase 5: Desplegar

### Previsualización primero

Preferir una previsualización de deploy antes de producción:

1. Confirmar una clave de deploy de Convex específica para previsualización y datos de preview aislados.
2. Desplegar Convex y construir Waku atómicamente usando el comando documentado actual. Un patrón común es:

```bash
pnpm exec convex deploy --cmd-url-env-var-name WAKU_PUBLIC_CONVEX_URL --cmd "pnpm build"
```

3. Desplegar un draft/preview de Netlify usando el script del repositorio o `pnpm exec netlify deploy`.
4. Capturar la URL y verificar carga de página, navegación directa, navegación RSC, autenticación, una lectura, una escritura autorizada, una operación cross-tenant denegada, headers, CSP y logs de funciones.

El comando anterior es un patrón de integración recomendado, no una constente atemporal. Confirmar el prefijo de entorno público actual de Waku y la sintaxis actual de la CLI de Convex antes de introducirlo.

### Producción

Antes de ejecutar un comando de producción, declarar y verificar sin exponer valores:

- Nombre/ID del sitio de Netlify y URL de producción.
- Nombre de despliegue de producción de Convex y que la clave es una clave de producción.
- Rama/commit de Git siendo desplegado y estado del worktree.
- Comandos de puerta pasados y resultado de verificación de previsualización.
- Nombres y alcances de variables de producción requeridas.

Luego usar el script de producción revisado del repositorio o el equivalente actual de la CLI. No inventar flags. El comportamiento típico de la CLI de Netlify es draft por defecto y `--prod` para producción, pero verificar la documentación actual y `--help` primero.

Después del despliegue, verificar la URL de producción independientemente. Una salida exitosa de la CLI no es prueba de que SSR, auth, Convex, CSP o HTML cacheado funciona.

## Fallo y rollback

- Detenerse en el primer fallo de etapa de despliegue. Preservar logs, redactar valores y diagnosticar antes de reintentar.
- Si Convex cambió pero Netlify falló, evaluar la compatibilidad de API con el frontend actualmente servido antes de hacer cualquier otra cosa.
- Preferir una corrección compatible hacia adelante. Usar rollback de Netlify cuando el frontend es inseguro y el deploy anterior se conoce como bueno.
- Nunca hacer rollback de un esquema de Convex a ciegas. Los datos ya pueden conformar a una forma más nueva; usar cambios de compatibilidad o migraciones.
- Reportar despliegue parcial explícitamente, incluyendo qué lado cambió.

## Respuesta final

Usar la plantilla de reporte. Los hallazgos deben citar archivo y línea. Separar hechos verificados de suposiciones. Incluir archivos cambiados, comandos y resultados, URLs desplegadas, riesgos sin resolver y estado de rollback. Nunca incluir valores secretos.

## Orígenes de referencia

El wrapper de Netlify, publicación de `dist/public`, nonce CSP y patrones de pre-despliegue fueron informados por los repositorios Waku/Firebase del usuario. El SDK específico de Firebase, credenciales, orígenes de CSP y workarounds de empaquetado no son orientación válida para Convex y no deben copiarse.

Fuentes oficiales actuales a refrescar cuando se usen:

- https://waku.gg/guides/static-deployments
- https://docs.convex.dev/production/hosting/netlify
- https://docs.convex.dev/production/overview
- https://docs.convex.dev/functions/validation
- https://docs.convex.dev/auth/functions-auth
- https://docs.netlify.com/deploy/deploy-overview/
- https://docs.netlify.com/build/functions/environment-variables/
