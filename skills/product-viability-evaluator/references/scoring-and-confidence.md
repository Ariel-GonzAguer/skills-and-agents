# Scoring, cobertura de evidencia y confianza

## Tres medidas separadas

- `Overall score`: atractivo de la oportunidad ajustado por riesgo, 0-100.
- `Confidence`: probabilidad de que la evaluación sea direccionalmente correcta, 0-100.
- `Evidence coverage`: cuánta de la superficie de decisión ponderada tiene evidencia útil, 0-100.

La confianza no es optimismo. Evidencia fuerte de que un proyecto debería abandonarse puede producir un score bajo y una confianza alta.

## Contrato de scoring de dimensiones

Puntúa cada dimensión aplicable de 0 a 100. Usa `null` cuando no pueda puntuarse sin inventar datos. Nunca asignes 50 solo porque un valor es desconocido.

Cada dimensión debe incluir:

- `weight`: porcentaje entero o decimal;
- `score`: 0-100 o `null`;
- `confidence`: 0-100;
- `evidence_strength`: 0-4;
- `positive_factors`;
- `negative_factors`;
- `evidence_ids`;
- `unknowns`;
- fundamento conciso.

`evidence_strength: 0` significa que la dimensión no tiene evidencia útil. Solo es válida para una dimensión sin puntuar o explícitamente provisional, y no puede respaldar un score confiado.

Interpreta los scores de forma consistente:

| Rango | Interpretación |
| ---: | --- |
| 0-20 | Evidencia fuerte en contra de la viabilidad |
| 21-40 | Debilidad estructural material |
| 41-60 | Mixto, ordinario o sin resolver |
| 61-80 | Atractivo con debilidades acotadas |
| 81-100 | Evidencia y economía excepcionales |

Anclas específicas de problema:

- 0-20: problema inexistente o sin respaldo;
- 21-40: inconveniencia o urgencia débil;
- 41-60: problema real pero reemplazable;
- 61-80: problema importante y recurrente con costo significativo;
- 81-100: problema crítico, frecuente y costoso respaldado por comportamiento.

Una afirmación del fundador no puede por sí sola justificar un score por encima de 60 en la dimensión afectada.

## Guía de dimensiones

### Problem

Frecuencia, severidad, urgencia, costo de la inacción, workaround actual y evidencia de comportamiento. Evita contar dos veces el tamaño de mercado.

### Customer

Especificidad del ICP, claridad usuario/comprador/decisor/pagador, presupuesto, disparador de compra, homogeneidad de segmento y acceso a entrevista o venta.

### Market

Compradores elegibles alcanzables, crecimiento, timing, geografía, regulación, concentración y SOM creíble. Un TAM grande sin accesibilidad puntúa mal.

### Competition

Puntúa el atractivo, no la ausencia de competidores. Incluye directos, indirectos, sustitutos, distribución de incumbentes, costos de cambio y saturación de mercado. La competencia puede validar la demanda mientras reduce la captura.

### Differentiation

Ventaja de comprador medible y defendibilidad por datos, distribución, workflow, integración, expertise, marca, regulación, efectos de red o costos de cambio. Etiqueta fácil, moderada o difícil de copiar.

### Product / UX

Tiempo hasta el valor, completitud del workflow central, activación, confiabilidad, confianza, loop de retención y capacidades críticas faltantes. Deja la elegancia del código fuera salvo que cambie estos resultados.

### Monetization / pricing

Pagador, métrica de valor, evidencia de disposición a pagar, empaquetado, precio-valor, descuentos, ajuste de billing y durabilidad del ingreso.

### Acquisition

Camino creíble a clientes iniciales y a escala, acceso a canal, evidencia de conversión, duración del ciclo, capacidad de venta, dependencia de plataforma y saturación.

### Economics

Margen de contribución, CAC, retención/churn, LTV, payback, ciclo de caja, soporte, infraestructura, costo de IA/API y break-even. CAC y churn desconocidos deben impedir un score alto con confianza alta.

### Execution risk

