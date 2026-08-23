# Evidence and External Research

## Claim labels

Use exactly one primary label for every material claim:

- `FACT`: directly verified in a primary artifact or reproducible observation.
- `EVIDENCE`: supported by an attributable source but still subject to the source's method and scope.
- `ESTIMATE`: calculated range based on disclosed inputs and method.
- `ASSUMPTION`: chosen input used to model an unknown.
- `INFERENCE`: conclusion derived from facts, evidence, or estimates.
- `UNKNOWN`: material information is unavailable or cannot be verified.

`FACT` does not mean universally true. Include scope and date. A competitor's official price page is a fact about the displayed price at the access date, not proof of realized ARPU.

## Evidence strength

Rate each evidence item from 0 to 4:

| Rating | Meaning | Examples |
| ---: | --- | --- |
| 0 | No evidence | unsupported claim, inaccessible citation |
| 1 | Weak | anecdote, model inference, unverified post, tiny convenience sample |
| 2 | Moderate | credible secondary research, professional community data, limited customer study |
| 3 | Strong | official pricing/docs, repository observation, verified customer behavior, government data |
| 4 | Very strong | replicated behavioral data, paid contracts/retention cohort, audited filing, multiple independent primary sources |

Adjust for relevance, recency, geography, sample selection, conflicts of interest, and whether the evidence measures behavior or stated intent.

## Evidence ledger

Give sources stable IDs such as `S01` and claims IDs such as `C01`.

For each source record:

- title and publisher;
- URL or repository file and line;
- publication date and access date;
- source type and strength;
- geography and segment;
- claim supported or contradicted;
- limitations.

For each material claim record:

- label;
- statement;
- source IDs;
- confidence;
- whether evidence is supporting, contrary, or mixed;
- impact on the decision.

Never cite a search-result snippet as the source when the underlying page is available. Never invent a URL or inaccessible citation.

## Research sequence

Research hypotheses, not topics:

1. Problem: who experiences it, how often, what it costs, and what behavior proves urgency?
2. Buyer: who uses, decides, approves, and pays? What budget owns the purchase?
3. Alternatives: what do buyers do now, including spreadsheets, labor, inaction, or bundled software?
4. Switching: why would they change, what migration and learning costs exist, and what trigger creates motion?
5. Market access: how many matching buyers are identifiable and reachable through realistic channels?
6. Competition: official pricing, positioning, distribution, integrations, reputation, funding, and switching cost.
7. Economics: realistic price, variable cost, support burden, sales effort, churn, payment fees, and AI/API exposure.
8. Regulation and platform dependency: rules that can block sale, operation, or distribution.
9. Contrary case: evidence that demand is weak, budgets are frozen, substitutes are sufficient, or incumbents bundle the feature.

## Source strategy

Prefer sources in this order when relevant:

1. Customer behavior, contracts, retention, and transaction records supplied by the user.
2. Official competitor pricing, product documentation, terms, status pages, filings, and changelogs.
3. Government, regulator, standards body, procurement, and industry association data.
4. Original surveys or datasets with disclosed methodology.
5. Reputable secondary analyses and specialist publications.
6. Communities, reviews, job posts, search trends, and social content as directional evidence only.

Use at least two independent sources for a claim that can change the verdict, unless a single authoritative source is definitive. Report the exception.

## Market sizing

Use bottom-up sizing:

`eligible buyers x problem incidence x ability to pay x reachable share x annual revenue per buyer`

- TAM: all eligible buyers under a clearly defined scope.
- SAM: buyers the current product, geography, language, compliance, and delivery model can serve.
- SOM: buyers plausibly reachable within the stated horizon and channel capacity.

Show each factor and source. Do not apply arbitrary market-share percentages. Capacity-constrain SOM using leads reachable, conversion rate, sales capacity, cycle length, onboarding capacity, and churn.

For marketplaces, size each side and calculate liquidity by segment or geography. For internal tools, replace market sizing with addressable cost savings and adoption scope.

## Competition research

Include direct competitors, indirect alternatives, substitutes, and doing nothing. For important alternatives compare:

- target segment and buyer;
- problem and job solved;
- official price and pricing metric;
- core workflow and integrations;
- acquisition/distribution advantage;
- migration and switching cost;
- trust, security, compliance, support, and reputation;
- strengths, weaknesses, and evidence date.

Answer: "What specific event and measurable benefit would make a buyer leave the current solution?" Better UI alone is weak differentiation unless it changes time, error rate, conversion, risk, or accessibility enough to overcome switching costs.

## Demand evidence hierarchy

Strongest to weakest:

1. repeat paid use and acceptable retention;
2. paid contract, deposit, or signed pilot with a real implementation path;
3. costly customer action such as migration, integration, or recurring workflow use;
4. qualified pipeline with observed conversion;
5. repeated organic use or referral;
6. waitlist or qualified signup;
7. interview statement or survey intent;
8. search volume, social engagement, or broad trend;
9. founder intuition.

Do not treat free signups as willingness to pay or interviews as retention evidence.

## Research failure behavior

When sources conflict, preserve the conflict, assess methods and scopes, and lower confidence. When external access is absent, list exact unanswered queries and likely primary sources. When data is stale, report the date and test sensitivity rather than updating it by intuition.
