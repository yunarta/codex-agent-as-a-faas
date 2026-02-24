Evidence and Publish Summary
============================

:ARC-ID: ARC-MIGRATE
:SPRINT-ID: ARC-MIGRATE-SPRINT-20260224-01
:Task: TASK-010
:Last Updated: 2026-02-24

Purpose
-------
Centralize evidence pointers and publish-page sources in canonical `.agile` locations so the migration sprint can cite one ARC-level document without depending on staging folders.

Canonical Evidence Pointers (Raw Outputs)
-----------------------------------------
- `.agile/reports/evidence/sprint-001/npm-test.txt`: unit test run output (`npm test`).
- `.agile/reports/evidence/sprint-001/smoke-http.txt`: HTTP wrapper smoke output (happy, missing token, upstream failure).
- `.agile/reports/evidence/sprint-001/smoke-live.txt`: live provider smoke output (`RUN_LIVE=1 npm run smoke:live`).
- `.agile/reports/evidence/sprint-001/http-happy.log`: trace log for happy path.
- `.agile/reports/evidence/sprint-001/http-missing-token.log`: trace log for missing token path.
- `.agile/reports/evidence/sprint-001/http-upstream-failure.log`: trace log for upstream failure path.
- `.agile/reports/evidence/sprint-001/gir-live.txt` and `.agile/reports/evidence/sprint-001/gir-golf-live.txt`: additional live output captures referenced by earlier reports.

Verification and Demo Reports (Markdown Sources)
------------------------------------------------
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/verification-001.md`: AC1-AC4 pass matrix for STORY-001; recommends demo approval.
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/verification-002.md`: spike-correction verification summary after runtime pivot to `pi-agent-core` + `pi-ai`.
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/demo-001.md`: demo pack with script, evidence pointers, known gaps, and demo fix policy.
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/run-001.md`: Sprint 1 run report with Stage 3/5 gate decisions and next-run plan.
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/run-002-spike.md`: spike correction report and updated risk/gap statement.

Publish-Ready Sphinx Pages (Canonical Imports)
----------------------------------------------
- `.agile/reports/sphinx/source/confluence-publish.rst`: Confluence environment variables and publish commands.
- `.agile/reports/sphinx/source/sprints/sprint-001/index.rst`: Sprint 1 report bundle index.
- `.agile/reports/sphinx/source/sprints/sprint-001/sprint-report-latest.rst`: latest sprint narrative with evidence snippets and known gap (`faas-cli up`).
- `.agile/reports/sphinx/source/sprints/sprint-001/proof-live-inference.rst`: reproducible proof page for live inference and log correlation.
- `.agile/reports/sphinx/source/sprints/sprint-001/demo-001.rst`: demo pack in RST form.
- `.agile/reports/sphinx/source/sprints/sprint-001/verification-002.rst`: spike verification summary in RST form.
- `.agile/reports/sphinx/source/sprints/sprint-002/pi-stack-capabilities.rst`: capability study used as context for provider/runtime planning.

Traceability Mapping for ARC-MIGRATE
------------------------------------
- STORY-001 evidence coverage: verification summaries, smoke outputs, and trace logs above are sufficient to show local wrapper behavior for AC1-AC4.
- TASK-010 output: this file becomes the ARC-level index for evidence and publish pointers during Stage 4 execution.
- Demo handoff input: `demo-001` + `sprint-report-latest` + `proof-live-inference` provide the fastest BO-facing narrative set.

Known Gaps (Still Open)
-----------------------
- Real gateway deployment proof (`faas-cli up`) is not present in migrated evidence yet.
- Confluence publish process is documented, but no ARC-MIGRATE publish run output has been captured yet.
