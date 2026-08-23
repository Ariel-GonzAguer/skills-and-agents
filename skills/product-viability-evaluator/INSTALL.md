# Installation and Use

## Location

The installed Skill directory is:

`C:\Users\arieg\.agents\skills\product-viability-evaluator`

Agents that discover Skills from `.agents/skills` can load it directly. A packaged `.skill` archive can be copied to another compatible installation and extracted into its Skills directory.

## Invocation examples

- `Evaluate this project using product-viability-evaluator.`
- `Is this SaaS worth another six months for this founder?`
- `Audit this repository as a business, not only as code.`
- `Compare these three projects by risk-adjusted return per founder hour.`
- `Evaluate this landing page, pricing, repository, and founder constraints.`

The description is intentionally broad enough to trigger without naming the Skill when the user asks whether to build, continue, monetize, fund, pivot, or abandon a project.

## Accepted inputs

Any combination of description, repository path, URL, README, product demo, landing page, pricing, analytics, customer interviews, contracts, costs, financials, and founder/team constraints. Missing data remains `UNKNOWN`.

## Outputs

- executive decision block;
- BUILD, VALIDATE, PIVOT, RECONSIDER, or ABANDON;
- overall score, confidence, and evidence coverage;
- weighted dimension analysis;
- ICP, market, competition, value, product, pricing, acquisition, and economics;
- pessimistic, base, and optimistic scenarios when supportable;
- founder fit, return on time, risks, unknowns, assumptions, evidence ledger;
- mandatory red team and score reconciliation;
- dangerous hypotheses and validation experiments.

## Change weights and policy

Edit `config/profiles.json` and `config/decision-policy.json`, then follow `references/configuration-and-extension.md`. Run tests after every change:

```powershell
node tests/run-tests.mjs
node scripts/validate-assessment.mjs examples/minimal-assessment.json
```

## Add models or agents

This Skill never encodes model names. Each phase delegates to an agent defined at the host level (`~/.config/opencode/agents/`), and each agent binds its own model. The mapping lives in `config/agents.json`. To change the model of a phase, edit the `model` field in the matching agent file and restart opencode. To bind a role to a different agent, edit `config/agents.json`. Roles exchange the shared assessment schema and evidence IDs. Never average verdicts.

## Tests

`tests/cases.json` contains the ten required deterministic archetypes. `evals/evals.json` contains behavioral prompts for full agent runs. The deterministic suite verifies arithmetic, confidence semantics, unknown handling, red-team gates, and expected verdict ceilings; it does not claim to prove real market outcomes.

## Package

Run `node scripts/package-skill.mjs` on Windows, macOS, or Linux. Windows uses PowerShell; macOS/Linux use the `zip` command. The default archive is written to the sibling `dist/product-viability-evaluator.skill` directory under the Skills root. Pass an output directory as the first argument to change the destination.
