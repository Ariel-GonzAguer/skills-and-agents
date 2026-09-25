---
description: Descubrir un proyecto legacy o brownfield antes de constituirlo.
agent: sdd-dl
---

Ejecutar una fase explícita de descubrimiento para un proyecto existente antes de crear o modificar su constitución.

1. Inspeccionar README, AGENTS.md, estructura, dependencias, entradas de ejecución, tests, CI y configuración de despliegue sin modificar el código.
2. Identificar comportamiento actual, límites de arquitectura, contratos externos, comandos de validación, datos/migraciones, riesgos, deuda y áreas que no deben romperse.
3. Registrar hallazgos y preguntas abiertas en `specs/discovery.md` usando `.opencode/templates/discovery.md`.
4. Resolver desde el repositorio todo lo posible. Registrar las incertidumbres que requieren intención humana; no asumir cambios de producto o de arquitectura.
5. No crear rama ni commit salvo que el usuario lo solicite explícitamente. Usar el descubrimiento como evidencia para la constitución y el primer feature spec.
