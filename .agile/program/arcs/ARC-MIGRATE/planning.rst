Sprint Planning: ARC-MIGRATE-SPRINT-20260224-01
===============================================

Sprint goal
-----------
Capture and migrate the knowledge, backlog, and evidence from the previous CodexFAAS run so Stage 3 can approve execution-ready work for the next sprint under ARC-MIGRATE.

Backlog overview
----------------
1. **EPIC-001:** "Migrate the CodexFAAS inference endpoint narrative" → translate the earlier sprint's epic/story/task hierarchy into the new ARC, expose verification proof, and seed follow-on sprint items.
2. **STORY-001:** "Document the working codebase and evidence" (linked items: inventory doc, migrating reports, `.agile` evidence pointers). Acceptance criteria below.
3. **STORY-002:** "Plan the next migrate sprint" (linked items: `faas-cli up` validation, provider compatibility matrix, metadata instructions); set up Phase 1 execution backlog.

Stories & acceptance criteria
----------------------------
- **STORY-001 (Document codebase):**
  - Given the `agent-inference` implementation, evidence logs, and sprint reports live in the repo
  - When we produce `codebase-inventory.rst` and reference key artifacts
  - Then any squad member can point to `.agile` for the handler, scripts, docs, verification outputs, and known gaps.
- **STORY-002 (Backlog translation):**
  - Given `.agile/program/arcs/ARC-MIGRATE/legacy-backlog` + `legacy-retro` entries
  - When we capture their intent in `.agile/program/arcs/ARC-MIGRATE/planning.rst` and link upcoming action items
  - Then Stage 3 has a clear backlog to gate, including `faas-cli` deployment, provider matrix, metadata instructions, and retro proof documentation.
- **STORY-003 (Sprint readiness):**
  - Given the migrate arc needs a first sprint for execution
  - When we declare `ARC-MIGRATE-SPRINT-20260224-01`, align the backlog with the action items, and note the execution trigger requirements
  - Then the PO can request Stage 3 gate validation for the execution sprint.

Tasks
-----
- **TASK-010:** Summarize verification evidence/publish pages (reports, demo pack, verification runs) inside `.agile` so evidence pointers are centralized.
- **TASK-011:** Turn retro action items (gateway deployment, provider compatibility, metadata instructions, proof evidence) into explicit sprint tasks ready for Execution after Stage 3 gating.
- **TASK-012:** Document the expected `faas-cli up` deployment path and required prompt metadata updates before execution so verification scripts remain relevant.

Stage 4 Execution Outputs (Migration Sprint)
--------------------------------------------
- **TASK-010 output:** `.agile/program/arcs/ARC-MIGRATE/evidence-publish-summary.rst`
- **TASK-011 output:** `.agile/program/arcs/ARC-MIGRATE/execution-task-translation.rst`
- **TASK-012 output:** `.agile/program/arcs/ARC-MIGRATE/faas-deploy-and-metadata-notes.rst`
- **Demo readiness report:** `.agile/reports/arcs/ARC-MIGRATE/demo-readiness.rst`
