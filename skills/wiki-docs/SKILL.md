---
name: wiki-docs
description: Genera documentacion tecnica completa para proyectos de software creando una wiki estructurada por dominios (arquitectura, backend, componentes, seguridad, despliegue, desarrollo, etc.). Documenta funcionalidades destacadas del proyecto (lectura de QR, algoritmos propios, integraciones especiales, etc.) y GitHub Actions/CI-CD. Usa cuando el usuario pida "documentar el proyecto", "crear wiki", "generar documentacion", o cuando necesite crear docs estructuradas para un codebase.
---

# Wiki Docs Skill

Genera documentacion tecnica **completa y detallada** para proyectos de software siguiendo una estructura wiki organizada por dominios tecnicos. El objetivo es que cualquier desarrollador nuevo pueda entender el proyecto leyendo la wiki, sin necesidad de leer el codigo fuente.

> **Principio rector**: La documentacion debe ser TAN COMPLETA que un desarrollador senior externo al proyecto pueda entenderlo, contribuir a el y hacer un deployment de produccion usando solo la wiki. Si hay duda sobre si incluir algo, incluirlo.

## Cuándo usar esta skill

- Cuando el usuario pida "documentar el proyecto", "crear wiki", "generar documentacion"
- Cuando haya un archivo `_plan.md` en un directorio de documentacion
- Cuando se necesite crear documentacion estructurada para un codebase

## Flujo de trabajo

### 1. Detectar o crear plan

Si existe `{wiki_dir}/_plan.md`:
- Leer el archivo para entender la estructura planificada
- Identificar archivos a crear y sus contenidos

Si no existe:
- Explorar el codigo fuente para entender el proyecto (pasos 1.5 y 1.6)
- Crear un `_plan.md` con la estructura propuesta
- Preguntar al usuario si aprueba la estructura antes de continuar

### 1.5. Exploracion paralela (OBLIGATORIO antes de escribir)

Lanzar explore agents en paralelo (todos en UN solo mensaje) para cubrir estas areas simultaneamente:

1. **Componentes**: `src/components/ui/` y `src/components/pages/` — listar cada componente, props, conexiones con otros componentes y stores
2. **Data layer**: `src/services/`, `src/lib/`, `src/store/`, `src/hooks/` — servicios, stores, utilidades, hooks, tipos
3. **Infraestructura**: config de despliegue (netlify.toml, vercel.json, etc.), edge functions, reglas de seguridad, headers HTTP, variables de entorno
4. **Routing**: `src/pages/` o `src/app/` — todas las rutas, render mode (static/dynamic), proteccion, layouts
5. **GitHub Actions y CI/CD**: directorio `.github/workflows/` — todos los archivos YAML de workflows, sus triggers, jobs, steps, secretos referenciados y artefactos generados
6. **Funcionalidades destacadas**: buscar en el codigo caracteristicas no triviales — ver seccion 1.6 para la lista completa de lo que buscar

Adicionalmente, leer en paralelo estos archivos clave:
- `package.json` — dependencias y scripts
- `tsconfig.json` o equivalente — configuracion de TypeScript
- Config del framework (waku.config.ts, next.config.ts, etc.)
- Reglas de seguridad (firebase.rules, supabase RLS, etc.)
- ESLint/Prettier config
- README.md y documentacion existente en `docs/`

**NO escribir ningun archivo de documentacion hasta tener TODOS los resultados de la exploracion.**

### 1.6. Identificar funcionalidades destacadas (OBLIGATORIO)

Durante la exploracion, buscar activamente caracteristicas que hacen al proyecto unico o no trivial. Para cada una encontrada, crear o ampliar `features/` con documentacion propia.

**Buscar especificamente** (no es lista exhaustiva, usar criterio):

