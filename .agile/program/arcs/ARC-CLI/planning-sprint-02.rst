Sprint Planning: ARC-CLI-SPRINT-20260224-02
===========================================

Sprint goal
-----------
Set up a GitHub Actions pipeline smoke workflow for the CLI container and validate a token-backed inference run (`"What is GIR in golf"`) through the agent CLI container.

Backlog overview
----------------
1. **STORY-201:** "Pipeline smoke workflow" -> add a GitHub Actions workflow that builds/runs the CLI container and uploads evidence.
2. **STORY-202:** "Live inference smoke script" -> add a reusable token-backed smoke script using the CLI container with profile/instructions config.
3. **STORY-203:** "Inference validation evidence" -> capture output/evidence for prompt `"What is GIR in golf"` and report success or blocker clearly.

Stories & acceptance criteria
----------------------------
- **STORY-201 (Workflow setup):**
  - Given the CLI container baseline is already implemented
  - When a developer reads `.github/workflows/arc-cli-smoke.yml`
  - Then they can see a build/run smoke pipeline pattern and optional live token-backed smoke step.
- **STORY-202 (Live smoke runner):**
  - Given a valid token file is available
  - When we run `scripts/testing/arc-cli-live-inference.sh`
  - Then the script builds/runs the container, uses a profile-based config, and captures stdout/stderr/evidence files.
- **STORY-203 (Evidence outcome):**
  - Given the prompt `"What is GIR in golf"`
  - When we execute the live smoke
  - Then we capture either a successful answer (`status=ok`) or a clear blocker artifact explaining why the inference did not complete.

Tasks
-----
- **TASK-200:** Add GitHub Actions workflow `.github/workflows/arc-cli-smoke.yml` for baseline and optional live smokes.
- **TASK-201:** Add `scripts/testing/arc-cli-live-inference.sh` for token-backed container inference with `config/profile`.
- **TASK-202:** Execute live smoke (`"What is GIR in golf"`) with local token and save evidence under `.agile/reports/evidence/arc-cli-sprint-002/`.
- **TASK-203:** Document workflow + status/blocker in ARC reports and SSOT.

Out of Scope (This Sprint)
--------------------------
- Full production pipeline rollout (branch protections, environments, release gates)
- Secret rotation/refresh automation
- Broader inference benchmark suite

Stage 3 Gate Output
-------------------
- `GATE-002`: `.agile/reports/arcs/ARC-CLI/gate-002.rst`

Stage 4 Execution Outputs (In Progress)
---------------------------------------
- Pipeline setup run report: `.agile/reports/arcs/ARC-CLI/run-003-pipeline-smoke-setup.rst`
- Pipeline demo readiness (pending token status): `.agile/reports/arcs/ARC-CLI/demo-readiness-sprint-02.rst`

