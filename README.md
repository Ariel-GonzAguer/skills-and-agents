# Skills & Agents

Skills, agentes y comandos propios para [OpenCode](https://opencode.ai) y agentes de código compatibles (Claude Code, CommandCode, etc.).

Enfoque: desarrollo frontend con React, TypeScript, Waku/Astro, Netlify, Firebase, accesibilidad (WCAG 2.2), performance e integración de IA/LLMs en productos reales.

## Contenido

### Skills (`skills/`)

Cada carpeta es una skill autocontenida con su `SKILL.md`.

| Skill | Descripción |
|-------|-------------|
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

Subagentes en formato markdown para OpenCode (`~/.config/opencode/agents/`).

| Agente | Rol |
|--------|-----|
| `architecture-reviewer` | Revisa arquitectura: complejidad innecesaria, escalabilidad, simplificación |
| `chatbot-security-reviewer` | Audita endpoints y UI de chatbots LLM contra OWASP LLM Top 10 |
| `firestore-auditor` | Detecta consultas costosas, modelado deficiente y riesgos de costo en Firestore |
| `netlify-costs` | Estima gastos de sitios desplegados en Netlify vía API REST |
| `waku-deploy-auditor` | Revisión pre-deploy como Staff Engineer (Waku/React/Netlify) |
| `convex-teacher` | Enseña Convex desde cero con analogías a Firebase |
| `viability-*` (6 roles) | Roles del sistema product-viability-evaluator: researcher, commercial/financial/product analyst, skeptic (red team) y synthesizer |

### Comandos (`commands/`)

Comandos rápidos para OpenCode (`~/.config/opencode/commands/`).

- `check-pre-deploy`: revisión previa a producción (re-renders, hydration, race conditions)
- `testing`: generación de tests con Vitest + Testing Library
- `react-doctor`: análisis de código React
- `summarize`: resumen rápido del proyecto actual

## Instalación

**OpenCode**: copiá las carpetas a tu configuración:

```bash
# skills
cp -r skills/<nombre> ~/.config/opencode/skills/

# agentes y comandos
cp agents/*.md ~/.config/opencode/agents/
cp commands/*.md ~/.config/opencode/commands/
```

**Otros agentes** (Claude Code, Cursor, etc.): las skills siguen el formato estándar `SKILL.md`; copiá la carpeta al directorio de skills de tu herramienta.

## Notas

- Los agentes declaran un `model` por defecto; ajustalo según los modelos disponibles en tu proveedor.
- El sistema `product-viability-evaluator` funciona mejor con sus 6 agentes `viability-*` instalados junto a la skill.
- No se incluye ningún secreto ni configuración privada; revisá siempre lo que publicás de tu entorno.

## Autor

Ariel GonzAgüer — [Gato Rojo Lab](https://gatorojolab.com)