| Categoria | Ejemplos concretos a buscar |
|-----------|----------------------------|
| Hardware / dispositivos | Lectura de QR/barcodes, camara, microfono, GPS, NFC, Bluetooth, sensores |
| IA / ML | Modelos de prediccion propios, embeddings, LLMs, procesamiento de imagenes, OCR |
| Tiempo real | WebSockets, SSE, Polling, canales de presencia, colaboracion en vivo |
| Algoritmos propios | Algoritmos de scoring, ranking, matching, calculo numerico no trivial |
| Integraciones externas especiales | APIs de pago (Stripe, MercadoPago), mapas (Google Maps, Mapbox), SMS, email masivo |
| Offline / PWA | Service Worker, cache strategies, sync en background, manifesto PWA |
| Criptografia / seguridad | Firmado de tokens JWT propio, encriptacion de datos, 2FA, TOTP |
| Exportacion / generacion de archivos | PDF, Excel, CSV, ZIP, generacion de imagenes en servidor |
| Busqueda avanzada | Full-text search, busqueda vectorial, filtros complejos, facets |
| Pipelines de datos | ETL, transformaciones batch, agregaciones, migraciones automaticas |
| Accesibilidad avanzada | Screen reader support, navegacion por teclado, contraste adaptativo |
| Internacionalizacion | i18n, l10n, formateo de fechas/moneda por locale |
| Autenticacion avanzada | OAuth multi-provider, magic links, passkeys, SSO, RBAC/ABAC |
| Performance especial | Virtualizacion de listas, lazy loading agresivo, streaming SSR |

**Para cada funcionalidad destacada encontrada**:
1. Crear `features/{nombre-funcionalidad}.md` con documentacion completa (ver plantilla en seccion 4.2)
2. Referenciarla desde `quickstart.md` en una seccion "Funcionalidades destacadas"
3. Referenciarla desde el dominio tecnico que le corresponda (ej: un componente de QR tambien va en `components/`)

**Criterio para considerar algo "destacado"**: si un desarrollador nuevo veria esta funcionalidad y preguntaria "¿como funciona esto?", documentarla como destacada.

### 2. Explorar el codigo fuente

Antes de documentar, explorar el proyecto para identificar, entre otros:

```
- package.json, waku.config.ts, next.config.ts → Stack y dependencias
- src/pages/ o app/ → Estructura de rutas
- src/componentes/ o src/components/ → Componentes UI
- src/utils/ o src/lib/ → Utilidades y lógica
- src/store/ → Estado global
- src/tipos/ o src/types/ → Tipos e interfaces
- netlify.toml, vercel.json → Configuración de despliegue
- .env.example → Variables de entorno requeridas
- AGENTS.md, README.md → Convenciones del proyecto
- .github/workflows/ → GitHub Actions y CI/CD pipelines
```

#### 2.1 Leer documentacion existente (ANTES de explorar codigo)

Buscar y leer en este orden:
1. `README.md` — puede contener el 50%+ de la informacion necesaria
2. `docs/*.md` si existe directorio docs
3. `CHANGELOG.md` si existe
4. `AGENTS.md` o `.commandcode/` si existe
5. `plan*.md` o `TODO*.md` si existen

Esto evita re-documentar lo que ya esta documentado y permite usarlo como fuente base para la documentacion completa.

#### 2.2 Buscar constantes y datos del dominio

Buscar en `src/types/`, `src/constants/`, o donde se definan:
- Enums, constantes, listas de opciones (ej: estados de una orden, tipos de usuario)
- Valores default configurados en el proyecto
- Mapeos de error (codigos de error a mensajes legibles)
- Limites configurados (rate limits, tamano maximo, etc.)

Incluir estos datos en la documentacion relevante. Por ejemplo, si hay una lista de 9 sintomas posibles, listarlos en el documento de base de datos. Si hay un mapeo de errores de Firebase a mensajes en espanol, documentarlo en seguridad.

#### 2.3 Leer los archivos de GitHub Actions

Si existe `.github/workflows/`:
1. Listar **todos** los archivos `.yml` / `.yaml` del directorio
2. Leer cada uno completo — no saltar ninguno
3. Para cada workflow, extraer:
   - Nombre y proposito
   - Triggers (`on:` — push, pull_request, schedule, manual, etc.)
   - Jobs y steps con sus acciones (`uses:`)
   - Secretos y variables de entorno referenciados (`secrets.XXX`, `env.XXX`)
   - Artefactos generados o cacheados
   - Condiciones y matrices de ejecucion
