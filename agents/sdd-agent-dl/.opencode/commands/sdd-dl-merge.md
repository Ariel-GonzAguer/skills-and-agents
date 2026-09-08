---
description: Actualizar changelog y mergear la fase actual de SDD (override manual).
agent: sdd-dl
---

Finalizar la fase actual.

1. Correr `node .opencode/scripts/status.js` y `node .opencode/scripts/trace.js`. Merge solo desde `state: validated`, con 0 BLOCKING y sin gaps de trazabilidad.
2. Leer `specs/constitution/roadmap.md` y el directorio del feature spec actual.
3. Actualizar `CHANGELOG.md` con `.opencode/scripts/changelog.js`.
4. Revisar y limpiar la redacción del changelog; preguntar antes de commitear.
5. Preguntar antes de cambiar a la rama base, mergear y borrar la rama de feature.
6. Marcar la fase como completa en `specs/constitution/roadmap.md`, pasar a `state: merged` y commitear.
