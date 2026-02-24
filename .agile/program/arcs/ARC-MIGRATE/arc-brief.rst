ARC Brief
=========

:ARC-ID: ARC-MIGRATE
:Title: Migration Knowledge Base
:Owner: Human BO
:Status: Migration finalized (v5 canonicalized)
:Last Updated: 2026-02-24

Intent
------
Capture and migrate the sprint knowledge, backlog, and evidence produced under the previous CodexFAAS run so the new AAS v5 workflow can plan the next sprint from a known baseline.

Goals (measurable)
------------------
- Document existing deliverables (`agent-inference` handler, scripts, docs, stack.yml, evidence logs, reports) inside `.agile` so the squad can reference a single SSOT.
- Translate prior sprint artifacts (epic/story/task/retro/reports) into the ARC-MIGRATE backlog and acceptance criteria for the planning sprint.
- Prepare the first ARC-MIGRATE sprint (`ARC-MIGRATE-SPRINT-20260224-01`) with clearly scoped backlog items for migrating remaining materials.

Constraints
-----------
- Staging discipline: only `.agile/**` and approved docs may be edited during this planning sprint.
- Execution (code changes/tests) awaits explicit `EXECUTE` directives tied to `ARC-MIGRATE-SPRINT-20260224-01`.
- Knowledge capture must avoid duplicating report text wholesale; summarize at a level actionable for planning.

Risk Notes
----------
- Missing context from the source sprint may cause overlooked dependencies; ensure every section references at least one migrated artifact.
- If we postpone Execution too long, the knowledge base may grow stale relative to the deployed demo artifacts.
