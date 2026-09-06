# Mantenimiento de proyecto

Usa esta referencia para trabajo de funcionalidades rutinarias, corrección de bugs, cambios de esquema, cambios de autenticación, actualizaciones de dependencias y cambios de configuración de despliegue.

## Clasificación del cambio

Clasifica la solicitud antes de editar:

- Componente o ruta de frontend
- Comportamiento Waku de estático, SSR, RSC, server action o middleware
- Esquema Convex, query, mutation, action, HTTP action o autorización
- Build de Netlify, Function, Edge Function, header, redirect o contexto
- Actualización de dependencia o cadena de herramientas
- Cambio de contrato entre capas

Los cambios cross-layer necesitan tests y verificación en ambos límites. Un build de frontend exitoso no prueba la autorización del backend ni el comportamiento desplegado en runtime.

## Flujo de funcionalidad

1. Inspecciona el estado actual, scripts, versiones, código fuente relevante, tipos generados, nombres de entorno y tests existentes.
2. Declara el cambio de contrato y los contextos afectados antes de editar.
3. Implementa el cambio compatible más pequeño.
4. Agrega validadores y autorización en el límite de Convex, no solo en la UI.
5. Agrega tests de éxito, input inválido, no autenticado y no autorizado donde aplique.
6. Regenera la salida de Convex con la CLI instalada cuando cambie el código del backend.
7. Ejecuta verificaciones dirigidas y luego typecheck, tests, lint, build, auditoría de dependencias y escaneo de secretos según aplique.
8. Produce un reporte listo para preview a menos que exista un destino aprobado de preview o producción.

## Flujo de bugs

1. Reproduce el problema usando los scripts del proyecto o un diagnóstico de solo lectura.
2. Encuentra el primer error de causa raíz, no el síntoma del wrapper. Por ejemplo, inspecciona el primer error de import/runtime de la Function detrás de un fallo de decodificación de lambda.
3. Verifica el contrato cliente/backend, el contexto de entorno, la salida generada, el routing, el CSP y el caching cuando el fallo aparece solo después del despliegue.
4. Aplica la corrección más pequeña y agrega un test de regresión.
5. Re-ejecuta la puerta fallida y la secuencia completa de verificación aplicable.

## Cambios de esquema y API

Usa expandir, migrar, contraer para datos persistidos:

1. Agrega campos o variantes compatibles.
2. Despliega código de backend compatible.
3. Haz backfill o migra datos en un workflow aislado e idempotente.
4. Despliega clientes que usen la nueva forma.
5. Remueve el comportamiento antiguo solo después de que los consumidores desaparezcan.

Nunca deshabilites la validación de esquema ni hagas rollback de un esquema a ciegas. Mantén las funciones públicas mínimas y mueve los detalles de implementación privilegiados a funciones internas.

## Cambios de dependencias y configuración

- Verifica el nombre oficial del paquete y la compatibilidad actual antes de instalar.
- Cambia solo las dependencias solicitadas y conserva el lockfile.
- No copies workarounds de Firebase o Vercel a Convex/Netlify sin evidencia.
- Trata los cambios en variables alojadas de Netlify o Convex como efectos secundarios separados que requieren aprobación separada.
- Mantén preview keys, datos, orígenes de auth, webhooks y credenciales de terceros aislados de producción.

## Salida de mantenimiento

Reporta archivos cambiados, causas raíz, verificaciones y resultados, puertas omitidas, nombres y scopes de variables de entorno, riesgos restantes y si el resultado está listo para local, listo para preview o listo para producción. Nunca reportes valores de secretos.