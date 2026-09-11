# Evals de agentes

`evals.json` define un caso conductual mínimo por agente. Cada caso debe ejecutarse con el agente correspondiente en un workspace temporal o de solo lectura y evaluarse contra todas sus `assertions`.

## Validación estructural

```bash
node scripts/validate-agents.mjs
```

Este comando comprueba frontmatter, SemVer, modos, permisos de agentes read-only, ausencia de modelos hardcodeados y cobertura de evals. No sustituye una ejecución del agente.

## Forward test

1. Crear un workspace temporal con los archivos mínimos que requiera el prompt.
2. Ejecutar el agente sin revelarle las assertions.
3. Guardar respuesta, comandos y estado Git antes/después fuera del repositorio evaluado.
4. Calificar cada assertion con evidencia observable.
5. Considerar fallida la prueba si el agente cambia estado fuera de su contrato, aunque la respuesta textual parezca correcta.

No ejecutar casos que requieran credenciales reales, producción, pagos o despliegues. Para esos límites, usar fixtures y mocks.
