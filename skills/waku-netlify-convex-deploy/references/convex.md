# Convex Production Review

## Setup and generated types

- Keep `convex` in runtime dependencies when the deployed client imports it.
- Generate `convex/_generated/api`, `dataModel`, and `server` with the installed Convex CLI.
- Commit generated files if that is the current Convex recommendation and repository convention; never edit them manually.
- Create `ConvexReactClient` once at module scope in a client-only boundary. Fail clearly when the public deployment URL is absent rather than passing `undefined` with a type assertion.
- In Waku, confirm the current client-visible environment prefix from official docs. Recent Waku uses `WAKU_PUBLIC_`; do not assume Vite's `VITE_` prefix.

## Schema audit

Require a `convex/schema.ts` for production projects. Review:

- Every table has explicit validators.
- Optional versus nullable semantics are intentional.
- IDs use `v.id("table")`, not arbitrary strings.
- Unions model persisted variants completely.
- Index field order matches equality and range constraints.
- Index names describe access paths, such as `by_owner_and_status`.
- Search/vector indexes include only fields needed by real queries.
- Runtime `schemaValidation` remains enabled.

Deploying a stricter schema validates existing documents and can fail. Use expand, migrate, contract rather than disabling validation.

## Function contract

Every public `query`, `mutation`, and `action` must have:

- Explicit `args`, including `args: {}` for no-argument functions.
- Runtime validators for every untrusted value.
- A `returns` validator when practical; require it for auth, billing, private records, and APIs where over-returning fields is risky.
- Authentication when the operation is user-specific.
- Resource-level authorization based on authoritative database state.
- A bounded query or pagination for potentially growing collections.
- Errors that do not leak secrets, internal IDs unnecessarily, or stack details.

Use `internalQuery`, `internalMutation`, and `internalAction` for functions called only by the backend, schedules, webhooks, migrations, seeds, admin workflows, or actions. Internal status reduces exposure but does not replace input checks and invariants.

## Authentication and authorization

`ctx.auth.getUserIdentity()` proves identity only after a provider is configured correctly. It does not prove ownership or role.

For each public operation:

1. Obtain identity and reject `null` where authentication is required.
2. Resolve the application user using stable identity fields such as `tokenIdentifier` or the documented issuer/subject pair.
3. Load membership or resource ownership from Convex.
4. Check tenant, role, ownership, status, and business constraints.
5. Query or mutate only after checks pass.

Never trust client-supplied `userId`, `ownerId`, email, tenant, organization, price, entitlement, or role as authorization evidence. Test that user A cannot read or mutate user B's records.

## Query and mutation performance

Flag and repair:

- `.collect()` on a table that can grow without a proven small upper bound.
- `.filter()` where an index can constrain the query.
- N+1 reads inside loops when data can be modeled or fetched more directly.
- Large documents, unbounded arrays, and frequently rewritten aggregates.
- Returning full documents when a stable projection is enough.
- Mutations that perform external network calls; network calls belong in actions, with mutations for transactional writes.
- Actions that implement database invariants across separate calls without an atomic mutation.

## HTTP actions and webhooks

Convex HTTP actions do not receive automatic function argument validation. Validate:

- Method and route.
- Content type and maximum body size.
- Parsed body shape.
- Authentication or webhook signature using the raw body when required.
- Timestamp/replay protection and idempotency.
- Authorization and tenant mapping.
- Strict CORS allowlist and preflight behavior for browser endpoints.
- Rate/abuse limits appropriate to cost and sensitivity.
- Safe response headers and errors.

Move privileged database work into internal functions invoked after the request is authenticated.

## Environment and deployments

- Convex environment variables are deployment-specific. Configure values separately for development, preview, staging, and production.
- Declare expected variables with validators in `convex/convex.config.ts` when supported by the installed version.
- Never expose `CONVEX_DEPLOY_KEY` through a Waku public variable.
- Use production deploy keys only in Netlify production Builds scope.
- Use preview deploy keys only in deploy-preview context.
- Use synthetic/non-production data and reduced third-party credentials in previews.
- A permanent staging environment should use a separate Convex project when stable isolation is needed.

Useful current commands, which must be checked against the installed CLI:

```bash
pnpm exec convex dev --once
pnpm exec convex env list
pnpm exec convex deploy --dry-run
pnpm exec convex deploy --cmd "pnpm build"
```

Do not print `convex env get` values during an audit.

## Tests

Use `convex-test` for fast function and authorization tests, including `withIdentity`. Also test production-sensitive behavior against a real isolated backend because the mock does not fully enforce production limits, IDs, search behavior, crons, or runtime built-ins.

Minimum backend tests:

- Valid request succeeds.
- Invalid argument and undeclared extra field fail.
- Unauthenticated request fails.
- Authenticated but unauthorized/cross-tenant request fails.
- Correct owner/role succeeds.
- Pagination or result bounds hold.
- Schema rejects invalid persisted data.
- Webhook rejects invalid signature and replay.

## Deployment sequencing

Convex deploy can run the frontend build with the selected deployment URL:

```bash
pnpm exec convex deploy \
  --cmd-url-env-var-name WAKU_PUBLIC_CONVEX_URL \
  --cmd "pnpm build"
```

Verify this integration against current docs and the installed version. Run tests before this command because Convex may update the backend before the Netlify deploy completes.

Official sources:

- https://docs.convex.dev/production/hosting/netlify
- https://docs.convex.dev/production/multiple-deployments
- https://docs.convex.dev/database/schemas
- https://docs.convex.dev/functions/validation
- https://docs.convex.dev/functions/internal-functions
- https://docs.convex.dev/auth/functions-auth
- https://docs.convex.dev/testing
