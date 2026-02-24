# Demo Pack - Sprint 1 (OpenFaaS Inference MVP)

## What's Done

- Node.js OpenFaaS-style function implemented in `agent-inference/handler.js`.
- Inference wired through `@mariozechner/pi` ecosystem (`@mariozechner/pi-ai` completeSimple API).
- Manual token loading via `token.json` implemented.
- HTTP contract and install docs added in `agent-inference/README.md`.
- Automated tests and smoke scripts added.

## What's Testable Now

- Success path (`200`, inference output envelope).
- Missing token path (`500`, `TOKEN_MISSING`).
- Upstream inference failure path (`502`, `UPSTREAM_INFERENCE_FAILED`).
- Trace logging (`request_id`, `session_id`, `latency_ms`, `outcome`).

## How To Verify

1. `cd agent-inference && npm install`
2. `npm test`
3. `npm run smoke:http`
4. Inspect `/tmp/agent-http-server-*.log` for trace fields.

## Evidence Pointers

- Unit tests: `agent-inference/test/handler.test.js`
- Runtime handler: `agent-inference/handler.js`
- HTTP wrapper demo: `agent-inference/scripts/http-server.js`
- Smoke script: `agent-inference/scripts/smoke-http.sh`
- Verification summary: `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/verification-001.md`

## Known Gaps / Constraints

- No full OpenFaaS gateway deployment execution (`faas-cli up`) in this sprint.
- Token automation and local memory persistence are deferred by scope.

## Demo Script (5-10 min)

1. Show `agent-inference/README.md` contract and token placement rules.
2. Run `npm run smoke:http` and read three outputs (happy/missing-token/upstream-failure).
3. Show matching `/tmp/agent-http-server-*.log` entries for traceability.
4. Close with deferred scope: memory/tool integrations and token automation.

## Out of Scope Reminder

- Token acquisition/rotation automation.
- Local memory setup.
- Additional tool integrations beyond the base inference call.

## Demo Fix Policy

Allowed during demo: troubleshooting/logging/small reversible hotfixes only.
