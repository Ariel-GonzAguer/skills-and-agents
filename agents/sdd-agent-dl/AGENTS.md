# Instrucciones de proyecto para SDD

Este proyecto usa Spec-Driven Development (SDD). El spec de larga vida vive en `specs/constitution/`:

- `specs/constitution/mission.md` — propósito del producto y métricas de éxito.
- `specs/constitution/tech-stack.md` — stack, convenciones, comandos de validación.
- `specs/constitution/roadmap.md` — fases de implementación.

Cada feature tiene un directorio con fecha: `specs/YYYY-MM-DD-nombre-feature/` que contiene:

- `requirements.md` — REQs con IDs (`REQ-001`), acceptance criteria, assumptions, clarifications y change log.
- `plan.md` — TASKs con IDs (`TASK-001 (REQ-001)`) y checkboxes por sub-tarea.
- `validation.md` — VALs con IDs (`VAL-001 (REQ-001)`) y checkboxes.
- `state.md` — estado explícito de la feature (specifying → approved → implementing → implemented → validating → validated → merged; flag blocked).

Al codear, leer primero los specs relevantes. Mantener cambios pequeños y reversibles; crear commits solo cuando el usuario los solicite. Ejecutar los comandos de validación de `specs/constitution/tech-stack.md` antes de terminar. Actualizar `CHANGELOG.md` antes de mergear una rama de feature.

Los IDs son estables: si se elimina un requirement, no reutilizar su ID. Los cambios a specs aprobadas requieren aprobación humana (sección "Change log" de `requirements.md`).
