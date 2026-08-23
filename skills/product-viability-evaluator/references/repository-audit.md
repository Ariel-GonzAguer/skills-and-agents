# Product and Repository Audit

## Purpose and safety

Determine whether the current product can deliver the promised outcome reliably enough to support adoption and economics. Do not turn this into a generic code review.

Default to read-only inspection. Do not modify files, install packages, access production systems, print environment values, or run destructive commands. Prefer repository search, manifest inspection, existing test commands, static checks, and local builds only when safe and proportionate. Report secret names, never values.

## Evidence order

Use this hierarchy:

1. observed runtime behavior or passing focused test;
2. implementation traced through source and configuration;
3. existing tests without a current run;
4. documentation or README claim;
5. roadmap, issue, or comment.

Documentation alone receives `DOCUMENTED_ONLY`.

## Product map

Map the shortest path from target customer to realized value:

- discovery and landing proposition;
- signup, authentication, and qualification;
- onboarding and time to first value;
- core job workflow;
- collaboration, export, or integration needed for adoption;
- payment and entitlement;
- support, error recovery, and cancellation;
- retention loop and reason to return.

Inspect only the routes, components, services, schemas, jobs, integrations, and tests supporting this path before widening scope.

## Capability statuses

- `VERIFIED`: behavior is traced and supported by execution or focused tests.
- `PRESENT_WITH_RISK`: implementation exists but has a material reliability, security, UX, cost, or scalability risk.
- `INCOMPLETE`: part of the workflow exists but cannot deliver the promised outcome end to end.
- `DOCUMENTED_ONLY`: claimed but not confirmed in implementation.
- `MISSING_CRITICAL`: absent and required to sell, onboard, comply, collect revenue, or retain users.
- `UNNECESSARY`: consumes material effort without supporting the target customer or decision.

## Decision-relevant audit areas

### Product and UX

- Is the value proposition visible and consistent with actual behavior?
- Can the ICP reach first value without founder intervention?
- Is onboarding effort acceptable for price and buyer type?
- Are critical states, empty states, errors, cancellation, and recovery implemented?
- Is the workflow responsive and accessible enough for the target context?
- Does the product create a retention loop or only a one-time utility?

### Technical delivery

- Architecture and dependencies that affect delivery speed or operating risk.
- Data model and migrations that affect core workflows.
- Authentication, authorization, tenancy, and auditability required by the buyer.
- Payment, plans, entitlements, invoicing, tax, and cancellation behavior.
- External APIs, model providers, quotas, lock-in, and failure modes.
- Deployment, rollback, backups, observability, and support diagnostics.
- Tests around revenue, security, data integrity, and core customer value.

### Economics and scale

- variable infrastructure and AI/API cost per active customer or transaction;
- unbounded workloads, abuse exposure, or manual operations hidden behind the product;
- support and onboarding burden;
- performance constraints that reduce conversion or retention;
- limits that fail before the scenario customer count.

### Trust and market access

- privacy, security, compliance, data residency, accessibility, and procurement requirements;
- integrations or export required to displace the current alternative;
- credibility signals and operational controls needed at the target price.

## Repository inspection sequence

1. Read repository instructions, README, manifests, lockfiles, directory map, and git status.
2. Identify framework, runtime, deployment target, databases, payments, authentication, analytics, and third-party APIs.
3. Map user-visible claims to source paths and tests.
4. Inspect configuration and environment variable names without reading values.
5. Inspect current test, lint, typecheck, build, audit, and deployment scripts.
6. Run only safe, existing checks that materially improve confidence and do not require secrets or external writes.
7. Cite file and line for consequential findings.

Do not claim that a feature works because a component, route, package, or environment variable exists. Trace the complete flow.

## Technical viability output

Report:

- maturity stage: concept, prototype, MVP, beta, production, or unknown;
- verified core flow and broken/missing steps;
- capability table with statuses and evidence;
- critical technical blockers and estimated remediation ranges;
- operating-cost drivers and scale limits;
- security/compliance issues that affect sale or trust;
- technical debt that changes time to market or support burden;
- irrelevant technical quality observations intentionally excluded.

Score product/UX and execution from their business consequences. Keep a technically elegant product with no demand commercially weak, and keep a commercially strong but rough MVP viable when remediation is affordable and bounded.
