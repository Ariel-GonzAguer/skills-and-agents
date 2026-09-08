---
name: wiki-docs
version: 1.0.0
description: Genera documentación técnica avanzada, completa y detallada para proyectos de software en Markdown. Crea una wiki estructurada por dominios técnicos orientada al onboarding de desarrolladores nuevos y a la referencia del equipo actual. Documenta arquitectura, backend, componentes, funcionalidades destacadas, CI/CD, seguridad, despliegue y desarrollo. Usa cuando el usuario pida documentar un proyecto, crear una wiki, generar documentación técnica o estructurar docs de onboarding.
---

# Wiki Docs Skill

Genera documentación técnica **avanzada, completa y detallada** para proyectos de software. La salida siempre es Markdown plano y sigue una estructura wiki organizada por dominios técnicos.

## Principios rector

1. **Siempre avanzado**: no existen niveles de detalle. Cada documento debe ser tan completo que un desarrollador senior externo al proyecto pueda entenderlo, contribuir a él y realizar un deploy de producción usando solo la wiki.
2. **Audiencia dual**: la documentación sirve tanto para el onboarding de desarrolladores nuevos como para la consulta diaria de quienes ya trabajan en el repo.
3. **Markdown único formato**: no se generan wikis en otros formatos (Obsidian, Docusaurus, Notion, etc.). Los documentos son archivos `.md` con links relativos estándar.
4. **Todo el repositorio**: se documenta el proyecto completo, no solo las partes "interesantes". Si hay duda sobre si incluir algo, incluirlo.
5. **Cero invención**: toda la información debe provenir del código fuente, configuraciones, README, AGENTS.md, workflows y documentación existente. No se inventan funcionalidades, firmas, variables ni comportamientos.

## Cuándo usar esta skill

- Cuando el usuario pida "documentar el proyecto", "crear wiki", "generar documentación" o "documentación técnica".
- Cuando pida "onboarding docs", "documentar el repo", "documentar este proyecto" o "crear documentación para nuevos devs".
- Cuando haya un archivo `_plan.md` en un directorio de documentación.
- Cuando se necesite crear documentación estructurada para un codebase.

## Configuración

La skill utiliza estos parámetros:

| Variable | Descripción | Default | ¿Se pregunta? |
|----------|-------------|---------|---------------|
| `wiki_dir` | Directorio donde se genera la documentación | `wiki-docs/` | No, usar default |
| `language` | Idioma de la documentación | `es` | **Sí, única pregunta obligatoria** |

**Regla**: no se pregunta nivel de detalle, estructura personalizada ni formato. La documentación siempre es avanzada, usa la estructura definida en esta skill y se entrega en Markdown plano.

## Flujo de trabajo

### 1. Preguntar idioma

Si no está claro por contexto, preguntar únicamente:

> "¿En qué idioma genero la documentación? (es/en)"

Usar `es` como default si el usuario no responde o escribe en español.

### 2. Detectar o crear `_plan.md`

- Si existe `{wiki_dir}/_plan.md`, leerlo y seguirlo.
- Si no existe, explorar el código fuente primero y luego crear `_plan.md` con la estructura propuesta.
- No pedir aprobación del plan salvo que el usuario lo solicite explícitamente. Avanzar directamente a la generación.

### 3. Exploración paralela con subagentes

Antes de escribir ningún archivo de documentación, lanzar **6 explore agents en paralelo** en un solo mensaje. Cada agente cubre un área y debe devolver su reporte en el formato indicado.

#### 3.1. Agente: Componentes

**Scope**: `src/components/ui/`, `src/components/pages/`, `src/components/`.

**Formato de salida obligatorio**:

```
# Componentes

## Lista completa
| Componente | Ubicación | Props principales | Descripción |

## Conexiones
- Componente A → usa → Componente B
- Componente C → conectado a store → store X

## Patrones observados
- Ej: todos los formularios usan react-hook-form + zod
```

#### 3.2. Agente: Data layer

**Scope**: `src/services/`, `src/lib/`, `src/store/`, `src/hooks/`, `src/types/`, `src/constants/`.

**Formato de salida obligatorio**:

```
# Data layer

## Servicios
| Servicio | Ubicación | Funciones principales |

## Stores
| Store | Tecnología | Estado global |

## Hooks
| Hook | Ubicación | Retorno |

## Tipos y constantes
- Enums, constantes, mapeos de error, límites configurados
```

#### 3.3. Agente: Infraestructura y despliegue

**Scope**: `netlify.toml`, `vercel.json`, `wrangler.toml`, `firebase.json`, headers HTTP, variables de entorno, edge functions, reglas de seguridad.

**Formato de salida obligatorio**:

```
# Infraestructura

## Plataforma de despliegue
- Nombre, versión, región

## Archivos de configuración
| Archivo | Propósito |

## Variables de entorno requeridas
| Variable | Tipo | Requerida | Descripción |

## Edge/functions
| Ruta/Función | Plataforma | Propósito |

## Seguridad perimetral
- Headers, CSP, CORS, reglas de firewall
```

#### 3.4. Agente: Routing

**Scope**: `src/pages/`, `src/app/`, `src/routes/`, archivo de rutas.

**Formato de salida obligatorio**:

```
# Routing

## Rutas principales
| Ruta | Render mode | Layout | Protección | Descripción |

## Layouts
| Layout | Rutas afectadas |

## Rutas API / actions
| Método | Path | Handler |
```

#### 3.5. Agente: CI/CD

**Scope**: `.github/workflows/`, pipelines en otras plataformas.

**Formato de salida obligatorio**:

```
# CI/CD

## Workflows
| Workflow | Trigger | Jobs | Secretos/variables |

## Jobs detallados
Para cada workflow, listar jobs, steps, acciones usadas, artefactos.

## Secretos referenciados
| Secreto | Workflow | Uso |
```

#### 3.6. Agente: Funcionalidades destacadas

**Scope**: todo el código buscando características no triviales.

**Formato de salida obligatorio**:

```
# Funcionalidades destacadas

## Encontradas
| Funcionalidad | Categoría | Archivos involucrados | Complejidad |

## Detalle por funcionalidad
1. Nombre
   - Qué hace
   - Por qué es no trivial
   - Archivos clave
   - Dependencias externas
```

Categorías a buscar: hardware/dispositivos, IA/ML, tiempo real, algoritmos propios, integraciones externas especiales, offline/PWA, criptografía/seguridad, exportación/generación de archivos, búsqueda avanzada, pipelines de datos, accesibilidad avanzada, internacionalización, autenticación avanzada, performance especial.

#### Lecturas en paralelo obligatorias

Mientras los explore agents corren, leer en paralelo:

- `package.json`
- `tsconfig.json` o equivalente
- Config del framework (`waku.config.ts`, `next.config.ts`, etc.)
- Reglas de seguridad (`firebase.rules`, políticas RLS, etc.)
- Config de ESLint/Prettier
- `README.md`
- `AGENTS.md` o `.commandcode/`
- `docs/*.md` si existe
- `CHANGELOG.md` si existe
- `.env.example` si existe

**No escribir ningún archivo de documentación hasta tener todos los resultados de la exploración y las lecturas.**

### 4. Síntesis de hallazgos

Consolidar los reportes de los subagentes en un solo resumen interno. Identificar:

- Stack tecnológico exacto y versiones.
- Estructura de directorios relevante.
- Funcionalidades destacadas que ameritan archivo propio en `features/`.
- Workflows de CI/CD que ameritan archivo propio en `ci-cd/`.
- Variables de entorno, secretos y configuraciones críticas.
- Problemas recurrentes o gotchas detectados para `troubleshooting.md`.

### 5. Crear estructura de directorios

Generar la siguiente estructura base en `{wiki_dir}/`:

```
{wiki_dir}/
├── _plan.md
├── quickstart.md
├── .last-update.json
├── architecture/
│   ├── overview.md
│   ├── routing.md
│   └── data-flow.md
├── backend/
│   ├── overview.md
│   ├── auth.md
│   └── database.md
├── components/
│   ├── overview.md
│   ├── patterns.md
│   └── accessibility.md
├── features/
│   └── {nombre-funcionalidad}.md
├── ci-cd/
│   ├── overview.md
│   └── {nombre-workflow}.md
├── security/
│   ├── implementation.md
│   ├── headers.md
│   └── validations.md
├── deployment/
│   ├── platform.md
│   ├── troubleshooting.md
│   ├── pwa.md
│   └── monitoring.md
├── development/
│   ├── testing.md
│   ├── linting.md
│   └── workflow.md
├── utils/
│   └── overview.md
└── docs/
    ├── overview.md
    └── guidelines.md
```

Reglas de adaptación:

- Si no aplica PWA → eliminar `deployment/pwa.md`.
- Si no hay tests → crear `development/testing.md` con sección "Sin tests configurados".
- Si hay múltiples bases de datos → crear un archivo por cada una en `backend/`.
- Si hay monitoreo/observabilidad → mantener `deployment/monitoring.md`.
- Si no hay componentes de accesibilidad destacados → eliminar `components/accessibility.md`.
- Si no hay GitHub Actions → eliminar `ci-cd/`.
- Si hay 1-2 features destacadas → documentarlas en `architecture/overview.md` y no crear `features/`.
- Si hay 3+ features destacadas → crear directorio `features/` con un archivo por cada una.

### 6. Generar documentos por dominio

Para cada documento:

