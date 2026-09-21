# Migración de OpenCode v1 a v2

Esta guía cubre los cambios necesarios para migrar agentes, skills, comandos y configuración de OpenCode v1 a v2. OpenCode v2 normaliza automáticamente muchos campos de v1, pero conviene escribir la config en el formato nativo de v2 para evitar advertencias y usar las capacidades nuevas.

---

## Tabla de contenidos

1. [Resumen de cambios](#resumen-de-cambios)
2. [Configuración global (`opencode.json`)](#configuración-global-opencodejson)
3. [Agentes (archivos `.md`)](#agentes-archivos-md)
4. [Comandos (archivos `.md`)](#comandos-archivos-md)
5. [Skills](#skills)
6. [MCP servers](#mcp-servers)
7. [Plugins](#plugins)
8. [Configuración del cliente TUI (`cli.json`)](#configuración-del-cliente-tui-clijson)
9. [Rutas preferidas](#rutas-preferidas)
10. [Lista de verificación](#lista-de-verificación)

---

## Resumen de cambios

| v1 | v2 |
|---|---|
| `provider` (singular) | `providers` (plural) |
| `provider.<id>.npm` | `providers.<id>.package` (con prefijo `aisdk:`) |
| `provider.<id>.api` / `options` | `providers.<id>.settings` |
| `apiKey: "env:VAR"` | `"{env:VAR}"` |
| `autoshare: true/false` | `share: "auto" / "manual" / "disabled"` |
| `agent` (singular) | `agents` (plural) |
| `agent.<id>.prompt` | `agents.<id>.system` (string en JSON) |
| `agent.<id>.disable` | `agents.<id>.disabled` |
| `agent.<id>.permission` | `agents.<id>.permissions` |
| `tools` | `permissions` |
| `bash` | `shell` |
| `task` | `subagent` |
| `write` / `patch` | `edit` |
| `mcp.<id>` | `mcp.servers.<id>` |
| `enabled: true` | `disabled: false` (inverso) |
| `theme` / `keybinds` en `opencode.json` | `cli.json` |
| `command` (singular) | `commands` (plural) |
| `reference` (singular) | `references` (plural) |
| `snapshot` (singular) | `snapshots` (plural) |
| `attachment` (singular) | `media` |
| `skills.paths` / `skills.urls` | `skills: []` |

---

## Configuración global (`opencode.json`)

### Proveedores

```json
// v1
{
  "provider": {
    "anthropic": {
      "npm": "@ai-sdk/anthropic",
      "api": "https://api.anthropic.com/v1",
      "options": {
        "apiKey": "env:ANTHROPIC_API_KEY"
      }
    }
  }
}

// v2
{
  "providers": {
    "anthropic": {
      "package": "aisdk:@ai-sdk/anthropic",
      "settings": {
        "baseURL": "https://api.anthropic.com/v1",
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### Compartir sesiones

```json
// v1
{ "autoshare": true }

// v2
{ "share": "auto" }
```

Valores posibles: `"manual"`, `"auto"`, `"disabled"`.

### Permisos

```json
// v1
{
  "permission": {
    "bash": {
      "git push *": "ask"
    },
    "edit": "allow"
  },
  "tools": {
    "websearch": false
  }
}

// v2
{
  "permissions": [
    { "action": "shell", "resource": "git push *", "effect": "ask" },
    { "action": "edit", "resource": "*", "effect": "allow" },
    { "action": "websearch", "resource": "*", "effect": "deny" }
  ]
}
```

Acciones disponibles en v2: `read`, `edit`, `glob`, `grep`, `shell`, `subagent`, `skill`, `question`, `webfetch`, `websearch`, `external_directory`, `<server>_<tool>`, `execute`.

### Agentes en JSON

```json
// v1
{
  "agent": {
    "reviewer": {
      "prompt": "Review for correctness.",
      "model": "anthropic/claude-sonnet-4-5",
      "variant": "high",
      "disable": false,
      "permission": {
        "edit": "deny"
      }
    }
  }
}

// v2
{
  "agents": {
    "reviewer": {
      "system": "Review for correctness.",
      "model": "anthropic/claude-sonnet-4-5#high",
      "disabled": false,
      "permissions": [
        { "action": "edit", "resource": "*", "effect": "deny" }
      ]
    }
  }
}
```

Reglas:

- `prompt` → `system` (string, no array en JSON config).
- `disable` → `disabled`.
- `permission` → `permissions`.
- `variant` separado → se une al modelo con `#`.
- `temperature`, `top_p` y opciones específicas del proveedor van bajo `request.body`.
- `maxSteps` → `steps`.

### MCP servers

```json
// v1
{
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp"],
      "enabled": true,
      "timeout": 30000
    }
  }
}

// v2
{
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": ["npx", "@playwright/mcp"],
        "disabled": false,
        "timeout": {
          "catalog": 30000,
          "execution": 30000
        }
      }
    }
  }
}
```

### Otros cambios top-level

```json
// v1
{
  "snapshot": false,
  "reference": { "docs": "../docs" },
  "command": { "review": { "template": "...", "subtask": true } },
  "attachment": { "image": { "auto_resize": true } },
  "skills": { "paths": ["./team-skills"], "urls": ["https://example.com/skills/"] }
}

// v2
{
  "snapshots": false,
  "references": { "docs": "../docs" },
  "commands": { "review": { "template": "...", "subagent": true } },
  "media": { "image": { "auto_resize": true } },
  "skills": ["./team-skills", "https://example.com/skills/"]
}
```

---

## Agentes (archivos `.md`)

Los agentes en Markdown son el formato preferido en v2.

```markdown
---
description: Revisa cambios sin modificar archivos
mode: all
permissions:
  - action: "*"
    resource: "*"
    effect: deny
  - action: read
    resource: "*"
    effect: allow
---

Eres un code reviewer. Revisa cambios staged, unstaged y archivos nuevos.
Reporta problemas de mantenibilidad, seguridad, performance y type-safety.
No modifiques archivos.
```

Cambios comunes en frontmatter:

| v1 | v2 |
|---|---|
| `prompt: "..."` | No se usa en archivos `.md`; el cuerpo del archivo es el system prompt |
| `disable: true` | `disabled: true` |
| `permission:` | `permissions:` |
| `model: anthropic/claude-sonnet-4-5` + `variant: high` | `model: anthropic/claude-sonnet-4-5#high` |
| `subtask: true` | `subagent: true` |
| `color: "#6366F1"` | Aceptado como extra, pero no es parte del schema v2 |

> **Nota:** el cuerpo del Markdown es el system prompt. No hace falta un campo `system` en el frontmatter de archivos `.md`.

---

## Comandos (archivos `.md`)

```markdown
---
description: Create tests for the project
agent: plan
subagent: true
---

Create tests for the project's components, hooks, endpoints, utils and scripts...
```

Cambios:

- `command/` → `commands/` (v2 prefiere plural).
- `subtask: true` → `subagent: true`.
- `model` + `variant` → `model: proveedor/modelo#variant`.

---

## Skills

El formato `SKILL.md` no cambia significativamente. v2 descubre skills desde `.opencode/skills/` y `.opencode/skill/`; la preferida es `.opencode/skills/<skill-id>/SKILL.md`.

En `opencode.json`, el campo `skills` ahora es un array plano:

```json
{
  "skills": [
    "./team-skills",
    "https://example.com/skills/"
  ]
}
```

---

## Plugins

Plugins v1 **no funcionan** en v2. Hay que portarlos al nuevo API (`@opencode/plugin`).

Si tenés plugins v1 en `cli.json`:

```json
// cli.json v2
{
  "plugins": []
}
```

O portarlos siguiendo la guía oficial de migración de plugins.

---

## Configuración del cliente TUI (`cli.json`)

En v2 la configuración del cliente TUI se separa de `opencode.json` y va a `~/.config/opencode/cli.json`:

```json
{
  "$schema": "https://opencode.ai/v2/cli.json",
  "theme": {
    "name": "opencode",
    "mode": "system"
  },
  "keybinds": {
    "leader": "ctrl+x",
    "session.last": "ctrl+alt+s"
  },
  "plugins": [],
  "session": {
    "sidebar": "auto",
    "scrollbar": false,
    "thinking": "show"
  }
}
```

El archivo `tui.json` de v1 ya no se usa.

---

## Rutas preferidas

| Tipo | v1 | v2 preferida |
|---|---|---|
| Agentes | `.opencode/agent/` | `.opencode/agents/` |
| Comandos | `.opencode/command/` | `.opencode/commands/` |
| Skills | `.opencode/skill/` | `.opencode/skills/` |

Ambas rutas siguen funcionando, pero usá las plurales para proyectos nuevos.

---

## Lista de verificación

Antes de usar v2 con tu setup migrado:

- [ ] `opencode.json` usa `providers` (plural) con `package` y `settings`.
- [ ] Las API keys usan `"{env:VAR}"`.
- [ ] `autoshare` se reemplazó por `share`.
- [ ] `agent` → `agents`, `command` → `commands`, `reference` → `references`, `snapshot` → `snapshots`, `attachment` → `media`.
- [ ] `tools` se migró a `permissions`.
- [ ] Las acciones `bash`, `task`, `write`, `patch` se renombraron a `shell`, `subagent`, `edit`.
- [ ] `mcp.<id>` se agrupó bajo `mcp.servers.<id>`.
- [ ] `enabled: true` se reemplazó por `disabled: false`.
- [ ] `theme` y `keybinds` se movieron a `cli.json`.
- [ ] Se quitaron o portaron plugins v1 del `cli.json`.
- [ ] Los agentes/comandos `.md` usan `subagent` en lugar de `subtask`.
- [ ] Se probó `opencode debug config` y `opencode run "hello"` sin errores de schema.

---

## Recursos

- [Migrate from V1 — OpenCode docs](https://opencode.ai/v2/docs/migrate-v1/)
- [Permissions — OpenCode docs](https://opencode.ai/v2/docs/permissions/)
- [MCP servers — OpenCode docs](https://opencode.ai/docs/mcp-servers)
