# Configuración y extensión

## Modificar pesos

Edita [config/profiles.json](../config/profiles.json), preservando los once IDs de dimensión estables y un total de 100 por perfil. Luego actualiza [references/business-model-profiles.md](business-model-profiles.md) para que los agentes entiendan por qué el perfil difiere.

Para una evaluación de una sola vez, copia el perfil más cercano dentro del JSON de la evaluación y explica cualquier cambio. Mantén los cambios pequeños salvo que el negocio tenga una restricción estructuralmente distinta. `founder_fit` debe permanecer explícito y no puede eliminarse de ningún perfil. Las keys de perfil deben coincidir exactamente con el tipo de proyecto del esquema; alias como `consumer` y `enterprise` se conservan solo como referencias amigables en la metodología.

## Modificar la política de decisión

Los defaults de política viven en [config/decision-policy.json](../config/decision-policy.json) y son leídos por `scripts/calculate-score.mjs` en runtime. Mantén su semántica alineada con las notas de política y ejecuta los tests completos después de cualquier cambio de política.

No introduzcas bandas de veredicto basadas solo en el score. La política puede cambiar los umbrales de confianza, cobertura y deal breakers, pero el veredicto final sigue siendo una decisión razonada.

## Agregar un tipo de negocio

1. Agrega el tipo a `project.type` en `schemas/assessment.schema.json`.
2. Agrega un perfil de pesos que totalice 100 a `config/profiles.json`.
3. Agrega preguntas específicas de comprador, retención, distribución, economía y ejecución a `references/business-model-profiles.md`.
4. Agrega al menos un caso determinista a `tests/cases.json` y un eval conductual a `evals/evals.json`.
5. Ejecuta `node tests/run-tests.mjs` y el validador de la Skill.

## Cambiar el modelo por fase

Esta Skill nunca codifica nombres de modelo. Cada rol se delega a un agente definido a nivel de host, y cada agente vincula su propio modelo:

1. Edita el campo `model` en el archivo de agente correspondiente de tu configuración de opencode (por ejemplo `~/.config/opencode/agents/viability-skeptic.md` con `model: provider/model-id`).
2. Reinicia opencode para que se cargue la nueva configuración.
3. Re-ejecuta la evaluación. El mapeo de rol a agente en [config/agents.json](../config/agents.json) no cambia.

Para vincular un rol a un agente distinto, edita el mapeo `role_agent` en `config/agents.json` y reinicia opencode.

## Agregar agentes o modelos

No codifiques nombres de modelo. Agrega un rol en `references/multi-agent.md`, define sus campos de input y output, y asegúrate de que escriba IDs de fuente en el esquema de evaluación compartido. Un rol nuevo debe reducir el error correlacionado, recolectar evidencia distinta o realizar verificación determinista; si no, solo agrega costo.

Para exponer un rol a la delegación:

1. Agrega el rol a `references/multi-agent.md`.
2. Define un archivo de agente a nivel de host con una `description` que mencione la skill y el nombre del rol.
3. Agrega una entrada `role_agent` en `config/agents.json`.

El synthesizer resuelve conflictos usando evidencia. Nunca promedies scores de modelos ni uses el voto por mayoría como sustituto del juicio.

## Extender modelos financieros

Agrega inputs de escenario opcionales al esquema y cálculos a `calculateScenario`. Preserva `null` para métricas no disponibles, documenta fórmulas y limitaciones en `references/financial-modeling.md`, y agrega tests aritméticos exactos.

## Requisitos de portabilidad

- Rutas relativas dentro de la Skill.
- Sin nombres de herramientas específicos de proveedor en el workflow.
- Sin dependencia obligatoria de red o subagentes.
- Sin dependencia de paquetes externos para los scripts.
- Fallback seguro cuando falta acceso a shell, web o repositorio.
- Artefactos Markdown y JSON en UTF-8.

## Versionado

Trata los cambios en IDs de dimensión, campos de esquema requeridos, fórmulas o semántica de veredicto como cambios breaking. El ajuste de pesos, perfiles nuevos, referencias adicionales y campos opcionales nuevos son compatibles cuando las evaluaciones existentes siguen siendo válidas.