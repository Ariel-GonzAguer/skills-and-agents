# Financial Modeling and Return on Time

## Modeling rules

1. Separate `FACT`, `ESTIMATE`, and `ASSUMPTION` inputs.
2. Use one currency, period, geography, and tax basis per model.
3. Prefer ranges and sensitivity analysis over unsupported point precision.
4. Distinguish revenue, gross profit, contribution profit, operating profit, and cash flow.
5. Do not calculate LTV when churn/retention behavior is unknown without labeling it an assumption.
6. Match the model to the business. Subscription formulas do not fit marketplaces, projects, hardware, or ad businesses without adaptation.

## Core subscription formulas

- `MRR = paying_customers x monthly_ARPU`
- `ARR = MRR x 12`
- `gross_profit = revenue - COGS`
- `gross_margin_pct = gross_profit / revenue x 100`
- `contribution_profit = revenue - variable_costs - variable_support - payment_fees - variable_sales_cost`
- `CAC = acquisition_spend / new_customers`, including attributable sales labor where material
- `monthly_logo_churn = lost_customers / starting_customers`
- Simple constant-churn LTV: `ARPU x gross_margin_ratio / monthly_churn`
- Revenue LTV may require cohort gross-margin contribution instead of logo churn.
- `LTV_CAC = LTV / CAC`
- `CAC_payback_months = CAC / monthly_gross_profit_per_customer`

State that the simple LTV model is unstable when churn is low, cohorts are young, expansion is material, contracts are annual, or retention is non-geometric. Prefer observed cohort contribution when available.

## Other models

Marketplace:

- `GMV = transactions x average_order_value`
- `net_revenue = GMV x take_rate`
- subtract incentives, payment losses, refunds, fraud, support, and acquisition on both sides.

E-commerce and hardware:

- contribution per order/unit includes landed cost, packaging, fulfillment, payment fees, expected returns/warranty, discounts, and variable support.
- include inventory cash cycle, minimum order quantities, certification, and write-off risk.

Agency/service:

- `gross_margin = revenue - delivery_labor - subcontractors - delivery tools`
- include billable utilization, bench time, founder sales time, rework, scope creep, and collection delay.

Usage-based API or AI:

- model revenue and cost by usage tier;
- include model/API calls, retries, inference latency, storage, egress, abuse, free tier, support, and provider price changes;
- test gross margin at heavy-user percentiles, not only average usage.

Internal tool:

- annual benefit includes labor hours avoided, errors reduced, faster cycle, risk reduction, or avoided software cost;
- subtract implementation, training, integration, maintenance, and adoption loss;
- report payback and net annual savings instead of MRR.

## Three scenarios

Use `pessimistic`, `base`, and `optimistic`, all plausible. For each show:

- time horizon and customer count;
- price/ARPU and revenue;
- acquisition volume, CAC, and sales cycle where applicable;
- churn or retention assumption;
- COGS and gross margin;
- fixed operating costs;
- contribution and operating profit/loss;
- one-time capital required and cash timing;
- founder/team hours by development, sales, marketing, support, and administration;
- return per hour and time to break even.

The optimistic case must remain capacity-constrained. It cannot assume simultaneous best-case conversion, retention, pricing, cost, and speed without evidence.

## Return on time

Report at least:

- build hours to next decision milestone;
- total hours to first revenue;
- ongoing monthly founder hours;
- monthly contribution or operating profit;
- `cash_return_per_ongoing_hour = monthly_profit / monthly_founder_hours`;
- `economic_return_per_hour = (monthly_profit - founder_time_cost) / monthly_founder_hours` when an opportunity-cost rate exists;
- payback on build time and invested cash;
- expected time to target income.

Do not divide by zero. A passive-looking product often hides support, sales, compliance, and maintenance; include them.

## Founder opportunity cost

Compare against the founder's credible alternative, not an abstract maximum salary. Include:

- foregone after-tax or pre-tax income on a consistent basis;
- lost learning, network, strategic options, or lifestyle benefits when material;
- downside and reversibility;
- probability and timing of returns.

For project comparisons, calculate risk-adjusted expected value only when scenario probabilities are explicitly supplied or defensibly estimated. Otherwise show scenario ranges without fake expected values.

## Sensitivity analysis

Test variables most likely to change the verdict:

- price or ARPU;
- conversion;
- CAC and sales cycle;
- churn/retention;
- gross margin and AI/API cost;
- support hours;
- time to launch;
- attainable customer count;
- capital requirement.

Identify break-even thresholds, for example maximum viable CAC, minimum retained customers, minimum price, or maximum support hours. This is more decision-useful than a single forecast.

## Taxes and finance caveats

Show pre-tax figures unless jurisdiction, entity, deductible costs, and tax treatment are known. Label financing, depreciation, working capital, refunds, chargebacks, and VAT/sales tax when relevant. Do not present this analysis as accounting, tax, or investment advice.
