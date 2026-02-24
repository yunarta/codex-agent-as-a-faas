#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="${EVIDENCE_DIR:-$ROOT_DIR/.agile/reports/evidence/arc-cli-sprint-002}"
IMAGE_TAG="${IMAGE_TAG:-galant-agent-cli:test}"
DOCKER_CFG_DIR="${DOCKER_CFG_DIR:-/tmp/arc-cli-live-dockercfg}"
HOST_UID="${HOST_UID:-$(id -u)}"
HOST_GID="${HOST_GID:-$(id -g)}"
PROMPT_TEXT="${PROMPT_TEXT:-What is GIR in golf}"
SESSION_ID="${SESSION_ID:-arc-cli-live-golf-001}"
TOKEN_FILE="${TOKEN_FILE:-$ROOT_DIR/token.json}"

if [[ ! -f "$TOKEN_FILE" ]]; then
  echo "TOKEN_FILE not found: $TOKEN_FILE" >&2
  exit 1
fi

if [[ "${ACT:-}" == "true" ]]; then
  ACT_TMP_BASE="${ACT_TMP_BASE:-$ROOT_DIR/.tmp/act}"
  mkdir -p "$ACT_TMP_BASE"
fi

if [[ -z "${CONTAINER_RUNTIME_DIR:-}" ]]; then
  if [[ "${ACT:-}" == "true" ]]; then
    CONTAINER_RUNTIME_DIR="$(mktemp -d "$ACT_TMP_BASE/arc-cli-live-runtime.XXXXXX")"
  else
    CONTAINER_RUNTIME_DIR="$(mktemp -d /tmp/arc-cli-live-runtime.XXXXXX)"
  fi
fi
if [[ -z "${CONTAINER_WORKSPACE_DIR:-}" ]]; then
  if [[ "${ACT:-}" == "true" ]]; then
    CONTAINER_WORKSPACE_DIR="$(mktemp -d "$ACT_TMP_BASE/arc-cli-live-workspace.XXXXXX")"
  else
    CONTAINER_WORKSPACE_DIR="$(mktemp -d /tmp/arc-cli-live-workspace.XXXXXX)"
  fi
fi

mkdir -p "$EVIDENCE_DIR" "$DOCKER_CFG_DIR" "$CONTAINER_RUNTIME_DIR" "$CONTAINER_WORKSPACE_DIR"
printf '{"auths":{}}\n' >"$DOCKER_CFG_DIR/config.json"
cp "$TOKEN_FILE" "$CONTAINER_RUNTIME_DIR/token.json"

{
  echo "prompt=$PROMPT_TEXT"
  echo "session_id=$SESSION_ID"
  echo "token_file=$TOKEN_FILE"
  echo "mounted_token_file=$CONTAINER_RUNTIME_DIR/token.json"
  echo "runtime_dir=$CONTAINER_RUNTIME_DIR"
  echo "workspace_dir=$CONTAINER_WORKSPACE_DIR"
} >"$EVIDENCE_DIR/live-inference.meta.txt"

DOCKER_CONFIG="$DOCKER_CFG_DIR" docker build \
  -f "$ROOT_DIR/agent-inference/Dockerfile.cli" \
  -t "$IMAGE_TAG" \
  "$ROOT_DIR" >"$EVIDENCE_DIR/live-docker-build.txt" 2>&1

if [[ "${ACT:-}" == "true" ]]; then
  # In act, nested docker mounts resolve on the host daemon namespace, not the runner container FS.
  DOCKER_CONFIG="$DOCKER_CFG_DIR" docker run --rm -i \
    --user "$HOST_UID:$HOST_GID" \
    -v "$CONTAINER_RUNTIME_DIR:/runtime" \
    --entrypoint sh "$IMAGE_TAG" \
    -lc 'cat > /runtime/token.json' <"$TOKEN_FILE"
fi

CONFIG_FILE="$CONTAINER_WORKSPACE_DIR/arc-cli.live.config.json"
cat >"$CONFIG_FILE" <<'JSON'
{
  "profiles": {
    "live-golf": {
      "workspace_dir": "/workspace",
      "runtime_dir": "/runtime",
      "token_path": "/runtime/token.json",
      "system_prompt": "You are a pragmatic CLI assistant used in CI/CD. Answer concisely and factually.",
      "pretty": true,
      "metadata": {
        "purpose": "live-inference-smoke",
        "topic": "golf"
      }
    }
  }
}
JSON

if [[ "${ACT:-}" == "true" ]]; then
  # In act, nested docker mounts resolve on the host daemon namespace, not the runner container FS.
  DOCKER_CONFIG="$DOCKER_CFG_DIR" docker run --rm -i \
    --user "$HOST_UID:$HOST_GID" \
    -v "$CONTAINER_WORKSPACE_DIR:/workspace" \
    --entrypoint sh "$IMAGE_TAG" \
    -lc 'cat > /workspace/arc-cli.live.config.json' <"$CONFIG_FILE"
fi

set +e
DOCKER_CONFIG="$DOCKER_CFG_DIR" docker run --rm \
  --user "$HOST_UID:$HOST_GID" \
  -v "$CONTAINER_WORKSPACE_DIR:/workspace" \
  -v "$CONTAINER_RUNTIME_DIR:/runtime" \
  "$IMAGE_TAG" \
  --config-file /workspace/arc-cli.live.config.json \
  --profile live-golf \
  --session-id "$SESSION_ID" \
  --input "$PROMPT_TEXT" \
  >"$EVIDENCE_DIR/live-inference.stdout.json" \
  2>"$EVIDENCE_DIR/live-inference.stderr.log"
code=$?
set -e
echo "$code" >"$EVIDENCE_DIR/live-inference.exitcode"

if [[ "$code" -ne 0 ]]; then
  echo "Live inference container run failed with exit code $code" >&2
  exit 1
fi

node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
if (p.status !== "ok") throw new Error(`expected status=ok, got ${p.status}`);
if (typeof p.output !== "string" || p.output.trim() === "") throw new Error("empty output");
if ((p.runtime?.profile ?? "") !== "live-golf") throw new Error(`unexpected profile ${p.runtime?.profile}`);
' "$EVIDENCE_DIR/live-inference.stdout.json"
