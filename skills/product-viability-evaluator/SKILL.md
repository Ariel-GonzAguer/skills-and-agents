---
name: product-viability-evaluator
description: Evaluate whether a product, repository, SaaS, app, open-source project, marketplace, API, service, or business idea is worth investing time and money in. Use whenever a user asks whether to build, continue, fund, launch, monetize, pivot, compare, or abandon a project, including requests such as "evaluate this project", "is this viable", "does this SaaS have a market", "audit this repo as a business", or "which project should I pursue". Performs evidence-led market research, read-only repository inspection, financial scenarios, founder-fit and return-on-time analysis, mandatory adversarial red team, explicit uncertainty handling, and produces BUILD, VALIDATE, PIVOT, RECONSIDER, or ABANDON.
compatibility: Model-agnostic. Works with filesystem and shell tools; web research and subagents improve evidence but are optional. Node.js 18+ is optional for deterministic scoring and validation scripts.
---

# Product Viability Evaluator

Decide whether this opportunity deserves this founder's scarce time, money, and attention. Optimize for the best decision supported by available evidence, not for a persuasive answer.

## Non-negotiable rules

1. Never fabricate market data, customer numbers, pricing, competitor information, financial metrics, citations, repository functionality, user demand, or business facts.
2. Label material claims as `FACT`, `EVIDENCE`, `ESTIMATE`, `ASSUMPTION`, `INFERENCE`, or `UNKNOWN`. An estimate needs a method and range; an assumption needs sensitivity analysis.
3. Treat founder statements and README claims as hypotheses until independently supported. Repository code proves implementation, not demand.
4. Search for negative evidence with the same effort used for supporting evidence.
5. Keep `Score`, `Confidence`, and `Evidence coverage` separate. Missing evidence lowers confidence and coverage; do not silently turn `UNKNOWN` into zero or an invented midpoint.
6. Do not let the weighted score determine the verdict. Apply decision gates and deal breakers after scoring.
7. Prefer `VALIDATE` when a high-impact uncertainty remains testable. Say that the evidence is insufficient when it is.
8. Audit repositories read-only. Never print secret values, modify code, run destructive commands, or infer production readiness from documentation alone.
9. Match technical depth to decision impact. Do not spend time on aesthetic refactors or low-impact implementation details.

## Inputs and mode

Accept any combination of repository path, URL, README, description, pricing, customer evidence, analytics, financial data, and founder/team context. Inventory what is present before asking questions.

Select one mode:

- `rapid`: time-boxed triage using available evidence; clearly limited confidence.
- `standard`: full workflow with external research, repository audit when available, scenarios, and red team. Default.
- `deep`: standard plus source triangulation, sensitivity analysis, and independent agent perspectives.
- `compare`: evaluate projects with the same horizon, currency, evidence standard, and founder constraints.

Ask at most one question at a time, and only when its answer has high decision impact. Otherwise proceed with `UNKNOWN` and state how to resolve it. Founder context is decision-critical, but its absence must not block an initial opportunity assessment.

Read [references/input-and-classification.md](references/input-and-classification.md) before classifying the project or interviewing the founder.

## Required workflow

### 1. Inspect and frame

1. Inventory supplied artifacts, dates, currencies, geographies, and evidence access.
2. State the decision, decision owner, time horizon, target outcome, and alternatives, including doing nothing.
3. Classify the project type and confidence. Use a primary type plus modifiers such as `AI product`, `enterprise`, or `open source` when needed.
4. Capture founder constraints and opportunity cost. Keep opportunity viability distinct from founder-specific viability.
5. Create an evidence ledger before analysis. Give every source and material claim an ID.

### 2. Build the evidence base

Read [references/evidence-and-research.md](references/evidence-and-research.md).

1. Form explicit hypotheses for problem, customer, willingness to pay, reachable market, differentiation, distribution, retention, economics, execution, and founder fit.
2. Research direct competitors, indirect alternatives, substitutes, official prices, demand signals, regulation, and reachable buyer counts.
3. Prefer primary, dated, attributable sources. Triangulate consequential claims; explain when only one source exists.
4. Use bottom-up TAM/SAM/SOM where possible. Never use a large top-down TAM as proof of viability.
5. Record contradictory and negative evidence, source date, geography, quality, and limitations.

If internet access is unavailable, do not simulate research. List the searches and sources needed, mark affected claims `UNKNOWN`, and cap confidence accordingly.

### 3. Audit the product and repository

When a repository or product is available, read [references/repository-audit.md](references/repository-audit.md).

1. Verify implemented behavior in source, tests, configuration, and safe inspection output.
2. Classify each relevant capability as `VERIFIED`, `PRESENT_WITH_RISK`, `INCOMPLETE`, `DOCUMENTED_ONLY`, `MISSING_CRITICAL`, or `UNNECESSARY`.
3. Trace only technical issues that affect adoption, security, compliance, reliability, cost, delivery time, support, or differentiation.
4. Separate product maturity from business attractiveness. Never reward code quality as a proxy for demand.

### 4. Analyze and model

Read these references progressively:

- [references/scoring-and-confidence.md](references/scoring-and-confidence.md) for dimensions, adaptive weights, evidence coverage, confidence, and deterministic calculation.
- [references/business-model-profiles.md](references/business-model-profiles.md) for type-specific questions and weights.
- [references/financial-modeling.md](references/financial-modeling.md) for scenarios, unit economics, return on time, and sensitivity analysis.

