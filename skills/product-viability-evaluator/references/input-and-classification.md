# Input, Decision Frame, and Classification

## Start with the decision

Define the actual decision before evaluating the object:

- Decision: build, continue, launch, fund, acquire, compare, pivot, or stop.
- Decision owner: founder, team, investor, employer, or buyer.
- Commitment under review: next experiment, MVP, launch, 12 months, or full company.
- Horizon: date by which evidence, revenue, or return is required.
- Success target: revenue, profit, users, strategic learning, community adoption, or internal savings.
- Alternatives: another project, employment, consulting, no action, or existing process.
- Reversibility: cost and time lost if the decision is wrong.

Without this frame, the same opportunity can be viable for a venture-backed team and irrational for a solo founder.

## Input inventory

Record each available item and whether it is current:

| Input | Examples | Reliability note |
| --- | --- | --- |
| Product description | pitch, README, issue, user prompt | Founder claim until verified |
| Product artifact | repository, app, demo, screenshots | Proves current behavior only when inspected |
| Customer evidence | interviews, contracts, usage, churn | Check sample, segment, date, and selection bias |
| Commercial evidence | invoices, pipeline, win/loss data | Separate booked, collected, and projected revenue |
| Financial evidence | bills, payroll, API usage, ad spend | Normalize period and currency |
| External evidence | official prices, filings, statistics | Record source, date, geography, and method |
| Founder context | time, skills, capital, channels | Self-report; still essential for fit |

Never ask for everything. Ask for the missing input most likely to change the decision. A useful question names the consequence: "What percentage of the 20 pilots used the product again after four weeks? This determines whether retention is evidence or still unknown."

## Founder and team context

Capture these fields when available:

- people and roles;
- technical and domain skills;
- sales, marketing, operations, compliance, and support experience;
- budget, runway, and maximum acceptable loss;
- weekly hours split across development, sales, marketing, support, and administration;
- target date and revenue/profit objective;
- existing audience, customer relationships, partnerships, brand, data, IP, and distribution;
- infrastructure and tooling already available;
- geography, language, legal entity, and constraints;
- risk tolerance, desired lifestyle, interest, and willingness to sell/support;
- opportunity cost and credible alternatives.

Distinguish missing founder data from poor founder fit. Missing data lowers confidence. Confirmed mismatch lowers the score and may cap the verdict.

## Project classification

Choose a primary type and optional modifiers:

- `saas_b2b`
- `saas_b2c`
- `consumer_app`
- `marketplace`
- `developer_tool`
- `open_source`
- `api`
- `ai_product`
- `agency_service`
- `ecommerce`
- `hardware_software`
- `enterprise_software`
- `internal_tool`
- `content_product`
- `community`
- `mobile_app`
- `other`
- `unknown`

Classification criteria:

1. Who pays and through what transaction?
2. Is value delivered through software, labor, content, access, transactions, or hardware?
3. Is adoption individual, team, organization, community, or two-sided?
4. Does revenue depend on subscription, usage, take rate, services, sponsorship, advertising, or internal savings?
5. Are sales, procurement, liquidity, retention, or community contribution the binding constraint?

Use modifiers for overlapping economics. An open-source developer tool with enterprise contracts can be `open_source` with `developer_tool` and `enterprise` modifiers. An AI wrapper remains an `ai_product` modifier only if AI cost, reliability, dependency, or differentiation materially affects viability.

Report classification confidence. If below 60, mark it tentative and ask one question only if different classifications would materially change weights or decision gates.

## Improve the original specification

The evaluation must correct these common methodological traps:

- Add founder fit explicitly rather than hiding it inside execution risk.
- Separate product maturity from product desirability.
- Distinguish evidence coverage from evidence quality and from model confidence.
- Evaluate retention and switching behavior, not acquisition alone.
- Include time to revenue, cash timing, runway, reversibility, and opportunity cost.
- Model taxes only when jurisdiction and business form are known; otherwise show pre-tax results.
- Treat privacy, security, compliance, and platform policy as business constraints when they can block adoption.
- Avoid false precision. Use ranges and sensitivity analysis for forecasts.
- Use gates for fatal risks instead of pretending every weakness can be averaged away.

## Mandatory, configurable, and automatable

Mandatory:

- evidence labels and source ledger;
- founder context or explicit unknowns;
- adaptive weights with rationale;
- score, confidence, and coverage kept separate;
- red team and conflict resolution;
- deal-breaker gates;
- validation experiment;
- report of unknowns and what changes the verdict.

Configurable:

- business profile and weights;
- geography, currency, horizon, tax treatment, discount rate, salary/opportunity cost;
- rapid, standard, or deep research depth;
- confidence thresholds and verdict policy;
- maximum research time and source recency;
- required return and maximum loss.

Automatable:

- weight validation and weighted score;
- confidence and evidence-coverage aggregation;
- MRR, ARR, gross margin, CAC, LTV, payback, burn, runway, break-even, and return per hour;
- schema and report completeness;
- scenario consistency and arithmetic;
- comparison table normalization.

Human or agent judgment remains necessary for source relevance, causal inference, buyer behavior, strategic fit, deal-breaker severity, and final verdict.