4. Documentar en `ci-cd/` (ver estructura en seccion 3)

### 3. Estructura de documentacion

Crear esta estructura base (adaptar segun el proyecto):

```
{wiki_dir}/
├── _plan.md                    # Plan de documentación
├── quickstart.md               # Punto de entrada
├── .last-update.json           # Metadata de actualización
├── architecture/
│   ├── overview.md             # Arquitectura y stack
│   ├── routing.md              # Estructura de rutas
│   └── data-flow.md            # Flujos de datos
├── backend/
│   ├── overview.md             # Integración general
│   ├── auth.md                 # Autenticación
│   └── database.md             # Base de datos
├── components/
│   ├── overview.md             # Sistema de componentes
│   ├── patterns.md             # Patrones de diseño
│   └── accessibility.md        # Accesibilidad
├── features/                   # Funcionalidades destacadas (una por archivo)
│   └── {nombre-feature}.md     # Ej: qr-scanner.md, pdf-export.md, realtime-sync.md
├── ci-cd/                      # GitHub Actions y pipelines CI/CD
│   ├── overview.md             # Resumen de todos los workflows
│   └── {nombre-workflow}.md    # Un archivo por workflow relevante
├── security/
│   ├── implementation.md       # Medidas de seguridad
│   ├── headers.md              # Headers HTTP
│   └── validations.md          # Validación de inputs
├── deployment/
│   ├── platform.md             # Plataforma de despliegue
│   ├── troubleshooting.md      # Errores comunes, gotchas, soluciones
│   ├── pwa.md                  # PWA (si aplica)
│   └── monitoring.md           # Monitoreo (si aplica)
├── development/
│   ├── testing.md              # Estrategia de testing
│   ├── linting.md              # Calidad de código
│   └── workflow.md             # Flujo de desarrollo
├── utils/
│   └── overview.md             # Librerías y utilidades
└── docs/
    ├── overview.md             # Documentación general
    └── guidelines.md          # Guías de estilo y convenciones
```

Adaptar la estructura segun lo encontrado:
- Si no hay PWA → eliminar `deployment/pwa.md`
- Si no hay tests → eliminar `development/testing.md` o crear con seccion "Sin tests configurados"
- Si hay multiples bases de datos → crear un archivo por cada una
- Si hay monitoreo/observabilidad → crear `deployment/monitoring.md`
- Si no hay componentes de accesibilidad → eliminar `components/accessibility.md`
- Si no hay GitHub Actions (`.github/workflows/` no existe) → eliminar `ci-cd/`
- Si hay pocas features destacadas (1-2) → documentarlas en `architecture/overview.md` en lugar de crear directorio `features/`

### 4. Plantilla de archivo

Cada archivo de documentacion debe seguir esta estructura:

```markdown
# Título del documento

Breve descripción del contenido.

## 1. Sección principal

Contenido técnico con:
- Explicación clara
- Ejemplos de código
- Referencias a archivos del proyecto

## 2. Segunda sección

...

## Referencias

- [Documento relacionado](enlace.md)
- Archivo fuente: `src/archivo.ts`
```

#### 4.1 Secciones obligatorias por tipo de documento

**overview.md (cualquier dominio)**:
- Resumen en 1-2 oraciones
- Tabla de componentes/servicios/archivos con columna "Descripcion"
- Diagrama ASCII si el dominio es arquitectura o flujo de datos
- Referencias cruzadas a documentos relacionados

**Documento de servicio/archivo individual** (auth.md, database.md, etc.):
- Flujo paso a paso con diagrama ASCII
- Tablas de funciones con firma y descripcion
- Ejemplos de codigo REAL del proyecto (extraer del codigo fuente, no inventar)
- Seccion de "Problemas comunes" / troubleshooting si aplica

**Documento de configuracion** (headers.md, linting.md, testing.md):
- Tabla de opciones con valores actuales del proyecto
- Ejemplo de uso o configuracion
- Scripts de package.json relacionados
- Archivos de config implicados y su ubicacion

