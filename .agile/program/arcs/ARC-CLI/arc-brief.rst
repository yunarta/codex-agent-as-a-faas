ARC Brief
=========

:ARC-ID: ARC-CLI
:Title: Containerized Agent CLI
:Owner: Human BO
:Status: Planning (Stage 2)
:Last Updated: 2026-02-24

Intent
------
Deliver a sensible CLI-first agent runtime based on the `@mariozechner/pi` stack, packaged as a reusable container image for CI/CD job execution (without building CI/CD pipelines yet).

Goals (measurable)
------------------
- Build a CLI-only container image that runs the agent with no HTTP service mode.
- Define a stable execution contract for CI/CD usage (`args`, `env`, exit codes, stdout/stderr behavior).
- Define persistent storage mounts for runtime and workspace data (`/runtime`, `/workspace`).
- Provide operator docs showing how to run and test the container in a CI/CD-like flow using `docker run`.

Constraints
-----------
- No CI/CD pipeline implementation in this sprint (GitHub Actions/GitLab/Jenkins configs are out of scope).
- No HTTP/OpenFaaS deployment path is in scope for this sprint.
- Agent must remain CLI-first and container-invoked.
- Storage should use bind mounts so runtime/workspace data survives across runs.

Risk Notes
----------
- Local Docker environment differences (credential helpers, rootless mode, volume permissions) may cause false negatives during image validation.
- Provider token handling inside containers must avoid leaking secrets to stdout/logs.

