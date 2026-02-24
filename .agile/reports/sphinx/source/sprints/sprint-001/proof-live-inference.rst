Proof: Live Codex Inference
===========================

This page captures reproducible evidence that the inference function is calling the Codex-backed provider and returning responses.

Environment
-----------

- Repo: `galant/agent`
- Function: `agent-inference`
- Runtime stack: `@mariozechner/pi-agent-core` + `@mariozechner/pi-ai`
- Token source: root `token.json` (not published; only evidence outputs are included)

Commands Executed
-----------------

1. `cd agent-inference && npm test`
2. `cd agent-inference && npm run smoke:http`
3. `cd agent-inference && RUN_LIVE=1 npm run smoke:live`

Evidence Files (checked into repo)
---------------------------------

- Unit test output: `.agile/reports/evidence/sprint-001/npm-test.txt`
- HTTP smoke output: `.agile/reports/evidence/sprint-001/smoke-http.txt`
- Live smoke output: `.agile/reports/evidence/sprint-001/smoke-live.txt`
- Handler logs (HTTP wrapper runs):

  - `.agile/reports/evidence/sprint-001/http-happy.log`
  - `.agile/reports/evidence/sprint-001/http-missing-token.log`
  - `.agile/reports/evidence/sprint-001/http-upstream-failure.log`

Highlights
----------

Live provider success (RUN_LIVE=1)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Result: `statusCode: 200` and a JSON response with `status=ok`.
- Evidence: `.agile/reports/evidence/sprint-001/smoke-live.txt`

HTTP contract behavior
~~~~~~~~~~~~~~~~~~~~~~

- Happy path returns `200` with `status=ok` and `output`.
- Missing token returns `500` with `error_code=TOKEN_MISSING`.
- Invalid token returns `502` with `error_code=UPSTREAM_INFERENCE_FAILED`.

Evidence: `.agile/reports/evidence/sprint-001/smoke-http.txt` and matching log lines under `.agile/reports/evidence/sprint-001/http-*.log`.
