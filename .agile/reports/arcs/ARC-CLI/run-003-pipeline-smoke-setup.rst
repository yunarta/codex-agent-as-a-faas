Run Report - ARC-CLI Pipeline Smoke Setup
=========================================

:ARC-ID: ARC-CLI
:SPRINT-ID: ARC-CLI-SPRINT-20260224-02
:Status: Stage 4 execution in progress (workflow setup complete; live token smoke blocked)
:Last Updated: 2026-02-24

Objective
---------
Set up the next sprint to demonstrate pipeline-style execution for the agent CLI container and run a token-backed inference smoke with prompt `"What is GIR in golf"`.

What Was Done
-------------
- Added GitHub Actions smoke workflow scaffold: `.github/workflows/arc-cli-smoke.yml`
- Added token-backed live inference smoke script: `scripts/testing/arc-cli-live-inference.sh`
- Retried live inference in container using local `token.json` and `config/profile` (`live-golf`) with prompt `"What is GIR in golf"`
- Captured evidence under `.agile/reports/evidence/arc-cli-sprint-002/`
- Fixed handler runtime default loading so config/profile environment values (such as `SYSTEM_PROMPT`) are resolved at execution time

Live Inference Result
---------------------
- Result: BLOCKED (provider rejected token as expired)
- Error code: `UPSTREAM_INFERENCE_FAILED`
- Provider message: `Provided authentication token is expired. Please try signing in again.`

Evidence Pointers
-----------------
- Workflow file: `.github/workflows/arc-cli-smoke.yml`
- Live smoke script: `scripts/testing/arc-cli-live-inference.sh`
- Live smoke stdout: `.agile/reports/evidence/arc-cli-sprint-002/live-inference.stdout.json`
- Live smoke stderr: `.agile/reports/evidence/arc-cli-sprint-002/live-inference.stderr.log`
- Live smoke meta: `.agile/reports/evidence/arc-cli-sprint-002/live-inference.meta.txt`
- Live smoke build log: `.agile/reports/evidence/arc-cli-sprint-002/live-docker-build.txt`

Notes
-----
- The workflow and smoke runner are ready; the blocker is credential validity, not container orchestration or CLI contract.
- After token refresh, rerun `bash scripts/testing/arc-cli-live-inference.sh` to complete live evidence capture.

