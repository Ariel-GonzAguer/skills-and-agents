# Auditoría de producto y repositorio

## Propósito y seguridad

Determina si el producto actual puede entregar el resultado prometido con la confiabilidad suficiente para respaldar la adopción y la economía. No conviertas esto en una revisión de código genérica.

Por defecto usa inspección de solo lectura. No modifiques archivos, instales paquetes, accedas a sistemas de producción, imprimas valores de entorno ni ejecutes comandos destructivos. Prefiere búsqueda en repositorio, inspección de manifests, comandos de test existentes, chequeos estáticos y builds locales solo cuando sean seguros y proporcionados. Reporta nombres de secretos, nunca valores.

## Orden de evidencia

Usa esta jerarquía:

1. comportamiento de runtime observado o test focalizado que pasa;
2. implementación rastreada por código fuente y configuración;
3. tests existentes sin una corrida actual;
4. afirmación de documentación o README;
5. roadmap, issue o comentario.

La documentación sola recibe `DOCUMENTED_ONLY`.

## Mapa de producto

Mapea el camino más corto del cliente objetivo al valor realizado:

- descubrimiento y propuesta de landing;
- signup, autenticación y calificación;
- onboarding y tiempo hasta el primer valor;
- workflow del trabajo central;
- colaboración, export o integración necesaria para la adopción;
- pago y entitlements;
- soporte, recuperación de errores y cancelación;
- loop de retención y razón para volver.

Inspecciona solo las rutas, componentes, servicios, esquemas, trabajos, integraciones y tests que respaldan este camino antes de ampliar el alcance.

## Estados de capacidad

- `VERIFIED`: el comportamiento está rastreado y respaldado por ejecución o tests focalizados.
- `PRESENT_WITH_RISK`: la implementación existe pero tiene un riesgo material de confiabilidad, seguridad, UX, costo o escalabilidad.
- `INCOMPLETE`: parte del workflow existe pero no puede entregar el resultado prometido de punta a punta.
- `DOCUMENTED_ONLY`: reclamado pero no confirmado en la implementación.
- `MISSING_CRITICAL`: ausente y requerido para vender, onboard, cumplir, cobrar o retener usuarios.
- `UNNECESSARY`: consume esfuerzo material sin respaldar al cliente objetivo ni a la decisión.

## Áreas de auditoría relevantes a la decisión

### Producto y UX

- ¿La propuesta de valor es visible y consistente con el comportamiento real?
- ¿El ICP puede alcanzar el primer valor sin intervención del fundador?
- ¿El esfuerzo de onboarding es aceptable para el precio y el tipo de comprador?
- ¿Los estados críticos, estados vacíos, errores, cancelación y recuperación están implementados?
- ¿El workflow es responsivo y accesible lo suficiente para el contexto objetivo?
- ¿El producto crea un loop de retención o solo una utilidad de una sola vez?

### Entrega técnica

- Arquitectura y dependencias que afectan velocidad de entrega o riesgo operativo.
- Modelo de datos y migraciones que afectan workflows centrales.
- Autenticación, autorización, tenancy y auditabilidad requeridas por el comprador.
- Comportamiento de pago, planes, entitlements, facturación, impuestos y cancelación.
- APIs externas, proveedores de modelo, cuotas, lock-in y modos de falla.
- Despliegue, rollback, backups, observabilidad y diagnósticos de soporte.
- Tests alrededor de ingreso, seguridad, integridad de datos y valor central del cliente.

### Economía y escala

- costo de infraestructura variable y de IA/API por cliente activo o transacción;
- workloads sin límite, exposición al abuso u operaciones manuales escondidas detrás del producto;
- carga de soporte y onboarding;
- restricciones de rendimiento que reducen conversión o retención;
- límites que fallan antes de la cantidad de clientes del escenario.

### Confianza y acceso al mercado

- requisitos de privacidad, seguridad, cumplimiento, data residency, accesibilidad y procurement;
- integraciones o export requeridos para desplazar la alternativa actual;
- señales de credibilidad y controles operativos necesarios al precio objetivo.

## Secuencia de inspección de repositorio

1. Lee instrucciones del repositorio, README, manifests, lockfiles, mapa de directorios y estado de git.
2. Identifica framework, runtime, destino de despliegue, bases de datos, pagos, autenticación, analytics y APIs de terceros.
3. Mapea las afirmaciones visibles al usuario a rutas de código y tests.
4. Inspecciona configuración y nombres de variables de entorno sin leer valores.
5. Inspecciona los scripts actuales de test, lint, typecheck, build, auditoría y despliegue.
6. Ejecuta solo chequeos seguros y existentes que mejoren materialmente la confianza y no requieran secretos ni escrituras externas.
7. Cita archivo y línea para hallazgos de consecuencia.

No afirmes que una funcionalidad funciona porque existe un componente, una ruta, un paquete o una variable de entorno. Rastrea el flujo completo.

## Salida de viabilidad técnica

Reporta:

- etapa de madurez: concepto, prototipo, MVP, beta, producción o desconocida;
- flujo central verificado y pasos rotos/faltantes;
- tabla de capacidades con estados y evidencia;
- bloqueadores técnicos críticos y rangos estimados de remediación;
- motores de costo operativo y límites de escala;
- problemas de seguridad/cumplimiento que afectan la venta o la confianza;
- deuda técnica que cambia el tiempo al mercado o la carga de soporte;
- observaciones irrelevantes de calidad técnica excluidas a propósito.

Puntúa producto/UX y ejecución por sus consecuencias de negocio. Mantén comercialmente débil un producto técnicamente elegante sin demanda, y viable un MVP áspero pero comercialmente fuerte cuando la remediación sea accesible y acotada.