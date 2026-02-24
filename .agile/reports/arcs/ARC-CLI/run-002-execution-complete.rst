Run Report - ARC-CLI Sprint Execution Complete
==============================================

:ARC-ID: ARC-CLI
:SPRINT-ID: ARC-CLI-SPRINT-20260224-01
:Status: Stage 4 execution complete (awaiting demo)
:Last Updated: 2026-02-24

Objective and Outcome
---------------------
- Objective: deliver a testable, CLI-only container image for the pi-based agent with CI/CD-usable runtime conventions.
- Outcome: completed baseline implementation, gate approval, non-root/bind-mount hardening, reusable `config/profile` support, and refreshed test evidence.

Delivered
---------
- CLI contract implementation (`agent-inference/scripts/agent-cli.js`)
- Container image definition (`agent-inference/Dockerfile.cli`)
- CI/CD usage docs (`agent-inference/README.md`)
- Smoke test scripts (`scripts/testing/arc-cli-local-smoke.sh`, `scripts/testing/arc-cli-container-smoke.sh`, `scripts/testing/arc-cli-gate-smoke.sh`)
- Gate approval report (`.agile/reports/arcs/ARC-CLI/gate-001.rst`)
- Evidence bundle (`.agile/reports/evidence/arc-cli-sprint-001/`)

Verification Summary
--------------------
- Unit tests: PASS (`npm test`)
- Local CLI help + missing-token: PASS
- Local CLI `config/profile` missing-token smoke: PASS
- Docker build + container help: PASS
- Default image user non-root probe: PASS
- Bind-mount write probe under host UID/GID mapping: PASS
- Container missing-token + container `config/profile` missing-token smokes: PASS

Notes
-----
- Docker credential-helper mismatch on this host is handled in test scripts via a temporary `DOCKER_CONFIG`.
- Happy-path token-injected container smoke is intentionally left as an optional follow-up.

Next Recommended Options
------------------------
1. Demo the sprint outcomes to BO.
2. Add GitHub Actions smoke workflow that builds/pulls the image and runs CLI smokes.
3. Add config/profile schema validation and richer profile composition.

