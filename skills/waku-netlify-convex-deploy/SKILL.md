---
name: waku-netlify-convex-deploy
description: Help create, maintain, audit, repair, test, preview, and deploy Waku applications using Convex on Netlify. Use whenever a user starts a new Waku + Convex + Netlify project, adds features, changes schemas or authentication, fixes build/runtime failures, reviews production readiness, configures environment variables, CSP, Netlify Functions, deploy previews, or production deployment. Use this skill even when the user mentions only files such as waku.config.ts, convex/schema.ts, convex/_generated/api, netlify.toml, or netlify-functions/serve.js. It may apply minimal fixes and execute preview or production deployment only after its safety gates pass.
compatibility: Requires Node.js 22+, pnpm, and project-specific Convex and Netlify CLIs. Context7 or official web documentation is recommended before changing version-sensitive configuration.
---

# Waku + Convex + Netlify

Audit and repair the complete path from a Waku client and server-rendered routes, through Convex's typed backend, to Netlify's build and runtime. Treat a successful build as necessary but not sufficient evidence of production readiness.

## Operating contract

1. Identify the operating mode: initialize, maintain, audit, preview, or production deployment.
2. Inspect the repository and current worktree before changing anything. For a new project, inspect the target directory and confirm it is empty or preserve existing files.
3. Retrieve current official Waku, Convex, and Netlify documentation before changing version-sensitive APIs, commands, adapters, or configuration. Do not blindly copy the reference repositories.
4. Never reveal, print, copy, or commit secret values. Report variable names and scopes only.
5. **Ask for explicit approval before any side effect.** This includes editing or deleting files, installing/updating dependencies, regenerating files, changing Netlify or Convex variables/configuration, provisioning or modifying a Convex deployment, creating a Netlify preview, and deploying to production. Read-only inspection and diagnostic commands are allowed before approval.
6. Before asking, present the audit, confirmed root causes, proposed files/commands, expected risks, and whether the action targets local, preview, staging, or production. Do not ask for vague permission such as “should I continue?”.
7. Apply only the approved scope. If a new problem or a new side effect appears outside that scope, stop and ask again.
8. Fix confirmed problems with the smallest maintainable change. Preserve unrelated worktree changes.
9. Run all applicable quality and deployment gates. Do not claim success when a gate was skipped or failed.
10. Production deployment is an external side effect. Execute it only when the user explicitly approved production deployment in the current conversation, credentials target the intended site/deployment, and every blocking gate passes.

## Operating modes

Select one mode before acting. If the request spans modes, complete discovery for all of them and ask for approval with the exact scope.

| Mode | Use when | Default outcome |
| --- | --- | --- |
| `initialize` | Starting a new Waku + Convex + Netlify project | Local development-ready project |
| `maintain` | Adding features, fixing bugs, changing schema, auth, or dependencies | Verified local change, preview-ready when requested |
| `audit` | Reviewing an existing project without changing it | Redacted report |
| `preview` | User requests a deploy preview | Verified preview URL, never production |
| `production` | User explicitly requests production deployment | Production deploy only after all gates and approval |

Read `references/initialization.md` for `initialize` and `references/maintenance.md` for `maintain`.

## Initialize

For a new project:

1. Confirm the target directory, project name, package manager, Node.js version, authentication provider, data domains, and whether Waku needs static output or dynamic SSR.
2. Check current official Waku, Convex, and Netlify documentation and the installed or selected CLI versions before choosing commands.
3. Scaffold Waku with the current official generator, then add Convex and the Netlify integration appropriate to the selected rendering model.
4. Establish the smallest useful `convex/schema.ts`, generated types, client provider, and one authenticated read/write path only when those are part of the requested scope.
5. Create `.env.example`, `.gitignore`, `netlify.toml`, and scripts without secret values. Keep deploy keys and backend secrets outside source files.
6. Add baseline tests for validators and authorization before adding domain features.
7. Run the local gates discovered from `package.json`: generation, typecheck, tests, lint, build, and inspection of generated output.
8. Stop at a local or preview-ready result unless the user explicitly requests and approves a deployment target.

