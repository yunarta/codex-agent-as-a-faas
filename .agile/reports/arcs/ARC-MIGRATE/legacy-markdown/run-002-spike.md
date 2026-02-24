# Run Report - Sprint 1 Spike Correction

## A) Objective & Outcome

- Objective: correct Sprint 1 technical direction before going further by aligning runtime packages with OpenClaw-style agent architecture.
- Outcome: handler now uses `@mariozechner/pi-agent-core` with `@mariozechner/pi-ai`, tests and smoke scenarios pass.

## B) Shipped/Produced

- Updated runtime: `agent-inference/handler.js`
- Updated deps: `agent-inference/package.json`, `package.json`
- Updated docs: `agent-inference/README.md`
- Verification report: `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/verification-002.md`

## C) What's Testable Now

- Same API contract with corrected runtime stack.
- Happy/missing-token/upstream-failure scenarios.

## D) How to Verify

1. `cd agent-inference && npm install`
2. `npm test`
3. `npm run smoke:http`

## E) Evidence Pointers

- Test output from `npm test`
- Smoke output from `npm run smoke:http`
- File updates listed above

## F) Known Gaps/Risks

- Full `faas-cli up` deployment path still pending in this environment.

## G) VALUE_ADD

- What: tightened upstream failure detection (agent `stopReason=error` and empty output now fail fast).
- Why it helps: prevents false-positive `200` responses on invalid credentials.
- Risk/Tradeoff: stricter behavior may surface more provider-side errors as `502`.
- Reversible: yes.

## H) Next Run Plan

1. Deploy to actual OpenFaaS gateway.
2. Repeat smoke checks against live gateway route.
3. Add memory/tool integration in Sprint 2.

## I) Role Ledger & Gate Decisions

- MP: directed spike correction scope.
- Implementer: changed handler/dependencies/docs.
- Verifier: reran tests/smokes and approved correction.
- Gate decision: Stage 5 demo remains APPROVED with updated runtime.
