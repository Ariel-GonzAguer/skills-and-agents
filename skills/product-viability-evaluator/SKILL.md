---
name: product-viability-evaluator
description: Evalúa si un producto, repositorio, SaaS, app, proyecto open-source, marketplace, API, servicio o idea de negocio vale la pena invertir tiempo y dinero. Usar cuando un usuario pregunte si construir, continuar, financiar, lanzar, monetizar, pivotar, comparar o abandonar un proyecto, incluyendo solicitudes como "evaluar este proyecto", "esto es viable", "este SaaS tiene mercado", "auditar este repo como negocio" o "qué proyecto debería seguir". Realiza investigación de mercado basada en evidencia, inspección de solo lectura del repositorio, escenarios financieros, análisis de ajuste fundador-retorno sobre el tiempo, equipo rojo adversarial obligatorio, manejo explícito de incertidumbre, y produce CONSTRUIR, VALIDAR, PIVOTAR, RECONSIDERAR o ABANDONAR.
compatibilidad: Agnóstico al modelo. Funciona con herramientas de sistema de archivos y shell; la investigación web y subagentes mejoran la evidencia pero son opcionales. Node.js 18+ es opcional para scripts deterministas de puntuación y validación.
---

# Evaluador de Viabilidad de Producto

Decidir si esta oportunidad merece el tiempo, dinero y atención escasos de este fundador. Optimizar para la mejor decisión soportada por la evidencia disponible, no para una respuesta persuasiva.

## Reglas innegociables

1. Nunca fabricar datos de mercado, números de clientes, precios, información de competidores, métricas financieras, citas, funcionalidad del repositorio, demanda de usuarios o hechos de negocio.
2. Etiquetar afirmaciones materiales como `HECHO`, `EVIDENCIA`, `ESTIMACIÓN`, `SUPUESTO`, `INFERENCIA` o `DESCONOCIDO`. Una estimación necesita un método y rango; un supuesto necesita análisis de sensibilidad.
3. Tratar declaraciones del fundador y afirmaciones del README como hipótesis hasta que estén respaldadas independientemente. El código del repositorio prueba implementación, no demanda.
4. Buscar evidencia negativa con el mismo esfuerzo usado para evidencia de soporte.
5. Mantener `Puntuación`, `Confianza` y `Cobertura de evidencia` separados. La evidencia faltante reduce la confianza y cobertura; no convertir silenciosamente `DESCONOCIDO` en cero o un punto medio inventado.
6. No dejar que la puntuación ponderada determine el veredicto. Aplicar puertas de decisión y deal breakers después de puntuar.
7. Preferir `VALIDAR` cuando una incertidumbre de alto impacto permanezca testeable. Decir que la evidencia es insuficiente cuando lo es.
8. Auditar repositorios en solo lectura. Nunca imprimir valores secretos, modificar código, ejecutar comandos destructivos o inferir preparación para producción solo de la documentación.
9. Igualar la profundidad técnica al impacto de la decisión. No gastar tiempo en refactorizaciones estéticas o detalles de implementación de bajo impacto.

## Entradas y modo

Aceptar cualquier combinación de ruta de repositorio, URL, README, descripción, precios, evidencia de clientes, analítica, datos financieros y contexto del fundador/equipo. Inventario lo que está presente antes de hacer preguntas.

Seleccionar un modo:

- `rápido`: triaje limitado en tiempo usando evidencia disponible; confianza claramente limitada.
- `estándar`: flujo completo con investigación externa, auditoría de repositorio cuando esté disponible, escenarios y equipo rojo. Por defecto.
- `profundo`: estándar más triangulación de fuentes, análisis de sensibilidad y perspectivas independientes de agentes.
- `comparar`: evaluar proyectos con el mismo horizonte, moneda, estándar de evidencia y restricciones del fundador.

Hacer como máximo una pregunta a la vez, y solo cuando su respuesta tenga alto impacto en la decisión. De lo contrario proceder con `DESCONOCIDO` y declarar cómo resolverlo. El contexto del fundador es crítico para la decisión, pero su ausencia no debe bloquear una evaluación inicial de la oportunidad.

Leer [references/input-and-classification.md](references/input-and-classification.md) antes de clasificar el proyecto o entrevistar al fundador.

## Flujo de trabajo requerido

### 1. Inspeccionar y enmarcar

1. Inventariar artefactos suministrados, fechas, monedas, geografías y acceso a evidencia.
2. Declarar la decisión, propietario de la decisión, horizonte temporal, resultado objetivo y alternativas, incluyendo no hacer nada.
3. Clasificar el tipo de proyecto y confianza. Usar un tipo primario más modificadores como `producto AI`, `empresa` u `open source` cuando sea necesario.
4. Capturar restricciones del fundador y costo de oportunidad. Mantener la viabilidad de la oportunidad distinta de la viabilidad específica del fundador.
5. Crear un registro de evidencia antes del análisis. Dar a cada fuente y afirmación material un ID.

