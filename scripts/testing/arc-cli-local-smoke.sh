#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="${EVIDENCE_DIR:-$ROOT_DIR/.agile/reports/evidence/arc-cli-sprint-001}"
LOCAL_RUNTIME_DIR="${LOCAL_RUNTIME_DIR:-/tmp/arc-cli-local-runtime}"
LOCAL_WORKSPACE_DIR="${LOCAL_WORKSPACE_DIR:-/tmp/arc-cli-local-workspace}"

mkdir -p "$EVIDENCE_DIR" "$LOCAL_RUNTIME_DIR" "$LOCAL_WORKSPACE_DIR"

cd "$ROOT_DIR/agent-inference"

npm test >"$EVIDENCE_DIR/npm-test.txt" 2>&1

node scripts/agent-cli.js --help >"$EVIDENCE_DIR/cli-help.txt" 2>&1

set +e
TOKEN_PATH=/tmp/does-not-exist.json \
AGENT_RUNTIME_DIR="$LOCAL_RUNTIME_DIR" \
AGENT_WORKSPACE_DIR="$LOCAL_WORKSPACE_DIR" \
node scripts/agent-cli.js \
  --session-id local-missing-token \
  --input "hello from local smoke" \
  --pretty >"$EVIDENCE_DIR/cli-missing-token.stdout.json" \
  2>"$EVIDENCE_DIR/cli-missing-token.stderr.log"
code=$?
set -e
echo "$code" >"$EVIDENCE_DIR/cli-missing-token.exitcode"

if [[ "$code" -ne 3 ]]; then
  echo "Expected local missing-token exit code 3, got $code" >&2
  exit 1
fi

CONFIG_FILE="$(mktemp /tmp/arc-cli-local-config.XXXXXX.json)"
cat >"$CONFIG_FILE" <<JSON
{
  "profiles": {
    "ci-local": {
      "runtime_dir": "$LOCAL_RUNTIME_DIR",
      "workspace_dir": "$LOCAL_WORKSPACE_DIR",
      "token_path": "/tmp/does-not-exist.json",
      "metadata": { "runner": "local-smoke" },
      "pretty": true
    }
  }
}
JSON

set +e
node scripts/agent-cli.js \
  --config-file "$CONFIG_FILE" \
  --profile ci-local \
  --session-id local-config-missing-token \
  --input "hello from local config smoke" \
  >"$EVIDENCE_DIR/cli-config-profile.stdout.json" \
  2>"$EVIDENCE_DIR/cli-config-profile.stderr.log"
config_code=$?
set -e
echo "$config_code" >"$EVIDENCE_DIR/cli-config-profile.exitcode"
rm -f "$CONFIG_FILE"

if [[ "$config_code" -ne 3 ]]; then
  echo "Expected local config/profile missing-token exit code 3, got $config_code" >&2
  exit 1
fi

profile_name="$(node -e 'const fs=require("fs"); const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); console.log(p.runtime.profile ?? "");' "$EVIDENCE_DIR/cli-config-profile.stdout.json")"
if [[ "$profile_name" != "ci-local" ]]; then
  echo "Expected runtime.profile=ci-local, got ${profile_name:-<empty>}" >&2
  exit 1
fi