Do not invent a starter architecture, authentication provider, domain schema, or hosted deployment when the user has not specified them. Ask one focused question for the missing decision.

## Maintain

For changes to an existing project:

1. Read the relevant project instructions, status, package scripts, current versions, generated Convex files, and deployment contexts before editing.
2. Classify the change as frontend, Waku rendering, Convex function/schema/auth, Netlify runtime/configuration, dependency, or cross-layer.
3. Preserve the client/backend compatibility contract. For persisted data, use additive changes, backfill, and later cleanup rather than breaking the currently deployed client.
4. For every new public Convex function, add argument validation, return validation where practical, authentication, resource authorization, bounded queries, and negative tests.
5. Regenerate `convex/_generated` with the installed CLI when backend contracts change. Never edit generated files manually.
6. For bugs, reproduce the failure, identify the first root-cause error, make the smallest fix, and add a regression test or explain why one is not feasible.
7. For dependency updates, inspect changelogs and peer requirements, change only the requested packages, preserve the lockfile, and run the complete applicable gate.
8. Re-run the narrowest relevant checks after each repair, then the complete verification sequence before proposing a preview or production deployment.

Do not remove legacy integrations, weaken security controls, disable schema validation, or add compatibility code without tracing an actual consumer.

## Load references progressively

- Read [references/architecture.md](references/architecture.md) for every full audit or initial setup.
- Read [references/convex.md](references/convex.md) when touching `convex/`, authentication, data access, generated types, previews, or backend deployment.
- Read [references/netlify-waku.md](references/netlify-waku.md) when touching Waku rendering, adapters, `netlify.toml`, Functions, Edge Functions, headers, redirects, build output, or deploy commands.
- Read [references/security.md](references/security.md) for every production-readiness review and before deploying.
- Read [references/troubleshooting.md](references/troubleshooting.md) only for failed builds, failed functions, routing errors, CSP violations, or client/backend connection problems.
- Use [references/report-template.md](references/report-template.md) for the final report.

## Phase 1: Discover

Establish facts before proposing changes:

1. Read repository instructions, `package.json`, lockfile, `waku.config.*`, `src/waku.server.*`, `netlify.toml`, function directories, `convex/`, TypeScript config, test config, ignore files, and CI workflows.
2. Record package manager and exact installed versions of Waku, Convex, React, TypeScript, Netlify packages, and the CLIs actually invoked by scripts.
3. Inspect `git status` and identify existing user changes. Never overwrite them.
4. Classify Waku output as pure static or dynamic SSR. Dynamic routes, server actions, request-time auth, API routes, cookies, or middleware require a runtime.
5. Identify Convex deployments and intended Netlify contexts: local development, deploy preview, branch deploy, staging, and production.
6. Map every environment variable by owner, visibility, context, and scope. Record names only.
7. Run the bundled read-only scanner when Node.js is available:

```bash
node <skill-directory>/scripts/audit-project.mjs <project-directory>
```

Treat scanner output as leads, not proof. Confirm each finding in source and official docs.

## Approval gate

After the read-only discovery and audit, stop before Phase 3. Ask exactly one focused question that includes the proposed scope. For example:

> Encontré estos bloqueos: `convex/schema.ts` no existe y `netlify.toml:12` expone una variable de despliegue. Propongo modificar `convex/schema.ts`, `netlify.toml` y `package.json`, ejecutar typecheck/tests/build, y crear solo un deploy preview con una clave Convex de preview. ¿Autorizás exactamente esos cambios y ese preview?

Interpret approval narrowly:

- “Sí” authorizes only the listed files, commands, contexts, and deployment target.
- Approval to fix code does not authorize installing packages, changing hosted variables, provisioning Convex, or deploying.
- Approval for a preview does not authorize production deployment.
- Approval to configure variables does not authorize reading or displaying their values.
- Never continue after an ambiguous answer. Ask the user to confirm the missing scope.

