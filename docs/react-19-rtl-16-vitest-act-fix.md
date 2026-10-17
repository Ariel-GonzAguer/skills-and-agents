# Fix: `React.act is not a function` con React 19, @testing-library/react 16 y Vitest

**Fecha**: 2026-08-28
**Contexto**: proyecto `ariel-personal` (Waku 1 beta + React 19.2.8 + TypeScript + Vitest 4.1.11)
**Síntoma**: todos los tests de componentes client fallaban con `TypeError: React.act is not a function`
**Solución**: forzar `NODE_ENV=test` en `vitest.config.ts`
**Downgrade de React**: NO fue necesario

---

## TL;DR

El shell en el que corría vitest tenía `NODE_ENV=production` (filtrado desde builds o deploys previos). React 19 solo expone `act` en el build de desarrollo. Al heredar `NODE_ENV=production`, vitest cargaba el build de React sin `act`, y el bundle pre-compilado de `@testing-library/react@16` lo buscaba en `react-dom/test-utils` (donde ya no existe). Una línea en `vitest.config.ts` lo arregla:

```ts
test: {
  env: { NODE_ENV: 'test' },
}
```

---

## Síntomas exactos

Tests que **antes** del fix fallaban:

```
FAIL  src/components/Hero/Hero.test.tsx > Hero > renderiza la sección
FAIL  src/components/IA/IA.test.tsx > IA > muestra el posicionamiento
FAIL  src/components/Contacto/Contacto.test.tsx > Contacto > renderiza la sección
... (11 archivos en total, 42 tests fallando)
```

Error en cada uno:

```
TypeError: React.act is not a function
 ❯ exports.act node_modules/.../react-dom/cjs/react-dom-test-utils.production.js:20:16
 ❯ node_modules/.../@testing-library/react/dist/act-compat.js:46:25
 ❯ renderRoot node_modules/.../@testing-library/react/dist/pure.js:189:26
```

Warning adicional en consola (deprecation notice):

```
`ReactDOMTestUtils.act` is deprecated in favor of `React.act`.
Import `act` from `react` instead of `react-dom/test-utils`.
See https://react.dev/warnings/react-dom-test-utils for more info.
```

Después del fix: **19 archivos de test, 93 tests pasando, 0 fallando**.

---

## Causa raíz (técnica)

### 1. React 19 movió `act` de lugar

- **React 18 y anteriores**: `act` vivía en `react-dom/test-utils`.
- **React 19**: `act` se movió a `react` directamente. El export desde `react-dom/test-utils` se mantiene por compatibilidad pero emite un deprecation warning.

Referencia oficial: <https://react.dev/reference/react/act>

### 2. `act` solo existe en el build de desarrollo de React

Esto es la clave que nadie menciona en la mayoría de issues:

```js
// node_modules/react/index.js
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.js');  // NO exporta `act`
} else {
  module.exports = require('./cjs/react.development.js'); // SÍ exporta `act`
}
```

Confirmado empíricamente:

```bash
$ node -e "console.log(typeof require('react').act)"
undefined  # con NODE_ENV=production (o sin setear, en este shell)
function   # con NODE_ENV=test o development
```

### 3. Vitest hereda `NODE_ENV` del shell

Vitest no setea `NODE_ENV` por sí mismo; lee el del proceso padre. Si el shell tiene `NODE_ENV=production` (común en máquinas de desarrollo donde se corre `pnpm build` o `pnpm deploy` antes de los tests), vitest arranca con ese valor y React carga el build de producción.

### 4. `@testing-library/react@16` resuelve `act` dentro de su propio bundle

El bundle pre-compilado de RTL tiene esto (simplificado):

```js
// @testing-library/react/dist/act-compat.js (built, no editable)
const ReactDOMTestUtils = require('react-dom/test-utils');
// ...
exports.act = ReactDOMTestUtils.act;  // ← falla si React está en build de producción
```

Esto significa que **ningún alias ni shim en `vitest.config.ts` puede interceptar esa resolución**, porque ya viene resuelta en el bundle de RTL.