Este score corre positivo: 100 significa ejecución fácil y de bajo riesgo; 0 significa inviable o expuesta. Incluye restricciones técnicas, operativas, legales, de cumplimiento, de dependencias, de capital, de soporte y de timing.

### Founder fit / personal ROI

Habilidades, acceso, credibilidad, disposición a vender, capital, tiempo semanal, interés, runway, costo de oportunidad, retorno por hora y capacidad de sostener el negocio.

## Score ponderado con dimensiones faltantes

Sea `known_weight` la suma de pesos con scores no nulos.

`provisional_score = sum(score x weight) / known_weight`

Esto evita fingir que desconocido significa malo. Sin embargo, puede hacer que una evaluación dispersa luzca engañosamente fuerte, así que siempre publica:

`evidence_coverage = known_weight / total_weight x 100`

No emitas `BUILD` cuando la cobertura de evidencia esté por debajo de 70. Por debajo de 50, normalmente límites en `VALIDATE` o `RECONSIDER` según si la evidencia faltante se puede testear barato y si el caso observado sigue siendo atractivo.

## Cálculo de confianza

La confianza de dimensión refleja calidad de fuente, triangulación, relevancia, actualidad, calidad de muestra y proximidad causal. Anclas sugeridas:

- 0-20: especulación o unknowns contradictorios;
- 21-40: evidencia direccional débil;
- 41-60: evidencia útil pero limitada;
- 61-80: múltiples fuentes relevantes o comportamiento verificado;
- 81-100: evidencia conductual repetida o autoritativa.

Calcula:

`weighted_dimension_confidence = sum(confidence x weight for scored dimensions) / known_weight`

`overall_confidence = 0.7 x weighted_dimension_confidence + 0.3 x evidence_coverage`

Luego aplica penalizaciones divulgadas, normalmente 0-20 en total, por evidencia desactualizada, contradicciones sin resolver, fuentes no independientes, sesgo de selección severo, contexto de fundador faltante o falta de investigación externa cuando fue necesaria. No apliques una penalización solo porque el score es bajo.

## Ajuste de red team

Guarda tanto `pre_red_team_score` como los scores de dimensión finales. El score ponderado final viene de los scores finales, no de una resta global arbitraria. Cada dimensión cambiada necesita un ID de ataque y un fundamento.

Si el red team encuentra un problema transversal que no puede asignarse a una dimensión, registra un `global_adjustment` transparente entre -10 y 0. Úsalo con moderación porque los cambios de dimensión son más fáciles de explicar.

## Deal breakers y límites de veredicto

Los deal breakers anulan el promediado. Ejemplos:

- prohibición legal o de cumplimiento sin remedio factible;
- sin acceso creíble al comprador dentro del runway;
- unidad económica estructuralmente negativa a escala plausible;
- capital requerido que excede el capital accesible;
- el fundador no puede ejecutar o financiar la actividad vinculante;
- la dependencia de plataforma o proveedor crea exposición existencial inaceptable;
- una brecha severa de seguridad/privacidad bloquea al comprador objetivo y no puede remediarse a tiempo;
- la evidencia conductual rechaza con fuerza la propuesta de valor central.

Cada deal breaker incluye estado `open`, `mitigated` o `accepted`, severidad, IDs de evidencia, remediación y límite de veredicto. Límites típicos:

- crítico sin resolver: `VALIDATE`, `RECONSIDER` o `ABANDON` según falsabilidad y evidencia;
- alto sin resolver: sin `BUILD`;
- sin evidencia de disposición a pagar o retención: normalmente sin `BUILD`;
- fit de fundador bajo sin plan de delegación: sin `BUILD` para este fundador, incluso si la viabilidad de la oportunidad es alta.

## El veredicto es un juicio, no una banda

Usa el score como un input. Explica por qué el veredicto elegido es preferible a los adyacentes. Un 72 con cobertura baja y un canal de adquisición sin testear puede ser `VALIDATE`; un 58 con confianza alta, economía de nicho fuerte, downside bajo y fit de fundador excelente puede ser `BUILD` para una microempresa acotada.