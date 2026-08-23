# Methodology Review and Architecture Rationale

## Phase 1: Critical review of the specification

The original specification correctly rejects technical-quality bias, requires founder context, external evidence, scenarios, and an adversarial review. Its main methodological weaknesses were:

1. Founder fit and return on time were mandatory in prose but absent from the initial weighted dimensions.
2. It did not define how `UNKNOWN` affects scoring, creating pressure to invent values, assign arbitrary midpoints, or punish missing evidence as failure.
3. Score and confidence were required but evidence coverage was not, so a high score based on a small known subset could look complete.
4. The requested evidence labels omitted `ESTIMATE`, despite requiring financial and market estimates.
5. The score-to-verdict relationship was rejected conceptually but no explicit gate mechanism was defined.
6. `PIVOT` and `RECONSIDER` can overlap unless the object of failure is defined: current offer versus opportunity/founder return.
7. Financial formulas were subscription-heavy and needed model-specific alternatives plus cash timing, runway, working capital, and cohort caveats.
8. Acquisition milestones of 10, 100, and 1,000 do not fit enterprise, high-ticket services, internal tools, or some marketplaces without equivalent milestones.
9. Multi-agent roles risk correlated agreement, duplicate research, and score averaging unless they share evidence IDs and resolve conflicts explicitly.
10. Ten realistic business outcomes cannot be proven by deterministic tests alone because market truth requires real evidence; testing must separate arithmetic invariants from model behavior and human judgment.

## Phase 2: Improvements applied

- Added `Founder fit / personal ROI` as an eleventh dimension.
- Added `Evidence coverage` as a separate metric.
- Defined null scoring: unknown dimensions are excluded from the provisional weighted score but reduce coverage and verdict permissions.
- Added `ESTIMATE` and required method, range, and sensitivity.
- Added deal breakers and verdict ceilings after scoring.
- Defined `PIVOT` as evidence for the opportunity but rejection of the current offer, segment, price, product, or channel.
- Defined `RECONSIDER` as weak risk-adjusted opportunity or founder-specific return.
- Interpreted `BUILD` as authorization for a bounded next commitment, not unconditional scale.
- Added behavior-based demand evidence hierarchy and equal treatment of contrary evidence.
- Added model-specific economics for marketplaces, e-commerce, hardware, services, APIs/AI, open source, and internal tools.
- Added return per founder hour, time to revenue, capital at risk, reversibility, and opportunity cost.
- Added safe repository inspection statuses that distinguish code, tests, docs, and missing business-critical behavior.
- Added structured conflict resolution instead of voting or averaging agents.

## Phase 3: Architecture

The package uses progressive disclosure:

1. `SKILL.md`: runtime contract, phases, gates, and required references.
2. `references/`: detailed methodology loaded only for the active phase or business type.
3. `schemas/`: portable assessment contract.
4. `config/`: editable weight profiles and decision policy.
5. `scripts/`: dependency-free deterministic math and completeness validation.
6. `templates/`: full report and project comparison output.
7. `tests/`: synthetic scoring and gate regressions.
8. `evals/`: behavioral prompts for agent-level evaluation.
9. `examples/`: a complete but explicitly synthetic assessment.

This split keeps the activation context short while preserving rigorous details. Scripts calculate only what can be deterministic; they do not decide source credibility or market truth.

## Mandatory elements

- evidence labels and source ledger;
- adaptive weights with founder fit;
- score, confidence, and coverage separation;
- repository claims verified beyond README when access exists;
- financial uncertainty and scenario disclosure;
- mandatory red team after initial scoring;
- deal-breaker gates;
- most dangerous hypothesis and behavioral validation experiment;
- explicit evidence that would change the verdict.

## Configurable elements

- business profile and weights;
- research mode, time budget, recency, geography, and source requirements;
- currency, horizon, tax basis, founder time cost, target return, and maximum loss;
- confidence and coverage thresholds;
- business-specific financial fields and milestone scales;
- multi-agent roles and execution order.

## Automatable elements

- weight totals, weighted score, confidence, and coverage;
- arithmetic for common financial metrics;
- scenario completeness and null propagation;
- deal-breaker ceilings and verdict consistency;
- schema, evidence-reference, and experiment completeness;
- synthetic regression cases and cross-model behavioral eval structure.

## Bias controls

- Confirmation bias: mandatory contrary evidence and red team.
- Builder bias: technical quality isolated from demand and monetization.
- TAM bias: bottom-up reachable market and capacity-constrained SOM.
- Survivorship bias: seek failed alternatives and negative reviews, not only winners.
- Precision bias: ranges, nulls, sensitivity, and coverage.
- Founder attachment: opportunity viability and founder-specific viability reported separately.
- Automation bias: scripts cannot issue a final verdict; gates only constrain it.
- Pessimism theater: red-team attacks require evidence or falsifiable inference and may leave scores unchanged with explanation.

## Known limitations

- No prompt can guarantee truthful research when tools or source access are weak.
- Cross-model agreement does not prove correctness; correlated training data can reproduce the same error.
- Synthetic fixtures validate formulas and policy, not real-world market outcomes.
- Forecasts remain conditional on customer behavior and external conditions.
- A repository audit cannot prove production behavior without suitable runtime access and safe tests.
