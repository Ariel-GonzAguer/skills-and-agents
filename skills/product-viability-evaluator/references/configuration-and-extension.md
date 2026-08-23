# Configuration and Extension

## Modify weights

Edit [config/profiles.json](../config/profiles.json), preserving the eleven stable dimension IDs and a total of 100 per profile. Then update [references/business-model-profiles.md](business-model-profiles.md) so agents understand why the profile differs.

For a one-off assessment, copy the closest profile into the assessment JSON and explain any changes. Keep changes small unless the business has a structurally different constraint. `founder_fit` must remain explicit and cannot be removed from any profile. Profile keys should match the schema's project type exactly; aliases such as `consumer` and `enterprise` are retained only as human-friendly references in the methodology.

## Modify decision policy

Policy defaults live in [config/decision-policy.json](../config/decision-policy.json) and are read by `scripts/calculate-score.mjs` at runtime. Keep their semantics aligned with the policy notes and run the complete tests after any policy change.

Do not introduce score-only verdict bands. Policy can change confidence, coverage, and deal-breaker thresholds, but the final verdict remains a reasoned decision.

## Add a business type

1. Add the type to `project.type` in `schemas/assessment.schema.json`.
2. Add a weight profile totaling 100 to `config/profiles.json`.
3. Add type-specific buyer, retention, distribution, economics, and execution questions to `references/business-model-profiles.md`.
4. Add at least one deterministic case to `tests/cases.json` and one behavioral eval to `evals/evals.json`.
5. Run `node tests/run-tests.mjs` and the Skill validator.

## Change the model per phase

This Skill never encodes model names. Each role is delegated to an agent defined at the host level, and each agent binds its own model:

1. Edit the `model` field in the matching agent file of your opencode configuration (for example `~/.config/opencode/agents/viability-skeptic.md` with `model: provider/model-id`).
2. Restart opencode so the new config is loaded.
3. Re-run the evaluation. The role to agent mapping in [config/agents.json](../config/agents.json) is unchanged.

To bind a role to a different agent instead, edit the `role_agent` mapping in `config/agents.json` and restart opencode.

## Add agents or models

Do not encode model names. Add a role in `references/multi-agent.md`, define its input and output fields, and ensure it writes source IDs into the shared assessment schema. A new role must reduce correlated error, collect different evidence, or perform deterministic verification; otherwise it only adds cost.

To expose a role to delegation:

1. Add the role to `references/multi-agent.md`.
2. Define a matching agent file at the host level with a `description` that mentions the skill and role name.
3. Add a `role_agent` entry in `config/agents.json`.

The synthesizer resolves conflicts using evidence. Never average model scores or use majority vote as a substitute for judgment.

## Extend financial models

Add optional scenario inputs to the schema and calculations to `calculateScenario`. Preserve `null` for unavailable metrics, document formulas and limitations in `references/financial-modeling.md`, and add exact arithmetic tests.

## Portability requirements

- Relative paths inside the Skill.
- No provider-specific tool names in the workflow.
- No mandatory network or subagent dependency.
- No external package dependency for scripts.
- Safe fallback when shell, web, or repository access is missing.
- UTF-8 Markdown and JSON artifacts.

## Versioning

Treat changes to dimension IDs, required schema fields, formulas, or verdict semantics as breaking changes. Weight tuning, new profiles, additional references, and new optional fields are compatible when existing assessments remain valid.
