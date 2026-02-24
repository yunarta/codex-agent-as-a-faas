# agent-inference (OpenFaaS Node.js MVP)

OpenFaaS function that runs Codex-backed inference through `@mariozechner/pi-agent-core` + `@mariozechner/pi-ai`.

## HTTP contract

- Endpoint: `POST /function/agent-inference`
- Content-Type: `application/json`
- Request body:

```json
{
  "input": "string, required",
  "session_id": "string, required",
  "metadata": {}
}
```

- Success (`200`):

```json
{
  "status": "ok",
  "output": "assistant text",
  "session_id": "session identifier",
  "request_id": "uuid"
}
```

- Error (`400|500|502`):

```json
{
  "status": "error",
  "error_code": "BAD_REQUEST|TOKEN_MISSING|UPSTREAM_INFERENCE_FAILED|MODEL_NOT_FOUND",
  "message": "human-readable message",
  "request_id": "uuid"
}
```

## Token setup (manual)

For Sprint 1, token is loaded manually from `token.json`.

Search order:
1. `TOKEN_PATH` env var (if set)
2. `<cwd>/token.json`
3. `<cwd>/../token.json`
4. `<cwd>/../../token.json`

Required shape:

```json
{
  "access_token": "..."
}
```

## Local run

```bash
cd agent-inference
npm install
npm test
npm run smoke
RUN_LIVE=1 npm run smoke:live
```

## CLI mode (no HTTP service)

This repo now includes a CLI entrypoint for containerized runs:

```bash
cd agent-inference
npm run cli -- --help
TOKEN_PATH=/path/to/token.json npm run cli -- \
  --session-id demo-1 \
  --input "Summarize this repo in one paragraph" \
  --output-file outputs/demo-1.txt \
  --pretty
```

Notes:
- CLI prints the machine-readable response JSON to stdout.
- Runtime logs are written to stderr.
- A run record JSON is written under `AGENT_RUNTIME_DIR/runs/` (default `/runtime/runs`).
- Relative `--output-file` paths are written under `AGENT_WORKSPACE_DIR` (default `/workspace`).

### Reusable config + profile (recommended for many agents)

Example config (`agent-cli.config.json`):

```json
{
  "defaults": {
    "pretty": true,
    "workspace_dir": "/workspace",
    "runtime_dir": "/runtime"
  },
  "profiles": {
    "repo-a": {
      "metadata": {
        "agent_name": "repo-a"
      },
      "pi_model": "gpt-5.2-codex"
    },
    "repo-b": {
      "metadata": {
        "agent_name": "repo-b"
      },
      "system_prompt": "You are a pragmatic CI coding agent."
    }
  }
}
```

Run with a profile:

```bash
TOKEN_PATH=/path/to/token.json npm run cli -- \
  --config-file ./agent-cli.config.json \
  --profile repo-a \
  --session-id ci-job-1 \
  --input "Review pending changes"
```

## Container image (CLI-only, CI/CD-usable)

Build image from repo root:

```bash
docker build -f agent-inference/Dockerfile.cli -t galant-agent-cli:dev .
```

Run locally with bind-mounted workspace and runtime storage (no ports):

```bash
mkdir -p .agent-runtime .agent-workspace
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -v "$PWD/.agent-workspace:/workspace" \
  -v "$PWD/.agent-runtime:/runtime" \
  -v "$PWD/token.json:/runtime/token.json:ro" \
  galant-agent-cli:dev \
  --session-id ci-smoke-1 \
  --input "Summarize sprint migration status" \
  --output-file outputs/ci-smoke-1.txt \
  --pretty
```

CI/CD usage pattern (concept only, no pipeline config required):
- Use the same image as a job step container.
- Bind-mount or attach a writable workspace volume to `/workspace`.
- Bind-mount a writable runtime volume to `/runtime` for run records and future agent state.
- Prefer running with the job user UID:GID (for example `--user "$(id -u):$(id -g)"`) when bind-mounting host directories to avoid root-owned output files.
- Provide token material as `/runtime/token.json` (or set `TOKEN_PATH` / `AGENT_TOKEN_PATH`).
- Treat CLI exit code + stdout JSON as the job contract.

### GitHub Actions smoke workflow (next sprint baseline)

This repo now includes a workflow scaffold at `.github/workflows/arc-cli-smoke.yml`:
- Baseline smoke (local + container) runs on PR/push/workflow_dispatch.
- Optional live inference smoke runs only when `AGENT_TOKEN_JSON` secret is configured.
- Live smoke prompt defaults to: `What is GIR in golf`.

## OpenFaaS deploy

```bash
# from repo root
faas-cli up -f stack.yml
```

Invoke:

```bash
curl -sS http://127.0.0.1:8080/function/agent-inference \
  -H 'Content-Type: application/json' \
  -d '{"input":"Explain sprint one in one sentence","session_id":"demo-1"}'
```

## Notes

- Provider defaults: `PI_PROVIDER=openai-codex`, `PI_MODEL=gpt-5.2-codex`
- Timeout default: `INFERENCE_TIMEOUT_MS=45000`
- Do not log token content; logs include request IDs, session IDs, latency, and outcome only.
