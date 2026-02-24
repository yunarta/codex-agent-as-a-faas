ARC-CLI Sprint 02 Demo Readiness
================================

:ARC-ID: ARC-CLI
:SPRINT-ID: ARC-CLI-SPRINT-20260224-02
:Status: Partial (workflow setup ready, live inference blocked by expired token)
:Last Updated: 2026-02-24

Ready to Show
-------------
- GitHub Actions workflow scaffold for baseline + optional live smoke
- Token-backed live inference smoke script and evidence capture flow
- Evidence showing real provider call attempt and explicit blocker output

Blocked for Full Demo
---------------------
- Token-backed inference success output (`status=ok`) for prompt `"What is GIR in golf"` is not available because the current token is expired.

Next Step to Unblock
--------------------
- Refresh `token.json` and rerun `bash scripts/testing/arc-cli-live-inference.sh`.

