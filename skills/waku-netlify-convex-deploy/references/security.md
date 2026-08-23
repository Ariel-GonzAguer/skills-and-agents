# Security Gate

## Secret classification

Public by design:

- Convex client deployment URL.
- Public auth provider identifiers documented for browser use.

Secret:

- `CONVEX_DEPLOY_KEY`.
- Convex backend environment values for private APIs, signing, encryption, webhooks, or admin operations.
- Netlify access tokens and privileged Function environment variables.
- Auth client secrets, private keys, webhook secrets, service credentials.

Any value placed in `WAKU_PUBLIC_*`, client code, generated JavaScript, HTML, source maps, or public assets is public.

## Mandatory searches

Search filenames and source patterns without printing values:

- `.env`, `.env.*`, credentials, service accounts, PEM/private keys, deploy state.
- Hard-coded tokens, authorization headers, deploy keys, and URLs with embedded credentials.
- `process.env` or `import.meta.env` access crossing server/client boundaries.
- `query`, `mutation`, `action`, `httpAction` without validators or authorization.
- `internal*` workflows accidentally exported as public functions.
- permissive CORS, CSP wildcards, `unsafe-eval`, script `unsafe-inline`, and open redirects/proxies.
- logs containing request bodies, auth headers, tokens, identities, or personal data.

If a secret appears tracked, stop deployment, identify its scope without displaying it, rotate/revoke it, remove it from the repository and history as appropriate, and verify audit logs.

## Convex boundary

- Assume every public Convex function is internet-callable.
- Runtime validators protect shape, not authorization.
- Authentication protects identity, not resource ownership.
- Return validators and explicit projections reduce accidental data leakage.
- Internal functions reduce attack surface for privileged implementation details.
- Queries must enforce tenant/owner constraints in their indexed access path whenever possible.
- Admin operations need server-established role checks, not hidden UI buttons.
- Scheduled and webhook-triggered work must be idempotent where retries are possible.

## Preview boundary

- Deploy previews may be publicly reachable.
- Never expose production Convex deploy keys or production backend secrets to untrusted preview builds.
- Never copy production personal data into previews by default.
- Use preview-specific OAuth origins, webhook endpoints, and reduced credentials.
- Protect previews when they expose internal functionality.
- Treat pull requests from forks or unknown authors as untrusted code capable of reading build variables if platform policy allows them.

## Netlify/Waku boundary

- Keep server-only modules out of client component import graphs.
- Keep Function sources outside the publish directory.
- Do not use `netlify.toml` as a secret store.
- Restrict CSP `connect-src` to the actual Convex/auth/API origins.
- Restrict CORS to explicit trusted origins for credentialed or sensitive endpoints.
- Validate proxy target hosts exactly; suffix checks must prevent attacker domains such as `trusted.com.attacker.example`.
- Apply request size, rate, and cost limits to expensive public endpoints.
- Avoid storing rate-limit state only in a Function's process memory; serverless instances are ephemeral and distributed.

## Supply chain

- Use pnpm and a frozen lockfile in CI.
- Review install scripts and newly introduced packages.
- Keep deploy CLIs project-pinned when reproducibility matters.
- Run `pnpm audit` but do not auto-force major upgrades.
- Check package provenance and official package names before installation.
- Ensure generated directories and deploy state are not treated as source.

## Production blocking checklist

- [ ] No known leaked or unrotated credentials.
- [ ] Production and preview Convex keys are isolated.
- [ ] No preview points at production data unintentionally.
- [ ] Every sensitive public Convex function authenticates and authorizes.
- [ ] Every public function validates arguments.
- [ ] Schema runtime validation is enabled.
- [ ] HTTP actions validate signatures/auth and CORS.
- [ ] Client bundle contains no secrets.
- [ ] CSP and security headers were tested on deployed HTML.
- [ ] Dependency and secret scans have no unresolved deploy blocker.
- [ ] Logs avoid secrets and sensitive payloads.
- [ ] Rollback/forward-fix path is understood.