### Por qué los issues en GitHub no lo dejan claro

- [#1392](https://github.com/testing-library/react-testing-library/issues/1392) — el autor dice "works locally but fails in CI". El problema: en su shell local tenía `NODE_ENV` distinto al de CI.
- [#1399](https://github.com/testing-library/react-testing-library/issues/1399) — el mantenedor de RTL cierra el issue diciendo: *"Why do you have NODE_ENV set to production? This is only useful for e2e environments where act isn't really needed. act isn't exported in production mode and this is a React definition, not a Testing-Library decision."*

Esa última frase es la respuesta: **es decisión de React, no de RTL**. React simplemente no exporta `act` en producción.

---

## Solución aplicada

### Cambio en `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    // Forzar NODE_ENV=test garantiza que React cargue el build de desarrollo,
    // que sí expone `act`. Sin esto, si el shell tiene NODE_ENV=production
    // (común en proyectos con pnpm build o deploys), vitest hereda ese
    // valor y los tests de componentes fallan con
    // `TypeError: React.act is not a function`.
    //
    // Referencia: https://github.com/testing-library/react-testing-library/issues/1399
    env: {
      NODE_ENV: 'test',
    },
    pool: 'threads',
    poolOptions: {
      threads: { singleThread: true },
    },
  },
});
```

### Por qué no se intentó el upgrade a `@testing-library/react@17`

**No existe v17 todavía**. La última versión estable al 2026-08-28 es `16.3.3` (publicada el mismo día). El equipo de RTL no ha anunciado v17.

### Por qué no se intentó el downgrade de React

El usuario lo pidió explícitamente: **"no haga downgrade a react"**. Y la solución no lo requería.

### Cambios complementarios

Un test pre-existente en `src/components/IA/IA.test.tsx` se rompía por una razón diferente: el assert `"muestra los tres tipos de experiencia con IA"` usaba `getByText`, pero al agregar el proyecto `ai-code-reviewer` (también con `tipo: 'Producto con IA'`) ahora hay 2 elementos con ese texto. Se actualizó a `getAllByText` con una aserción más flexible: "cada tipo único presente en `proyectosIA` aparece al menos una vez".

---

## Approaches que NO funcionaron (documentados para no repetir)

### ❌ Shims de `react-dom/test-utils`

Crear un archivo `src/__tests__/shims/react-dom-test-utils.ts`:

```ts
export { act } from 'react';
```

Y aliasarlo en `vitest.config.ts`:

```ts
resolve: {
  alias: {
    'react-dom/test-utils': './src/__tests__/shims/react-dom-test-utils.ts',
  },
},
```

**Por qué falla**: el bundle de `@testing-library/react` ya tiene `require('react-dom/test-utils')` resuelto en su propio JS compilado. El alias de vitest no intercepta los `require` internos de un módulo ya cargado.

### ❌ Patches en `setup.ts` con `require` síncrono

```ts
// setup.ts
const rdt = require('react-dom/test-utils');
if (!rdt.act && typeof React.act === 'function') {
  rdt.act = React.act;
}
```

**Por qué falla**: el proyecto usa ESM (`"type": "module"` en `package.json`). En ESM, los `require` síncronos no se pueden inyectar de forma confiable antes de que vitest cargue el bundle de RTL.

### ❌ Alias de `react` y `react-dom` a sus entry points

```ts
resolve: {
  alias: {
    '^react$': './node_modules/.pnpm/react@19.2.8/node_modules/react/index.js',
  },
}
```

**Por qué falla**: el `index.js` ya decide según `NODE_ENV`. Si `NODE_ENV=production` (el problema raíz), sigue cargando el build de producción. El alias no cambia el valor de `NODE_ENV`, solo la ruta.

---

## Verificación de la solución

### Antes del fix

```
 Test Files  11 failed | 4 passed (15)
      Tests  42 failed | 24 passed (66)
```

### Después del fix

```
 Test Files  19 passed (19)
      Tests  93 passed (93)
