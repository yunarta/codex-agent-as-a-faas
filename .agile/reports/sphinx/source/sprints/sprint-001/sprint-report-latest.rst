Sprint Report (Latest)
======================

Sprint
------

- **Sprint**: 1 Spike Correction
- **Date**: 2026-02-11
- **Status**: Ready for Confluence publish

Objective
---------

Correct Sprint 1 architecture to use `@mariozechner/pi-agent-core` + `@mariozechner/pi-ai` for the OpenFaaS inference runtime.

Outcome
-------

- Handler migrated to the `Agent` orchestration runtime.
- API contract preserved.
- Failure handling ramped up for upstream/error and empty-output cases.

Validation Results
------------------

- Unit tests: PASS (`npm test`, 4/4)
- Smoke happy path: PASS (`200` with `status=ok`)
- Smoke missing token: PASS (`500 TOKEN_MISSING`)
- Smoke upstream failure: PASS (`502 UPSTREAM_INFERENCE_FAILED`)

Proof (Evidence Output)
----------------------

The following snippets are captured from executed commands and handler logs. Full raw outputs are stored under `.agile/reports/evidence/sprint-001/`.

Unit tests (`npm test`)
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: text

   > agent-inference@0.1.0 test
   > node --test
   ...
   # tests 4
   # pass 4
   # fail 0

HTTP contract smoke (`npm run smoke:http`)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: text

   [happy]
   {"status":"ok","output":"I don’t have any sprint details. Please share the sprint 1 notes/tickets or a brief summary to condense.","session_id":"happy","request_id":"f8cc3d80-d46e-4800-af49-ed4e37d2a92c"}
   [missing-token]
   {"status":"error","error_code":"TOKEN_MISSING","message":"token.json is required and must contain access_token","request_id":"9cf7ff5a-735f-4d60-a024-70c9532ae909"}
   [upstream-failure]
   {"status":"error","error_code":"UPSTREAM_INFERENCE_FAILED","message":"Failed to extract accountId from token","request_id":"9656f17f-833b-4531-b98b-79956fe16cd9"}

Live provider smoke (`RUN_LIVE=1 npm run smoke:live`)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: text

   statusCode: 200
   body: {"status":"ok","output":"Please provide the sprint goal text to summarize.","session_id":"sprint1-smoke","request_id":"cc580381-aef4-4949-8a47-4281c0d9b517"}

Handler log proof (request_id correlation)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: text

   {"event":"inference_complete","request_id":"f8cc3d80-d46e-4800-af49-ed4e37d2a92c","session_id":"happy","latency_ms":2192,"outcome":"ok",...}
   {"event":"inference_failed","request_id":"9cf7ff5a-735f-4d60-a024-70c9532ae909","session_id":"missing-token","outcome":"error","error_code":"TOKEN_MISSING",...}
   {"event":"inference_failed","request_id":"9656f17f-833b-4531-b98b-79956fe16cd9","session_id":"upstream-failure","outcome":"error","error_code":"UPSTREAM_INFERENCE_FAILED",...}

Evidence Pointers
-----------------

- Handler code: `agent-inference/handler.js`
- Tests: `agent-inference/test/handler.test.js`
- Spike verification: `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/verification-002.md`
- Spike run report: `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/run-002-spike.md`

Known Gaps
----------

- `faas-cli up` against a real OpenFaaS gateway remains to be validated.

Next Steps
----------

1. Deploy to the real OpenFaaS gateway.
2. Re-run the smoke suite against the live endpoint.
3. Begin Sprint 2 on memory/tool integrations.