**troubleshooting.md** (deployment/troubleshooting.md):
- Una entrada por problema comun, cada una con:
  - **Sintoma**: que error o comportamiento anormal ve el usuario
  - **Causa**: por que ocurre (raiz tecnica)
  - **Solucion**: paso a paso para resolverlo
  - **Verificacion**: como confirmar que se resolvio
- Incluir al menos 3-5 entradas reales del proyecto
- Ordenar por frecuencia (lo mas comun primero)
- Incluir referencias a archivos fuente o configuraciones relevantes
- Ejemplo de formato:
  ```markdown
  ### 502 Bad Gateway en endpoints de API

  **Sintoma**: La app carga pero los endpoints API devuelven 502.

  **Causa**: `firebase-admin` no esta incluido en el bundle de la Netlify Function, o version incompatible.

  **Solucion**:
  1. Verificar `firebase-admin@13.8.0` en `package.json`
  2. Verificar `ssr.external: ['firebase-admin']` en `waku.config.ts`

  **Verificacion**: `curl -I https://site.com/api/endpoint` devuelve 200.
  ```

#### 4.2 Plantilla para funcionalidades destacadas (`features/{nombre}.md`)

Cada feature destacada merece un documento propio con esta estructura:

```markdown
# {Nombre de la funcionalidad}

Una oración que explica qué hace y por qué es relevante en este proyecto.

## ¿Qué es y por qué está aquí?

Contexto de negocio: por qué se implementó esta funcionalidad, qué problema resuelve.
No es necesario si es obvio, pero sí si la decisión de implementación no es trivial.

## Cómo funciona (flujo técnico)

Diagrama ASCII del flujo completo, desde el trigger hasta el resultado.

\`\`\`
[Trigger] → [Componente A] → [Servicio B] → [Resultado]
\`\`\`

Descripción paso a paso de cada etapa.

## Archivos involucrados

| Archivo | Rol en esta funcionalidad |
|---------|--------------------------|
| `src/components/QrScanner.tsx` | Componente UI, accede a la cámara |
| `src/services/qr.service.ts` | Decodifica el QR y valida el formato |

## API / Interfaz pública

Si la funcionalidad expone una API (hook, componente, función), documentarla:

\`\`\`ts
// Firma real extraída del código fuente
useQrScanner(options: QrScannerOptions): { data: string | null; error: Error | null }
\`\`\`

Tabla de props/parámetros con tipo, descripción y si es requerido.

## Dependencias externas

Listar librerías de terceros involucradas, con version y link a docs si aplica.

## Limitaciones y consideraciones

- Lo que NO hace esta implementación
- Limitaciones de hardware/browser conocidas
- Edge cases importantes

## Referencias

- [Componente relacionado](../components/overview.md)
- Librería: `nombre-libreria@version`
- Archivo fuente: `src/...`
```

#### 4.3 Plantilla para GitHub Actions (`ci-cd/{workflow}.md`)

```markdown
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

\`\`\`
push a main
  └─→ build-and-test
        ├─→ lint
        ├─→ test (matrix: Node 18, 20)
        └─→ deploy (solo si tests pasan)
\`\`\`

## Referencias

- Archivo fuente: `.github/workflows/{nombre}.yml`
- [Documentacion de despliegue](../deployment/platform.md)
```

### 5. Convenciones de escritura

- **Idioma**: Español
- **Tono**: Técnico, directo, sin adornos
- **Código**: Incluir ejemplos reales del proyecto (extraer con `read_file`, no inventar)
- **Referencias**: Enlazar a otros documentos y archivos fuente
- **Extensión**: Completo y sin omisiones — si un documento parece corto, probablemente falta profundidad

#### 5.1 Restricciones

- No inventar funcionalidades que no existan
- No usar emojis ni lenguaje informal
- No incluir codigo que no exista en el proyecto real
- No usar headings H1 mas de una vez por documento (el titulo)
- **No resumir donde se puede detallar** — si hay 10 funciones en un servicio, documentar las 10, no "las principales"
- **No omitir por parecer obvio** — lo que parece obvio para el autor no lo es para el lector nuevo

