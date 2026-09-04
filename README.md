# Skills & Agents

Skills, agentes y comandos propios para [OpenCode](https://opencode.ai) y agentes de código compatibles (Claude Code, CommandCode, etc.).

Enfoque: desarrollo frontend con React, TypeScript, Waku/Astro, Netlify, Firebase, accesibilidad (WCAG 2.2), performance e integración de IA/LLMs en productos reales.

## Contenido

### Skills (`skills/`)

Cada carpeta es una skill autocontenida con su `SKILL.md`.

| Skill                        | Descripción                         |
| ---------------------------- | ----------------------------------- |
| `pwa-splash-icon` | Generación de iconos de splash para PWA |
| `product-viability-evaluator` | Evaluación multi-agente de viabilidad de productos/SaaS con red team adversario, scoring objetivo y veredicto BUILD/VALIDATE/PIVOT/RECONSIDER/ABANDON. Incluye schemas, scripts de scoring y evals |
| `security-audit-webapp` | Auditoría de seguridad para webapps serverless (Waku/React/Netlify/Firebase) contra OWASP |
| `chatbot-openai-builder` | Chatbots accesibles con OpenAI: streaming, rate limiting, UI flotante |
| `chatbot-security` | Checklist y patrones seguros para LLM chatbots (OWASP LLM Top 10) |
| `wiki-docs` | Genera wiki técnica estructurada por dominios para cualquier codebase |
| `theme-switching` | Light/dark mode en React con Zustand + localStorage + Tailwind v4 |
| `version-checker` | Version checking en tiempo real con Zustand + Firestore + toasts |
| `wcag-react-implementer` | Implementación sistemática de WCAG 2.2 AA en React + TS + Tailwind |
| `waku-netlify-firebase-deploy` | Deploy de Waku a Netlify con Firebase Admin SDK (serve.js, CSP nonce) |
| `waku-netlify-convex-deploy` | Deploy de Waku a Netlify con Convex |

### Agentes (`agents/`)

Agentes en Markdown diseñados principalmente para OpenCode. Las adaptaciones para CommandCode se documentan por separado.

| Agente                      | Rol                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm-auditor` | Audita varios repos con pnpm; propone update/override y limpieza mínima del workspace. Correcciones solo con permiso por repo |
| `code-reviewer` | Revisa cambios staged, unstaged y nuevos: mantenibilidad, seguridad, performance, type-safety y accesibilidad. Solo lectura |
| `architecture-reviewer`     | Revisa arquitectura: complejidad innecesaria, escalabilidad, simplificación                                                       |
| `chatbot-security-reviewer` | Audita endpoints y UI de chatbots LLM contra OWASP LLM Top 10                                                                     |
| `firestore-auditor`         | Detecta consultas costosas, modelado deficiente y riesgos de costo en Firestore                                                   |
| `netlify-costs`             | Estima gastos de sitios desplegados en Netlify vía API REST                                                                       |
| `waku-deploy-auditor`       | Revisión pre-deploy como Staff Engineer (Waku/React/Netlify)                                                                      |
| `convex-teacher`            | Enseña Convex desde cero con analogías a Firebase                                                                                 |
| `viability-*` (6 roles)     | Roles del sistema product-viability-evaluator: researcher, commercial/financial/product analyst, skeptic (red team) y synthesizer |

### Comandos (`commands/`)

Comandos rápidos para OpenCode (`~/.config/opencode/commands/`).

- `check-pre-deploy`: revisión previa a producción (re-renders, hydration, race conditions)
- `testing`: generación de tests con Vitest + Testing Library
- `react-doctor`: análisis de código React
- `summarize`: resumen rápido del proyecto actual

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

**CommandCode**: los agentes son compatibles ([docs oficiales](https://commandcode.ai/docs/agents)). Copiá los `.md` a `~/.commandcode/agents/`:

```bash
cp agents/*.md ~/.commandcode/agents/
```

Diferencias de frontmatter a tener en cuenta:

- `mode:` es ignorado por CommandCode (podés dejarlo o borrarlo)
- `model:` sí existe en CommandCode, pero espera sus propios ids (`claude-sonnet-5`, etc.). Los ids de OpenCode como `opencode/mimo-v2.5-free` no existen ahí: quitá el campo para que herede el modelo de la sesión, o reemplazalo por un id válido
- Opcional: agregá `tools:` (por ejemplo `tools: read_file, grep, glob`) para limitar las herramientas del agente

**Otros agentes** (Claude Code, Cursor, etc.): las skills siguen el formato estándar `SKILL.md`; copiá la carpeta al directorio de skills de tu herramienta.

## Notas

- Algunos agentes declaran un `model` por defecto; ajustalo según los modelos disponibles en tu proveedor.
- El sistema `product-viability-evaluator` funciona mejor con sus 6 agentes `viability-*` instalados junto a la skill.
- No se incluye ningún secreto ni configuración privada; revisá siempre lo que publicás de tu entorno.

## Autor

Ariel GonzAgüer — [Gato Rojo Lab](https://gatorojolab.com)

## Licencia

[MIT + Commons Clause](./LICENSE): podés usar, copiar y modificar el contenido libremente, pero no vender las skills, agentes o documentos como producto o servicio.
