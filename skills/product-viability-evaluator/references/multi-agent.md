# Model-Agnostic Multi-Agent Execution

## Shared contract

All agents write to the same assessment schema and evidence ledger. They must use stable source IDs, disclose unknowns, avoid model-specific assumptions, and never vote on the verdict.

Roles:

- `Researcher`: gathers primary and contrary external evidence; does not score beyond source implications.
- `Product/technical analyst`: performs read-only product and repository audit; does not infer demand from code quality.
- `Commercial analyst`: analyzes ICP, competition, differentiation, monetization, and acquisition.
- `Financial analyst`: checks formulas, scenarios, sensitivity, cash timing, and return on time.
- `Skeptic`: receives the initial case and attacks it independently.
- `Synthesizer`: resolves conflicts, applies gates, calculates final score, and writes the report.

## Role to agent binding

This Skill never names a model. Model selection happens at the host level: each role is delegated to an agent defined in the user's opencode configuration, and each agent binds its own model.

- The mapping lives in [config/agents.json](../config/agents.json): a `role_agent` object that pairs each role name with an agent name.
- The agents themselves are files in the host configuration (for example `~/.config/opencode/agents/viability-skeptic.md` with frontmatter `model: provider/model-id`).
- To change the model of a phase, edit the `model` field of the matching agent file. Do not edit `config/agents.json` for that; edit it only to point a role at a different agent name.
- The orchestrator delegates to the agent named in `config/agents.json`, not to a hard-coded list. If an agent is missing, fall back to the single-model sequence below and disclose the limitation.

## Parallelization

After classification and hypothesis definition, research, repository audit, and financial input preparation can run in parallel. Red team must see the initial claims and scores, so it runs after the first synthesis. Final synthesis runs last.

Do not parallelize work that would duplicate sources without purpose. Independent duplicate analysis is useful only for high-impact claims, score calibration, or adversarial review.

## Handoff format

Each agent returns:

- scope completed and limits;
- claim records with labels and source IDs;
- supporting and contrary evidence;
- unknowns ranked by decision impact;
- calculations with inputs and formulas when relevant;
- disagreements with existing claims;
- no final verdict unless assigned to synthesize.

## Independence

For a genuine second opinion, do not reveal the initial verdict or founder preference to the skeptic before it forms its attacks. It may receive the factual evidence ledger and initial claims after producing an independent risk map.

## Single-model fallback

Use separate phases and notes. Reset the role objective explicitly and prevent leakage by asking each pass to challenge the prior artifact, not to continue its prose. Separation improves discipline but does not create true independence; disclose this limitation in confidence.

## Portability

- Do not name or require a specific model.
- Treat web, browser, repository, shell, and subagent tools as capabilities discovered at runtime.
- Use relative paths inside the skill.
- Keep deterministic scripts dependency-free and optional.
- When a provider cannot run subagents, execute roles sequentially.
- When a provider cannot access the internet, produce a research plan and lower confidence rather than fabricating results.