1. Leer la plantilla correspondiente en `templates/`.
2. Extraer información real del código fuente usando `Read`, `Grep` o subagentes si es necesario.
3. Rellenar la plantilla con datos concretos del proyecto.
4. Incluir al menos una tabla y, si es documento de flujo/arquitectura, al menos un diagrama ASCII.
5. Incluir ejemplos de código reales del proyecto.
6. Terminar con sección `Referencias` que enlace a otros documentos y archivos fuente.

### 7. Documentar funcionalidades destacadas

Para cada funcionalidad destacada encontrada:

1. Crear `features/{nombre-funcionalidad}.md`.
2. Usar la plantilla `templates/feature.md`.
3. Incluir: qué es y por qué está aquí, flujo técnico con diagrama ASCII, archivos involucrados, API/interfaz pública, dependencias externas, limitaciones y consideraciones, referencias cruzadas.
4. Referenciarla desde `quickstart.md`.
5. Referenciarla desde el dominio técnico correspondiente.

### 8. Documentar CI/CD

Si existe `.github/workflows/`:

1. Crear `ci-cd/overview.md` que resuma todos los workflows.
2. Crear `ci-cd/{nombre-workflow}.md` para cada workflow relevante usando `templates/workflow.md`.
3. Documentar triggers, jobs, steps, secretos, variables y artefactos.
4. Incluir diagrama ASCII de ejecución del pipeline.

### 9. Escribir `quickstart.md`

Actualizar/crear `quickstart.md` con:

- Mapa rápido con enlaces a todos los documentos organizados por dominio.
- Inicio rápido: 3-5 pasos para levantar el proyecto localmente.
- Stack resumido.
- Sección **Funcionalidades destacadas** con enlace a cada `features/*.md`.
- Sección **CI/CD** con enlace a `ci-cd/overview.md` si aplica.
- Sección **Próximos pasos** para devs nuevos.

### 10. Quality Gate riguroso

Antes de considerar terminado el trabajo, ejecutar este gate. No se puede reportar completitud sin pasar todos los ítems.

#### 10.1. Validación de existencia

- [ ] `_plan.md` existe y está actualizado.
- [ ] `quickstart.md` existe.
- [ ] `.last-update.json` existe.
- [ ] Todos los directorios de la estructura base existen (salvo los omitidos por no aplicar).
- [ ] Cada workflow de GitHub Actions tiene su documento en `ci-cd/` o está detallado en `ci-cd/overview.md`.
- [ ] Cada funcionalidad destacada encontrada tiene su archivo en `features/`.

#### 10.2. Validación de contenido

- [ ] Ningún documento tiene secciones vacías, placeholders sin reemplazar ni texto "TODO".
- [ ] Cada documento tiene al menos una tabla.
- [ ] Cada documento de flujo/arquitectura tiene al menos un diagrama ASCII.
- [ ] Cada documento tiene sección `Referencias` con al menos un link.
- [ ] Los ejemplos de código son reales y existen en el proyecto.
- [ ] Las tablas de funciones/componentes/servicios listan el 100% de los elementos, no solo "los principales".
- [ ] `deployment/troubleshooting.md` tiene al menos 3 entradas reales del proyecto.

#### 10.3. Validación de links

1. Listar todos los `.md` creados con `glob`.
2. Para cada documento, extraer todos los links `[texto](path)`.
3. Verificar que cada link apunte a un archivo que existe.
4. Verificar que las referencias entre documentos sean recíprocas cuando aplique.
5. Corregir cualquier link roto.

#### 10.4. Validación de cobertura

- [ ] Todos los archivos del proyecto relevantes están referenciados en al menos un documento.
- [ ] `quickstart.md` enlaza al 100% de los documentos creados.
- [ ] No hay funcionalidad destacada sin documentar.
- [ ] No hay workflow sin documentar.

### 11. Actualizar `.last-update.json`

Generar o actualizar el archivo con:

```json
{
  "updatedAt": "ISO-8601",
  "command": "complete-documentation",
  "gitHead": "commit-hash",
  "filesCreated": 0,
  "directoriesCreated": 0
}
```

Obtener el `gitHead` real con `git rev-parse HEAD`. Si no hay repo git, dejar `"unknown"`.

## Plantillas

La skill incluye plantillas en `templates/` para mantener consistencia. Antes de escribir un documento, leer la plantilla correspondiente.

- `templates/overview.md` → documentos `overview.md` de cualquier dominio.
- `templates/feature.md` → documentos `features/{nombre}.md`.
- `templates/workflow.md` → documentos `ci-cd/{nombre}.md`.
- `templates/troubleshooting-entry.md` → entradas individuales de `deployment/troubleshooting.md`.

## Instrucciones para subagentes

### Explore agents

- Lanzar siempre en paralelo en un solo mensaje.
- Asignar scope preciso y formato de salida obligatorio.
- No permitir que escriban archivos; solo investigan y reportan.
- Si un área no existe en el proyecto, el agente debe reportar "No encontrado" en lugar de omitirse.

