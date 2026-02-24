#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="${EVIDENCE_DIR:-$ROOT_DIR/.agile/reports/evidence/arc-cli-sprint-001}"
IMAGE_TAG="${IMAGE_TAG:-galant-agent-cli:test}"
DOCKER_CFG_DIR="${DOCKER_CFG_DIR:-/tmp/arc-cli-dockercfg}"
HOST_UID="${HOST_UID:-$(id -u)}"
HOST_GID="${HOST_GID:-$(id -g)}"

if [[ "${ACT:-}" == "true" ]]; then
  ACT_TMP_BASE="${ACT_TMP_BASE:-$ROOT_DIR/.tmp/act}"
  mkdir -p "$ACT_TMP_BASE"
fi

if [[ -z "${CONTAINER_RUNTIME_DIR:-}" ]]; then
  if [[ "${ACT:-}" == "true" ]]; then
    CONTAINER_RUNTIME_DIR="$(mktemp -d "$ACT_TMP_BASE/arc-cli-container-runtime.XXXXXX")"
  else
    CONTAINER_RUNTIME_DIR="$(mktemp -d /tmp/arc-cli-container-runtime.XXXXXX)"
  fi
fi
if [[ -z "${CONTAINER_WORKSPACE_DIR:-}" ]]; then
  if [[ "${ACT:-}" == "true" ]]; then
    CONTAINER_WORKSPACE_DIR="$(mktemp -d "$ACT_TMP_BASE/arc-cli-container-workspace.XXXXXX")"
  else
    CONTAINER_WORKSPACE_DIR="$(mktemp -d /tmp/arc-cli-container-workspace.XXXXXX)"
  fi
fi

mkdir -p "$EVIDENCE_DIR" "$DOCKER_CFG_DIR" "$CONTAINER_RUNTIME_DIR" "$CONTAINER_WORKSPACE_DIR"
printf '{"auths":{}}\n' >"$DOCKER_CFG_DIR/config.json"

DOCKER_CONFIG="$DOCKER_CFG_DIR" docker build \
  -f "$ROOT_DIR/agent-inference/Dockerfile.cli" \
  -t "$IMAGE_TAG" \
  "$ROOT_DIR" >"$EVIDENCE_DIR/docker-build.txt" 2>&1

DOCKER_CONFIG="$DOCKER_CFG_DIR" docker run --rm "$IMAGE_TAG" --help \
  >"$EVIDENCE_DIR/docker-cli-help.txt" 2>&1

DOCKER_CONFIG="$DOCKER_CFG_DIR" docker run --rm --entrypoint sh "$IMAGE_TAG" -lc 'id -u; id -g' \
  >"$EVIDENCE_DIR/docker-image-user-id.txt" 2>&1

image_uid="$(sed -n '1p' "$EVIDENCE_DIR/docker-image-user-id.txt" | tr -d '\r')"
if [[ -z "$image_uid" || "$image_uid" == "0" ]]; then
  echo "Expected default image user to be non-root, got uid=${image_uid:-<empty>}" >&2
  exit 1
fi

DOCKER_CONFIG="$DOCKER_CFG_DIR" docker run --rm \
  --user "$HOST_UID:$HOST_GID" \
  -v "$CONTAINER_WORKSPACE_DIR:/workspace" \
  -v "$CONTAINER_RUNTIME_DIR:/runtime" \
  --entrypoint sh "$IMAGE_TAG" \
  -lc 'touch /workspace/.write-probe /runtime/.write-probe && ls -ln /workspace/.write-probe /runtime/.write-probe' \
  >"$EVIDENCE_DIR/docker-bind-mount-write-probe.txt" 2>&1

set +e
DOCKER_CONFIG="$DOCKER_CFG_DIR" docker run --rm \
  --user "$HOST_UID:$HOST_GID" \
  -v "$CONTAINER_WORKSPACE_DIR:/workspace" \
  -v "$CONTAINER_RUNTIME_DIR:/runtime" \
  "$IMAGE_TAG" \
  --session-id container-missing-token \
  --input "hello from container smoke" \
  --pretty >"$EVIDENCE_DIR/docker-cli-missing-token.stdout.json" \
  2>"$EVIDENCE_DIR/docker-cli-missing-token.stderr.log"
code=$?
set -e
echo "$code" >"$EVIDENCE_DIR/docker-cli-missing-token.exitcode"

if [[ "$code" -ne 3 ]]; then
  echo "Expected container missing-token exit code 3, got $code" >&2
  exit 1
fi

docker_uid="$(node -e 'const fs=require("fs"); const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); console.log(p.runtime.process_uid ?? "");' "$EVIDENCE_DIR/docker-cli-missing-token.stdout.json")"
if [[ "$docker_uid" != "$HOST_UID" ]]; then
  echo "Expected container CLI process uid $HOST_UID, got $docker_uid" >&2
  exit 1
fi

CONFIG_FILE="$CONTAINER_WORKSPACE_DIR/arc-cli.container.config.json"
cat >"$CONFIG_FILE" <<'JSON'
{
  "profiles": {
    "ci-container": {
      "runtime_dir": "/runtime",
      "workspace_dir": "/workspace",
      "token_path": "/runtime/does-not-exist.json",
      "metadata": { "runner": "container-smoke" },
      "pretty": true
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
    -lc 'cat > /workspace/arc-cli.container.config.json' <"$CONFIG_FILE"
fi

set +e
DOCKER_CONFIG="$DOCKER_CFG_DIR" docker run --rm \
  --user "$HOST_UID:$HOST_GID" \
  -v "$CONTAINER_WORKSPACE_DIR:/workspace" \
  -v "$CONTAINER_RUNTIME_DIR:/runtime" \
  "$IMAGE_TAG" \
  --config-file /workspace/arc-cli.container.config.json \
  --profile ci-container \
  --session-id container-config-missing-token \
  --input "hello from container config smoke" \
  >"$EVIDENCE_DIR/docker-cli-config-profile.stdout.json" \
  2>"$EVIDENCE_DIR/docker-cli-config-profile.stderr.log"
config_code=$?
set -e
echo "$config_code" >"$EVIDENCE_DIR/docker-cli-config-profile.exitcode"

if [[ "$config_code" -ne 3 ]]; then
  echo "Expected container config/profile missing-token exit code 3, got $config_code" >&2
  exit 1
fi

container_profile="$(node -e 'const fs=require("fs"); const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); console.log(p.runtime.profile ?? "");' "$EVIDENCE_DIR/docker-cli-config-profile.stdout.json")"
if [[ "$container_profile" != "ci-container" ]]; then
  echo "Expected container runtime.profile=ci-container, got ${container_profile:-<empty>}" >&2
  exit 1
fi
