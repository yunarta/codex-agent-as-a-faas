#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

run_case() {
  local label="$1"
  local token_path="$2"
  local port="$3"

  echo "[$label]"
  TOKEN_PATH="$token_path" PORT="$port" node "$ROOT_DIR/scripts/http-server.js" >/tmp/agent-http-server-"$label".log 2>&1 &
  local server_pid=$!
  sleep 1

  curl -sS "http://127.0.0.1:${port}/function/agent-inference" \
    -H 'Content-Type: application/json' \
    -d "{\"input\":\"Summarize sprint one.\",\"session_id\":\"${label}\"}"
  echo

  kill "$server_pid" >/dev/null 2>&1 || true
  wait "$server_pid" 2>/dev/null || true
}

run_case "happy" "$ROOT_DIR/../token.json" 8081
run_case "missing-token" "/tmp/no-token.json" 8082
run_case "upstream-failure" "/tmp/bad-token.json" 8083
