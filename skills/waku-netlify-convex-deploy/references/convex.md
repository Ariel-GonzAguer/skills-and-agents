# Revisión de producción de Convex

## Configuración y tipos generados

- Mantén `convex` en dependencias de runtime cuando el cliente desplegado lo importa.
- Genera `convex/_generated/api`, `dataModel` y `server` con la CLI de Convex instalada.
- Commitea los archivos generados si esa es la recomendación actual de Convex y la convención del repositorio; nunca los edites a mano.
- Crea `ConvexReactClient` una vez a nivel de módulo en un límite solo-cliente. Falla claramente cuando la URL pública de despliegue está ausente en vez de pasar `undefined` con una aserción de tipo.
- En Waku, confirma el prefijo de entorno visible para el cliente actual desde la documentación oficial. Waku reciente usa `WAKU_PUBLIC_`; no asumas el prefijo `VITE_` de Vite.

## Auditoría de esquema

Requiere un `convex/schema.ts` para proyectos de producción. Revisa:

- Cada tabla tiene validadores explícitos.
- La semántica opcional versus nullable es intencional.
- Los IDs usan `v.id("table")`, no strings arbitrarios.
- Las uniones modelan variantes persistidas por completo.
- El orden de campos de los índices coincide con restricciones de igualdad y rango.
- Los nombres de índices describen rutas de acceso, como `by_owner_and_status`.
- Los índices de búsqueda/vector incluyen solo campos necesarios para consultas reales.
- La `schemaValidation` de runtime sigue habilitada.

Desplegar un esquema más estricto valida documentos existentes y puede fallar. Usa expandir, migrar, contraer en vez de deshabilitar la validación.

## Contrato de funciones

Cada `query`, `mutation` y `action` pública debe tener:

- `args` explícitos, incluido `args: {}` para funciones sin argumentos.
- Validadores de runtime para cada valor no confiable.
- Un validador `returns` cuando sea práctico; requiérelo para auth, billing, registros privados y APIs donde devolver campos de más es riesgoso.
- Autenticación cuando la operación es específica del usuario.
- Autorización a nivel de recursos basada en el estado autoritativo de la base de datos.
- Una consulta acotada o paginación para colecciones que pueden crecer.
- Errores que no filtren secretos, IDs internos innecesariamente o detalles del stack.

Usa `internalQuery`, `internalMutation` e `internalAction` para funciones llamadas solo por el backend, schedules, webhooks, migraciones, seeds, workflows de admin o actions. El estado interno reduce la exposición pero no reemplaza las comprobaciones de input y los invariantes.

## Autenticación y autorización

`ctx.auth.getUserIdentity()` prueba identidad solo después de que un proveedor esté configurado correctamente. No prueba propiedad ni rol.

Para cada operación pública:

1. Obtén la identidad y rechaza `null` donde se requiera autenticación.
2. Resuelve el usuario de la aplicación usando campos de identidad estables como `tokenIdentifier` o el par issuer/subject documentado.
3. Carga la membresía o propiedad del recurso desde Convex.
4. Verifica tenant, rol, propiedad, estado y restricciones de negocio.
5. Consulta o muta solo después de que las verificaciones pasen.

Nunca confíes en `userId`, `ownerId`, email, tenant, organización, precio, entitlement o rol suministrados por el cliente como evidencia de autorización. Prueba que el usuario A no pueda leer ni mutar los registros del usuario B.

## Rendimiento de consultas y mutaciones

Señala y repara:

- `.collect()` en una tabla que puede crecer sin un límite superior pequeño probado.
- `.filter()` donde un índice puede restringir la consulta.
- Lecturas N+1 dentro de loops cuando los datos pueden modelarse u obtenerse más directamente.
- Documentos grandes, arrays sin límite y agregados reescritos con frecuencia.
- Devolver documentos completos cuando una proyección estable es suficiente.
- Mutaciones que realizan llamadas de red externas; las llamadas de red pertenecen a actions, con mutaciones para escrituras transaccionales.
- Actions que implementan invariantes de base de datos entre llamadas separadas sin una mutación atómica.

## HTTP actions y webhooks

Las HTTP actions de Convex no reciben validación automática de argumentos de función. Valida:

- Método y ruta.
- Tipo de contenido y tamaño máximo del body.
- Forma del body parseado.
- Autenticación o firma de webhook usando el body crudo cuando se requiera.
- Protección de timestamp/replay e idempotencia.
- Autorización y mapeo de tenant.
- Allowlist estricta de CORS y comportamiento de preflight para endpoints de navegador.
- Límites de rate/abuso apropiados al costo y la sensibilidad.
- Headers de respuesta y errores seguros.

Mueve el trabajo privilegiado de base de datos a funciones internas invocadas después de autenticar la petición.

## Entorno y despliegues

- Las variables de entorno de Convex son específicas del despliegue. Configura valores por separado para desarrollo, preview, staging y producción.
- Declara las variables esperadas con validadores en `convex/convex.config.ts` cuando la versión instalada lo soporte.
- Nunca expongas `CONVEX_DEPLOY_KEY` a través de una variable pública de Waku.
- Usa deploy keys de producción solo en el scope de Netlify Builds de producción.
- Usa deploy keys de preview solo en el contexto de deploy-preview.
- Usa datos sintéticos/no productivos y credenciales reducidas de terceros en previews.
- Un entorno de staging permanente debería usar un proyecto Convex separado cuando se necesite aislamiento estable.

Comandos actuales útiles, que deben verificarse contra la CLI instalada:

```bash
pnpm exec convex dev --once
pnpm exec convex env list
pnpm exec convex deploy --dry-run
pnpm exec convex deploy --cmd "pnpm build"
```

No imprimas valores de `convex env get` durante una auditoría.

## Tests

Usa `convex-test` para tests rápidos de funciones y autorización, incluido `withIdentity`. También prueba el comportamiento sensible a producción contra un backend aislado real porque el mock no impone completamente los límites de producción, IDs, comportamiento de búsqueda, crons o built-ins de runtime.

Tests mínimos de backend:

- Una petición válida tiene éxito.
- Un argumento inválido y un campo extra no declarado fallan.
- Una petición no autenticada falla.
- Una petición autenticada pero no autorizada/cross-tenant falla.
- El propietario/rol correcto tiene éxito.
- La paginación o los límites de resultados se mantienen.
- El esquema rechaza datos persistidos inválidos.
- El webhook rechaza firma inválida y replay.

## Secuencia de despliegue

El deploy de Convex puede ejecutar el build del frontend con la URL de despliegue seleccionada:

```bash
pnpm exec convex deploy \
  --cmd-url-env-var-name WAKU_PUBLIC_CONVEX_URL \
  --cmd "pnpm build"
```

Verifica esta integración contra la documentación actual y la versión instalada. Ejecuta los tests antes de este comando porque Convex puede actualizar el backend antes de que el deploy de Netlify se complete.

Fuentes oficiales:

- https://docs.convex.dev/production/hosting/netlify
- https://docs.convex.dev/production/multiple-deployments
- https://docs.convex.dev/database/schemas
- https://docs.convex.dev/functions/validation
- https://docs.convex.dev/functions/internal-functions
- https://docs.convex.dev/auth/functions-auth
- https://docs.convex.dev/testing