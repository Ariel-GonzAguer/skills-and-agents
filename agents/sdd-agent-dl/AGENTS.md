# Instrucciones de proyecto para SDD

Este proyecto usa Spec-Driven Development (SDD). El spec de larga vida vive en `specs/constitution/`:

- `specs/constitution/mission.md` — propósito del producto y métricas de éxito.
- `specs/constitution/tech-stack.md` — stack, convenciones, comandos de validación.
- `specs/constitution/roadmap.md` — fases de implementación.

Cada feature tiene un directorio con fecha: `specs/YYYY-MM-DD-nombre-feature/` que contiene:

- `requirements.md` — alcance, decisiones, contexto.
- `plan.md` — grupos de tareas numeradas.
- `validation.md` — checks automáticos y manuales.

Al codear, leer primero los specs relevantes. Preferir commits pequeños y reversibles. Ejecutar los comandos de validación de `specs/constitution/tech-stack.md` antes de terminar. Actualizar `CHANGELOG.md` antes de mergear una rama de feature.