#### 5.2 Nivel de detalle minimo por tipo de contenido

| Contenido | Nivel minimo exigido |
|-----------|---------------------|
| Funcion/metodo | Firma completa + descripcion + parametros + retorno + cuando usarla |
| Componente React | Props tipadas + descripcion de cada prop + ejemplo de uso |
| Endpoint API | Metodo + path + body/query params + respuesta exitosa + errores posibles |
| Variable de entorno | Nombre + tipo + descripcion + si es requerida + ejemplo de valor |
| Script de package.json | Nombre + comando exacto + cuando ejecutarlo |
| Workflow de GitHub Actions | Todos los jobs + steps + secretos + cuando se ejecuta |
| Feature destacada | Flujo completo + archivos + dependencias + limitaciones |

### 6. Diagramas (OBLIGATORIO)

Cada documento de tipo "flujo" o "arquitectura" DEBE incluir al menos un diagrama ASCII.

Tipos de diagrama requeridos por documento:

| Documento | Tipo de diagrama | Ejemplo |
|-----------|-----------------|---------|
| `architecture/overview.md` | Diagrama de capas | cliente → edge → servidor → DB |
| `architecture/data-flow.md` | Flujo por cada operacion clave | login, CRUD, prediccion |
| `backend/auth.md` | Flujo de autenticacion | login → store → guard → redirect |
| `backend/database.md` | Arbol de colecciones/documents | users/{uid}/dailyLogs/... |
| `security/implementation.md` | Flujo de request seguro | request → edge → verify → handler |
| `deployment/platform.md` | Arquitectura de despliegue | CDN → Edge → Functions → DB |
| `features/{nombre}.md` | Flujo completo de la feature | trigger → componente → servicio → resultado |
| `ci-cd/{workflow}.md` | Jobs y dependencias del pipeline | push → lint → test → deploy |

#### 6.1 Formato de diagrama ASCII

