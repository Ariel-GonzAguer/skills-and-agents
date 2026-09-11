---
description: Crear la constitución de SDD (override manual).
agent: sdd-dl
---

Crear la constitución del proyecto en `specs/constitution/`.

1. Leer cualquier `README.md`, `TODO.md` o notas de stakeholders existentes.
2. Inferir desde el repositorio y preguntar juntas solo las decisiones faltantes:
   - **Mission**: ¿qué hace el producto, para quién y por qué? ¿Qué significa el éxito?
   - **Tech stack**: lenguajes, frameworks, hosting, almacenamiento, testing, librerías clave.
   - **Roadmap**: ¿cuáles son las primeras 2-4 fases pequeñas e independientes? ¿En qué orden?
3. Después de las tres respuestas, escribir:
   - `specs/constitution/mission.md`
   - `specs/constitution/tech-stack.md`
   - `specs/constitution/roadmap.md`
   Usar las plantillas en `.opencode/templates/constitution/`.
4. Dejar sin commit por defecto. Crear `chore(specs): add project constitution` solo si el usuario pidió commits y confirma esa unidad.
