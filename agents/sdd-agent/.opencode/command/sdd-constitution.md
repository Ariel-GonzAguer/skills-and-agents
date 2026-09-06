---
description: Crear la constitución de SDD (override manual).
agent: sdd
---

Crear la constitución del proyecto en `specs/`.

1. Leer cualquier `README.md`, `TODO.md` o notas de stakeholders existentes.
2. Preguntar al usuario tres cosas, una a la vez:
   - **Mission**: ¿qué hace el producto, para quién y por qué? ¿Qué significa el éxito?
   - **Tech stack**: lenguajes, frameworks, hosting, almacenamiento, testing, librerías clave.
   - **Roadmap**: ¿cuáles son las primeras 2-4 fases pequeñas e independientes? ¿En qué orden?
3. Después de las tres respuestas, escribir:
   - `specs/mission.md`
   - `specs/tech-stack.md`
   - `specs/roadmap.md`
   Usar las plantillas en `.opencode/templates/constitution/`.
4. Preguntar antes de commitear. Si el usuario aprueba, commitear con el mensaje: `chore(specs): add project constitution`.
