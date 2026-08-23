# Project Initialization

Use this reference when starting a Waku + Convex + Netlify project from an empty or newly created directory. Commands are examples, not timeless constants. Confirm them against current official documentation and the selected package versions first.

## Initialization contract

The first result should be a local development-ready project, not an unapproved hosted deployment. Keep the initial architecture small and make the rendering decision explicit:

- Use static Waku output when all request-time behavior can be built ahead of time.
- Use dynamic output when routes need request-time cookies, headers, auth, middleware, server actions, or dynamic API responses.
- Client-side Convex subscriptions do not by themselves require Waku SSR.

## Suggested sequence

1. Confirm Node.js, pnpm, project directory, app name, auth provider, data domains, and target contexts.
2. Scaffold the Waku app using the current official generator.
3. Add the Convex package and initialize the backend with the current CLI.
4. Create `convex/schema.ts` with explicit validators and runtime schema validation.
5. Generate `convex/_generated` using the installed Convex CLI. Never hand-write generated substitutes.
6. Create one module-scope `ConvexReactClient` in a client-only boundary using the current Waku public environment prefix.
7. Add `netlify.toml` that matches the selected Waku output, publish directory, Functions directory, Node version, and contexts.
8. Add `.env.example` containing names only and document ownership, visibility, context, and scope.
9. Add `.gitignore` entries for `.env*` exceptions, `.netlify/`, local Convex state, generated build output, and credentials as appropriate for the repository convention.
10. Add tests for invalid arguments, unauthenticated access, unauthorized resource access, and the first valid operation.
11. Run generation, typecheck, tests, lint, build, and inspect `dist/public` plus server/function output.

## Minimum environment contract

Record names only. Values belong in the relevant local, Convex, or Netlify environment:

| Variable | Consumer | Visibility | Context |
| --- | --- | --- | --- |
| `WAKU_PUBLIC_CONVEX_URL` | Browser build | Public | Development, preview, production |
| `CONVEX_DEPLOY_KEY` | Convex CLI during build | Secret | Isolated per deployment context |
| Auth provider browser identifiers | Browser build | Public or provider-defined | Matching origin per context |
| Backend and webhook secrets | Convex functions | Secret | Isolated per deployment |

Never place deploy keys or backend secrets in `WAKU_PUBLIC_*`, client code, `netlify.toml`, generated assets, or source maps.

## Initialization approval boundary

Before creating or editing files, installing packages, generating Convex files, provisioning a deployment, configuring hosted variables, or creating a preview, report the proposed paths, commands, context, and risks. Ask for approval with that exact scope.
