ARC-CLI Demo Readiness
======================

:ARC-ID: ARC-CLI
:SPRINT-ID: ARC-CLI-SPRINT-20260224-01
:Status: Ready for BO Demo (CLI container baseline + hardening)
:Last Updated: 2026-02-24

Scope of This Demo
------------------
- Show a CLI-only agent runtime packaged as a container image (no HTTP service mode).
- Show CI/CD-usable execution contract (stdout JSON, exit codes, bind mounts, token file path).
- Show Stage 4 hardening outcomes (non-root image default and bind-mount-safe `--user` pattern).
- Show reusable `config/profile` support for running many agents with shared image and per-profile settings.

What Is Ready
-------------
- CLI entrypoint implementation: `agent-inference/scripts/agent-cli.js`
- Container image baseline: `agent-inference/Dockerfile.cli`
- CI/CD usage docs and examples: `agent-inference/README.md`
- Testing harness: `scripts/testing/arc-cli-*.sh`
- Stage 3 gate approval: `.agile/reports/arcs/ARC-CLI/gate-001.rst`
- Stage 4 hardening run report: `.agile/reports/arcs/ARC-CLI/run-001-hardening.rst`
- Refreshed evidence bundle: `.agile/reports/evidence/arc-cli-sprint-001/`

Evidence to Show in Demo
------------------------
- `.agile/reports/evidence/arc-cli-sprint-001/npm-test.txt`
- `.agile/reports/evidence/arc-cli-sprint-001/docker-build.txt`
- `.agile/reports/evidence/arc-cli-sprint-001/docker-image-user-id.txt`
- `.agile/reports/evidence/arc-cli-sprint-001/docker-bind-mount-write-probe.txt`
- `.agile/reports/evidence/arc-cli-sprint-001/docker-cli-missing-token.stdout.json`
- `.agile/reports/evidence/arc-cli-sprint-001/docker-cli-config-profile.stdout.json`

Known Gaps (Call Out Explicitly)
--------------------------------
- No GitHub Actions/GitLab/Jenkins pipeline YAML is included in this sprint (by scope).
- No happy-path container smoke with live token injection has been captured yet (optional follow-up).
- Config/profile support currently uses a JSON file contract; no schema validation file is published yet.

Demo Recommendation
-------------------
- Proceed with BO demo for ARC-CLI sprint execution completion.
- Position next sprint options as either (a) pipeline YAML integration or (b) further runtime hardening/features.

