# Troubleshooting Matrix

## `error decoding lambda response`

This is a wrapper symptom, not a root cause. Inspect Netlify Function logs for the first import/runtime exception.

Check:

- Wrapper imports the generated server entry that actually exists.
- Waku adapter and checked-in wrapper agree for the installed version.
- Runtime dependencies are in `dependencies`, not only `devDependencies`.
- Packages required by SSR were not incorrectly externalized.
- Required Function variables have Functions scope and the deploy was rebuilt after setting them.
- Function response is valid and body consumption/streaming is supported by the current runtime.

The Firebase reference repositories fixed one case by not externalizing the Firebase browser SDK. Do not translate that into externalizing or bundling Convex blindly; inspect the failing import and current Waku/Convex packaging.

## Static page works, refresh or dynamic route fails

- Generic SPA redirect is masking Waku routing.
- Dynamic route lacks runtime or `staticPaths`.
- Catch-all Function path omits current RSC base.
- `dist/public` was partially deployed.
- Function directory or publish path disagrees with generated output.

## Convex works locally but not after deploy

- Public Convex URL was absent during the Waku client build.
- Wrong Waku public prefix was used.
- Preview/production build used the wrong `CONVEX_DEPLOY_KEY`.
- CSP blocks the Convex connection.
- Auth provider does not allow the deployed origin.
- Convex backend environment values were configured only in development.
- The frontend and backend contracts are incompatible.

Inspect the browser bundle only for the public URL. Never search deployed assets for a secret by echoing the secret itself; search known variable names and suspicious key markers.

## Convex deploy rejects schema

- Existing documents do not match the new validator.
- A required field was introduced before backfill.
- A union removed a still-persisted variant.
- An index or schema change conflicts with current data.

Use expand, migrate, contract. Do not disable `schemaValidation` to bypass production data errors.

## Type errors in `convex/_generated`

- Generated files are stale or were edited.
- Convex CLI/package versions disagree.
- Backend code failed generation/typecheck.
- TypeScript config excludes or incorrectly transforms generated modules.

Run the installed CLI's one-shot dev/codegen command against a non-production deployment. Never hand-patch generated output.

## Netlify preview touched production Convex

Treat this as a security incident:

1. Stop further preview builds.
2. Revoke/rotate the exposed production deploy key.
3. Audit Convex deployment history, functions, schema, and data writes.
4. Configure a preview-specific key in deploy-preview Builds scope.
5. Verify production and preview builds resolve distinct deployment URLs.
6. Assess whether untrusted preview code could read any other build secrets.

## CSP violations

- Confirm the blocked origin/resource is expected and necessary.
- For inline Waku scripts, confirm a per-response nonce appears both in CSP and markup.
- Do not add script `unsafe-inline` or broad `https:`/`*` merely to silence errors.
- Add only exact Convex, auth, analytics, image, font, or API origins used by the app.
- Remember Report-Only does not enforce; use it for rollout, then enforce after review.

## Stale page after successful deploy

- HTML has long-lived or immutable caching.
- Service worker serves an old shell.
- New HTML references removed hashed assets.
- CDN/browser was not forced to revalidate mutable resources.

Cache immutable hashed assets aggressively, but make HTML and service-worker update behavior explicit and test an upgrade from the previous version.

## Convex query is slow or expensive

- `.collect()` scans an unbounded set.
- Filtering happens after retrieval rather than through an index.
- Index fields/order do not match equality and range constraints.
- UI creates duplicate subscriptions or requests.
- N+1 document reads occur per result.
- Large documents or arrays are repeatedly transferred.

Confirm with actual query shape and Convex dashboard metrics before changing the data model.
