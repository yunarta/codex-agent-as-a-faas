Deployment and Metadata Notes
=============================

:ARC-ID: ARC-MIGRATE
:SPRINT-ID: ARC-MIGRATE-SPRINT-20260224-01
:Task: TASK-012
:Last Updated: 2026-02-24

Purpose
-------
Document the expected `faas-cli up` path plus provider/metadata notes so the next execution sprint can validate deployment without losing contract/verification context.

Expected `faas-cli up` Path (Target Gateway)
--------------------------------------------
Pre-checks
~~~~~~~~~~
- Confirm OpenFaaS gateway URL and credentials are available.
- Confirm `faas-cli` is installed and points to the correct gateway context.
- Confirm `token.json` is present at the expected component root before build/deploy.
- Confirm `stack.yml` references the `agent-inference` function image/build path used in this repo.

Execution Flow
~~~~~~~~~~~~~~
1. Authenticate to the gateway (`faas-cli login` or environment-driven auth).
2. Build and deploy with `faas-cli up -f stack.yml`.
3. Invoke `/function/agent-inference` with a known-good payload.
4. Capture one success response and one failure response (`TOKEN_MISSING` or invalid token) if safe in the environment.
5. Record logs and endpoint URL used for the run report.

Recommended Evidence Capture (Next Sprint)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
- Deploy output log (`faas-cli up`)
- Invocation output (success)
- Invocation output (controlled failure)
- Gateway/function logs showing trace fields
- Updated verification summary with gateway route details

Provider Compatibility Matrix Seed
----------------------------------
Use this column set in the next sprint document:

- Provider / SDK path
- Token type/source (manual `token.json`, OAuth token, service token)
- Model default or required model field
- Prompt requirement (`metadata.instructions` required/optional)
- Expected success path
- Observed error signature
- Status (`tested`, `untested`, `blocked`)
- Notes / mitigation

Initial Known Entries (from migrated evidence)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
- Codex-backed path via `pi-ai`: `tested` only through local HTTP wrapper and live smoke script, not through real gateway deployment.
- Invalid token path: structured `UPSTREAM_INFERENCE_FAILED` observed in wrapper smoke.
- Missing token path: structured `TOKEN_MISSING` observed in wrapper smoke.

`metadata.instructions` Mapping Notes
-------------------------------------
Goal
~~~~
Allow callers to pass optional prompt steering in `metadata.instructions` without breaking the existing request/response contract.

Contract Guidance
~~~~~~~~~~~~~~~~~
- Keep `input` and `session_id` as required fields.
- Treat `metadata` as optional.
- If `metadata.instructions` exists and is a non-empty string, pass it as provider/system instructions.
- If missing, use default instructions path so current tests continue to pass.
- Reject unsupported `metadata.instructions` types with a clear validation error (preserve structured error envelope).

Verification Notes (Future)
~~~~~~~~~~~~~~~~~~~~~~~~~~~
- Add one test for default behavior (no metadata).
- Add one test for custom `metadata.instructions`.
- Add one negative test for invalid metadata shape.
- Confirm trace logs do not leak token contents or full instruction payloads if sensitive.

Demo Readiness Implication
--------------------------
- This document satisfies migration-sprint documentation readiness for TASK-012.
- Actual gateway proof remains a next-sprint execution item and should be presented as an explicit known gap, not hidden.

