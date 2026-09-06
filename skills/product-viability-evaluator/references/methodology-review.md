# Revisión de metodología y fundamento de arquitectura

## Fase 1: Revisión crítica de la especificación

La especificación original rechaza correctamente el sesgo de calidad técnica, y requiere contexto del fundador, evidencia externa, escenarios y una revisión adversaria. Sus principales debilidades metodológicas fueron:

1. El fit del fundador y el retorno sobre el tiempo eran obligatorios en prosa pero ausentes de las dimensiones ponderadas iniciales.
2. No definía cómo `UNKNOWN` afecta el scoring, creando presión para inventar valores, asignar puntos medios arbitrarios o castigar la evidencia faltante como fracaso.
3. Se requerían score y confianza pero no cobertura de evidencia, así un score alto basado en un subconjunto conocido pequeño podía parecer completo.
4. Las etiquetas de evidencia solicitadas omitían `ESTIMATE`, a pesar de requerir estimaciones financieras y de mercado.
5. La relación score-veredicto se rechazaba conceptualmente pero no se definía ningún mecanismo de gate explícito.
6. `PIVOT` y `RECONSIDER` pueden solaparse salvo que se defina el objeto del fracaso: oferta actual versus oportunidad/retorno del fundador.
7. Las fórmulas financieras cargaban peso en suscripciones y necesitaban alternativas por modelo, más timing de caja, runway, capital de trabajo y salvedades de cohortes.
8. Los hitos de adquisición de 10, 100 y 1.000 no aplican a enterprise, servicios de ticket alto, herramientas internas o algunos marketplaces sin hitos equivalentes.
9. Los roles multi-agente arriesgan acuerdo correlacionado, investigación duplicada y promedio de scores salvo que compartan IDs de evidencia y resuelvan conflictos explícitamente.
10. Diez resultados de negocio realistas no pueden probarse solo con tests deterministas porque la verdad de mercado requiere evidencia real; el testing debe separar los invariantes aritméticos del comportamiento del modelo y del juicio humano.

## Fase 2: Mejoras aplicadas

- Agregó `Founder fit / personal ROI` como undécima dimensión.
- Agregó `Evidence coverage` como métrica separada.
- Definió el scoring nulo: las dimensiones desconocidas se excluyen del score ponderado provisional pero reducen la cobertura y los permisos de veredicto.
- Agregó `ESTIMATE` y exigió método, rango y sensibilidad.
- Agregó deal breakers y límites de veredicto después del scoring.
- Definió `PIVOT` como evidencia de la oportunidad pero rechazo de la oferta, segmento, precio, producto o canal actuales.
- Definió `RECONSIDER` como oportunidad de riesgo-ajuste débil o retorno específico del fundador.
- Interpretó `BUILD` como autorización para un próximo compromiso acotado, no como escala incondicional.
- Agregó jerarquía de evidencia de demanda basada en comportamiento y tratamiento igualitario de la evidencia contraria.
- Agregó economías específicas de modelo para marketplaces, e-commerce, hardware, servicios, APIs/IA, open source y herramientas internas.
- Agregó retorno por hora del fundador, tiempo hasta el ingreso, capital en riesgo, reversibilidad y costo de oportunidad.
- Agregó estados seguros de inspección de repositorio que distinguen código, tests, docs y comportamiento crítico de negocio faltante.
- Agregó resolución de conflictos estructurada en lugar de votación o promedio de agentes.

## Fase 3: Arquitectura

El paquete usa divulgación progresiva:

1. `SKILL.md`: contrato de runtime, fases, gates y referencias requeridas.
2. `references/`: metodología detallada cargada solo para la fase o tipo de negocio activo.
3. `schemas/`: contrato de evaluación portable.
4. `config/`: perfiles de pesos y política de decisión editables.
5. `scripts/`: matemática determinista sin dependencias y validación de completitud.
6. `templates/`: reporte completo y comparación de proyectos.
7. `tests/`: regresiones sintéticas de scoring y gates.
8. `evals/`: prompts conductuales para evaluación a nivel de agente.
9. `examples/`: una evaluación completa pero explícitamente sintética.

Esta separación mantiene corto el contexto de activación mientras preserva los detalles rigurosos. Los scripts calculan solo lo que puede ser determinista; no deciden credibilidad de fuentes ni verdad de mercado.

## Elementos obligatorios

- etiquetas de evidencia y registro de fuentes;
- pesos adaptativos con fit del fundador;
- separación de score, confianza y cobertura;
- afirmaciones de repositorio verificadas más allá del README cuando hay acceso;
- incertidumbre financiera y divulgación de escenarios;
- red team obligatorio después del scoring inicial;
- gates de deal breaker;
- hipótesis más peligrosa y experimento de validación conductual;
- evidencia explícita que cambiaría el veredicto.

## Elementos configurables

- perfil de negocio y pesos;
- modo de investigación, presupuesto de tiempo, actualidad, geografía y requisitos de fuente;
- moneda, horizonte, base impositiva, costo del tiempo del fundador, retorno objetivo y pérdida máxima;
- umbrales de confianza y cobertura;
- campos financieros específicos de negocio y escalas de hitos;
- roles multi-agente y orden de ejecución.

## Elementos automatizables

- totales de pesos, score ponderado, confianza y cobertura;
- aritmética de métricas financieras comunes;
- completitud de escenarios y propagación de nulos;
- límites de deal breaker y consistencia de veredicto;
- completitud de esquema, referencias de evidencia y experimentos;
- casos de regresión sintéticos y estructura de eval conductual cross-model.

## Controles de sesgo

- Sesgo de confirmación: evidencia contraria obligatoria y red team.
- Sesgo del constructor: calidad técnica aislada de demanda y monetización.
- Sesgo de TAM: mercado alcanzable bottom-up y SOM limitado por capacidad.
- Sesgo de supervivencia: buscar alternativas fallidas y reseñas negativas, no solo ganadores.
- Sesgo de precisión: rangos, nulos, sensibilidad y cobertura.
- Apego del fundador: viabilidad de la oportunidad y viabilidad específica del fundador reportadas por separado.
- Sesgo de automatización: los scripts no pueden emitir un veredicto final; los gates solo lo limitan.
- Teatro de pesimismo: los ataques del red team requieren evidencia o inferencia falsificable, y pueden dejar los scores sin cambios con explicación.

## Limitaciones conocidas

- Ningún prompt puede garantizar investigación veraz cuando las herramientas o el acceso a fuentes son débiles.
- El acuerdo cross-model no prueba corrección; datos de entrenamiento correlacionados pueden reproducir el mismo error.
- Los fixtures sintéticos validan fórmulas y política, no resultados reales de mercado.
- Los pronósticos siguen condicionados al comportamiento del cliente y a condiciones externas.
- Una auditoría de repositorio no puede probar el comportamiento de producción sin acceso de runtime adecuado y tests seguros.