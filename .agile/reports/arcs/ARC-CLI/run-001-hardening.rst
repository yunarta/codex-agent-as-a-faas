Run Report - ARC-CLI Hardening 001
==================================

:ARC-ID: ARC-CLI
:SPRINT-ID: ARC-CLI-SPRINT-20260224-01
:Status: Stage 4 in progress
:Last Updated: 2026-02-24

Objective
---------
Harden the CLI container image for safer CI/CD-style usage by making the image default to a non-root user and validating a bind-mount-friendly execution pattern using `--user <host uid:gid>`.

What Changed
------------
- `agent-inference/Dockerfile.cli` now creates a dedicated `agent` user/group (`10001:10001`) and runs the image as that non-root user by default.
- `agent-inference/scripts/agent-cli.js` now reports `runtime.process_uid` and `runtime.process_gid` in stdout JSON for easier smoke verification.
- `scripts/testing/arc-cli-container-smoke.sh` now verifies default image user is non-root and runs the bind-mount smoke with `--user <host uid:gid>`.
- `agent-inference/README.md` documents the recommended `docker run --user "$(id -u):$(id -g)"` pattern for bind-mounted storage.

Verification (Refreshed)
------------------------
- `bash scripts/testing/arc-cli-gate-smoke.sh`: PASS
- Image default user probe: PASS (`docker-image-user-id.txt` shows non-root uid/gid)
- Container missing-token smoke under host UID/GID mapping: PASS (`TOKEN_MISSING`, exit code `3`, runtime JSON includes `process_uid/process_gid`)

Evidence Pointers
-----------------
- Gate smoke scripts: `scripts/testing/arc-cli-gate-smoke.sh`, `scripts/testing/arc-cli-container-smoke.sh`
- Evidence bundle: `.agile/reports/evidence/arc-cli-sprint-001/`
- Non-root image probe: `.agile/reports/evidence/arc-cli-sprint-001/docker-image-user-id.txt`
- Container missing-token JSON: `.agile/reports/evidence/arc-cli-sprint-001/docker-cli-missing-token.stdout.json`
- Docker build log: `.agile/reports/evidence/arc-cli-sprint-001/docker-build.txt`

Notes / Risks
-------------
- Bind-mounted directories must remain writable by the selected container user; recommended usage is `--user <host uid:gid>` for local/runner-mounted paths.
- Happy-path token-injected container smoke remains optional follow-up and is not required for this hardening checkpoint.

