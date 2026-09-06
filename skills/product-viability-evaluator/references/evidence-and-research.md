# Evidencia e investigación externa

## Etiquetas de afirmaciones

Usa exactamente una etiqueta primaria para cada afirmación material:

- `FACT`: verificado directamente en un artefacto primario o en una observación reproducible.
- `EVIDENCE`: respaldada por una fuente atribuible pero todavía sujeta al método y alcance de esa fuente.
- `ESTIMATE`: rango calculado basado en inputs y método divulgados.
- `ASSUMPTION`: input elegido para modelar una incógnita.
- `INFERENCE`: conclusión derivada de hechos, evidencia o estimaciones.
- `UNKNOWN`: información material no disponible o no verificable.

`FACT` no significa universalmente verdadero. Incluye alcance y fecha. La página oficial de precios de un competidor es un hecho sobre el precio mostrado en la fecha de acceso, no una prueba del ARPU realizado.

## Fuerza de la evidencia

Califica cada ítem de evidencia de 0 a 4:

| Calificación | Significado | Ejemplos |
| ---: | --- | --- |
| 0 | Sin evidencia | afirmación sin respaldo, cita inaccesible |
| 1 | Débil | anécdota, inferencia de modelo, post no verificado, muestra de conveniencia diminuta |
| 2 | Moderada | investigación secundaria creíble, datos de comunidad profesional, estudio de cliente limitado |
| 3 | Fuerte | precios/docs oficiales, observación de repositorio, comportamiento de cliente verificado, datos gubernamentales |
| 4 | Muy fuerte | datos de comportamiento replicados, contratos pagados/cohorte de retención, file auditado, múltiples fuentes primarias independientes |

Ajusta por relevancia, actualidad, geografía, selección de muestra, conflictos de interés, y si la evidencia mide comportamiento o intención declarada.

## Registro de evidencia

Asigna a las fuentes IDs estables como `S01` y a las afirmaciones IDs como `C01`.

Para cada fuente registra:

- título y editor;
- URL, o archivo y línea del repositorio;
- fecha de publicación y fecha de acceso;
- tipo y fuerza de la fuente;
- geografía y segmento;
- afirmación respaldada o contradicha;
- limitaciones.

Para cada afirmación material registra:

- etiqueta;
- declaración;
- IDs de fuente;
- confianza;
- si la evidencia es de apoyo, contraria o mixta;
- impacto en la decisión.

Nunca cites un snippet de resultados de búsqueda como fuente cuando la página subyacente está disponible. Nunca inventes una URL ni una cita inaccesible.

## Secuencia de investigación

Investiga hipótesis, no temas:

1. Problema: quién lo experimenta, con qué frecuencia, cuánto cuesta, y qué comportamiento prueba la urgencia.
2. Comprador: quién usa, decide, aprueba y paga. ¿Qué presupuesto es dueño de la compra?
3. Alternativas: qué hacen hoy los compradores, incluidas hojas de cálculo, mano de obra, inacción o software empaquetado.
4. Cambio: por qué cambiarían, qué costos de migración y aprendizaje existen, y qué disparador genera movimiento.
5. Acceso al mercado: cuántos compradores con el perfil correcto son identificables y alcanzables por canales realistas.
6. Competencia: precios oficiales, posicionamiento, distribución, integraciones, reputación, financiamiento y costo de cambio.
7. Economía: precio realista, costo variable, carga de soporte, esfuerzo de venta, churn, comisiones de pago y exposición a AI/API.
8. Regulación y dependencia de plataforma: reglas que pueden bloquear la venta, operación o distribución.
9. Caso contrario: evidencia de que la demanda es débil, los presupuestos están congelados, los sustitutos bastan o los incumbentes empaquetan la funcionalidad.

## Estrategia de fuentes

Cuando sea relevante, prefiere las fuentes en este orden:

1. Comportamiento de clientes, contratos, retención y registros de transacciones provistos por el usuario.
2. Precios oficiales de competidores, documentación de producto, términos, páginas de status, files y changelogs.
3. Datos de gobiernos, reguladores, organismos de estándares, compras públicas y asociaciones de industria.
4. Encuestas o datasets propios con metodología divulgada.
5. Análisis secundarios de reputación y publicaciones especializadas.
6. Comunidades, reseñas, ofertas de trabajo, tendencias de búsqueda y contenido social, solo como evidencia direccional.

Usa al menos dos fuentes independientes para una afirmación que pueda cambiar el veredicto, salvo que una única fuente autoritativa sea definitiva. Reporta la excepción.

## Dimensionamiento de mercado

Usa dimensionamiento bottom-up:

`compradores elegibles x incidencia del problema x capacidad de pago x cuota alcanzable x ingreso anual por comprador`

- TAM: todos los compradores elegibles bajo un alcance claramente definido.
- SAM: compradores que el producto actual, la geografía, el idioma, el cumplimiento y el modelo de entrega pueden servir.
- SOM: compradores alcanzables de forma plausible dentro del horizonte y la capacidad de canal declarados.

Muestra cada factor y su fuente. No apliques porcentajes de cuota de mercado arbitrarios. Limita el SOM por capacidad usando leads alcanzables, tasa de conversión, capacidad de venta, duración del ciclo, capacidad de onboarding y churn.

Para marketplaces, dimensiona cada lado y calcula la liquidez por segmento o geografía. Para herramientas internas, reemplaza el dimensionamiento de mercado por ahorro de costos abordable y alcance de adopción.

## Investigación de competencia

Incluye competidores directos, alternativas indirectas, sustitutos y la opción de no hacer nada. Para alternativas importantes compara:

- segmento objetivo y comprador;
- problema y trabajo resuelto;
- precio oficial y métrica de precio;
- flujo de trabajo central e integraciones;
- ventaja de adquisición/distribución;
- costo de migración y cambio;
- confianza, seguridad, cumplimiento, soporte y reputación;
- fortalezas, debilidades y fecha de la evidencia.

Responde: "¿Qué evento específico y beneficio medible haría que un comprador abandone la solución actual?". Una mejor UI por sí sola es diferenciación débil salvo que cambie el tiempo, la tasa de error, la conversión, el riesgo o la accesibilidad lo suficiente como para superar los costos de cambio.

## Jerarquía de evidencia de demanda

De más fuerte a más débil:

1. uso pagado repetido y retención aceptable;
2. contrato pagado, depósito o piloto firmado con un camino real de implementación;
3. acción costosa del cliente como migración, integración o uso recurrente del workflow;
4. pipeline calificado con conversión observada;
5. uso orgánico repetido o referidos;
6. waitlist o registro calificado;
7. declaración de entrevista o intención de encuesta;
8. volumen de búsqueda, engagement social o tendencia amplia;
9. intuición del fundador.

No trates los registros gratuitos como disposición a pagar ni las entrevistas como evidencia de retención.

## Comportamiento ante fallas de investigación

Cuando las fuentes entran en conflicto, preserva el conflicto, evalúa métodos y alcances, y baja la confianza. Cuando el acceso externo no existe, lista las consultas exactas sin responder y las fuentes primarias probables. Cuando los datos están desactualizados, reporta la fecha y prueba sensibilidad en lugar de actualizarlos por intuición.