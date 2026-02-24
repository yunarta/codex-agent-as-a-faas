Demo Pack - Sprint 1
====================

What's Done
-----------

- Node.js OpenFaaS-style function in `agent-inference/handler.js`
- Inference via `@mariozechner/pi-agent-core` + `@mariozechner/pi-ai`
- `token.json` loader and contract documentation in `agent-inference/README.md`
- Tests and smoke scripts (`agent-inference/test/handler.test.js`, `agent-inference/scripts`)

What's Testable Now
-------------------

- `200` success response with inference output
- `500 TOKEN_MISSING` for missing token
- `502 UPSTREAM_INFERENCE_FAILED` for invalid token
- Trace logging fields (`timestamp`, `request_id`, `session_id`, `latency_ms`, `outcome`)

How to Verify
--------------

1. `cd agent-inference && npm install`
2. `npm test`
3. `npm run smoke:http`
4. Inspect `/tmp/agent-http-server-*.log`

Evidence Pointers
------------------

- Handler: `agent-inference/handler.js`
- HTTP wrapper: `agent-inference/scripts/http-server.js`
- Smoke script: `agent-inference/scripts/smoke-http.sh`
- Verification: `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/verification-001.md`

Known Gaps
----------

- Actual gateway deployment (`faas-cli up`) not executed in this workspace.

Demo Script
-----------

1. Show `agent-inference/README.md` contract.
2. Run `npm run smoke:http` to demonstrate success/missing token/upstream failure.
3. Display `/tmp/agent-http-server-*.log` entries.
4. Mention deferred scope (memory/tooling, token automation).

Out of Scope Reminder
---------------------

- Token automation and memory tuning.
- Additional tool integrations beyond the base inference call.

Demo Fix Policy
---------------

Only log, troubleshoot, or apply small reversible hotfixes during demo.
