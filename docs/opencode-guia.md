# OpenCode — Guía de Uso

**OpenCode** es un agente de IA para codificación que funciona desde la terminal. Es open-source, compatible con más de 75 proveedores de LLM (OpenAI, Anthropic, Google, Ollama, modelos locales) y está diseñado para trabajar directamente en tu proyecto.

## Tabla de contenidos

1. [Instalación](#instalación)
2. [Configuración inicial](#configuración-inicial)
3. [Configuración recomendada (opencode.json)](#configuración-recomendada-opencodejson)
4. [Uso básico](#uso-básico)
5. [Modos de trabajo](#modos-de-trabajo)
6. [Comandos útiles](#comandos-útiles)
7. [GitHub Copilot Pro en OpenCode](#github-copilot-pro-en-opencode)
8. [MCP — Model Context Protocol](#mcp--model-context-protocol)
9. [Flujo de trabajo recomendado](#flujo-de-trabajo-recomendado)
10. [Personalización avanzada](#personalización-avanzada)
11. [Recursos](#recursos)

---

## Instalación

### Instalador universal (macOS / Linux / WSL)
```sh
curl -fsSL https://opencode.ai/install | bash
```

### Otras opciones
```sh
# Homebrew
brew install anomalyco/tap/opencode

# npm
npm install -g opencode-ai

# Windows (Chocolatey)
choco install opencode

# Windows (Scoop)
scoop install opencode
```

### Verificar instalación
```sh
opencode --version
```

---

## Configuración inicial

### 1. Conectar un proveedor de IA

Dentro de OpenCode escribe:
```
/connect
```
Selecciona tu proveedor (OpenAI, Anthropic, etc.) y pega tu API key.

> También puedes usar **OpenCode Zen** (modelos curados gratuitos) autenticándote en [opencode.ai/auth](https://opencode.ai/auth).

### 2. Archivos de configuración

| Alcance   | Ruta                                  |
|-----------|---------------------------------------|
| Global    | `~/.config/opencode/opencode.json`    |
| Proyecto  | `./opencode.json`                     |

---

## Configuración recomendada (opencode.json)

El archivo `opencode.json` controla el comportamiento global de OpenCode. A continuación la configuración más completa y recomendada:

```json
{
  "$schema": "https://opencode.ai/config.schema.json",

  "theme": "opencode",

  "autoshare": false,

  "model": "anthropic/claude-sonnet-4-5",

  "provider": {
    "anthropic": {
      "apiKey": "env:ANTHROPIC_API_KEY"
    },
    "openai": {
      "apiKey": "env:OPENAI_API_KEY"
    },
    "google": {
      "apiKey": "env:GEMINI_API_KEY"
    }
  },

  "keybinds": {
    "leader": "ctrl+x"
  }
}
```

### Notas importantes

- **Nunca escribas API keys directamente** — usa `"env:NOMBRE_VARIABLE"` para leerlas del entorno.
- Puedes tener múltiples proveedores configurados y cambiar entre ellos con `/connect`.
- El campo `"model"` define el modelo por defecto; puedes sobreescribirlo en cualquier momento.
- Los temas disponibles se listan con `/themes`. Opciones populares: `opencode`, `tokyo-night`, `catppuccin`, `dracula`.

### Variables de entorno recomendadas

Agrega esto a tu `.bashrc` / `.zshrc` / perfil de PowerShell:

```sh
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
export GEMINI_API_KEY="AIza..."
export GITHUB_TOKEN="ghp_..."
```

---

## Uso básico

### Iniciar en tu proyecto
```sh
cd tu-proyecto
opencode
```

### Inicializar contexto del proyecto
```
/init
```
Genera un archivo `AGENTS.md` en la raíz. Este archivo le explica al agente la arquitectura, convenciones de nombres y patrones de tu proyecto. **Commitéalo al repositorio.**

---

## Modos de trabajo

| Modo          | Descripción                              | Activar              |
|---------------|------------------------------------------|----------------------|
| **Plan**      | Solo lectura y análisis (sin cambios)    | `Tab` o `/plan`      |
| **Build**     | Edita y modifica archivos reales         | `Tab` o `/build`     |

> Buena práctica: siempre analiza primero con **Plan** antes de ejecutar cambios con **Build**.

---

## Comandos útiles

| Comando              | Atajo           | Descripción                         |
|----------------------|-----------------|-------------------------------------|
| `/init`              | —               | Inicializa contexto del proyecto    |
| `/connect`           | —               | Conecta un proveedor de IA          |
| `/plan`              | `Tab`           | Cambia al modo Plan (análisis)      |
| `/build`             | `Tab`           | Cambia al modo Build (edición)      |
| `/undo`              | `Ctrl+X U`      | Deshace el último cambio            |
| `/redo`              | `Ctrl+X R`      | Rehace el último cambio             |
| `/themes`            | `Ctrl+X T`      | Cambia el tema visual               |
| `@nombre-archivo`    | —               | Busca y referencia un archivo       |

---

## GitHub Copilot Pro en OpenCode

OpenCode soporta **GitHub Copilot** como proveedor nativo. Si tienes una suscripción activa a Copilot Pro, puedes usarlo directamente desde la terminal sin necesidad de VS Code.

### Opción 1 — Conexión interactiva (recomendada)

Dentro de OpenCode escribe:
```
/connect
```
Selecciona **GitHub Copilot** en la lista de proveedores. OpenCode abrirá un flujo de autenticación OAuth con tu cuenta de GitHub.

### Opción 2 — Configuración manual en opencode.json

```json
{
  "provider": {
    "copilot": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "https://api.githubcopilot.com"
      },
      "models": {
        "gpt-4o": {},
        "claude-3.7-sonnet": {},
        "o3-mini": {}
      }
    }
  },

  "model": "copilot/gpt-4o"
}
```

> El `baseURL` apunta a la API oficial de Copilot. Los modelos disponibles dependen de tu plan (Pro, Pro+, Enterprise).

### GitHub Copilot Enterprise (self-hosted)

Si tu organización usa GitHub Enterprise Server, agrega el endpoint personalizado:

```json
{
  "provider": {
    "copilot-enterprise": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "https://TU_EMPRESA.github.com/api/v3/copilot"
      }
    }
  }
}
```

### Modelos disponibles con Copilot Pro

| Modelo                  | Descripción                                 |
|-------------------------|---------------------------------------------|
| `gpt-4o`                | Rápido y preciso — uso general              |
| `o3-mini`               | Razonamiento avanzado, más lento            |
| `claude-3.7-sonnet`     | Excelente para refactorización y análisis   |
| `gemini-2.0-flash`      | Respuestas ultra rápidas                    |

> Los modelos disponibles dependen de tu plan y de lo que GitHub habilite en tu cuenta.

---

## MCP — Model Context Protocol

MCP permite que OpenCode acceda a herramientas externas: bases de datos, APIs, sistemas de archivos, GitHub, Jira, etc. Se configura en `opencode.json` bajo la clave `"mcp"`.

### Tipos de servidor MCP

| Tipo       | Descripción                                     |
|------------|-------------------------------------------------|
| `local`    | Corre como subproceso en tu máquina (stdio)     |
| `remote`   | Accede via HTTP/SSE a un servidor externo       |

### Configuración básica

```json
{
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "/ruta/permitida"],
      "enabled": true
    },

    "github": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "env:GITHUB_TOKEN"
      },
      "enabled": true
    },

    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "env:DATABASE_URL"
      },
      "enabled": true
    }
  }
}
```

### Servidor MCP remoto (HTTP/SSE)

```json
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "enabled": true
    },

    "empresa-interna": {
      "type": "remote",
      "url": "https://tools.miempresa.com/mcp",
      "headers": {
        "Authorization": "Bearer env:MCP_API_KEY"
      },
      "enabled": true
    }
  }
}
```

### Servidores MCP más útiles

| Servidor                                          | Función                                      |
|---------------------------------------------------|----------------------------------------------|
| `@modelcontextprotocol/server-filesystem`         | Leer/escribir archivos en rutas controladas  |
| `@modelcontextprotocol/server-github`             | Issues, PRs, repos desde GitHub              |
| `@modelcontextprotocol/server-postgres`           | Consultas SQL a PostgreSQL                   |
| `@modelcontextprotocol/server-sqlite`             | Bases de datos SQLite locales                |
| `@modelcontextprotocol/server-brave-search`       | Búsquedas web con Brave Search               |
| `@upstash/context7-mcp`                           | Documentación actualizada de librerías       |

### Buenas prácticas con MCP

- ✓ Habilita **solo los servidores que necesitas** — cada uno consume tokens de contexto.
- ✓ Usa `"env:VARIABLE"` para **todas las credenciales**, nunca texto plano.
- ✓ Limita las rutas del filesystem a carpetas específicas del proyecto.
- ◬ El servidor de GitHub puede consumir mucho contexto en repos grandes — úsalo con cuidado.

---

## Flujo de trabajo recomendado

```
1. cd tu-proyecto
2. opencode
3. /init          → genera AGENTS.md, commitéalo
4. /plan          → analiza el código antes de tocar nada
5. Describe tu tarea en lenguaje natural
6. /build         → deja que el agente aplique los cambios
7. /undo          → si algo salió mal
```

### Ejemplos de prompts
```
"Explica esta función"
"Refactoriza la autenticación en archivos separados"
"Agrega tipos TypeScript a todos los archivos en src/"
"Escribe tests unitarios para el módulo de usuarios"
```

---

## Personalización avanzada

### Comandos reutilizables (Skills/Prompts)

Crea archivos `.md` en `.opencode/commands/` con plantillas de prompts que uses frecuentemente (la convención actual es plural; OpenCode también sigue aceptando `command/` singular). Después los ejecutás dentro de OpenCode como `/review`, `/test` o `/refactor`:

```
.opencode/
  command/
    review.md       → "Revisa este código buscando bugs y code smells..."
    test.md         → "Escribe tests unitarios con Vitest para..."
    refactor.md     → "Refactoriza siguiendo los principios SOLID..."
```

### Múltiples modelos y cambio dinámico

Puedes configurar varios proveedores y cambiar entre ellos en tiempo real:
```
/model anthropic/claude-opus-4
/model openai/gpt-4o
/model copilot/gpt-4o
```

### AGENTS.md — Contexto del proyecto

El archivo `AGENTS.md` en la raíz es la "memoria" del agente sobre tu proyecto. Incluye:

```markdown
# Arquitectura
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + PostgreSQL
- Estilos: Tailwind CSS

# Convenciones
- Nombres de componentes en PascalCase
- Hooks con prefijo `use`
- Tests en archivos *.test.ts junto al código

# Directorios clave
- src/components/ → componentes reutilizables
- src/hooks/      → custom hooks
- src/api/        → llamadas al backend
```

---

## Recursos

- 📖 Documentación oficial: [opencode.ai/docs](https://opencode.ai/docs)
- 🎓 Tutoriales: [opencode.ai/tutorial](https://opencode.ai/tutorial)
- 💻 Repositorio: [github.com/sst/opencode](https://github.com/sst/opencode)
- 🔌 Servidores MCP: [opencode.ai/docs/mcp-servers](https://opencode.ai/docs/mcp-servers)
- 🤖 GitHub Copilot docs: [docs.github.com/en/copilot](https://docs.github.com/en/copilot)
