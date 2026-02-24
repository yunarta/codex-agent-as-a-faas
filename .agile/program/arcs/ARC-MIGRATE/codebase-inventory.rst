Codebase Inventory Snapshot
===========================

Agent runtime
-------------
- `agent-inference/handler.js`: OpenFaaS handler that validates POST payloads, loads `token.json`, and runs `@mariozechner/pi` to return structured JSON (happy path, `TOKEN_MISSING`, `UPSTREAM_INFERENCE_FAILED`).
- `agent-inference/package.json` + `agent-inference/package-lock.json`: runtime dependencies plus npm scripts (`test`, `smoke:http`, `smoke:live`, `dev`).
- `agent-inference/test/handler.test.js`: unit coverage for the handler contract.
- `agent-inference/scripts/*`: HTTP wrapper, smoke scripts, log collectors used for verification demos.
- `agent-inference/README.md`: installation steps, token placement guidance, request/response contract, curl examples for success and failure paths.

Supporting configuration
------------------------
- `stack.yml`: OpenFaaS deployment manifest referenced by the sprint demos.
- `token.json` (kept out of VCS) is expected at the component root for live runs; verifying evidence simulates missing/invalid tokens via renamed copies.

Evidence & verification
-----------------------
- `.agile/reports/evidence/sprint-001/npm-test.txt`, `.agile/reports/evidence/sprint-001/smoke-http.txt`, `.agile/reports/evidence/sprint-001/smoke-live.txt`: saved command outputs proving tests/smokes pass.
- `.agile/reports/evidence/sprint-001/http-happy.log`, `.agile/reports/evidence/sprint-001/http-missing-token.log`, `.agile/reports/evidence/sprint-001/http-upstream-failure.log`: handler trace logs cited by the demo/test docs.
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/verification-001.md`, `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/verification-002.md`: Gate-ready verification summaries.
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/demo-001.md`: Sprint 1 demo pack referencing the HTTP wrapper and logs.
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/run-001.md`, `run-002-spike.md`: execution reports capturing sprint objectives, known gaps (`faas-cli up` missing), and follow-up plan items.

Legacy backlog artifacts
-----------------------
- `.agile/program/arcs/ARC-MIGRATE/legacy-backlog/epic-001.yml`: EPIC-001 describes launching the OpenFaaS Codex inference endpoint with `@mariozechner/pi`.
- `.agile/program/arcs/ARC-MIGRATE/legacy-backlog/story-001.yml`: story-level acceptance criteria (AC1-AC4) for success, missing token, upstream failure, and trace logging.
- `.agile/program/arcs/ARC-MIGRATE/legacy-backlog/task-001..005.yml`: discrete tasks covering handler creation, pi integration, docs, verification tests, and demo pack.
- `.agile/program/arcs/ARC-MIGRATE/legacy-retro/retro-001.md`: retrospective insights (wins/issues/root causes/action items) that drive new action items (gateway deployment, provider matrix, metadata instructions, retro proof links).
- `.agile/reports/evidence/sprint-001/*`: CLI logs and validation outputs that can be referenced in future retros/per meta.

Documented learnings
---------------------
- Sprint 1 introduced a local HTTP wrapper to simulate OpenFaaS, enabling repeatable `npm test`/`smoke:http` flows without a real gateway.
- Missing gateway deployment and provider prompt requirements are explicit gaps captured in retro/action items.
- Future work should include OpenFaaS `faas-cli up` validation, metadata instructions, and provider compatibility documentation before the next sprint demo.