### Coder agents

- Usar para generar documentos grandes o cuando el proyecto exceda la capacidad de contexto.
- Asignar un dominio completo por agente (ej: uno para `backend/`, otro para `components/`).
- Entregar el contexto necesario: reportes de explore agents, paths de archivos fuente, plantilla a usar.
- El agente padre siempre revisa y consolida el output antes de escribir.

## Anti-patrones

La skill debe evitar estos comportamientos:

- **No resumir donde se puede detallar**: si hay 10 funciones en un servicio, documentar las 10.
- **No omitir por parecer obvio**: lo obvio para el autor no lo es para el lector nuevo.
- **No inventar funcionalidades, firmas, variables ni ejemplos**: todo debe provenir del código fuente.
- **No copiar el README.md tal cual en quickstart.md**: `quickstart.md` es el mapa de la wiki, no una copia del README.
- **No documentar funciones privadas sin contexto**: si se documenta una función privada, explicar por qué existe y quién la usa.
- **No usar emojis, lenguaje informal o adornos**: tono técnico y directo.
- **No incluir código que no exista en el proyecto real**.
- **No usar más de un heading H1 por documento**.
- **No generar documentación en formatos que no sean Markdown plano**.
- **No dejar links rotos**: toda referencia interna debe apuntar a un archivo existente.
- **No dejar secciones vacías o con placeholders**: cada sección debe tener contenido sustantivo.
- **No pedir aprobación del plan por default**: avanzar salvo que el usuario lo solicite.

## Convenciones de escritura

- **Idioma**: el definido por `language` (español por default).
- **Tono**: técnico, directo, sin adornos.
- **Código**: incluir ejemplos reales del proyecto, extraídos con `Read` o `Grep`.
- **Referencias**: enlazar a otros documentos de la wiki y a archivos fuente del proyecto.
- **Tablas**: usar para listar funciones, componentes, variables, rutas, jobs, etc.
- **Diagramas**: usar ASCII en documentos de flujo y arquitectura.

## Nivel de detalle mínimo

| Contenido | Nivel mínimo exigido |
|-----------|----------------------|
| Función/método | Firma completa + descripción + parámetros + retorno + cuándo usarla |
| Componente React | Props tipadas + descripción de cada prop + ejemplo de uso |
| Endpoint API | Método + path + body/query params + respuesta exitosa + errores posibles |
| Variable de entorno | Nombre + tipo + descripción + si es requerida + ejemplo de valor |
| Script de package.json | Nombre + comando exacto + cuándo ejecutarlo |
| Workflow de GitHub Actions | Todos los jobs + steps + secretos + cuándo se ejecuta |
| Feature destacada | Flujo completo + archivos + dependencias + limitaciones |
| Regla de seguridad | Qué protege + condición + ejemplos de permiso/denegación |

## Diagramas ASCII

Cada documento de tipo flujo o arquitectura debe incluir al menos un diagrama ASCII.

Tipos requeridos:

| Documento | Tipo de diagrama |
|-----------|------------------|
| `architecture/overview.md` | Diagrama de capas |
| `architecture/data-flow.md` | Flujo por operación clave |
| `backend/auth.md` | Flujo de autenticación |
| `backend/database.md` | Árbol de colecciones/documentos |
| `security/implementation.md` | Flujo de request seguro |
| `deployment/platform.md` | Arquitectura de despliegue |
| `features/{nombre}.md` | Flujo completo de la feature |
| `ci-cd/{workflow}.md` | Jobs y dependencias del pipeline |

Caracteres recomendados: `┌ ┐ └ ┘ │ ─ ├ ┤ ┬ ┴ ┼ → ←`

Ejemplo:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Cliente  │────→│ Servidor │────→│    DB    │
└──────────┘     └──────────┘     └──────────┘
```

## Adaptación por framework

Sin importar el framework, la documentación debe cubrir:

- Server Components si existen.
- Routing (`pages/` o `app/`).
- SSR/SSG/ISR si aplica.
- Endpoints de API o actions.
- Plugins y configuración del framework.
- Seguridad y validaciones.
- Backend y base de datos.
- Constantes y enums del dominio.
- `deployment/troubleshooting.md` con errores comunes del stack.
- `ci-cd/overview.md` con todos los workflows si existen.
- `features/` con una entrada por funcionalidad destacada encontrada.

## Reporte final

Al terminar, reportar:

1. Directorio de la wiki generada.
2. Idioma usado.
3. Cantidad de documentos creados.
4. Cantidad de funcionalidades destacadas documentadas.
5. Cantidad de workflows documentados.
6. Estado del Quality Gate (todos los ítems deben estar ✅).
7. Lista de archivos clave generados.