Usar bloques de codigo plano con caracteres de linea:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Cliente  │────→│ Servidor │────→│    DB    │
└──────────┘     └──────────┘     └──────────┘
```

Caracteres recomendados: `┌ ┐ └ ┘ │ ─ ├ ┤ ┬ ┴ ┼ → ←`

### 7. Actualizar quickstart.md

Después de crear todos los archivos, actualizar `quickstart.md` con:
- Mapa rápido con enlaces a todos los documentos (una tabla por dominio)
- Inicio rapido (3-5 pasos para levantar el proyecto)
- Stack resumido (tecnologias principales en bullets)
- Seccion **"Funcionalidades destacadas"** con enlace a cada `features/*.md` encontrado y una linea de descripcion
- Seccion **"CI/CD"** si existe `ci-cd/`, con enlace a `ci-cd/overview.md`

### 8. Metadata de actualización

Actualizar `.last-update.json`:

```json
{
  "updatedAt": "ISO-8601",
  "command": "complete-documentation",
  "gitHead": "commit-hash",
  "filesCreated": 17,
  "directoriesCreated": 5
}
```

### 8.5 Validar links cruzados (OBLIGATORIO)

Despues de crear todos los archivos:

1. Listar todos los `.md` creados con `glob`
2. Para cada documento, extraer todos los links `[texto](path)`
3. Verificar que cada link apunta a un archivo que existe
4. Verificar que las referencias en seccion "Referencias" son reciprocas (si A referencia a B, B deberia referencia a A)
5. Corregir cualquier link roto encontrado

### 9. Metricas de completitud

Antes de finalizar, verificar TODOS estos puntos:

- [ ] `_plan.md` existe y esta actualizado
- [ ] `quickstart.md` enlaza el 100% de los documentos creados
- [ ] Todos los directorios de la estructura existen
- [ ] Cada archivo tiene contenido relevante (no plantillas vacias)
- [ ] Al menos 1 tabla por documento
- [ ] Al menos 1 diagrama ASCII en documentos de flujo/arquitectura
- [ ] Ejemplos de codigo son del proyecto real (no inventados)
- [ ] Referencias cruzadas son correctas (0 links rotos)
- [ ] Todos los archivos del proyecto referenciados en al menos 1 documento
- [ ] Cada documento tiene seccion "Referencias" con al menos 1 link
- [ ] `.last-update.json` esta actualizado con hash de commit real
- [ ] `deployment/troubleshooting.md` existe con al menos 3 entradas reales del proyecto
- [ ] Si existe `.github/workflows/` → `ci-cd/overview.md` existe y documenta todos los workflows
- [ ] Cada workflow de GitHub Actions tiene su propio documento en `ci-cd/` O esta documentado en el overview
- [ ] Si se encontraron funcionalidades destacadas → cada una tiene su archivo en `features/`
- [ ] `quickstart.md` incluye seccion "Funcionalidades destacadas" si hay features documentadas
- [ ] Ningun documento tiene secciones vacias, con "TODO" o con texto de plantilla sin sustituir
- [ ] Las tablas de funciones/componentes listan el 100% de los elementos, no solo "los principales"

## Ejemplo de uso

```
Usuario: Documenta este proyecto en /docs

Agente:
1. Lee /docs/_plan.md (o lo crea)
2. Lanza 6 explore agents en paralelo:
   - componentes, data layer, infraestructura, routing
   - .github/workflows/ para GitHub Actions
   - busqueda de funcionalidades destacadas (QR, IA, websockets, etc.)
3. Lee README.md, package.json, configs existentes
4. Extrae constantes y datos del dominio
5. Crea _plan.md con estructura (incluye ci-cd/ y features/ si aplica) y pide aprobacion
6. Crea la estructura de directorios
7. Genera cada archivo de documentacion con detalle completo
8. Para cada feature destacada: crea features/{nombre}.md
9. Para cada workflow: crea ci-cd/{workflow}.md o documenta en ci-cd/overview.md
10. Incluye diagramas ASCII obligatorios en todos los documentos de flujo
11. Actualiza quickstart.md con mapa completo + seccion features destacadas
12. Valida que todos los links internos funcionan
13. Actualiza .last-update.json
14. Reporta metricas de completitud (checklist de 17 items)
```

## Variables de configuración

| Variable | Descripción | Default |
|----------|-------------|---------|
| `wiki_dir` | Directorio de documentación | `openwiki/` |
| `language` | Idioma de la documentación | Español |
| `include_code_examples` | Incluir ejemplos de código | `true` |
| `include_diagrams` | Incluir diagramas ASCII | `true` |
| `detail_level` | Nivel de detalle | `intermedio` |

### Niveles de detalle

| Nivel | Archivos | Contenido por archivo | Ejemplos de codigo | Diagramas |
|-------|----------|----------------------|-------------------|-----------|
| basico | 8-10 | Descripcion general, sin firmas de funciones | No | Solo arquitectura |
| intermedio | 15-17 | Tablas de funciones, flujos, configuracion | Si, fragmentos clave | Todos los requeridos |
| avanzado | 20+ | Todo intermedio + edge cases, troubleshooting, decisiones ADR | Si, completos | Todos + adicionales |

## Adaptación por framework

Sin importar el framework, la documentacion debe cubrir:

- Documentar Server Components (si existen)
- Explicar routing (pages/ o app/)
- Mencionar SSR/SSG/ISR
- Documentar endpoints de API (pages/api/ o src/api/) y actions
- Documentar plugins y configuracion
- Seguridad y validaciones
- Backend (serverless o no) y base de datos (SQL/NoSQL)
- Constantes y enums del dominio
- `deployment/troubleshooting.md` con errores comunes del stack usado (obligatorio)
- `ci-cd/overview.md` con todos los workflows de GitHub Actions (si existen)
- `features/` con una entrada por funcionalidad destacada encontrada en el codigo

## Preguntas a hacer al usuario

Si el plan no esta claro, preguntar:

1. ¿Qué directorio usar para la documentación?
2. ¿Qué nivel de detalle necesitas? (básico/intermedio/avanzado)
3. ¿Hay secciones específicas que quieras incluir/excluir?
4. ¿El proyecto tiene documentación existente que respetar?
5. ¿En qué idioma debe estar la documentación?
