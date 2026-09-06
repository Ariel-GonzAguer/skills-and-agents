# Plantilla de reporte

Usa esta estructura. Omite secciones opcionales vacías, pero nunca omitas verificación fallida u omitida.

```markdown
# Revisión Waku + Convex + Netlify

## Veredicto
LISTO PARA PREVIEW | LISTO PARA PRODUCCIÓN | BLOQUEADO | DESPLEGADO

Un párrafo que indique qué se verificó y el riesgo restante más alto.

## Hallazgos

### CRÍTICO
- `ruta/archivo.ts:línea` Hallazgo, impacto, evidencia y corrección requerida.

### ALTO
- `ruta/archivo.ts:línea` Hallazgo, impacto, evidencia y corrección requerida.

### MEDIO
- `ruta/archivo.ts:línea` Hallazgo, impacto, evidencia y recomendación.

### BAJO
- `ruta/archivo.ts:línea` Hallazgo y recomendación.

## Correcciones aplicadas
- `ruta/archivo.ts` Qué cambió y por qué.

## Verificación
| Puerta | Comando/verificación | Resultado |
| --- | --- | --- |
| Generación de Convex | `...` | PASS/FAIL/SKIPPED |
| Typecheck | `...` | PASS/FAIL/SKIPPED |
| Tests | `...` | PASS/FAIL/SKIPPED |
| Lint | `...` | PASS/FAIL/SKIPPED |
| Auditoría de dependencias/secretos | `...` | PASS/FAIL/SKIPPED |
| Dry run de Convex | `...` | PASS/FAIL/SKIPPED |
| Build de producción de Netlify | `...` | PASS/FAIL/SKIPPED |
| Smoke test de preview | URL y verificaciones | PASS/FAIL/SKIPPED |
| Smoke test de producción | URL y verificaciones | PASS/FAIL/SKIPPED |

## Despliegue
- Destino Netlify: nombre/ID, sin credenciales.
- Destino Convex: nombre/tipo de despliegue, sin key.
- Revisión de Git: rama y commit.
- URL de preview: ...
- URL de producción: ...
- Despliegue parcial: ninguno o servicio exacto cambiado.
- Estado de rollback: no necesario, disponible, ejecutado o bloqueado.

## Contrato de entorno
Lista los nombres de variables requeridas, propietario, contexto, visibilidad y scope. Nunca incluyas valores.

## Riesgos restantes
- Riesgo, motivo por el que permanece y próxima acción.
```

Si no quedan hallazgos, declara explícitamente que no quedan hallazgos confirmados e identifica las limitaciones residuales de los tests, como credenciales no disponibles o verificación en navegador desplegado omitida.