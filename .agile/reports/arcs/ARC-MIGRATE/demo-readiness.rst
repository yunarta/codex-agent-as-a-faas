ARC-MIGRATE Demo Readiness
==========================

:ARC-ID: ARC-MIGRATE
:SPRINT-ID: ARC-MIGRATE-SPRINT-20260224-01
:Status: Ready for BO Demo (Migration Sprint, v5 finalized)
:Last Updated: 2026-02-24

Scope of This Demo
------------------
- Show that legacy agile/docs artifacts have been mapped into AAS v5 knowledge docs under `.agile`.
- Show execution-ready follow-on tasks derived from retro issues and known gaps.
- Show preserved evidence/publish pointers so the team can demo traceability, not only implementation history.

What Is Ready
-------------
- ARC brief and planning artifacts exist (`arc-brief.rst`, `planning.rst`, `codebase-inventory.rst`).
- TASK-010 output exists: `evidence-publish-summary.rst`.
- TASK-011 output exists: `execution-task-translation.rst`.
- TASK-012 output exists: `faas-deploy-and-metadata-notes.rst`.
- Workspace SSOT and continuation packet are updated for Stage 4 execution.
- Canonical `.agile` paths now contain imported raw evidence, legacy markdown reports, backlog YAML, and Sphinx pages (no runtime dependency on `.migrating-*` folders).

Evidence to Show in Demo
------------------------
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/demo-001.md`
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/verification-001.md`
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/run-001.md`
- `.agile/reports/sphinx/source/sprints/sprint-001/sprint-report-latest.rst`
- `.agile/reports/sphinx/source/sprints/sprint-001/proof-live-inference.rst`
- `.agile/program/arcs/ARC-MIGRATE/evidence-publish-summary.rst`

Known Gaps (Call Out Explicitly)
--------------------------------
- Real OpenFaaS gateway deployment validation (`faas-cli up`) is still pending and remains a next-sprint execution item.
- No new runtime code changes were executed in this migration sprint; the output is a finalized v5 knowledge/doc/backlog migration.

Demo Recommendation
-------------------
- Proceed with BO demo for ARC-MIGRATE migration sprint.
- Position gateway deployment proof as the first execution item in the next implementation sprint.
