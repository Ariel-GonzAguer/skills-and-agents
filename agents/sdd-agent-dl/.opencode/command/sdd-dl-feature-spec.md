---
description: Escribir el siguiente feature spec desde el roadmap (override manual).
agent: sdd-dl
---

Encontrar la siguiente fase incompleta del roadmap y escribir un feature spec para ella.

1. Leer `specs/constitution/roadmap.md`, `specs/constitution/mission.md` y `specs/constitution/tech-stack.md`.
2. Identificar la primera fase cuyos ítems estén todos desmarcados (`[ ]`).
3. Crear y cambiar a una rama: `git checkout -b phase-N-<kebab-name>`.
4. Preguntar al usuario tres cosas, una a la vez:
   - **Scope**: ¿qué recolecta, expone o hace la feature? Campos, comportamiento, forma de los datos.
   - **Decisions**: decisiones clave de implementación — almacenamiento, visibilidad, validación, patrón de UX.
   - **Context**: tono, restricciones o cualquier cosa que moldee el spec — estilo de copy, límites del stack, preguntas abiertas.
5. No escribir archivos hasta tener las tres respuestas.
6. Crear `specs/YYYY-MM-DD-<feature-name>/` usando la fecha actual.
7. Escribir:
   - `requirements.md` con secciones Scope, Decisions y Context.
   - `plan.md` con grupos de tareas numeradas y sub-tareas.
   - `validation.md` con checks automáticos, manuales, check de tono y definición de done.
8. Mostrar los archivos del spec al usuario y pedir aprobación antes de implementar.
