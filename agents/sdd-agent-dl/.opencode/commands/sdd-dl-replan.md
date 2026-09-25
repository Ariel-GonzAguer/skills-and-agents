---
description: Replanificar una fase SDD sin perder trazabilidad ni gates.
agent: sdd-dl
---

Replanificar la feature activa o el roadmap desde la evidencia actual.

1. Leer la constitución, `specs/discovery.md` si existe, el feature spec activo, `state.md`, `trace.js` y el resultado de validación más reciente.
2. Distinguir cambios editoriales de cambios materiales de alcance, criterios, arquitectura, orden del roadmap o VALs afectados.
3. Para un cambio material en una spec aprobada, proponerlo en `requirements.md` → `Change log` con motivo, impacto, TASK/VAL afectados y decisión solicitada. No aplicarlo ni avanzar el estado sin aprobación humana.
4. Tras la aprobación, actualizar plan y validation de forma trazable, invalidar los VALs afectados y devolver el estado a `implementing` o `specifying` según corresponda.
5. Ejecutar `trace.js` y `status.js`. No crear rama ni commit salvo solicitud explícita del usuario.
