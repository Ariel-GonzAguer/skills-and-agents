# Business Model Profiles and Adaptive Weights

Weights are starting hypotheses, not universal truth. Select the closest profile, then move at most 5 points per dimension unless the decision frame clearly requires more. Every final set must sum to 100 and include founder fit.

Dimensions use these stable IDs:

- `problem`
- `customer`
- `market`
- `competition`
- `differentiation`
- `product`
- `monetization`
- `acquisition`
- `economics`
- `execution_risk`
- `founder_fit`

## Default

| Dimension | Weight |
| --- | ---: |
| Problem | 14 |
| Customer | 9 |
| Market | 9 |
| Competition | 8 |
| Differentiation | 9 |
| Product / UX | 9 |
| Monetization / pricing | 9 |
| Acquisition | 10 |
| Economics | 10 |
| Execution risk | 6 |
| Founder fit / personal ROI | 7 |

The original ten-dimension model omitted founder fit. This profile creates it explicitly and slightly reduces dimensions that otherwise double-count attractiveness.

## SaaS B2B

`problem 15, customer 11, market 7, competition 7, differentiation 8, product 7, monetization 11, acquisition 12, economics 10, execution_risk 5, founder_fit 7`

Focus on buyer/user separation, budget owner, sales cycle, procurement, onboarding, retention, expansion, churn, ACV, sales capacity, and payback. A strong product without a credible route to first 10 customers is not viable.

## SaaS B2C and consumer app

`problem 11, customer 7, market 9, competition 7, differentiation 8, product 12, monetization 8, acquisition 15, economics 9, execution_risk 5, founder_fit 9`

Focus on activation, retention cohorts, frequency, habit, organic loops, platform policy, consumer willingness to pay, CAC, and support at low ARPU. Downloads and signups are weak without retained use.

## Marketplace

`problem 10, customer 9, market 8, competition 7, differentiation 7, product 7, monetization 8, acquisition 16, economics 10, execution_risk 10, founder_fit 8`

Evaluate supply and demand separately. Model geographic/category density, time to match, fill rate, disintermediation, trust, fraud, take rate, and CAC on both sides. A large market does not solve cold start.

## Developer tool or API

`problem 13, customer 8, market 8, competition 9, differentiation 11, product 10, monetization 8, acquisition 10, economics 8, execution_risk 7, founder_fit 8`

Focus on time saved, reliability, docs, integration effort, ecosystem, distribution through communities or platforms, free alternatives, usage-based cost, and migration risk.

## Open source

`problem 12, customer 7, market 6, competition 8, differentiation 9, product 10, monetization 10, acquisition 8, economics 9, execution_risk 10, founder_fit 11`

Separate users, contributors, sponsors, and buyers. Evaluate adoption quality, maintainer load, governance, license, contributor concentration, hosted/open-core/service paths, conversion trigger, and sponsor dependency. Stars are weak evidence without active use and a payer path.

## Enterprise software

`problem 13, customer 11, market 6, competition 7, differentiation 8, product 7, monetization 10, acquisition 12, economics 8, execution_risk 11, founder_fit 7`

Focus on budget, procurement, security, compliance, integration, implementation services, references, data residency, SLA, sales cycle, switching cost, and runway. A founder without access or enterprise sales capacity faces a serious fit constraint.

## AI product

Use the closest commercial profile, then adjust for model dependency. Typically increase `economics`, `differentiation`, and `execution_risk` by 1-3 points each, funded by lower `market` or `product` weights. Evaluate model cost, reliability, latency, evals, data rights, fallback, commoditization, provider concentration, and whether AI creates proprietary advantage or only implementation convenience.

## Agency or service

`problem 14, customer 11, market 7, competition 7, differentiation 8, product 4, monetization 11, acquisition 14, economics 9, execution_risk 6, founder_fit 9`

Replace product retention with repeat business, referrals, utilization, delivery capacity, scope control, gross margin after labor, founder dependency, and path from first clients to repeatable acquisition.

## E-commerce

`problem 8, customer 9, market 9, competition 10, differentiation 10, product 8, monetization 8, acquisition 14, economics 12, execution_risk 7, founder_fit 5`

Model landed cost, inventory, returns, fulfillment, contribution margin, repeat purchase, channel concentration, cash conversion cycle, and creative/ad fatigue.

## Hardware/software

`problem 12, customer 8, market 8, competition 7, differentiation 10, product 9, monetization 7, acquisition 8, economics 10, execution_risk 14, founder_fit 7`

Include BOM, manufacturing yield, certification, warranty, logistics, inventory financing, lead times, support, and irreversible capital exposure.

## Internal tool

`problem 17, customer 10, market 2, competition 7, differentiation 5, product 10, monetization 2, acquisition 4, economics 17, execution_risk 12, founder_fit 14`

Replace external revenue with labor saved, error reduction, risk reduction, adoption, maintenance ownership, integration, and payback. The customer is the organization; internal users and budget owner may differ.

## Content product or community

`problem 9, customer 9, market 8, competition 8, differentiation 10, product 8, monetization 9, acquisition 15, economics 8, execution_risk 5, founder_fit 11`

Focus on trust, audience access, cadence, retention, creator dependence, platform concentration, conversion, sponsor/subscription durability, and return on founder time.

## Scaling questions

For acquisition, describe first 10, 100, and 1,000 customers when those numbers fit the model. Replace with equivalent milestones for enterprise, marketplaces, open source, internal tools, or high-ticket services. Each stage must include channel, reachable volume, conversion assumptions, owner, cost, time, and bottleneck.
