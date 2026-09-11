---
description: Escribir el siguiente feature spec desde el roadmap (override manual).
agent: sdd-dl
---

Encontrar la siguiente fase incompleta del roadmap y escribir un feature spec para ella.

1. Leer `specs/constitution/roadmap.md`, `specs/constitution/mission.md` y `specs/constitution/tech-stack.md`.
2. Identificar la primera fase cuyos ítems estén todos desmarcados (`[ ]`).
3. Permanecer en la rama actual salvo que el usuario solicite y autorice crear `phase-N-<kebab-name>`.
4. Inferir Scope, Decisions y Context; preguntar juntas solo las decisiones BLOCKING que falten.
5. No escribir archivos mientras exista una decisión BLOCKING.
6. Crear `specs/YYYY-MM-DD-<feature-name>/` y escribir los 4 archivos desde `.opencode/templates/feature/`: `requirements.md` (REQ-IDs + acceptance criteria), `plan.md` (TASK-IDs con referencia a REQ), `validation.md` (VAL-IDs con referencia a REQ) y `state.md` (`state: specifying`).
7. Clarification gate: revisar el checklist de ambigüedades, clasificar BLOCKING/IMPORTANT/OPTIONAL y resolver primero desde la constitución, AGENTS.md y el código existente. 0 BLOCKING para aprobar.
8. Correr `node .opencode/scripts/trace.js` — no aprobar con gaps de trazabilidad.
9. Mostrar el spec y pedir aprobación. Al aprobar: registrar la decisión en `state.md` y pasar a `state: approved`.