If the user requests audit-only, return the report without asking for changes. If the user explicitly requests production deployment, still ask for approval after presenting the audit and before the first side effect.

## Phase 2: Audit

Audit all domains, not only the reported failure.

### Waku

- Confirm scripts use Waku's installed CLI and the selected rendering model matches the app's features.
- Confirm the whole `dist/public` output is published, including RSC payloads. Reject generic SPA fallbacks that hide route mistakes.
- For dynamic output, confirm the current Netlify adapter-generated output or wrapper routes static files before the catch-all runtime.
- Confirm server-only modules and secrets cannot enter client components or public environment prefixes.
- Confirm Waku config is typechecked and included by TypeScript where appropriate.

### Convex

- Require `convex/schema.ts` for production data and keep runtime schema validation enabled.
- Require generated types from `convex/_generated`; never hand-write substitutes or edit generated files.
- Require `args` validators for every public function and `returns` validators where practical, especially for sensitive records.
- Minimize public functions. Use `internalQuery`, `internalMutation`, and `internalAction` for implementation details and privileged workflows.
- Check authentication and resource-level authorization at the start of every public operation. Client-provided IDs, email, tenant, owner, or role are not authorization evidence.
- Check indexes match query access paths. Flag broad `.collect()` calls, unbounded result sets, filtering after collection, and avoidable N+1 reads.
- Validate HTTP actions manually: method, content type, body, auth, authorization, webhook signatures, CORS, response, and abuse controls.
- Verify development, preview, and production deployments have isolated data, keys, and environment variables.

### Netlify

- Confirm build command, publish directory, Functions directory, Node version, headers, redirects, and Edge Function routes agree with generated output.
- Confirm variables needed during build have Builds scope and function runtime variables have Functions scope. Do not put secrets in `netlify.toml`.
- Require different `CONVEX_DEPLOY_KEY` values for production and deploy-preview contexts. A preview must never inherit a production deploy key.
- Confirm function source is outside the public publish directory.
- Review CSP against actual Waku and Convex connections. Prefer a restrictive policy; add origins only when source or runtime evidence requires them.
- Check immutable caching only for hashed assets and revalidation/no-cache behavior for HTML where stale shells are unsafe.

### Repository and supply chain

- Confirm `.env*`, deploy state, credentials, private keys, `.netlify/`, local Convex state, and generated build output are ignored as appropriate.
- Search Git history or use the repository's secret scanner if a credential file appears tracked. Never display its contents.
- Run the package manager's audit without automatically applying breaking upgrades. Judge exploitability and deployment impact.
- Remove legacy Firebase/Vercel code only when confirmed unused and within scope; coexistence often causes wrong endpoints, duplicated secrets, or bundling errors.

## Severity and blockers

Use these levels:

- `CRITICAL`: exposed credential, production key available to untrusted previews, cross-tenant data access, unauthenticated privileged mutation, or deployment targeting the wrong production resource.
- `HIGH`: missing authorization, public admin function, disabled runtime schema validation, secret in client bundle, preview connected to production data, or broken CSP that requires unsafe broadening.
- `MEDIUM`: missing return validators, unbounded queries, missing indexes, stale HTML caching, incomplete headers, environment scope mismatch, or weak failure handling.
- `LOW`: maintainability, documentation, non-blocking observability, or minor configuration drift.

Block production for every unresolved `CRITICAL` or `HIGH`, failed test/typecheck/lint/build, uncertain deployment target, missing required production variable, or inability to verify the deployed health checks.

## Phase 3: Repair

1. Explain the confirmed root cause internally before editing; do not patch symptoms blindly.
2. Prioritize security boundaries and data correctness, then build/runtime configuration, then performance and maintainability.
3. Use declared functions with JSDoc for new project functions when consistent with repository instructions.
4. Add or update tests for authorization boundaries, validators, schema behavior, changed routes, and regressions.
5. Never weaken schema validation, authentication, CSP, CORS, secret scanning, or tests merely to make deployment pass.
6. Do not create compatibility layers for removed Firebase/Vercel behavior without an identified consumer.
7. Re-run the narrowest relevant checks after each repair, then the complete gate.

