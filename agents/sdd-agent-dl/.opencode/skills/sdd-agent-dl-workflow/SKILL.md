---
name: sdd-agent-dl-workflow
version: 1.0.0
description: >
  Orquestar Spec-Driven Development (SDD) con OpenCode.
  Usar cuando el usuario quiera iniciar un proyecto con constitución,
  planear la siguiente fase del roadmap, escribir un feature spec,
  implementar un feature spec, validar trabajo contra specs o ejecutar
  el flujo SDD de punta a punta.
  Se activa con frases como "spec-driven development", "SDD",
  "crear constitución", "siguiente fase", "feature spec",
  "implementar el spec", "validar contra specs", "/sdd-dl", o cuando
  el proyecto tiene un directorio `specs/`.
---

# SDD Agent DL Workflow

## Resultado

Convertir una idea de producto en specs rastreables, código testeado y una rama lista para mergear usando el flujo SDD del curso *Spec-Driven Development with Coding Agents* de DeepLearning.AI.

## Flujo

1. Inspeccionar el repositorio buscando una constitución SDD (`specs/constitution/mission.md`, `specs/constitution/tech-stack.md`, `specs/constitution/roadmap.md`).
2. Si falta, crear la constitución entrevistando al usuario.
3. Encontrar la siguiente fase incompleta del roadmap y crear una rama de git.
4. Escribir un directorio de feature spec con `requirements.md`, `plan.md` y `validation.md`.
5. Implementar el plan en commits pequeños y reversibles.
6. Validar contra el spec.
7. Actualizar `CHANGELOG.md` y mergear.

## Restricciones

- Siempre escribir specs antes del código de implementación.
- Preguntar antes de commitear, mergear o agregar dependencias.
- Nunca mergear requerimientos que fallen o no estén testeados como completos.
- Mantener el alcance de cada feature enfocado e independientemente entregable.
