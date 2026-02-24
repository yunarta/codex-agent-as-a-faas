Sprint Planning: ARC-CLI-SPRINT-20260224-01
===========================================

Sprint goal
-----------
Deliver a testable CLI-only container image for the pi-based agent, with bind-mounted runtime/workspace persistence and documented CI/CD usage patterns (without implementing CI/CD pipelines).

Backlog overview
----------------
1. **STORY-001:** "CLI execution contract" -> define and implement agent CLI arguments, input modes, JSON output, and exit-code mapping suitable for job runners.
2. **STORY-002:** "Container image baseline" -> package the agent CLI into a reusable image with a CLI entrypoint and storage mount conventions.
3. **STORY-003:** "CI/CD usage docs (no pipeline code)" -> document how to run the image as a job step using bind mounts, env vars, and token injection.
4. **STORY-004:** "Container smoke verification" -> prove the image boots and the CLI contract works for at least help + controlled failure paths.

Stories & acceptance criteria
----------------------------
- **STORY-001 (CLI contract):**
  - Given the agent runtime exists in `agent-inference`
  - When we invoke the CLI with `--session-id` and input (arg/stdin/file)
  - Then it returns machine-readable JSON on stdout and meaningful non-zero exit codes on failure.
- **STORY-002 (Container baseline):**
  - Given the repo contains the `pi`-based agent runtime
  - When we build the CLI image and run it with bind mounts for `/workspace` and `/runtime`
  - Then the container runs as a CLI process (no port exposure required) and writes runtime artifacts to mounted storage.
- **STORY-003 (CI/CD usage docs):**
  - Given the container is intended for CI/CD job execution
  - When an operator reads the docs
  - Then they can run `docker build` and `docker run` examples with token injection and mounted storage without pipeline-specific YAML.
- **STORY-004 (Verification):**
  - Given the image and CLI contract are implemented
  - When we run local/container smokes
  - Then we capture evidence for help output, error envelope (missing token), and exit-code behavior.

Tasks
-----
- **TASK-100:** Add CLI entrypoint script that reuses the current handler logic and emits CI/CD-friendly JSON + exit codes.
- **TASK-101:** Add container image definition (`Dockerfile`) for CLI execution with `/workspace` and `/runtime` conventions.
- **TASK-102:** Document local and containerized CLI usage, including bind-mount and token-path patterns for CI/CD use.
- **TASK-103:** Run verification smokes (`npm test`, CLI help, missing-token path, container help/missing-token) and record outcomes.

Out of Scope (This Sprint)
--------------------------
- GitHub Actions/GitLab/Jenkins pipeline YAML or runner setup
- HTTP service runtime / OpenFaaS deployment validation
- Multi-agent orchestration tooling
- Long-term persistent memory backend design (Redis/Postgres/etc.)

Current Implementation Snapshot
-------------------------------
- CLI baseline implementation exists in `agent-inference/scripts/agent-cli.js`.
- Container image baseline exists in `agent-inference/Dockerfile.cli`.
- CI/CD-oriented usage docs exist in `agent-inference/README.md`.
- Verification completed for local+container smokes, non-root/bind-mount checks, and `config/profile` failure-path coverage.

Gating Notes (Stage 3 Readiness)
--------------------------------
- To pass Stage 3 gate, the sprint report should include evidence pointers for the CLI/container smoke runs and the final container execution contract summary.
- Success for this sprint is "testable containerized CLI baseline", not "full pipeline integration".

Stage 3 Gate Output
-------------------
- `GATE-001`: `.agile/reports/arcs/ARC-CLI/gate-001.rst`

Stage 4 Execution Outputs
-------------------------
- Hardening progress report: `.agile/reports/arcs/ARC-CLI/run-001-hardening.rst`
- Execution completion report: `.agile/reports/arcs/ARC-CLI/run-002-execution-complete.rst`
- Demo readiness report: `.agile/reports/arcs/ARC-CLI/demo-readiness.rst`
