# Architecture and Audit Map

## Intended request path

```text
Browser
  -> Netlify CDN (dist/public)
  -> Waku Netlify Function only when no static asset matches
  -> Convex public API or authenticated client connection
  -> public Convex function
  -> authentication + authorization + validation
  -> database/index/internal function
```

Netlify hosts the Waku application. Convex is a separately deployed backend. Do not route normal Convex queries and mutations through a Netlify Function without a concrete server-only requirement; that adds latency and duplicates the trust boundary.

## Repository inventory

Inspect these locations when present:

| Concern | Files |
| --- | --- |
| Toolchain | `package.json`, `pnpm-lock.yaml`, `.npmrc`, `pnpm-workspace.yaml` |
| Waku | `waku.config.ts`, `src/waku.server.tsx`, `src/pages/**`, `src/pages.gen.ts` |
| Convex | `convex/schema.ts`, `convex/convex.config.ts`, `convex/auth.config.ts`, `convex/http.ts`, `convex/_generated/**`, all other `convex/*.ts` |
| Client integration | root client component/provider, imports from `convex/react`, `ConvexReactClient` initialization |
| Netlify | `netlify.toml`, `netlify-functions/**`, `netlify/functions/**`, `netlify/edge-functions/**`, `.netlify/state.json` |
| Security | `.gitignore`, `.env*`, headers, CSP, auth helpers, rate limits, webhook handlers |
| Verification | `tsconfig*.json`, ESLint, Vitest, CI workflows, deploy scripts |

## Rendering decision

Use pure static output only if every request-time feature can be removed or precomputed. Dynamic Waku runtime is required for any of these:

- A route configured with `render: "dynamic"`.
- A dynamic route without complete `staticPaths`.
- Dynamic API routes.
- Server actions.
- Request-time cookies, headers, auth, personalization, middleware, redirects, or rewrites.

Convex client-side reactivity does not itself require Waku SSR. A static Waku shell can connect directly to Convex. Choose dynamic Waku only for actual Waku server-runtime needs.

## Environment ownership matrix

Create this matrix using names only:

| Variable | Owner | Secret | Consumer | Context | Netlify scope / Convex deployment |
| --- | --- | --- | --- | --- | --- |
| `WAKU_PUBLIC_CONVEX_URL` | Convex output | No | Browser build | preview/production | Netlify Builds |
| `CONVEX_DEPLOY_KEY` | Convex | Yes | Convex CLI during build | preview/production | Netlify Builds, secret |
| Other backend secrets | Application/vendor | Yes | Convex functions | per deployment | Convex environment |
| Netlify Function secret | Application/vendor | Yes | Netlify Function | per context | Netlify Functions, secret |

Do not duplicate a secret in Netlify and Convex unless both runtimes genuinely consume it.

## Compatibility contract

Deployments are not perfectly atomic across services. New Convex functions and schemas must remain compatible with the currently deployed browser bundle, open tabs, scheduled jobs, and the new Waku bundle. Prefer additive changes:

1. Add optional fields or broader unions.
2. Deploy compatible backend code.
3. Backfill data.
4. Deploy clients using the new shape.
5. Tighten schema and remove old behavior later.

## Reference repository lessons

The user's Waku/Firebase projects demonstrate useful Netlify patterns:

- `netlify-functions/serve.js` imports `dist/server/index.js` and delegates to `INTERNAL_runFetch`.
- `preferStatic: true` lets `dist/public` win before the catch-all runtime.
- `netlify.toml` publishes `dist/public` and points Functions to `netlify-functions`.
- A Netlify Edge Function can inject per-response CSP nonces when Waku emits inline hydration scripts.
- Hashed assets can be cached immutably while HTML should revalidate.
- Deploy scripts should fail fast and run tests, lint, typecheck/build, and explicit target checks.

Do not copy these Firebase-specific lessons:

- Externalizing `firebase-admin` or pinning Firebase Admin versions.
- Firebase service account files or `included_files = ["private/**"]` unless the Waku application has an unrelated private-file need.
- Firebase CSP origins.
- Firebase REST token-verification workarounds.

Convex's browser URL is public by design. Convex deploy keys and backend environment variables are secrets.