### 2. Construir la base de evidencia

Leer [references/evidence-and-research.md](references/evidence-and-research.md).

1. Formar hipótesis explícitas para problema, cliente, disposición de pago, mercado alcanzable, diferenciación, distribución, retención, economía, ejecución y ajuste del fundador.
2. Investigar competidores directos, alternativas indirectas, sustitutos, precios oficiales, señales de demanda, regulación y números de compradores alcanzables.
3. Preferir fuentes primarias, fechadas y atribuibles. Triangular afirmaciones consecuentes; explicar cuando solo existe una fuente.
4. Usar TAM/SAM/SOM de abajo hacia arriba cuando sea posible. Nunca usar un TAM grande de arriba hacia abajo como prueba de viabilidad.
5. Registrar evidencia contradictoria y negativa, fecha de fuente, geografía, calidad y limitaciones.

Si el acceso a internet no está disponible, no simular investigación. Listar las búsquedas y fuentes necesarias, marcar afirmaciones afectadas como `DESCONOCIDO` y limitar la confianza en consecuencia.

### 3. Auditar el producto y repositorio

Cuando un repositorio o producto esté disponible, leer [references/repository-audit.md](references/repository-audit.md).

1. Verificar comportamiento implementado en código fuente, tests, configuración y salida segura de inspección.
2. Clasificar cada capacidad relevante como `VERIFICADA`, `PRESENTE_CON_RIESGO`, `INCOMPLETA`, `SOLO_DOCUMENTADA`, `FALTANTE_CRÍTICA` o `INNECESARIA`.
3. Rastrear solo problemas técnicos que afecten adopción, seguridad, cumplimiento, fiabilidad, costo, tiempo de entrega, soporte o diferenciación.
4. Separar madurez del producto de atractivo de negocio. Nunca recompensar calidad de código como proxy de demanda.

### 4. Analizar y modelar

Leer estas referencias progresivamente:

- [references/scoring-and-confidence.md](references/scoring-and-confidence.md) para dimensiones, pesos adaptativos, cobertura de evidencia, confianza y cálculo determinista.
- [references/business-model-profiles.md](references/business-model-profiles.md) para preguntas y pesos específicos por tipo.
- [references/financial-modeling.md](references/financial-modeling.md) para escenarios, economía unitaria, retorno sobre el tiempo y análisis de sensibilidad.

Puntuar cada dimensión aplicable con factores positivos, factores negativos, IDs de evidencia, desconocidos, confianza y justificación. Incluir `Ajuste del fundador / ROI personal` como una dimensión de primera clase. Si no es aplicable, explicar por qué en vez de eliminarla silenciosamente.

Crear escenarios pesimista, base y optimista solo cuando las entradas puedan ser soportadas o asumidas transparentemente. Mantener hechos históricos, pronósticos y metas separados. Usar rangos cuando la precisión puntual sería falsa.

Para cálculo determinista, crear un JSON de evaluación conforme a [schemas/assessment.schema.json](schemas/assessment.schema.json), luego ejecutar:

```bash
node <skill-directory>/scripts/calculate-score.mjs <assessment.json>
```

El script valida pesos, calcula puntuación ponderada, cobertura de evidencia, confianza, métricas financieras y techos de veredicto. Tratar su salida como soporte de cálculo, no juicio autónomo.

### 5. Ejecutar el equipo rojo obligatorio

Leer [references/red-team-and-decision.md](references/red-team-and-decision.md).

Realizar esto después de la puntuación inicial para que pueda desafiar un caso concreto. Construir el caso plausible más fuerte de que el proyecto no debería recibir más inversión. Atacar demanda, acceso al comprador, disposición de pago, comportamiento de cambio, retención, distribución, economía unitaria, costos ocultos, restricciones legales, dependencias y ajuste del fundador.

Para cada ataque, declarar la afirmación desafiada, evidencia contraria, mecanismo de fallo, severidad, probabilidad, test de falsificación e impacto en la puntuación. Un equipo rojo que no cambia nada requiere una explicación explícita.

Resolver desacuerdos entre el análisis inicial y el equipo rojo. Recalcular dimensiones cambiadas y preservar tanto las puntuaciones pre-equipo-rojo como las finales.

### 6. Decidir con puertas

Aplicar deal breakers y techos de veredicto después de puntuar:

- `CONSTRUIR`: evidencia suficiente soporta demanda, compradores alcanzables, un camino económico plausible, ajuste de ejecución y sin puerta crítica sin resolver.
- `VALIDAR`: el potencial existe, pero una o más hipótesis testeables de alto impacto permanecen sin resolver.
- `PIVOTAR`: el problema o mercado tiene evidencia, pero el cliente actual, oferta, producto, precios o canal son estructuralmente débiles.
- `RECONSIDERAR`: la evidencia, el retorno ajustado al riesgo, el ajuste del fundador o el costo de oportunidad son poco atractivos, pero no fatalmente concluyentes.
- `ABANDONAR`: evidencia fuerte muestra que el retorno esperado no justifica más inversión o existe un deal breaker no remediable.

