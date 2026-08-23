# Report Template

Use this structure. Omit empty optional sections, but never omit failed or skipped verification.

```markdown
# Waku + Convex + Netlify Review

## Verdict
READY FOR PREVIEW | READY FOR PRODUCTION | BLOCKED | DEPLOYED

One paragraph stating what was verified and the highest remaining risk.

## Findings

### CRITICAL
- `path/file.ts:line` Finding, impact, evidence, and required fix.

### HIGH
- `path/file.ts:line` Finding, impact, evidence, and required fix.

### MEDIUM
- `path/file.ts:line` Finding, impact, evidence, and recommendation.

### LOW
- `path/file.ts:line` Finding and recommendation.

## Fixes Applied
- `path/file.ts` What changed and why.

## Verification
| Gate | Command/check | Result |
| --- | --- | --- |
| Convex generation | `...` | PASS/FAIL/SKIPPED |
| Typecheck | `...` | PASS/FAIL/SKIPPED |
| Tests | `...` | PASS/FAIL/SKIPPED |
| Lint | `...` | PASS/FAIL/SKIPPED |
| Dependency/secret audit | `...` | PASS/FAIL/SKIPPED |
| Convex dry run | `...` | PASS/FAIL/SKIPPED |
| Netlify production build | `...` | PASS/FAIL/SKIPPED |
| Preview smoke test | URL and checks | PASS/FAIL/SKIPPED |
| Production smoke test | URL and checks | PASS/FAIL/SKIPPED |

## Deployment
- Netlify target: name/ID, no credentials.
- Convex target: deployment name/type, no key.
- Git revision: branch and commit.
- Preview URL: ...
- Production URL: ...
- Partial deployment: none or exact service changed.
- Rollback status: not needed, available, executed, or blocked.

## Environment Contract
List required variable names, owner, context, visibility, and scope. Never include values.

## Remaining Risks
- Risk, reason it remains, and next action.
```

If no findings remain, explicitly state that no confirmed findings remain and identify residual test limitations, such as unavailable credentials or skipped deployed-browser verification.
