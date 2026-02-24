CLI Container Baseline Verification
===================================

:ARC-ID: ARC-CLI
:SPRINT-ID: ARC-CLI-SPRINT-20260224-01
:Status: Baseline smoke checks complete
:Last Updated: 2026-02-24

Scope
-----
Validate the newly added CLI-only agent runtime and container image baseline for CI/CD-style execution (no HTTP service mode).

Commands Run (This Workspace)
-----------------------------
1. `cd agent-inference && npm test`
2. `cd agent-inference && node scripts/agent-cli.js --help`
3. `cd agent-inference && TOKEN_PATH=/tmp/does-not-exist.json AGENT_RUNTIME_DIR=/tmp/agent-cli-runtime-test AGENT_WORKSPACE_DIR=/tmp/agent-cli-workspace-test node scripts/agent-cli.js --session-id test-missing-token --input 'hello' --pretty`
4. `DOCKER_CONFIG=/tmp/dockercfg docker build -f agent-inference/Dockerfile.cli -t galant-agent-cli:test .`
5. `DOCKER_CONFIG=/tmp/dockercfg docker run --rm galant-agent-cli:test --help`
6. `DOCKER_CONFIG=/tmp/dockercfg docker run --rm -v /tmp/agent-cli-docker-workspace:/workspace -v /tmp/agent-cli-docker-runtime:/runtime galant-agent-cli:test --session-id docker-missing-token --input 'hello from container' --pretty`

Results
-------
- `npm test`: PASS (4/4 tests)
- CLI help: PASS (usage/help text shown, process exits successfully)
- Local CLI missing token: PASS (structured JSON error, `TOKEN_MISSING`, exit code `3`, runtime run record written)
- Local CLI `config/profile` smoke: PASS (`TOKEN_MISSING`, exit code `3`, `runtime.profile=ci-local`)
- Docker build: PASS using temporary `DOCKER_CONFIG` workaround
- Container CLI help: PASS
- Container CLI missing token: PASS (structured JSON error, `TOKEN_MISSING`, exit code `3`)
- Default image user probe: PASS (image runs as non-root uid/gid by default)
- Bind-mount container smoke under host UID/GID mapping: PASS (runtime JSON reports mapped process uid/gid)
- Bind-mount write probe: PASS (created `/workspace` and `/runtime` files owned by host uid/gid)
- Container CLI `config/profile` smoke: PASS (`TOKEN_MISSING`, exit code `3`, `runtime.profile=ci-container`)

Evidence Pointers
-----------------
- Implementation: `agent-inference/scripts/agent-cli.js`
- Image definition: `agent-inference/Dockerfile.cli`
- Usage docs: `agent-inference/README.md`
- Test scripts: `scripts/testing/arc-cli-local-smoke.sh`, `scripts/testing/arc-cli-container-smoke.sh`, `scripts/testing/arc-cli-gate-smoke.sh`
- Captured evidence bundle: `.agile/reports/evidence/arc-cli-sprint-001/` (`npm-test.txt`, `cli-help.txt`, `docker-build.txt`, `docker-image-user-id.txt`, `docker-bind-mount-write-probe.txt`, `*-config-profile.*`, `*-missing-token.*`)

Notes / Risks
-------------
- Docker build failed initially due host credential-helper mismatch (`docker-credential-desktop.exe`); workaround was a temporary `DOCKER_CONFIG` used by the test scripts.
- Happy-path live inference in container was not validated in this baseline report because token injection was intentionally omitted for controlled failure-path smoke.
- `config/profile` support is validated by smoke tests but does not yet publish a standalone JSON schema.
