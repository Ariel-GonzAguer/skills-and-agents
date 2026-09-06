# SDD Agentic Workflow para OpenCode

Agente de Spec-Driven Development (SDD) para [OpenCode](https://github.com/anomalyco/opencode), basado en el curso [Spec-Driven Development with Coding Agents](https://www.deeplearning.ai/courses/spec-driven-development-with-coding-agents) de DeepLearning.AI.

## Qué hace

Es un **agente autónomo** que implementa el flujo SDD del curso:

1. **Constitución**: crea `specs/mission.md`, `specs/tech-stack.md` y `specs/roadmap.md`.
2. **Feature spec**: para cada fase del roadmap crea `specs/YYYY-MM-DD-nombre-feature/{requirements.md,plan.md,validation.md}`.
3. **Implementación**: sigue el plan escrito en el spec.
4. **Validación**: ejecuta los checks automáticos y el walkthrough manual.
5. **Changelog y merge**: actualiza `CHANGELOG.md`, mergea la rama y marca la fase como completa.

El agente detecta solo en qué fase está el proyecto y propone la siguiente acción. Solo necesitás invocarlo con `/sdd` o `@sdd`.

## Instalación

### 1. Copiar el agente en tu proyecto

Copiá el contenido de esta carpeta (`sdd-agent/`) a la raíz de tu proyecto de OpenCode. Es decir, la carpeta `.opencode/` y `AGENTS.md` deben quedar en la raíz.

```bash
# Desde la raíz de tu proyecto
cp -r /ruta/a/sdd-agent/.opencode ./.opencode
cp /ruta/a/sdd-agent/AGENTS.md ./AGENTS.md
```

En Windows (PowerShell):

```powershell
Copy-Item -Recurse -Force /ruta/a/sdd-agent/.opencode ./.opencode
Copy-Item -Force /ruta/a/sdd-agent/AGENTS.md ./AGENTS.md
```

### 2. Fusionar la configuración (opcional)

Si ya tenés `.opencode/opencode.jsonc`, fusioná el contenido de `.opencode/opencode.jsonc` de este agente con el tuyo. Si no tenés uno, copiá el archivo tal cual:

```bash
cp .opencode/opencode.jsonc ./opencode.jsonc
```

> Nota: OpenCode también lee configuración desde `.opencode/opencode.jsonc`.

### 3. Inicializar OpenCode

Si es la primera vez, ejecutá `opencode` en tu proyecto y usá `/init` para que OpenCode reconozca los agentes y comandos.

## Uso

### Modo autónomo (recomendado)

Abrí tu proyecto con OpenCode y ejecutá:

```
/sdd
```

El agente `sdd` inspeccionará el proyecto, detectará en qué fase está y propondrá la siguiente acción. Te pedirá aprobación antes de escribir archivos, commitear o mergear.

También podés cambiar al agente SDD manualmente con `Tab` y hablarle directamente con `@sdd`.

### Modo manual (atajos)

Si querés forzar una fase específica, usá estos comandos:

| Comando | Cuándo usarlo |
|---------|---------------|
| `/sdd-constitution` | Crea la constitución del proyecto. |
| `/sdd-feature-spec` | Escribe el spec de la siguiente fase del roadmap. |
| `/sdd-implement` | Implementa el spec actual. |
| `/sdd-validate` | Valida el trabajo contra el spec. |
| `/sdd-merge` | Actualiza changelog y mergea la rama. |

## Estructura

```text
sdd-agent/
├── .opencode/
│   ├── agent/
│   │   └── sdd.md                 # agente SDD principal
│   ├── command/
│   │   ├── sdd.md                 # comando /sdd
│   │   ├── sdd-constitution.md    # /sdd-constitution
│   │   ├── sdd-feature-spec.md    # /sdd-feature-spec
│   │   ├── sdd-implement.md       # /sdd-implement
│   │   ├── sdd-validate.md        # /sdd-validate
│   │   └── sdd-merge.md           # /sdd-merge
│   ├── skills/
│   │   └── sdd-agentic-workflow/
│   │       └── SKILL.md           # skill SDD
│   ├── templates/
│   │   ├── constitution/          # mission, tech-stack, roadmap
│   │   └── feature/               # requirements, plan, validation
│   ├── scripts/
│   │   └── changelog.js           # helper para CHANGELOG.md
│   └── opencode.jsonc             # configuración de ejemplo
├── AGENTS.md                      # instrucciones persistentes del proyecto
└── README.md                      # este archivo
```

## Créditos

Basado en los materiales del curso *Spec-Driven Development with Coding Agents* de DeepLearning.AI y JetBrains.
