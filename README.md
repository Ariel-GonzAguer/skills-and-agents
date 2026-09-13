# Skills & Agents

Skills, agentes y comandos propios para diferentes `AI agent harness`, compatibles con OpenCode, CommandCode, Codex, Claude Code, Cursor y otros.

Enfoque: desarrollo JAMStack, desarrollo frontend con React, TypeScript, Waku/Astro, Netlify, Firebase, accesibilidad (WCAG 2.2), performance e integración de IA/LLMs en productos reales.

## Contenido

### Skills (`skills/`)

Cada carpeta es una skill autocontenida con su `SKILL.md`.

| Skill                        | Descripción                         |
| ---------------------------- | ----------------------------------- |
| `pwa-splash-icon` | Generación de iconos de splash para PWA |
| `product-viability-evaluator` | Evaluación multi-agente de viabilidad de productos/SaaS con red team adversario, scoring objetivo y veredicto BUILD/VALIDATE/PIVOT/RECONSIDER/ABANDON. Incluye schemas, scripts de scoring y evals |
| `security-audit-webapp` | Auditoría de seguridad para webapps serverless (Waku/React/Netlify/Firebase) contra OWASP |
| `chatbot-openai-builder` | Chatbots accesibles con OpenAI: streaming, rate limiting, UI flotante |
| `chatbot-openrouter-builder` | Chatbots accesibles con OpenRouter: SDKs, streaming, routing, privacidad y costos |
| `chatbot-security` | Checklist y patrones seguros para LLM chatbots (OWASP LLM Top 10) |
| `wiki-docs` | Genera wiki técnica estructurada por dominios para cualquier codebase |
| `theme-switching` | Light/dark mode en React con Zustand + localStorage + Tailwind v4 |
| `version-checker` | Version checking en tiempo real con Zustand + Firestore + toasts |
| `react-viewtransition` | View Transitions integradas de React para navegación, listas, Suspense y elementos compartidos |
| `wcag-react-implementer` | Implementación sistemática de WCAG 2.2 AA en React + TS + Tailwind |
| `waku-netlify-firebase-deploy` | Deploy de Waku a Netlify con Firebase Admin SDK (serve.js, CSP nonce) |
| `waku-netlify-convex-deploy` | Deploy de Waku a Netlify con Convex |
| `sdd-agent-dl-workflow` | Orquestación de Spec-Driven Development (SDD): constitución, feature specs, implementación, validación y merge |

### Agentes (`agents/`)

Agentes en Markdown diseñados principalmente para OpenCode. Las adaptaciones para CommandCode se documentan por separado.

Los casos conductuales y su protocolo de forward-testing están en [`agents/evals/`](./agents/evals/README.md).

| Agente                      | Rol                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm-auditor` | Audita varios repos con pnpm; propone update/override y limpieza mínima del workspace. Correcciones solo con permiso por repo |
| `code-reviewer` | Revisa cambios staged, unstaged y nuevos: mantenibilidad, seguridad, performance, type-safety y accesibilidad. Solo lectura |
| `architecture-reviewer`     | Revisa arquitectura: complejidad innecesaria, escalabilidad, simplificación                                                       |
| `chatbot-security-reviewer` | Audita fronteras de confianza, datos, herramientas, consumo y salida de sistemas LLM                                                |
| `firestore-auditor`         | Audita autorización, reglas, consultas, índices, listeners, escala y costos de Firestore                                           |
| `netlify-costs`             | Analiza facturación, uso y proyecciones de Netlify sin exponer credenciales                                                        |
| `waku-deploy-auditor`       | Revisión pre-deploy como Staff Engineer (Waku/React/Netlify)                                                                      |
| `convex-teacher`            | Enseña Convex con analogías a Firebase y puede acompañar una implementación interactiva                                            |
| `viability-*` (6 roles)     | Roles del sistema product-viability-evaluator: researcher, commercial/financial/product analyst, skeptic (red team) y synthesizer |
| `sdd-agent-dl`                | Orquestador autónomo de Spec-Driven Development: constitución, feature specs, implementación, validación y merge. Incluye 6 comandos (`/sdd-dl`, `/sdd-dl-constitution`, `/sdd-dl-feature-spec`, `/sdd-dl-implement`, `/sdd-dl-validate`, `/sdd-dl-merge`) |

### Comandos (`commands/`)

Comandos rápidos para OpenCode (`~/.config/opencode/commands/`).

- `check-pre-deploy`: revisión previa a producción (re-renders, hydration, race conditions)
- `testing`: generación de tests con Vitest + Testing Library
- `react-doctor`: análisis de código React
- `summarize`: resumen rápido del proyecto actual
- `/sdd-dl`: orquestador autónomo de Spec-Driven Development
- `/sdd-dl-constitution`: crear constitución del proyecto (mission, tech-stack, roadmap)
- `/sdd-dl-feature-spec`: escribir el siguiente feature spec desde el roadmap
- `/sdd-dl-implement`: implementar el feature spec actual
- `/sdd-dl-validate`: validar la rama contra su feature spec
- `/sdd-dl-merge`: actualizar changelog y mergear la fase

### Documentos técnicos (`docs/`)

Soluciones reales documentadas en producción, complementarias a las skills.

| Doc                                       | Complementa                                             | Tema                                                                               |
| ----------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `opencode-guia.md`                        | Todo el repo                                            | Guía de uso y configuración de OpenCode: MCPs, modos de trabajo, flujo recomendado |
| `rate-limiting-netlify-blobs.md`          | `chatbot-openai-builder`                                | Rate limiting con Netlify Blobs                                                    |
| `race-condition-rate-limiting.md`         | `chatbot-openai-builder`                                | Race condition en contadores distribuidos y su solución                            |
| `cache-datos-chatbot-ia.md`               | `chatbot-openai-builder`                                | Caché en memoria para reducir consumo de tokens                                    |
| `csp-con-nonces.md`                       | `security-audit-webapp`, `waku-netlify-firebase-deploy` | CSP con nonces por request en Edge Functions                                       |
| `firebase-admin-bundling-waku-netlify.md` | `waku-netlify-firebase-deploy`                          | Solución definitiva al bundling de firebase-admin en Netlify Lambda                |
| `firebase-admin-cjs-interop.md`           | `waku-netlify-firebase-deploy`                          | Interop CJS/ESM de firebase-admin con Vite/Waku                                    |

## Instalación

**OpenCode**: copiá las carpetas a tu configuración:

```bash
# skills
cp -r skills/<nombre> ~/.config/opencode/skills/

