# Changelog

Todos los cambios notables de skills, agentes y comandos se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado usa [SemVer](https://semver.org/lang/es/): cada skill declara su versión en `metadata.version`; agentes y comandos usan `version` en el frontmatter. Las entradas se registran por ítem.

Reglas de bump:

- `major`: cambios incompatibles (renombres, cambios de interfaz)
- `minor`: funcionalidad nueva compatible
- `patch`: correcciones y documentación

## [2.2.0] — 2026-09-11

### Added

- `chatbot-openrouter-builder` — 1.0.0: creación y migración de chatbots con OpenRouter Client SDKs, streaming robusto, routing y fallbacks explícitos, privacidad, costos, accesibilidad y evals conductuales.

## [2.1.0] — 2026-09-10

### Changed

- `architecture-reviewer` — 1.1.0 (minor): alcance adaptativo, evidencia `archivo:línea`, permisos de solo lectura y eliminación de puntuaciones sin rúbrica.
- `chatbot-security-reviewer` — 2.0.0 (major): reemplaza detección por regex y nota A–F por auditoría de fronteras, riesgo, evidencia y cobertura; `chatbot-security` pasa a ser la fuente de criterios.
- `code-reviewer` — 1.1.0 (minor): confianza explícita por hallazgo.
- `convex-teacher` — 2.0.0 (major): modo interactivo, modelo heredado, preguntas adaptativas y verificación de documentación/comandos vigentes.
- `firestore-auditor` — 2.0.0 (major): incorpora Auth, Security Rules, aislamiento multi-tenant, evidencia y estimaciones parametrizadas.
- `netlify-costs` — 2.0.0 (major): elimina el intercambio de PAT por chat y precios embebidos; añade conexión segura, paginación y separación entre factura, uso y estimación.
- `pnpm-auditor` — 1.1.0 (minor): reconoce solicitudes explícitas de corrección como autorización local y conserva gates para majors, overrides y ampliaciones.
- `viability-*` — 1.1.0 (minor): modelos heredados, permisos explícitos y handoffs JSON-compatible con IDs de evidencia compartidos.
- `waku-deploy-auditor` — 2.0.0 (major): contrato de solo lectura, integración con skills de despliegue y veredictos separados para local, preview y producción.
- `sdd-dl` — 2.1.0 (minor): soporta worktrees sin commit, ramas/commits opcionales, autorización local no redundante y checks npm/pnpm/Yarn acotados.
- `sdd-dl-validator` — 1.1.0 (minor): valida commits, índice, working tree y archivos nuevos sin modificar el repositorio.
- `chatbot-openai-builder` — 1.2.0 (minor): Responses API, modelo configurable por entorno, límites atómicos y ejemplos de streaming/validación corregidos.
- `chatbot-security` — 1.1.0 (minor): controles de rol, input y output por contexto; rate limiting distribuido atómico; handler de referencia actualizado a Responses API.
- `product-viability-evaluator` — 1.1.0 (minor): veredictos canónicos en inglés y contrato de evals normalizado a `assertions`.
- `pwa-splash-icon` — 1.1.0 (minor): generador reutilizable, validación de argumentos y activos separados para iconos `any` y `maskable`.
- `security-audit-webapp` — 1.1.0 (minor): auditoría basada en evidencia y correcciones de precisión para IDOR, Firebase, CSP, XSS, sesiones y rate limiting.
- `theme-switching` — 1.1.0 (minor): toggle accesible, persistencia correcta al cerrar sesión y estrategia real para evitar flash inicial.
- `version-checker` — 1.1.0 (minor): comparación contra la versión compilada, sin estado local obsoleto; `APP_VERSION` queda bajo cambio manual exclusivo de una persona.
- `waku-netlify-convex-deploy` — 1.1.0 (minor): autorización local no redundante, límites claros para efectos externos y evals alineadas.
- `waku-netlify-firebase-deploy` — 1.1.1 (patch): metadata sincronizada y suite de evals para SSR/RSC, Firebase Admin, CSP, migración y despliegue seguro.
- `wcag-react-implementer` — 1.1.0 (minor): modal con gestión completa de foco, target size AA preciso y utilidad de focus ring consistente.
- `wiki-docs` — 2.1.0 (minor): profundidad y estructura adaptativas, cobertura basada en valor y delegación opcional según capacidad.
- `sdd-agent-dl-workflow` — 2.1.0 (minor): contrato explícito del paquete instalado y diagnóstico de errores de ejecución en evals.

### Added

- Evals conductuales para los 16 agentes y `scripts/validate-agents.mjs` para validar versiones, modos, permisos, portabilidad y cobertura.
- `react-viewtransition` — 1.0.0: guía de View Transitions de React con patrones de navegación, listas, Suspense, Activity y reduced motion.
- Evals estructuradas para todas las skills modificadas y `scripts/validate-skills.mjs` para verificar frontmatter, versiones, manifiestos, evals, enlaces e índice.

## [2.0.0] — 2026-09-08

### Changed

- `sdd-dl` — 2.0.0 (major): V2 del orquestador — estado explícito por feature (`state.md`), clarification gate con BLOCKING/IMPORTANT/OPTIONAL, change control para specs aprobadas, validación delegada a un agente independiente, prohibiciones absolutas y detección determinista del estado con `status.js`. Se elimina el modelo hardcodeado (usa el default de la config global).
- `sdd-agent-dl-workflow` — 2.0.0 (major): flujo sincronizado con V2 (estado explícito, clarification, validator independiente, prohibiciones).

### Added

- `sdd-dl-validator` — 1.0.0: agente validador independiente (subagent, `edit: deny`, temperature 0.1). Reporta PASS/FAIL/PARTIAL/NOT EXECUTED por VAL y nunca corrige código.
- Scripts deterministas: `status.js` (SDD STATUS + validación de transiciones), `trace.js` (matriz REQ → TASK → VAL + checks), evals con fixtures (`evals/run-evals.js`, 5/5 PASS).

Nota: los comandos internos de `sdd-agent-dl` (`/sdd-dl-*`) no llevan versión propia; se versionan como parte del agente `sdd-dl`.

## [1.0.0] — 2026-09-08

### Added

Se introduce versionado semántico en todo el repo. Todos los ítems arrancan en `1.0.0`:

**Skills**: `chatbot-openai-builder`, `chatbot-security`, `product-viability-evaluator`, `pwa-splash-icon`, `sdd-agent-dl-workflow`, `security-audit-webapp`, `theme-switching`, `version-checker`, `waku-netlify-convex-deploy`, `waku-netlify-firebase-deploy`, `wcag-react-implementer`, `wiki-docs`

**Agentes**: `architecture-reviewer`, `chatbot-security-reviewer`, `code-reviewer`, `convex-teacher`, `firestore-auditor`, `netlify-costs`, `pnpm-auditor`, `sdd-dl`, `viability-*` (6 roles), `waku-deploy-auditor`

**Comandos**: `check-pre-deploy`, `react-doctor`, `summarize`, `testing`

Nota: los comandos internos de `sdd-agent-dl` (`/sdd-dl-*`) no llevan versión propia; se versionan como parte del agente `sdd-dl`.
