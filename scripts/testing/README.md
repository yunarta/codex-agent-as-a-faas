# Testing Scripts

Reusable smoke-test helpers for the `ARC-CLI` containerized agent baseline.

Scripts
- `scripts/testing/arc-cli-local-smoke.sh`: runs `npm test`, CLI help, local missing-token smoke, and local `config/profile` smoke.
- `scripts/testing/arc-cli-container-smoke.sh`: builds the CLI image and runs container help, non-root checks, bind-mount write probe, missing-token smoke, and container `config/profile` smoke.
- Container smoke also verifies the image default user is non-root and runs the bind-mounted smoke with `--user <host uid:gid>` to avoid root-owned files on the host.
- `scripts/testing/arc-cli-gate-smoke.sh`: runs both local and container smokes and writes a small summary file.
- `scripts/testing/arc-cli-live-inference.sh`: runs a token-backed container inference smoke (default prompt: `What is GIR in golf`) using a `config/profile`.

Evidence Output
- Default output directory: `.agile/reports/evidence/arc-cli-sprint-001/`
- Override with `EVIDENCE_DIR=/path/to/dir`
- Live inference script defaults to `.agile/reports/evidence/arc-cli-sprint-002/`

Usage
```bash
bash scripts/testing/arc-cli-gate-smoke.sh
bash scripts/testing/arc-cli-live-inference.sh
```

act / nektos local pipeline test
- Repo includes `.actrc` with default workflow path and `--secret-file .act.secrets`.
- Create `.act.secrets` from `.act.secrets.example` and put a valid `AGENT_TOKEN_JSON` JSON payload for optional live smoke.
- Run `act workflow_dispatch -j smoke` to execute the same smoke workflow locally.
