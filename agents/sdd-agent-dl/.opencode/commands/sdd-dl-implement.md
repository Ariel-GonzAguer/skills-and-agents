---
description: Implementar el feature spec actual (override manual).
agent: sdd-dl
---

Implementar el feature spec en la rama actual.

1. Correr `node .opencode/scripts/status.js` y leer `state.md` y los tres archivos del spec del feature activo.
2. Solo implementar desde `state: approved` o `implementing`. Si no está aprobado, pedir aprobación primero.
3. Trabajar los TASKs de `plan.md` en orden; marcar los checkboxes al completar cada sub-tarea.
4. Mantener cambios pequeños y reversibles; hacer commits solo si el usuario los solicita.
5. Change control: si un REQ aprobado no se puede cumplir, NO editarlo; proponer el cambio en la sección "Change log" de `requirements.md` y pedir aprobación humana para cambios materiales. Al aprobar, invalidar los VALs afectados.
6. Respetar el tech stack en `specs/constitution/tech-stack.md`; no agregar dependencias sin aprobación.
7. Seguir las convenciones existentes del codebase.
8. No mergear. Al completar todos los TASKs, pasar a `state: implemented` y reportar.
