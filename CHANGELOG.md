# Changelog

Todos los cambios notables de skills, agentes y comandos se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado usa [SemVer](https://semver.org/lang/es/): cada skill, agente y comando declara su versión en el frontmatter (`version: X.Y.Z`) y las entradas se registran por ítem.

Reglas de bump:

- `major`: cambios incompatibles (renombres, cambios de interfaz)
- `minor`: funcionalidad nueva compatible
- `patch`: correcciones y documentación

## [1.0.0] — 2026-09-08

### Added

Se introduce versionado semántico en todo el repo. Todos los ítems arrancan en `1.0.0`:

**Skills**: `chatbot-openai-builder`, `chatbot-security`, `product-viability-evaluator`, `pwa-splash-icon`, `sdd-agent-dl-workflow`, `security-audit-webapp`, `theme-switching`, `version-checker`, `waku-netlify-convex-deploy`, `waku-netlify-firebase-deploy`, `wcag-react-implementer`, `wiki-docs`

**Agentes**: `architecture-reviewer`, `chatbot-security-reviewer`, `code-reviewer`, `convex-teacher`, `firestore-auditor`, `netlify-costs`, `pnpm-auditor`, `sdd-dl`, `viability-*` (6 roles), `waku-deploy-auditor`

**Comandos**: `check-pre-deploy`, `react-doctor`, `summarize`, `testing`

Nota: los comandos internos de `sdd-agent-dl` (`/sdd-dl-*`) no llevan versión propia; se versionan como parte del agente `sdd-dl`.
