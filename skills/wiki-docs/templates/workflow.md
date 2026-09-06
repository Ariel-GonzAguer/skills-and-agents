# Workflow: {nombre}

Una línea describiendo qué hace este workflow y cuándo se ejecuta.

## Triggers

| Evento | Condición |
|--------|-----------|
| `push` | Solo rama `main` |
| `pull_request` | Cualquier PR a `main` |

## Jobs

### Job: `{nombre-job}`

**Propósito**: qué hace este job.
**Runner**: `ubuntu-latest` / `windows-latest` / etc.

| Step | Acción | Descripción |
|------|--------|-------------|
| Checkout | `actions/checkout@v4` | Clona el repositorio |
| Setup Node | `actions/setup-node@v4` | Instala Node 20 |
| Install | `run: pnpm install` | Instala dependencias |
| Test | `run: pnpm test` | Ejecuta suite de tests |

## Secretos y variables requeridos

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | Secret | Credenciales de Firebase Admin |
| `NODE_ENV` | Variable | Ambiente de ejecución |

## Artefactos

Listar artefactos que se generan, cachean o publican.

## Diagrama de ejecución

```
push a main
  └─→ build-and-test
        ├─→ lint
        ├─→ test (matrix: Node 18, 20)
        └─→ deploy (solo si tests pasan)
```

## Referencias

- Archivo fuente: `.github/workflows/{nombre}.yml`
- [Documentación de despliegue](../deployment/platform.md)