```

### Comandos de validación

```bash
pnpm test         # 93/93 pasan
pnpm lint         # limpio
pnpm build        # 5 archivos generados, sin errores
pnpm audit        # 0 vulnerabilidades
```

---

## Lecciones aprendidas

### 1. El entorno importa tanto como la configuración

El error no era del código, ni de las versiones, ni de la configuración de vitest propiamente dicha. Era una variable de entorno heredada del shell. **Siempre verificar `NODE_ENV` antes de debuggear issues raros con React 19**.

### 2. El bundle de una dependencia puede absorber el problema

RTL empaqueta su `act-compat` en el bundle de distribución, así que no hay forma de interceptar la resolución desde fuera sin hacer override del bundle. **Cuando una dependencia está bien mantenida pero algo "no debería fallar" falla, mirar variables de entorno antes que el código de la dependencia**.

### 3. El warning de deprecation es la pista

El warning *"ReactDOMTestUtils.act is deprecated in favor of React.act"* está diciendo dos cosas: (1) el código está usando la API vieja, y (2) la API vieja está rota en producción. La primera parte es cosmetic, la segunda es el bug real.

### 4. Los issues cerrados en GitHub a veces tienen la respuesta

El issue #1399 fue cerrado sin resolución, pero el comentario del mantenedor contiene la respuesta completa: *"act isn't exported in production mode"*. **Buscar comentarios de maintainers en issues cerrados, no solo en abiertos**.

---

## Variables de entorno relacionadas que vale la pena conocer

| Variable | Efecto en React | Efecto en Vitest |
|---|---|---|
| `NODE_ENV=production` | Carga build sin `act`, sin devtools, sin warnings | Vitest hereda el valor |
| `NODE_ENV=test` | Carga build dev con `act` | Valor por defecto de vitest (si el shell no lo fuerza) |
| `NODE_ENV=development` | Igual que `test` para React | Vitest no distingue; usa `test` internamente |
| `IS_REACT_ACT_ENVIRONMENT=true` | Habilita verificaciones de `act` en runtime | Vitest no setea esto por default en jsdom |

Si se quiere ser explícito, se puede agregar `IS_REACT_ACT_ENVIRONMENT: 'true'` también en `env:`, aunque con `NODE_ENV=test` ya viene implícito en React 19.

---

## Referencias

- **React 19 docs — `act`**: <https://react.dev/reference/react/act>
- **Issue RTL #1399 (cerrado con la respuesta)**: <https://github.com/testing-library/react-testing-library/issues/1399>
- **Issue RTL #1392 (caso similar en CI)**: <https://github.com/testing-library/react-testing-library/issues/1392>
- **React 19 deprecation warning**: <https://react.dev/warnings/react-dom-test-utils>
- **npm `@testing-library/react`**: <https://www.npmjs.com/package/@testing-library/react> (última versión estable al 2026-08-28: 16.3.3)
- **Vitest config — `env`**: <https://vitest.dev/config/#env>

---

## Cómo reproducir el bug (para verificación futura)

```bash
# 1. En un shell con NODE_ENV=production (o sin setear, en máquinas con .env de prod)
echo $NODE_ENV
# production

# 2. Instalar React 19 + RTL 16 + Vitest (cualquier setup estándar)
pnpm add react@19 react-dom@19
pnpm add -D @testing-library/react@16 @testing-library/jest-dom vitest

# 3. Crear un test cualquiera
cat > Foo.test.tsx <<EOF
import { render, screen } from '@testing-library/react';
test('renders', () => {
  render(<div>Hello</div>);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
EOF

# 4. Correr tests
pnpm test

# 5. Observar: TypeError: React.act is not a function

# 6. Solución: agregar env: { NODE_ENV: 'test' } en vitest.config.ts
```

---

## Mantenido por

- **Ariel GonzAgüer** — <https://gatorojolab.com>
- **Contexto original**: proyecto `ariel-personal/ariel-personal`, feature `feature/ai-code-reviewer`
- **Fecha del fix**: 2026-08-28
