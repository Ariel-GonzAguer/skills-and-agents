# Input, marco de decisión y clasificación

## Empieza por la decisión

Define la decisión real antes de evaluar el objeto:

- Decisión: construir, continuar, lanzar, financiar, adquirir, comparar, pivotear o detener.
- Dueño de la decisión: fundador, equipo, inversor, empleador o comprador.
- Compromiso bajo revisión: próximo experimento, MVP, lanzamiento, 12 meses o empresa completa.
- Horizonte: fecha para la cual se requiere evidencia, ingreso o retorno.
- Objetivo de éxito: ingreso, utilidad, usuarios, aprendizaje estratégico, adopción comunitaria o ahorro interno.
- Alternativas: otro proyecto, empleo, consultoría, no hacer nada o proceso existente.
- Reversibilidad: costo y tiempo perdidos si la decisión es incorrecta.

Sin este marco, la misma oportunidad puede ser viable para un equipo con capital de riesgo e irracional para un fundador en solitario.

## Inventario de inputs

Registra cada ítem disponible y si está al día:

| Input | Ejemplos | Nota de confiabilidad |
| --- | --- | --- |
| Descripción del producto | pitch, README, issue, prompt de usuario | Afirmación del fundador hasta ser verificada |
| Artefacto del producto | repositorio, app, demo, screenshots | Prueba el comportamiento actual solo cuando se inspecciona |
| Evidencia de clientes | entrevistas, contratos, uso, churn | Revisa muestra, segmento, fecha y sesgo de selección |
| Evidencia comercial | facturas, pipeline, datos win/loss | Separa ingreso contabilizado, cobrado y proyectado |
| Evidencia financiera | facturas, nómina, uso de API, gasto en ads | Normaliza período y moneda |
| Evidencia externa | precios oficiales, files, estadísticas | Registra fuente, fecha, geografía y método |
| Contexto del fundador | tiempo, habilidades, capital, canales | Autorreporte; sigue siendo esencial para el fit |

Nunca pidas todo. Pide el input faltante con más probabilidad de cambiar la decisión. Una pregunta útil nombra la consecuencia: "¿Qué porcentaje de los 20 pilotos volvió a usar el producto después de cuatro semanas? Esto determina si la retención es evidencia o todavía es desconocida."

## Contexto del fundador y del equipo

Registra estos campos cuando estén disponibles:

- personas y roles;
- habilidades técnicas y de dominio;
- experiencia en ventas, marketing, operaciones, cumplimiento y soporte;
- presupuesto, runway y pérdida máxima aceptable;
- horas semanales distribuidas entre desarrollo, ventas, marketing, soporte y administración;
- fecha objetivo y objetivo de ingreso/utilidad;
- audiencia existente, relaciones con clientes, partners, marca, datos, IP y distribución;
- infraestructura y herramientas ya disponibles;
- geografía, idioma, entidad legal y restricciones;
- tolerancia al riesgo, estilo de vida deseado, interés y disposición a vender/dar soporte;
- costo de oportunidad y alternativas creíbles.

Distingue datos de fundador faltantes de un fit pobre del fundador. La falta de datos baja la confianza. Un desajuste confirmado baja el score y puede limitar el veredicto.

## Clasificación de proyecto

Elige un tipo primario y modificadores opcionales:

- `saas_b2b`
- `saas_b2c`
- `consumer_app`
- `marketplace`
- `developer_tool`
- `open_source`
- `api`
- `ai_product`
- `agency_service`
- `ecommerce`
- `hardware_software`
- `enterprise_software`
- `internal_tool`
- `content_product`
- `community`
- `mobile_app`
- `other`
- `unknown`

Criterios de clasificación:

1. ¿Quién paga y mediante qué transacción?
2. ¿El valor se entrega con software, mano de obra, contenido, acceso, transacciones o hardware?
3. ¿La adopción es individual, de equipo, de organización, comunitaria o de dos lados?
4. ¿El ingreso depende de suscripción, uso, take rate, servicios, patrocinio, publicidad o ahorro interno?
5. ¿Las ventas, las compras, la liquidez, la retención o la contribución comunitaria son la restricción vinculante?

Usa modificadores para economías superpuestas. Una herramienta de desarrollador open source con contratos enterprise puede ser `open_source` con modificadores `developer_tool` y `enterprise`. Un wrapper de IA sigue siendo un modificador `ai_product` solo si el costo, la confiabilidad, la dependencia o la diferenciación de la IA afectan materialmente la viabilidad.

Reporta la confianza de clasificación. Si es menor a 60, márcala como tentativa y haz una sola pregunta solo si clasificaciones distintas cambiarían materialmente los pesos o los gates de decisión.

## Mejorar la especificación original

La evaluación debe corregir estas trampas metodológicas comunes:

- Agregar el fit del fundador explícitamente en lugar de esconderlo dentro del riesgo de ejecución.
- Separar la madurez del producto de la deseabilidad del producto.
- Distinguir cobertura de evidencia, calidad de evidencia y confianza del modelo.
- Evaluar retención y comportamiento de cambio, no solo adquisición.
- Incluir tiempo hasta el ingreso, timing de caja, runway, reversibilidad y costo de oportunidad.
- Modelar impuestos solo cuando se conocen jurisdicción y forma jurídica; si no, mostrar resultados pre-impuestos.
- Tratar privacidad, seguridad, cumplimiento y política de plataforma como restricciones de negocio cuando pueden bloquear la adopción.
- Evitar falsa precisión. Usa rangos y análisis de sensibilidad para los pronósticos.
- Usar gates para riesgos fatales en lugar de fingir que toda debilidad puede promediarse.

## Obligatorio, configurable y automatizable

Obligatorio:

- etiquetas de evidencia y registro de fuentes;
- contexto del fundador o unknowns explícitos;
- pesos adaptativos con fundamento;
- score, confianza y cobertura mantenidos separados;
- red team y resolución de conflictos;
- gates de deal breaker;
- experimento de validación;
- reporte de unknowns y de qué cambiaría el veredicto.

Configurable:

- perfil de negocio y pesos;
- geografía, moneda, horizonte, tratamiento impositivo, tasa de descuento, salario/costo de oportunidad;
- profundidad de investigación rápida, estándar o profunda;
- umbrales de confianza y política de veredicto;
- tiempo máximo de investigación y actualidad de fuentes;
- retorno requerido y pérdida máxima.

Automatizable:

- validación de pesos y score ponderado;
- agregación de confianza y cobertura de evidencia;
- MRR, ARR, margen bruto, CAC, LTV, payback, burn, runway, break-even y retorno por hora;
- completitud de esquema y reporte;
- consistencia de escenarios y aritmética;
- normalización de la tabla de comparación.

El juicio humano o del agente sigue siendo necesario para relevancia de fuentes, inferencia causal, comportamiento del comprador, ajuste estratégico, severidad de deal breakers y el veredicto final.