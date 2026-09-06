# Ejecución multi-agente agnóstica de modelo

## Contrato compartido

Todos los agentes escriben en el mismo esquema de evaluación y en el mismo registro de evidencia. Deben usar IDs de fuente estables, divulgar unknowns, evitar supuestos específicos de modelo y nunca votar sobre el veredicto.

Roles:

- `Researcher`: reúne evidencia externa primaria y contraria; no puntúa más allá de las implicaciones de las fuentes.
- `Product/technical analyst`: realiza la auditoría de producto y repositorio de solo lectura; no infiere demanda desde la calidad del código.
- `Commercial analyst`: analiza ICP, competencia, diferenciación, monetización y adquisición.
- `Financial analyst`: verifica fórmulas, escenarios, sensibilidad, timing de caja y retorno sobre el tiempo.
- `Skeptic`: recibe el caso inicial y lo ataca de forma independiente.
- `Synthesizer`: resuelve conflictos, aplica gates, calcula el score final y escribe el reporte.

## Vinculación de rol a agente

Esta Skill nunca nombra un modelo. La selección de modelo ocurre a nivel de host: cada rol se delega a un agente definido en la configuración de opencode del usuario, y cada agente vincula su propio modelo.

- El mapeo vive en [config/agents.json](../config/agents.json): un objeto `role_agent` que empareja cada nombre de rol con un nombre de agente.
- Los agentes en sí son archivos en la configuración del host (por ejemplo `~/.config/opencode/agents/viability-skeptic.md` con frontmatter `model: provider/model-id`).
- Para cambiar el modelo de una fase, edita el campo `model` del archivo de agente correspondiente. No edites `config/agents.json` para eso; edítalo solo para apuntar un rol a un nombre de agente distinto.
- El orquestador delega al agente nombrado en `config/agents.json`, no a una lista hardcodeada. Si un agente falta, recurre a la secuencia de modelo único de abajo y divulga la limitación.

## Paralelización

Después de la clasificación y la definición de hipótesis, la investigación, la auditoría de repositorio y la preparación de inputs financieros pueden correr en paralelo. El red team debe ver las afirmaciones y scores iniciales, por eso corre después de la primera síntesis. La síntesis final corre al final.

No paralelices trabajo que duplicaría fuentes sin propósito. El análisis duplicado independiente es útil solo para afirmaciones de alto impacto, calibración de scores o revisión adversaria.

## Formato de handoff

Cada agente devuelve:

- alcance completado y límites;
- registros de afirmaciones con etiquetas e IDs de fuente;
- evidencia de apoyo y contraria;
- unknowns ordenados por impacto en la decisión;
- cálculos con inputs y fórmulas cuando corresponda;
- desacuerdos con afirmaciones existentes;
- ningún veredicto final salvo que se le asigne sintetizar.

## Independencia

Para una segunda opinión genuina, no reveles el veredicto inicial ni la preferencia del fundador al skeptic antes de que forme sus ataques. Puede recibir el registro de evidencia factual y las afirmaciones iniciales después de producir un mapa de riesgo independiente.

## Fallback de modelo único

Usa fases y notas separadas. Restablece el objetivo del rol explícitamente y prevén filtraciones pidiendo a cada pasada que desafíe el artefacto anterior, no que continúe su prosa. La separación mejora la disciplina pero no crea independencia verdadera; divulga esta limitación en la confianza.

## Portabilidad

- No nombre ni requieras un modelo específico.
- Trata las herramientas de web, navegador, repositorio, shell y subagentes como capacidades descubiertas en runtime.
- Usa rutas relativas dentro de la skill.
- Mantén los scripts deterministas sin dependencias y opcionales.
- Cuando un proveedor no puede ejecutar subagentes, ejecuta los roles en secuencia.
- Cuando un proveedor no puede acceder a internet, produce un plan de investigación y baja la confianza en lugar de fabricar resultados.