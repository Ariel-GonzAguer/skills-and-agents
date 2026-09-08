# SDD Agent DL para OpenCode

Agente de Spec-Driven Development (SDD) para [OpenCode](https://github.com/anomalyco/opencode), basado en el curso [Spec-Driven Development with Coding Agents](https://www.deeplearning.ai/courses/spec-driven-development-with-coding-agents) de DeepLearning.AI.

## Qué hace

Es un **agente autónomo** que implementa el flujo SDD del curso:

1. **Constitución**: crea `specs/constitution/mission.md`, `specs/constitution/tech-stack.md` y `specs/constitution/roadmap.md`.
2. **Feature spec**: para cada fase del roadmap crea `specs/YYYY-MM-DD-nombre-feature/{requirements.md,plan.md,validation.md}`.
3. **Implementación**: sigue el plan escrito en el spec.
4. **Validación**: ejecuta los checks automáticos y el walkthrough manual.
5. **Changelog y merge**: actualiza `CHANGELOG.md`, mergea la rama y marca la fase como completa.

El agente detecta solo en qué fase está el proyecto y propone la siguiente acción. Solo necesitás invocarlo con `/sdd-dl` o `@sdd-dl`.

## Instalación

### 1. Copiar el agente en tu proyecto

Copiá el contenido de esta carpeta (`sdd-agent-dl/`) a la raíz de tu proyecto de OpenCode. Es decir, la carpeta `.opencode/` y `AGENTS.md` deben quedar en la raíz.

```bash
# Desde la raíz de tu proyecto
cp -r /ruta/a/sdd-agent-dl/.opencode ./.opencode
cp /ruta/a/sdd-agent-dl/AGENTS.md ./AGENTS.md
```

En Windows (PowerShell):

```powershell
Copy-Item -Recurse -Force /ruta/a/sdd-agent-dl/.opencode ./.opencode
Copy-Item -Force /ruta/a/sdd-agent-dl/AGENTS.md ./AGENTS.md
```

### 2. Fusionar la configuración (opcional)

Si ya tenés `.opencode/opencode.json`, fusioná el contenido de `.opencode/opencode.json` de este agente con el tuyo. Si no tenés uno, copiá el archivo tal cual:

```bash
cp .opencode/opencode.json ./opencode.json
```

### 3. Inicializar OpenCode

Si es la primera vez, ejecutá `opencode` en tu proyecto y usá `/init` para que OpenCode reconozca los agentes y comandos.

## Uso

### Modo autónomo (recomendado)

Abrí tu proyecto con OpenCode y ejecutá:

```
/sdd-dl
```

El agente `sdd-dl` inspeccionará el proyecto, detectará en qué fase está y propondrá la siguiente acción. Te pedirá aprobación antes de escribir archivos, commitear o mergear.

También podés cambiar al agente SDD manualmente con `Tab` y hablarle directamente con `@sdd-dl`.

### Modo manual (atajos)

Si querés forzar una fase específica, usá estos comandos:

| Comando | Cuándo usarlo |
|---------|---------------|
| `/sdd-dl-constitution` | Crea la constitución del proyecto. |
| `/sdd-dl-feature-spec` | Escribe el spec de la siguiente fase del roadmap. |
| `/sdd-dl-implement` | Implementa el spec actual. |
| `/sdd-dl-validate` | Valida el trabajo contra el spec. |
| `/sdd-dl-merge` | Actualiza changelog y mergea la rama. |

## Estructura

```text
sdd-agent-dl/
├── .opencode/
│   ├── agent/
│   │   └── sdd-dl.md              # agente SDD DL principal
│   ├── command/
│   │   ├── sdd-dl.md              # comando /sdd-dl
│   │   ├── sdd-dl-constitution.md # /sdd-dl-constitution
│   │   ├── sdd-dl-feature-spec.md # /sdd-dl-feature-spec
│   │   ├── sdd-dl-implement.md    # /sdd-dl-implement
│   │   ├── sdd-dl-validate.md     # /sdd-dl-validate
│   │   └── sdd-dl-merge.md        # /sdd-dl-merge
│   ├── skills/
│   │   └── sdd-agent-dl-workflow/
│   │       └── SKILL.md           # skill SDD DL
│   ├── templates/
│   │   ├── constitution/          # mission, tech-stack, roadmap
│   │   └── feature/               # requirements, plan, validation
│   ├── scripts/
│   │   └── changelog.js           # helper para CHANGELOG.md
│   └── opencode.json             # configuración de ejemplo
├── AGENTS.md                      # instrucciones persistentes del proyecto
└── README.md                      # este archivo
```

## Créditos

Basado en los materiales del curso *Spec-Driven Development with Coding Agents* de DeepLearning.AI y JetBrains.
