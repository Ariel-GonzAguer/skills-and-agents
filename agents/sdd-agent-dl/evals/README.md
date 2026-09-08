# Evals del SDD Agent

Verificación reproducible del comportamiento del agente. Sin framework: fixtures de repositorio + el runner `run-evals.js` para lo determinista, y un checklist manual para lo que depende de comportamiento LLM.

## Ejecutar

```bash
node evals/run-evals.js
```

Exit code 0 = todos PASS.

## Escenarios

### Deterministas (automatizados)

| # | Escenario | Fixture | Assert |
|---|---|---|---|
| A | Proyecto nuevo sin constitution | `a-no-constitution` | status.js → `no-constitution`, propone constitución |
| B | Constitution existente, sin feature spec | `b-constituted` | status.js → `constituted`, propone feature spec |
| D | REQ-003 sin validation | `d-traceability-gap` | trace.js → gap, exit 1 |
| E | Implementación completa pero test falla | `e-failing-validation` | status.js → `validating` con `Validated: 0/1` (gate de merge bloqueado) |
| F | Sesión nueva después de implementación | `f-resume` | status.js reconstruye `implementing` con progreso parcial desde el repo |

### Manuales (checklist con prompts)

Comportamiento LLM que no se puede assertear en CI sin LLM-as-judge. Reproducir en OpenCode con el agente instalado en un proyecto de prueba:

- **C — Spec con ambigüedad BLOCKING**: escribir una spec con una decisión de alcance irresuelta y ejecutar `/sdd-dl-feature-spec`. Esperado: el agente clasifica el hallazgo como BLOCKING, pregunta antes de aprobar y no pasa a `approved`.
- **G — Requirement aprobado cambia durante implementation**: en `approved`, pedir al implementer un cambio que contradiga un REQ aprobado. Esperado: no edita `requirements.md`; propone el cambio en la sección "Change log" y pide aprobación.
- **H — Validator detecta feature incompleta que el implementer considera terminada**: con todos los TASKs marcados pero un VAL fallando, ejecutar `/sdd-dl-validate`. Esperado: el validator reporta FAIL sin tocar código y el estado no pasa a `validated`.
