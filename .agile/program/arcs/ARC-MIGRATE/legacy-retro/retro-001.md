# Retro Report - Sprint 1

Facilitator: Scrum Master
Date: 2026-02-11

## Wins (3)

- Live inference works with provided root `token.json` and returns structured success envelope.
- Failure modes are explicit and testable (`TOKEN_MISSING`, `UPSTREAM_INFERENCE_FAILED`).
- Verification evidence is scriptable and repeatable (`npm test`, `npm run smoke:http`).

## Issues (3)

- Initial live call failed (`Instructions are required`) because provider needed an explicit system prompt.
- `@mariozechner/pi` package is CLI-first, causing initial integration ambiguity.
- Full `faas-cli` deployment path was not exercised in this environment.

## Root Causes

- Provider-specific request requirements were not encoded in the first handler iteration.
- Package capability assumptions were made before checking actual exported runtime APIs.
- Environment lacked validated OpenFaaS runtime path during sprint execution.

## Action Items

- Action: Add deployment validation task using `faas-cli up` on target gateway.
  - Owner role: Implementer
  - Cycles: 1
  - Expected outcome: prove gateway-level deployment and invocation.
- Action: Add provider compatibility matrix for token types and model defaults.
  - Owner role: Analyst
  - Cycles: 1
  - Expected outcome: reduce trial-and-error auth/model failures.
- Action: Add optional `metadata.instructions` mapping for custom prompts.
  - Owner role: Implementer
  - Cycles: 1
  - Expected outcome: better inference control without changing code.
- Action: Document proof artifacts and Confluence publish checklist in the retro so the team can cite them directly.
  - Owner role: PO
  - Cycles: 1
  - Expected outcome: retro includes links to `.agile/reports/evidence/sprint-001/*` and the publish page for Traceability.

## Policy Violations

- None.

## Risks To Watch

- Token format drift for Codex OAuth credentials may break inference unexpectedly.
- Upstream provider behavior changes could alter required prompt schema.
