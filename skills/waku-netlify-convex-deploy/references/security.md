# Puerta de seguridad

## Clasificación de secretos

Públicos por diseño:

- URL de despliegue del cliente de Convex.
- Identificadores públicos del proveedor de auth documentados para uso del navegador.

Secretos:

- `CONVEX_DEPLOY_KEY`.
- Valores de entorno del backend de Convex para APIs privadas, firmas, cifrado, webhooks u operaciones de admin.
- Tokens de acceso de Netlify y variables de entorno privilegiadas de Functions.
- Secretos de cliente de auth, llaves privadas, secretos de webhook, credenciales de servicio.

Cualquier valor colocado en `WAKU_PUBLIC_*`, código cliente, JavaScript generado, HTML, source maps o assets públicos es público.

## Búsquedas obligatorias

Busca nombres de archivos y patrones de fuente sin imprimir valores:

- `.env`, `.env.*`, credenciales, service accounts, PEM/llaves privadas, estado de deploy.
- Tokens hardcodeados, headers de autorización, deploy keys y URLs con credenciales embebidas.
- Acceso a `process.env` o `import.meta.env` que cruce los límites servidor/cliente.
- `query`, `mutation`, `action`, `httpAction` sin validadores o autorización.
- Workflows `internal*` exportados accidentalmente como funciones públicas.
- CORS permisivo, wildcards de CSP, `unsafe-eval`, `unsafe-inline` de scripts y redirects/proxies abiertos.
- Logs que contengan bodies de petición, headers de auth, tokens, identidades o datos personales.

Si un secreto aparece rastreado, detén el despliegue, identifica su alcance sin mostrarlo, rótalo/revócalo, remuévelo del repositorio y del historial según corresponda, y verifica los logs de auditoría.

## Límite de Convex

- Asume que toda función pública de Convex es invocable desde internet.
- Los validadores de runtime protegen la forma, no la autorización.
- La autenticación protege la identidad, no la propiedad de recursos.
- Los validadores de retorno y las proyecciones explícitas reducen la fuga accidental de datos.
- Las funciones internas reducen la superficie de ataque de detalles de implementación privilegiados.
- Las consultas deben imponer restricciones de tenant/propietario en su ruta de acceso indexada siempre que sea posible.
- Las operaciones de admin necesitan verificaciones de rol establecidas en el servidor, no botones de UI ocultos.
- El trabajo programado y disparado por webhooks debe ser idempotente donde sean posibles los reintentos.

## Límite de preview

- Los deploys de preview pueden ser alcanzables públicamente.
- Nunca expongas deploy keys de producción de Convex ni secretos de backend de producción a builds de preview no confiables.
- Nunca copies datos personales de producción a previews por defecto.
- Usa orígenes OAuth específicos de preview, endpoints de webhook y credenciales reducidas.
- Protege las previews cuando exponen funcionalidad interna.
- Trata los PRs de forks o autores desconocidos como código no confiable capaz de leer variables de build si la política de la plataforma lo permite.

## Límite de Netlify/Waku

- Mantén los módulos solo-servidor fuera de los grafos de import de componentes cliente.
- Mantén las fuentes de Functions fuera del directorio de publicación.
- No uses `netlify.toml` como almacén de secretos.
- Restringe el `connect-src` de CSP a los orígenes reales de Convex/auth/API.
- Restringe CORS a orígenes confiables explícitos para endpoints con credenciales o sensibles.
- Valida exactamente los hosts objetivo de proxys; los checks de sufijo deben prevenir dominios atacantes como `trusted.com.attacker.example`.
- Aplica límites de tamaño de petición, rate y costo a endpoints públicos costosos.
- Evita almacenar estado de rate limit solo en la memoria del proceso de una Function; las instancias serverless son efímeras y distribuidas.

## Cadena de suministro

- Usa pnpm y un lockfile congelado en CI.
- Revisa los scripts de instalación y los paquetes recién introducidos.
- Mantén las CLIs de deploy fijadas al proyecto cuando la reproducibilidad importe.
- Ejecuta `pnpm audit` pero no fuerces automáticamente upgrades mayores.
- Verifica la procedencia del paquete y los nombres oficiales antes de instalar.
- Asegura que los directorios generados y el estado de deploy no se traten como fuente.

## Checklist de bloqueo de producción

- [ ] Sin credenciales conocidas filtradas o no rotadas.
- [ ] Las keys de Convex de producción y preview están aisladas.
- [ ] Ninguna preview apunta a datos de producción involuntariamente.
- [ ] Cada función pública sensible de Convex autentica y autoriza.
- [ ] Cada función pública valida argumentos.
- [ ] La validación de esquema en runtime está habilitada.
- [ ] Las HTTP actions validan firmas/auth y CORS.
- [ ] El bundle del cliente no contiene secretos.
- [ ] El CSP y los headers de seguridad fueron probados en HTML desplegado.
- [ ] Los escaneos de dependencias y secretos no tienen bloqueador de despliegue sin resolver.
- [ ] Los logs evitan secretos y payloads sensibles.
- [ ] El camino de rollback/corrección hacia adelante está comprendido.