## Phase 4: Verify

Discover actual script names from `package.json`; do not assume them. Run applicable equivalents in this order:

1. Install with `pnpm install --frozen-lockfile` only when dependencies are absent or changed.
2. Convex generation and backend validation against a non-production deployment, normally `pnpm exec convex dev --once` or the documented project equivalent.
3. Typecheck.
4. Unit/integration tests, including negative authorization tests using distinct identities.
5. Lint with zero errors and no new warnings.
6. Format check, not format-write, unless formatting files is part of the requested fix.
7. Dependency and secret audit.
8. Convex production dry run where supported: `pnpm exec convex deploy --dry-run` with the intended non-secret environment already configured.
9. Netlify local production-context build where supported: `pnpm exec netlify build --context production`.
10. Inspect generated `dist/public`, server output, and Function manifest. Ensure secrets are absent from client assets.

`convex-test` is a mock runtime. Passing it does not prove production limits, search behavior, cron behavior, real IDs, or deployment configuration. Use an isolated real backend or preview for production-sensitive verification.

## Phase 5: Deploy

### Preview first

Prefer a deploy preview before production:

1. Confirm a preview-specific Convex deploy key and isolated preview data.
2. Deploy Convex and build Waku atomically using the current documented command. A common pattern is:

```bash
pnpm exec convex deploy --cmd-url-env-var-name WAKU_PUBLIC_CONVEX_URL --cmd "pnpm build"
```

3. Deploy a Netlify draft/preview using the repository's script or `pnpm exec netlify deploy`.
4. Capture the URL and verify page load, direct navigation, RSC navigation, authentication, one read, one authorized write, one denied cross-user operation, headers, CSP, and function logs.

The command above is a recommended integration pattern, not a timeless constant. Confirm current Waku's public environment prefix and current Convex CLI syntax before introducing it.

### Production

Before running a production command, state and verify without exposing values:

- Netlify site name/ID and production URL.
- Convex production deployment name and that the key is a production key.
- Git branch/commit being deployed and worktree status.
- Passed gate commands and preview verification result.
- Required production variable names and scopes.

Then use the repository's reviewed production script or the current CLI equivalent. Do not invent flags. Typical Netlify CLI behavior is draft by default and `--prod` for production, but verify current docs and `--help` first.

After deployment, verify the production URL independently. A successful CLI exit is not proof that SSR, auth, Convex, CSP, or cached HTML works.

## Failure and rollback

- Stop on the first deployment-stage failure. Preserve logs, redact values, and diagnose before retrying.
- If Convex changed but Netlify failed, assess API compatibility with the currently served frontend before doing anything else.
- Prefer a forward-compatible fix. Use Netlify rollback when the frontend is unsafe and the previous deploy is known good.
- Never roll back a Convex schema blindly. Data may already conform to a newer shape; use compatibility changes or migrations.
- Report partial deployment explicitly, including which side changed.

## Final response

Use the report template. Findings must cite file and line. Separate verified facts from assumptions. Include changed files, commands and outcomes, deployed URLs, unresolved risks, and rollback status. Never include secret values.

## Reference origins

The Netlify wrapper, `dist/public` publishing, CSP nonce, and pre-deploy patterns were informed by the user's Waku/Firebase repositories. Firebase-specific SDK, credentials, CSP origins, and bundling workarounds are not valid Convex guidance and must not be copied.

Current official sources to refresh when used:

- https://waku.gg/guides/static-deployments
- https://docs.convex.dev/production/hosting/netlify
- https://docs.convex.dev/production/overview
- https://docs.convex.dev/functions/validation
- https://docs.convex.dev/auth/functions-auth
- https://docs.netlify.com/deploy/deploy-overview/
- https://docs.netlify.com/build/functions/environment-variables/
