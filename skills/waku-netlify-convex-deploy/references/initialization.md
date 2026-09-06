# Inicialización de proyecto

Usa esta referencia al iniciar un proyecto Waku + Convex + Netlify desde un directorio vacío o recién creado. Los comandos son ejemplos, no constantes atemporales. Confírmalos contra la documentación oficial actual y las versiones de paquete seleccionadas primero.

## Contrato de inicialización

El primer resultado debería ser un proyecto listo para desarrollo local, no un despliegue alojado no aprobado. Mantén la arquitectura inicial pequeña y haz explícita la decisión de renderizado:

- Usa salida estática de Waku cuando todo el comportamiento de tiempo de request puede construirse antes.
- Usa salida dinámica cuando las rutas necesiten cookies, headers, auth, middleware, server actions o respuestas de API dinámicas en tiempo de request.
- Las suscripciones de Convex del lado del cliente no requieren por sí mismas SSR de Waku.

## Secuencia sugerida

1. Confirma Node.js, pnpm, directorio del proyecto, nombre de la app, proveedor de auth, dominios de datos y contextos objetivo.
2. Haz scaffolding de la app Waku usando el generador oficial actual.
3. Agrega el paquete Convex e inicializa el backend con la CLI actual.
4. Crea `convex/schema.ts` con validadores explícitos y validación de esquema en runtime.
5. Genera `convex/_generated` usando la CLI de Convex instalada. Nunca escribas sustitutos generados a mano.
6. Crea un `ConvexReactClient` a nivel de módulo en un límite solo-cliente usando el prefijo de entorno público actual de Waku.
7. Agrega `netlify.toml` que coincida con la salida Waku seleccionada, el directorio de publicación, el directorio de Functions, la versión de Node y los contextos.
8. Agrega `.env.example` que contenga solo nombres y documenta propiedad, visibilidad, contexto y scope.
9. Agrega entradas de `.gitignore` para excepciones de `.env*`, `.netlify/`, estado local de Convex, salida de build generada y credenciales según la convención del repositorio.
10. Agrega tests para argumentos inválidos, acceso no autenticado, acceso a recursos no autorizado y la primera operación válida.
11. Ejecuta generación, typecheck, tests, lint, build e inspecciona `dist/public` más la salida del servidor/función.

## Contrato mínimo de entorno

Registra solo nombres. Los valores pertenecen al entorno local, de Convex o de Netlify correspondiente:

| Variable | Consumidor | Visibilidad | Contexto |
| --- | --- | --- | --- |
| `WAKU_PUBLIC_CONVEX_URL` | Build del navegador | Pública | Desarrollo, preview, producción |
| `CONVEX_DEPLOY_KEY` | CLI de Convex durante el build | Secreta | Aislada por contexto de despliegue |
| Identificadores de navegador del proveedor de auth | Build del navegador | Públicos o definidos por el proveedor | Origen coincidente por contexto |
| Secretos del backend y de webhooks | Funciones de Convex | Secretos | Aislados por despliegue |

Nunca coloques deploy keys o secretos de backend en `WAKU_PUBLIC_*`, código cliente, `netlify.toml`, assets generados o source maps.

## Límite de aprobación de inicialización

Antes de crear o editar archivos, instalar paquetes, generar archivos de Convex, aprovisionar un despliegue, configurar variables alojadas o crear una preview, reporta las rutas, comandos, contexto y riesgos propuestos. Pide aprobación con ese alcance exacto.