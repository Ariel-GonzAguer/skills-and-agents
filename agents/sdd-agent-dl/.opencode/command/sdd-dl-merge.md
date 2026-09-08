---
description: Actualizar changelog y mergear la fase actual de SDD (override manual).
agent: sdd-dl
---

Finalizar la fase actual.

1. Leer `specs/constitution/roadmap.md` y el directorio del feature spec actual.
2. Actualizar `CHANGELOG.md` usando el helper en `.opencode/scripts/changelog.js`, o leyendo los commits desde la última fecha registrada.
3. Revisar y limpiar la redacción del changelog.
4. Preguntar antes de commitear el changelog.
5. Preguntar antes de cambiar a `main`, mergear la rama y borrar la rama de feature.
6. Marcar la fase como completa en `specs/constitution/roadmap.md` y commitear.
