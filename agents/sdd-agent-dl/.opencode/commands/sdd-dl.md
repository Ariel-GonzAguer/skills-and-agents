---
description: Ejecutar el orquestador de SDD.
agent: sdd-dl
---

Avanzar el proyecto usando Spec-Driven Development. Inspeccionar el estado con los scripts deterministas, proponer la siguiente acción y ejecutarla con aprobación humana en los gates que la requieren.

1. `git status --porcelain` — si hay cambios manuales sin commitear, preguntar antes de continuar.
2. `node .opencode/scripts/status.js` — estado actual.
3. `node .opencode/scripts/trace.js` — gaps de trazabilidad.
4. Proponer la siguiente acción según el estado y ejecutarla respetando los gates, actualizando `state.md` en cada transición.