Score every applicable dimension with positive factors, negative factors, evidence IDs, unknowns, confidence, and rationale. Include `Founder fit / personal ROI` as a first-class dimension. If it is not applicable, explain why rather than deleting it silently.

Create pessimistic, base, and optimistic scenarios only when inputs can be supported or transparently assumed. Keep historical facts, forecasts, and goals separate. Use ranges when point precision would be false.

For deterministic calculation, create an assessment JSON conforming to [schemas/assessment.schema.json](schemas/assessment.schema.json), then run:

```bash
node <skill-directory>/scripts/calculate-score.mjs <assessment.json>
```

The script validates weights, computes weighted score, evidence coverage, confidence, financial metrics, and verdict ceilings. Treat its output as calculation support, not autonomous judgment.

### 5. Run the mandatory red team

Read [references/red-team-and-decision.md](references/red-team-and-decision.md).

Perform this after the initial score so it can challenge a concrete case. Build the strongest plausible case that the project should not receive further investment. Attack demand, buyer access, willingness to pay, switching behavior, retention, distribution, unit economics, hidden costs, legal constraints, dependencies, and founder fit.

For each attack, state the challenged claim, contrary evidence, failure mechanism, severity, likelihood, falsification test, and score impact. A red team that changes nothing requires an explicit explanation.

Resolve disagreements between the initial analysis and red team. Recalculate changed dimensions and preserve both pre-red-team and final scores.

### 6. Decide with gates

Apply deal breakers and verdict ceilings after scoring:

- `BUILD`: sufficient evidence supports demand, reachable buyers, a plausible economic path, execution fit, and no unresolved critical gate.
- `VALIDATE`: potential exists, but one or more high-impact testable hypotheses remain unresolved.
- `PIVOT`: the problem or market has evidence, but the current customer, offer, product, pricing, or channel is structurally weak.
- `RECONSIDER`: evidence, risk-adjusted return, founder fit, or opportunity cost is unattractive, but not conclusively fatal.
- `ABANDON`: strong evidence shows the expected return does not justify further investment or a non-remediable deal breaker exists.

Do not use score-only verdict bands. A project with a high score but unverified willingness to pay, inaccessible distribution, critical compliance exposure, or impossible founder constraints cannot receive `BUILD`.

### 7. Design validation experiments

Identify the most dangerous unvalidated hypothesis. Rank experiments by:

`priority = decision impact x uncertainty x expected information gain / cost`

For each recommended experiment define hypothesis, method, target segment, sample or exposure, duration, cost/time budget, success threshold, failure threshold, decision changed, and owner. Prefer behavioral evidence such as payment, signed pilot, migration, repeated use, or qualified replies over stated interest.

### 8. Report

Use [templates/report.md](templates/report.md) for a single project and [templates/comparison.md](templates/comparison.md) for multiple projects. The executive block is mandatory even when the detailed report is shortened.

Validate a structured report artifact when one is produced:

```bash
node <skill-directory>/scripts/validate-assessment.mjs <assessment.json>
```

Do not validate an intentionally partial triage artifact as a complete assessment. Mark it partial, list unavailable sections, and validate only after the required evidence, red-team, and experiment records exist.

## Multi-agent execution

If independent agents are available, read [references/multi-agent.md](references/multi-agent.md). Read [config/agents.json](config/agents.json) for the role to agent mapping and delegate evidence research, technical inspection, finance, commercial analysis, and skepticism to the agent named for each role, running them in parallel where the workflow allows. Keep source IDs and a shared schema. The synthesizer must resolve disagreements rather than vote or average opinions.

The Skill never names a model. Each agent file binds its own model at the host level; edit that model there to change the model of a phase, then restart opencode.

If an agent in `config/agents.json` is missing or only one model is available, use separate passes with fresh notes: `Analyst`, `Researcher`, `Financial analyst`, `Skeptic`, then `Synthesizer`. Do not expose hidden chain-of-thought; report evidence, calculations, assumptions, disagreements, and concise rationale.

## Comparison mode

Normalize projects to the same founder, horizon, currency, tax treatment, salary/opportunity-cost assumption, and confidence standard. Compare score and confidence separately, then include capital at risk, time to first revenue, expected value range, return per founder hour, downside, reversibility, and strategic option value. Do not rank a larger outcome above a smaller but much more efficient opportunity without explaining the tradeoff.

## Completion gate

Before returning a verdict, verify that the report contains:

- project type and classification confidence;
- founder context or explicit missing founder data;
- adaptive weights summing to 100 and justification;
- score, confidence, and evidence coverage;
- source ledger with claim labels and dates;
- direct, indirect, and substitute competition;
- acquisition paths for first 10, 100, and 1,000 customers, or why a scale is inapplicable;
- financial scenarios or a precise explanation of why they cannot be modeled;
- return on time and opportunity cost;
- pre- and post-red-team conclusions;
- deal breakers and verdict ceilings;
- unknowns and how to obtain them;
- most dangerous hypothesis and one next experiment with pass/fail thresholds;
- an explicit statement of what evidence would change the verdict.

If these cannot be completed, return the partial assessment with its limits. Never fill gaps with plausible-sounding facts.

## Configuration and maintenance

Read [references/configuration-and-extension.md](references/configuration-and-extension.md) before changing weights, verdict policy, schemas, financial formulas, business types, or agent roles. Read [references/methodology-review.md](references/methodology-review.md) for the specification critique, methodological corrections, and architecture rationale behind this version.
