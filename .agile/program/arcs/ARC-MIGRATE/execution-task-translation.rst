Execution Task Translation
==========================

:ARC-ID: ARC-MIGRATE
:SPRINT-ID: ARC-MIGRATE-SPRINT-20260224-01
:Task: TASK-011
:Last Updated: 2026-02-24

Purpose
-------
Translate retro action items and known gaps into execution-ready tasks for the next implementation cycle after the migration sprint demo.

Source Inputs
-------------
- `.agile/program/arcs/ARC-MIGRATE/legacy-retro/retro-001.md` (action items and risks)
- `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/run-001.md` and `.agile/reports/arcs/ARC-MIGRATE/legacy-markdown/run-002-spike.md` (known gaps and next-run plan)
- `.agile/program/arcs/ARC-MIGRATE/planning.rst` (TASK-011 and TASK-012 scope)

Execution-Ready Task Set (Translated from Retro)
------------------------------------------------
- `ARCM-TASK-011A` - Validate gateway deployment with `faas-cli up`
  - Owner role: Implementer
  - Goal: prove real OpenFaaS deployment/invocation path beyond local HTTP wrapper.
  - Inputs: `stack.yml`, `agent-inference/*`, target gateway credentials, `token.json`.
  - Deliverables: deploy command log, invoke output, failure notes (if any), rollback/cleanup notes.
  - Acceptance check: gateway endpoint returns expected contract for at least one smoke case and is documented with evidence pointers.
- `ARCM-TASK-011B` - Build provider compatibility matrix
  - Owner role: Analyst
  - Goal: reduce auth/model trial-and-error by documenting token type, provider, model default, and observed errors.
  - Inputs: retro issue notes, capability study (`pi-stack-capabilities.rst`), live smoke outcomes.
  - Deliverables: matrix document with tested/untested rows and risk notes.
  - Acceptance check: BO can identify which provider/token combinations are known-good, risky, or untested.
- `ARCM-TASK-011C` - Add `metadata.instructions` prompt mapping
  - Owner role: Implementer
  - Goal: support optional request-level prompt steering without changing code for every prompt tweak.
  - Inputs: current handler request contract, retro action item, verification contract expectations.
  - Deliverables: implementation patch, contract docs update, tests for default and custom instructions behavior.
  - Acceptance check: request with `metadata.instructions` changes inference prompt behavior while preserving response envelope.
- `ARCM-TASK-011D` - Retro proof links and publish checklist traceability
  - Owner role: PO
  - Goal: make retro artifacts directly cite evidence and publish pages.
  - Inputs: evidence catalog (`evidence-publish-summary.rst`), Confluence publish page, proof page.
  - Deliverables: retro addendum or ARC report linking evidence files and Sphinx publish steps.
  - Acceptance check: retro action review includes direct links to proof and publish instructions.

Dependency and Ordering Notes
-----------------------------
- Start with `ARCM-TASK-011A` before demoing real gateway readiness claims.
- `ARCM-TASK-011B` can run in parallel with `ARCM-TASK-011A` once environment details are known.
- `ARCM-TASK-011C` should land with tests so verification scripts remain trustworthy.
- `ARCM-TASK-011D` closes traceability after the evidence set is refreshed.

Demo Impact Classification
--------------------------
- Demo-blocking for "real gateway validation" narrative: `ARCM-TASK-011A`
- Demo-enhancing but not blocking for migration sprint demo: `ARCM-TASK-011B`, `ARCM-TASK-011D`
- Feature-scope for next sprint (not migration demo-blocking): `ARCM-TASK-011C`
