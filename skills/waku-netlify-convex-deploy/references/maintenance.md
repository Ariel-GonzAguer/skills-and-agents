# Project Maintenance

Use this reference for routine feature work, bug fixes, schema changes, authentication changes, dependency updates, and deployment configuration changes.

## Change classification

Classify the request before editing:

- Frontend component or route
- Waku static, SSR, RSC, server action, or middleware behavior
- Convex schema, query, mutation, action, HTTP action, or authorization
- Netlify build, Function, Edge Function, header, redirect, or context
- Dependency or toolchain update
- Cross-layer contract change

Cross-layer changes need tests and verification at both boundaries. A successful frontend build does not prove backend authorization or deployed runtime behavior.

## Feature workflow

1. Inspect current status, scripts, versions, relevant source, generated types, environment names, and existing tests.
2. State the contract change and affected contexts before editing.
3. Implement the smallest compatible change.
4. Add validators and authorization at the Convex boundary, not only in the UI.
5. Add success, invalid-input, unauthenticated, and unauthorized tests where applicable.
6. Regenerate Convex output with the installed CLI when backend code changes.
7. Run targeted checks, then typecheck, tests, lint, build, dependency audit, and secret scan as applicable.
8. Produce a preview-ready report unless an approved preview or production target exists.

## Bug workflow

1. Reproduce the issue using the project scripts or a read-only diagnostic.
2. Find the first root-cause error, not the wrapper symptom. For example, inspect the first Function import/runtime error behind a lambda decoding failure.
3. Check the client/backend contract, environment context, generated output, routing, CSP, and caching when the failure appears only after deployment.
4. Apply the smallest fix and add a regression test.
5. Re-run the failed gate and the complete applicable verification sequence.

## Schema and API changes

Use expand, migrate, contract for persisted data:

1. Add compatible fields or variants.
2. Deploy compatible backend code.
3. Backfill or migrate data in an isolated, idempotent workflow.
4. Deploy clients that use the new shape.
5. Remove old behavior only after consumers are gone.

Never disable schema validation or roll back a schema blindly. Keep public functions minimal and move privileged implementation details to internal functions.

## Dependency and configuration changes

- Verify the package's official name and current compatibility before installing.
- Change only requested dependencies and preserve the lockfile.
- Do not copy Firebase or Vercel workarounds into Convex/Netlify without evidence.
- Treat changes to Netlify or Convex hosted variables as separate side effects requiring separate approval.
- Keep preview keys, data, auth origins, webhooks, and third-party credentials isolated from production.

## Maintenance output

Report changed files, root causes, checks and outcomes, skipped gates, environment variable names and scopes, remaining risks, and whether the result is local-ready, preview-ready, or production-ready. Never report secret values.
