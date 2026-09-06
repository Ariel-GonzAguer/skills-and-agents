# Instalación y uso

## Ubicación

El directorio de la Skill instalada es:

`C:\Users\arieg\.agents\skills\product-viability-evaluator`

Los agentes que descubren Skills desde `.agents/skills` pueden cargarla directamente. Un archivo `.skill` empaquetado puede copiarse a otra instalación compatible y extraerse en su directorio de Skills.

## Ejemplos de invocación

- `Evaluate this project using product-viability-evaluator.`
- `Is this SaaS worth another six months for this founder?`
- `Audit this repository as a business, not only as code.`
- `Compare these three projects by risk-adjusted return per founder hour.`
- `Evaluate this landing page, pricing, repository, and founder constraints.`

La descripción es intencionalmente amplia para dispararse sin nombrar la Skill cuando el usuario pregunta si construir, continuar, monetizar, financiar, pivotear o abandonar un proyecto.

## Inputs aceptados

Cualquier combinación de descripción, ruta de repositorio, URL, README, demo de producto, landing page, precios, analytics, entrevistas de clientes, contratos, costos, finanzas y restricciones del fundador/equipo. Los datos faltantes siguen siendo `UNKNOWN`.

## Outputs

- bloque de decisión ejecutiva;
- BUILD, VALIDATE, PIVOT, RECONSIDER o ABANDON;
- score general, confianza y cobertura de evidencia;
- análisis de dimensiones ponderadas;
- ICP, mercado, competencia, valor, producto, precios, adquisición y economía;
- escenarios pesimista, base y optimista cuando hay respaldo;
- fit del fundador, retorno sobre el tiempo, riesgos, unknowns, supuestos y registro de evidencia;
- red team obligatorio y conciliación de scores;
- hipótesis peligrosas y experimentos de validación.

## Cambiar pesos y política

Edita `config/profiles.json` y `config/decision-policy.json`, y luego sigue `references/configuration-and-extension.md`. Ejecuta los tests después de cada cambio:

```powershell
node tests/run-tests.mjs
node scripts/validate-assessment.mjs examples/minimal-assessment.json
```

## Agregar modelos o agentes

Esta Skill nunca codifica nombres de modelo. Cada fase delega a un agente definido a nivel de host (`~/.config/opencode/agents/`), y cada agente vincula su propio modelo. El mapeo vive en `config/agents.json`. Para cambiar el modelo de una fase, edita el campo `model` en el archivo de agente correspondiente y reinicia opencode. Para vincular un rol a un agente distinto, edita `config/agents.json`. Los roles intercambian el esquema de evaluación compartido y los IDs de evidencia. Nunca promedies veredictos.

## Tests

`tests/cases.json` contiene los diez arquetipos deterministas requeridos. `evals/evals.json` contiene prompts conductuales para corridas completas de agentes. La suite determinista verifica aritmética, semántica de confianza, manejo de unknowns, gates de red team y límites de veredicto esperados; no afirma probar resultados reales de mercado.

## Empaquetado

Ejecuta `node scripts/package-skill.mjs` en Windows, macOS o Linux. Windows usa PowerShell; macOS/Linux usan el comando `zip`. El archivo por defecto se escribe en el directorio hermano `dist/product-viability-evaluator.skill` bajo la raíz de Skills. Pasa un directorio de salida como primer argumento para cambiar el destino.