---
description: Validar la rama actual contra su feature spec (override manual).
agent: sdd-dl
---

Validar la rama actual contra su feature spec.

1. Leer los archivos del feature spec en el directorio más reciente `specs/YYYY-MM-DD-<feature-name>/`.
2. Ejecutar cada check automático listado en `validation.md` (typecheck, tests, lint, build).
3. Realizar el walkthrough manual.
4. Reportar pass/fail de cada check.
5. Si fallan checks, corregir o señalar riesgo residual y pedir aprobación antes de mergear.
