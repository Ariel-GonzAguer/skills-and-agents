# React 19 + @testing-library/react 16 + Vitest: `React.act is not a function`

## El Problema

Todos los tests de componentes client fallaban con:

```
TypeError: React.act is not a function
 ❯ exports.act node_modules/.../react-dom/cjs/react-dom-test-utils.production.js:20:16
 ❯ node_modules/.../@testing-library/react/dist/act-compat.js:46:25
 ❯ renderRoot node_modules/.../@testing-library/react/dist/pure.js:189:26
```

Warning adicional en consola:

```
`ReactDOMTestUtils.act` is deprecated in favor of `React.act`.
Import `act` from `react` instead of `react-dom/test-utils`.
```

## La Causa Raíz

### 1. React 19 movió `act` de lugar

- **React 18 y anteriores**: `act` vivía en `react-dom/test-utils`.
- **React 19**: `act` se movió a `react` directamente. El export desde `react-dom/test-utils` se mantiene por compatibilidad pero emite un deprecation warning.

### 2. `act` solo existe en el build de desarrollo de React

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
undefined  # con NODE_ENV=production
function   # con NODE_ENV=test o development
```

### 3. Vitest hereda `NODE_ENV` del shell

Vitest no setea `NODE_ENV` por sí mismo; lee el del proceso padre. Si el shell tiene `NODE_ENV=production` (común en máquinas donde se corre `pnpm build` o `pnpm deploy` antes de los tests), vitest arranca con ese valor y React carga el build de producción.

### 4. `@testing-library/react@16` resuelve `act` dentro de su propio bundle

```js
// @testing-library/react/dist/act-compat.js (built, no editable)
const ReactDOMTestUtils = require('react-dom/test-utils');
exports.act = ReactDOMTestUtils.act;  // ← falla si React está en build de producción
```

**Ningún alias ni shim en `vitest.config.ts` puede interceptar esa resolución**, porque ya viene resuelta en el bundle de RTL.

## La Solución

Forzar `NODE_ENV=test` en `vitest.config.ts`:

```ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    // Forzar NODE_ENV=test garantiza que React cargue el build de desarrollo,
    // que sí expone `act`. Sin esto, si el shell tiene NODE_ENV=production
    // (común en proyectos con pnpm build o deploys), vitest hereda ese
    // valor y los tests de componentes fallan.
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

## Verificación

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
pnpm build        # sin errores
pnpm audit        # 0 vulnerabilidades
```

## Approaches que NO funcionaron

### ❌ Shims de `react-dom/test-utils`

Crear un archivo shim y aliasearlo en `vitest.config.ts`:

```ts
resolve: {
  alias: {
    'react-dom/test-utils': './src/__tests__/shims/react-dom-test-utils.ts',
  },
}
```

**Por qué falla**: el bundle de `@testing-library/react` ya tiene `require('react-dom/test-utils')` resuelto en su propio JS compilado. El alias de vitest no intercepta los `require` internos de un módulo ya cargado.

### ❌ Patches en `setup.ts` con `require` síncrono

```ts
const rdt = require('react-dom/test-utils');
if (!rdt.act && typeof React.act === 'function') {
  rdt.act = React.act;
}
```

**Por qué falla**: el proyecto usa ESM (`"type": "module"`). En ESM, los `require` síncronos no se pueden inyectar de forma confiable antes de que vitest cargue el bundle de RTL.

### ❌ Alias de `react` a sus entry points

```ts
resolve: {
  alias: {
    '^react$': './node_modules/.pnpm/react@19.2.8/node_modules/react/index.js',
  },
}
```

**Por qué falla**: el `index.js` ya decide según `NODE_ENV`. Si `NODE_ENV=production`, sigue cargando el build de producción. El alias no cambia el valor de `NODE_ENV`.

## Variables de entorno relacionadas

| Variable | Efecto en React | Efecto en Vitest |
|---|---|---|
| `NODE_ENV=production` | Carga build sin `act`, sin devtools, sin warnings | Vitest hereda el valor |
| `NODE_ENV=test` | Carga build dev con `act` | Valor por defecto de vitest (si el shell no lo fuerza) |
| `NODE_ENV=development` | Igual que `test` para React | Vitest no distingue; usa `test` internamente |
| `IS_REACT_ACT_ENVIRONMENT=true` | Habilita verificaciones de `act` en runtime | Vitest no setea esto por default en jsdom |

## Lecciones Aprendidas

1. **El entorno importa tanto como la configuración** — El error no era del código ni de las versiones, era una variable de entorno heredada del shell. Siempre verificar `NODE_ENV` antes de debuggear issues raros con React 19.

2. **El bundle de una dependencia puede absorber el problema** — RTL empaqueta su `act-compat` en el bundle de distribución, así que no hay forma de interceptar la resolución desde fuera. Cuando una dependencia está bien mantenida pero algo "no debería fallar" falla, mirar variables de entorno antes que el código de la dependencia.

3. **El warning de deprecation es la pista** — El warning dice dos cosas: (1) el código está usando la API vieja, y (2) la API vieja está rota en producción. La primera parte es cosmética, la segunda es el bug real.

4. **Los issues cerrados en GitHub a veces tienen la respuesta** — El issue #1399 fue cerrado sin resolución, pero el comentario del mantenedor contiene la respuesta completa: *"act isn't exported in production mode"*.

## Referencias

- [React 19 docs — `act`](https://react.dev/reference/react/act)
- [Issue RTL #1399 (cerrado con la respuesta)](https://github.com/testing-library/react-testing-library/issues/1399)
- [Issue RTL #1392 (caso similar en CI)](https://github.com/testing-library/react-testing-library/issues/1392)
- [React 19 deprecation warning](https://react.dev/warnings/react-dom-test-utils)
- [Vitest config — `env`](https://vitest.dev/config/#env)
