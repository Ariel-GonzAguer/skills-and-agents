# Scoring, Evidence Coverage, and Confidence

## Three separate measures

- `Overall score`: risk-adjusted attractiveness of the opportunity, 0-100.
- `Confidence`: how likely the assessment is directionally correct, 0-100.
- `Evidence coverage`: how much of the weighted decision surface has usable evidence, 0-100.

Confidence is not optimism. Strong evidence that a project should be abandoned can produce a low score and high confidence.

## Dimension scoring contract

Score each applicable dimension from 0 to 100. Use `null` when it cannot be scored without inventing data. Never assign 50 merely because a value is unknown.

Each dimension must include:

- `weight`: integer or decimal percentage;
- `score`: 0-100 or `null`;
- `confidence`: 0-100;
- `evidence_strength`: 0-4;
- `positive_factors`;
- `negative_factors`;
- `evidence_ids`;
- `unknowns`;
- concise rationale.

`evidence_strength: 0` means the dimension has no usable evidence. It is valid only for an unscored or explicitly provisional dimension and must not support a confident score.

Interpret scores consistently:

| Range | Interpretation |
| ---: | --- |
| 0-20 | Strong evidence against viability |
| 21-40 | Material structural weakness |
| 41-60 | Mixed, ordinary, or unresolved |
| 61-80 | Attractive with bounded weaknesses |
| 81-100 | Exceptional evidence and economics |

Problem-specific anchors:

- 0-20: nonexistent or unsupported problem;
- 21-40: inconvenience or weak urgency;
- 41-60: real but replaceable problem;
- 61-80: important recurring problem with meaningful cost;
- 81-100: critical, frequent, costly problem supported by behavior.

A claim by the founder cannot by itself justify a score above 60 in the affected dimension.

## Dimension guidance

### Problem

Frequency, severity, urgency, cost of inaction, current workaround, and behavioral evidence. Avoid double-counting market size.

### Customer

ICP specificity, user/buyer/decision-maker/payer clarity, budget, buying trigger, segment homogeneity, and access to interview or sell.

### Market

Eligible reachable buyers, growth, timing, geography, regulation, concentration, and credible SOM. Large TAM without accessibility scores poorly.

### Competition

Score attractiveness, not absence of competitors. Include direct, indirect, substitutes, incumbent distribution, switching costs, and market crowding. Competition can validate demand while reducing capture.

### Differentiation

Measurable buyer advantage and defensibility from data, distribution, workflow, integration, expertise, brand, regulation, network effects, or switching costs. Label easy, moderate, or difficult to copy.

### Product / UX

Time to value, core workflow completion, activation, reliability, trust, retention loop, and critical missing capabilities. Keep code elegance out unless it changes these outcomes.

### Monetization / pricing

Payer, value metric, willingness-to-pay evidence, packaging, price-to-value, discounting, billing fit, and revenue durability.

### Acquisition

Credible path to initial and scaled customers, channel access, conversion evidence, cycle length, sales capacity, platform dependence, and saturation.

### Economics

Contribution margin, CAC, retention/churn, LTV, payback, cash cycle, support, infrastructure, AI/API cost, and break-even. Unknown CAC and churn should prevent a high-confidence high score.

### Execution risk

This score runs positive: 100 means easy and low-risk execution; 0 means infeasible or exposed. Include technical, operational, legal, compliance, dependency, capital, support, and timing constraints.

### Founder fit / personal ROI

Skills, access, credibility, sales willingness, capital, weekly time, interest, runway, opportunity cost, return per hour, and ability to maintain the business.

## Weighted score with missing dimensions

Let `known_weight` be the sum of weights with non-null scores.

`provisional_score = sum(score x weight) / known_weight`

This avoids pretending unknown means bad. However, it can make a sparse evaluation look deceptively strong, so always publish:

`evidence_coverage = known_weight / total_weight x 100`

Do not issue `BUILD` when evidence coverage is below 70. Below 50, normally cap at `VALIDATE` or `RECONSIDER` depending on whether the missing evidence is cheaply testable and whether the observed case remains attractive.

## Confidence calculation

Dimension confidence reflects source quality, triangulation, relevance, recency, sample quality, and causal proximity. Suggested anchors:

- 0-20: speculation or contradictory unknowns;
- 21-40: weak directional evidence;
- 41-60: usable but limited evidence;
- 61-80: multiple relevant sources or verified behavior;
- 81-100: strong repeated behavioral or authoritative evidence.

Compute:

`weighted_dimension_confidence = sum(confidence x weight for scored dimensions) / known_weight`

`overall_confidence = 0.7 x weighted_dimension_confidence + 0.3 x evidence_coverage`

Then apply disclosed penalties, normally 0-20 total, for stale evidence, unresolved contradictions, non-independent sources, severe selection bias, missing founder context, or no external research when it was needed. Do not apply a penalty merely because the score is low.

## Red-team adjustment

Store both `pre_red_team_score` and final dimension scores. The final weighted score comes from final scores, not from an arbitrary global subtraction. Every changed dimension needs an attack ID and rationale.

If the red team finds a cross-cutting issue that cannot be assigned to one dimension, record a transparent `global_adjustment` between -10 and 0. Use it sparingly because dimension changes are easier to explain.

## Deal breakers and verdict ceilings

Deal breakers override averaging. Examples:

- legal or compliance prohibition without a feasible remedy;
- no credible buyer access within runway;
- unit economics structurally negative at plausible scale;
- required capital exceeds accessible capital;
- founder cannot perform or fund the binding activity;
- platform or supplier dependency creates unacceptable existential exposure;
- severe security/privacy gap blocks the target buyer and cannot be remediated in time;
- behavioral evidence strongly rejects the core value proposition.

Each deal breaker includes status `open`, `mitigated`, or `accepted`, severity, evidence IDs, remediation, and verdict ceiling. Typical ceilings:

- unresolved critical: `VALIDATE`, `RECONSIDER`, or `ABANDON` depending on falsifiability and evidence;
- unresolved high: no `BUILD`;
- missing willingness-to-pay or retention evidence: normally no `BUILD`;
- low founder fit with no delegation plan: no `BUILD` for this founder, even if opportunity viability is high.

## Verdict is a judgment, not a band

Use the score as one input. Explain why the selected verdict is preferable to adjacent verdicts. A 72 with low coverage and an untested acquisition channel can be `VALIDATE`; a 58 with high confidence, strong niche economics, low downside, and excellent founder fit can be `BUILD` for a constrained micro-business.