No usar rangos de veredicto basados solo en puntuación. Un proyecto con alta puntuación pero disposición de pago no verificada, distribución inaccesible, exposición crítica de cumplimiento o restricciones imposibles del fundador no puede recibir `CONSTRUIR`.

### 7. Diseñar experimentos de validación

Identificar la hipótesis no validada más peligrosa. Rankear experimentos por:

`prioridad = impacto en decisión x incertidumbre x ganancia esperada de información / costo`

Para cada experimento recomendado definir hipótesis, método, segmento objetivo, muestra o exposición, duración, presupuesto de costo/tiempo, umbral de éxito, umbral de fallo, decisión cambiada y responsable. Preferir evidencia conductual como pago, piloto firmado, migración, uso repetido o respuestas calificadas sobre interés declarado.

### 8. Reportar

Usar [templates/report.md](templates/report.md) para un proyecto individual y [templates/comparison.md](templates/comparison.md) para múltiples proyectos. El bloque ejecutivo es obligatorio incluso cuando el reporte detallado se acorta.

Validar un artefacto de reporte estructurado cuando se produce uno:

```bash
node <skill-directory>/scripts/validate-assessment.mjs <assessment.json>
```

No validar un artefacto de triaje intencionalmente parcial como una evaluación completa. Marcarlo como parcial, listar secciones no disponibles y validar solo después de que existan los registros de evidencia, equipo rojo y experimentos requeridos.

## Ejecución multi-agente

Si hay agentes independientes disponibles, leer [references/multi-agent.md](references/multi-agent.md). Leer [config/agents.json](config/agents.json) para el mapeo de rol a agente y delegar investigación de evidencia, inspección técnica, finanzas, análisis comercial y escepticismo al agente nombrado para cada rol, ejecutándolos en paralelo donde el flujo de trabajo lo permita. Mantener IDs de fuente y un esquema compartido. El sintetizador debe resolver desacuerdos en vez de votar u opinar promediando.

La skill nunca nombra un modelo. Cada archivo de agente vincula su propio modelo a nivel de host; editar ese modelo allí para cambiar el modelo de una fase, luego reiniciar opencode.

Si un agente en `config/agents.json` falta o solo hay un modelo disponible, usar pasadas separadas con notas frescas: `Analista`, `Investigador`, `Analista financiero`, `Escéptico`, luego `Sintetizador`. No exponer cadena de pensamiento oculta; reportar evidencia, cálculos, supuestos, desacuerdos y justificación concisa.

## Modo comparación

Normalizar proyectos al mismo fundador, horizonte, moneda, tratamiento fiscal, supuesto de salario/costo-de-oportunidad y estándar de confianza. Comparar puntuación y confianza por separado, luego incluir capital en riesgo, tiempo hasta primer ingreso, rango de valor esperado, retorno por hora del fundador, desventaja, reversibilidad y valor de opción estratégica. No rankear un resultado mayor sobre uno menor pero mucho más eficiente sin explicar el tradeoff.

## Puerta de completitud

Antes de devolver un veredicto, verificar que el reporte contiene:

- tipo de proyecto y confianza de clasificación;
- contexto del fundador o datos faltantes explícitos del fundador;
- pesos adaptativos sumando 100 y justificación;
- puntuación, confianza y cobertura de evidencia;
- registro de fuentes con etiquetas de afirmación y fechas;
- competencia directa, indirecta y sustitutos;
- rutas de adquisición para los primeros 10, 100 y 1.000 clientes, o por qué una escala es inaplicable;
- escenarios financieros o una explicación precisa de por qué no pueden modelarse;
- retorno sobre el tiempo y costo de oportunidad;
- conclusiones pre y post equipo rojo;
- deal breakers y techos de veredicto;
- desconocidos y cómo obtenerlos;
- hipótesis más peligrosa y un próximo experimento con umbrales de éxito/fallo;
- una declaración explícita de qué evidencia cambiaría el veredicto.

Si estos no pueden completarse, devolver la evaluación parcial con sus límites. Nunca llenar gaps con hechos que suenan plausibles.

## Configuración y mantenimiento

Leer [references/configuration-and-extension.md](references/configuration-and-extension.md) antes de cambiar pesos, política de veredicto, esquemas, fórmulas financieras, tipos de negocio o roles de agentes. Leer [references/methodology-review.md](references/methodology-review.md) para la crítica de especificación, correcciones metodológicas y justificación de arquitectura detrás de esta versión.
