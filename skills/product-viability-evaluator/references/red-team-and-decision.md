# Red Team, Conflict Resolution, and Decision

## Red-team charter

Assume the initial viability case is wrong. Try to identify the failure mechanism before the founder spends more. Do not invent objections; every attack must be grounded in evidence, a disclosed inference, or a testable unknown.

Use a separate pass or independent agent when possible. Do not reveal private chain-of-thought. Return concise claims, evidence, tests, and impacts.

## Attack surface

### Demand and customer

- The problem is infrequent, tolerable, or solved adequately by inaction.
- Interview or signup evidence is selected, polite, or non-behavioral.
- User, buyer, approver, and payer are confused.
- Budget exists in theory but not in the target account or current cycle.
- The segment combines buyers with different needs and channels.

### Market and competition

- TAM substitutes broad category spend for reachable buyers.
- SOM ignores sales capacity, geography, regulation, or implementation limits.
- An incumbent bundles the feature or owns distribution.
- Spreadsheet, labor, agency, open source, or doing nothing is good enough.
- Switching cost exceeds incremental value.

### Product and differentiation

- Better UI does not create measurable economic value.
- The moat is an easily copied model prompt, feature, or integration.
- The workflow depends on founder-operated manual work.
- Trust, accuracy, latency, accessibility, security, or integrations block adoption.
- Product novelty is mistaken for retention.

### Monetization and acquisition

- Stated willingness to pay does not survive a payment request.
- Pricing metric conflicts with delivered value or variable cost.
- Freemium attracts non-buyers and increases support.
- First customers come from founder relationships that do not scale.
- Channel economics omit labor, sales cycle, content lag, platform fees, or saturation.

### Economics and execution

- Churn is understated or unobserved.
- CAC excludes founder time, failed leads, commissions, onboarding, or discounts.
- AI/API, support, refunds, compliance, or payment costs destroy contribution margin.
- Required runway exceeds available capital before learning arrives.
- Regulation, certification, procurement, data rights, or platform policy blocks sale.
- A single provider, platform, customer, or founder is an existential dependency.

### Founder fit and opportunity cost

- The founder avoids the binding work, usually sales, support, or operations.
- Domain credibility or network is missing and expensive to acquire.
- Weekly hours cannot support the sales cycle or service level.
- A smaller alternative has better return per hour and downside.
- Founder interest will not survive repetitive maintenance.

## Attack record

For every material attack record:

- ID and challenged claim;
- contrary evidence IDs;
- label: `FACT`, `EVIDENCE`, `ASSUMPTION`, `INFERENCE`, or `UNKNOWN`;
- failure mechanism;
- likelihood and severity;
- affected dimensions;
- score changes;
- deal-breaker implication;
- cheapest falsification test.

The red team may raise, lower, or leave a dimension unchanged. Negative evidence must have equal standing, but forced pessimism is also bias.

## Conflict resolution

When analyst and skeptic disagree:

1. State the disputed claim precisely.
2. List evidence for each position and compare scope, source quality, date, and behavioral proximity.
3. Identify whether they use different definitions, segments, horizons, or assumptions.
4. Seek one additional high-value source if tools and time allow.
5. Define a falsifiable hypothesis and threshold.
6. Re-score the affected dimensions.
7. Preserve unresolved disagreement and lower confidence.

Do not average contradictory opinions. Resolve with evidence or keep the uncertainty visible.

## Verdict gates

Check these before `BUILD`:

- Problem evidence is behavioral or otherwise strong enough for the commitment size.
- ICP, user, buyer, and payer are concrete.
- At least one reachable acquisition path has evidence or a bounded experiment.
- Pricing or willingness to pay has behavioral evidence appropriate to stage.
- Economics have a plausible path with no structural negative contribution.
- Critical product, legal, security, compliance, and dependency risks are remediable within constraints.
- Founder fit supports the binding work.
- Evidence coverage is normally at least 70 and confidence at least 60.

Early-stage projects can rarely satisfy `BUILD` for a full product. Interpret `BUILD` as permission for the next bounded commitment, such as a paid pilot or constrained MVP, and state that scope.

Use `PIVOT` only when evidence supports the problem/opportunity but rejects the current solution, segment, price, or channel. Use `RECONSIDER` when the opportunity itself or founder-specific return is weak. Use `ABANDON` only with strong negative evidence or a non-remediable blocker; lack of evidence alone normally means `VALIDATE` or `RECONSIDER`.

## Validation experiment quality

Prefer tests that expose the project to reality:

- paid pre-sale, deposit, or signed pilot;
- outbound to a defined buyer list with reply and meeting thresholds;
- migration or integration commitment;
- repeated usage and retention cohort;
- price test tied to checkout or sales call;
- concierge delivery measuring actual effort and outcome;
- channel test with tracked conversion and full cost.

Avoid vanity experiments that can pass without proving the hypothesis. A landing-page click does not prove willingness to pay. Define success and failure before running the experiment.