# agentes y comandos
cp agents/*.md ~/.config/opencode/agents/
cp commands/*.md ~/.config/opencode/commands/
```

**SDD Agent DL** (excepción): este agente se recomienda copiarlo a la raíz de tu proyecto, no al directorio de configuración:

```bash
cp -r agents/sdd-agent-dl/.opencode ./.opencode
cp agents/sdd-agent-dl/AGENTS.md ./AGENTS.md
```

Ver `agents/sdd-agent-dl/README.md` para instrucciones detalladas.

Esta excepción se hace por la posibilidad de que ya tengas un agente o flujo de trabajo SDD en tu proyecto, y no quieras sobreescribirlo. Si no tenés un flujo SDD, podés copiarlo sin problemas en la carpeta de configuración de OpenCode.

**CommandCode**: los agentes son compatibles ([docs oficiales](https://commandcode.ai/docs/agents)). Copiá los `.md` a `~/.commandcode/agents/`:

```bash
cp agents/*.md ~/.commandcode/agents/
```

Diferencias de frontmatter a tener en cuenta:

- `mode:` es ignorado por CommandCode (podés dejarlo o borrarlo)
- Los agentes del repo no fijan `model:`: heredan el modelo de la sesión para conservar portabilidad. Si agregás uno, debe usar un ID válido para el harness destino
- Opcional: agregá `tools:` (por ejemplo `tools: read_file, grep, glob`) para limitar las herramientas del agente

**Otros agentes** (Claude Code, Cursor, etc.): las skills siguen el formato estándar `SKILL.md`; copiá la carpeta al directorio de skills de tu herramienta.

## Versionado

Cada skill declara su versión semántica como `metadata.version` en el frontmatter y la mantiene sincronizada con `skill.json` cuando ese manifiesto existe. Los agentes y comandos conservan `version` como campo superior de su formato. Los cambios se registran en [CHANGELOG.md](./CHANGELOG.md) por ítem:

- `major`: cambios incompatibles (renombres, cambios de interfaz)
- `minor`: funcionalidad nueva compatible
- `patch`: correcciones y documentación

Validar el catálogo, manifiestos, evals e índice antes de publicar cambios:

```bash
node scripts/validate-skills.mjs
node scripts/validate-agents.mjs
```

Todas las skills del catálogo cuentan con al menos una suite de evals estructurada.

## Notas

- Los agentes heredan el modelo de la sesión; elegí uno con las capacidades necesarias para la tarea y el acceso permitido.
- El sistema `product-viability-evaluator` funciona mejor con sus 6 agentes `viability-*` instalados junto a la skill.
- No se incluye ningún secreto ni configuración privada; revisá siempre lo que publicás de tu entorno.

## Autor

Ariel GonzAgüer — [Gato Rojo Lab](https://gatorojolab.com)

## Licencia

[MIT + Commons Clause](./LICENSE): podés usar, copiar y modificar el contenido libremente, pero no vender las skills, agentes o documentos como producto o servicio.
