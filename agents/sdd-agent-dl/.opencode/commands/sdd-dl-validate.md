---
description: Validar la rama actual contra su feature spec (validator independiente).
agent: sdd-dl-validator
subtask: true
---

Validar la rama actual contra su feature spec de forma independiente.

1. Leer `state.md` (state, branch, base) y los tres archivos del spec (`requirements.md`, `plan.md`, `validation.md`).
2. Ejecutar de verdad cada check automático listado en `validation.md`.
3. Evaluar cada acceptance criteria de los REQs contra el diff `git diff <base>...HEAD`.
4. Correr `node .opencode/scripts/status.js` y `node .opencode/scripts/trace.js` y reportar inconsistencias y gaps.
5. Reportar PASS / FAIL / PARTIAL / NOT EXECUTED por VAL, con evidencia. No corregir código.
