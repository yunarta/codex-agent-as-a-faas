#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="${EVIDENCE_DIR:-$ROOT_DIR/.agile/reports/evidence/arc-cli-sprint-001}"

mkdir -p "$EVIDENCE_DIR"

"$ROOT_DIR/scripts/testing/arc-cli-local-smoke.sh"
"$ROOT_DIR/scripts/testing/arc-cli-container-smoke.sh"

{
  echo "arc-cli gate smoke complete"
  echo "timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "evidence_dir=$EVIDENCE_DIR"
} >"$EVIDENCE_DIR/gate-smoke-summary.txt"

