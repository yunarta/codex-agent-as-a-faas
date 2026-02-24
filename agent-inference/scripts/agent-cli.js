#!/usr/bin/env node

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createHandler } from "../handler.js";

const HELP_TEXT = `agent-inference CLI

Runs the pi-based agent as a CLI process (no HTTP server).

Usage:
  node scripts/agent-cli.js --session-id <id> --input "your prompt"
  echo "your prompt" | node scripts/agent-cli.js --session-id <id>

Options:
  --session-id <id>       Required session identifier.
  --config-file <path>    Optional JSON config file with defaults/profiles.
  --profile <name>        Optional profile name from --config-file.
  --input <text>          Prompt text. If omitted, reads stdin.
  --input-file <path>     Read prompt text from file.
  --metadata-file <path>  Optional JSON file for request metadata.
  --output-file <path>    Optional output file (relative paths are under workspace dir).
  --workspace-dir <path>  Workspace mount path (default: AGENT_WORKSPACE_DIR or /workspace).
  --runtime-dir <path>    Runtime mount path (default: AGENT_RUNTIME_DIR or /runtime).
  --pretty                Pretty-print JSON response.
  --help                  Show this help.
`;

function parseArgs(argv) {
  const args = {
    pretty: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];

    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }
    if (token === "--pretty") {
      args.pretty = true;
      continue;
    }
    if (token === "--session-id") {
      args.sessionId = next;
      i += 1;
      continue;
    }
    if (token === "--config-file") {
      args.configFile = next;
      i += 1;
      continue;
    }
    if (token === "--profile") {
      args.profile = next;
      i += 1;
      continue;
    }
    if (token === "--input") {
      args.input = next;
      i += 1;
      continue;
    }
    if (token === "--input-file") {
      args.inputFile = next;
      i += 1;
      continue;
    }
    if (token === "--metadata-file") {
      args.metadataFile = next;
      i += 1;
      continue;
    }
    if (token === "--output-file") {
      args.outputFile = next;
      i += 1;
      continue;
    }
    if (token === "--workspace-dir") {
      args.workspaceDir = next;
      i += 1;
      continue;
    }
    if (token === "--runtime-dir") {
      args.runtimeDir = next;
      i += 1;
      continue;
    }

    if (token.startsWith("-")) {
      throw new Error(`Unknown option: ${token}`);
    }

    args.positional = [...(args.positional || []), token];
  }

  return args;
}

async function readStdinText() {
  if (process.stdin.isTTY) {
    return "";
  }

  let text = "";
  for await (const chunk of process.stdin) {
    text += String(chunk);
  }
  return text;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadMetadata(metadataFile) {
  if (!metadataFile) {
    return {};
  }

  const raw = await readFile(metadataFile, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("metadata file must contain a JSON object");
  }
  return parsed;
}

async function loadJsonObject(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must contain a JSON object`);
  }
  return parsed;
}

async function loadCliConfig(configFile, profileName) {
  if (!configFile) {
    return { config: null, selectedProfileName: null };
  }

  const parsed = await loadJsonObject(configFile, "config file");
  const defaults =
    parsed.defaults && typeof parsed.defaults === "object" && !Array.isArray(parsed.defaults)
      ? parsed.defaults
      : {};
  const profiles =
    parsed.profiles && typeof parsed.profiles === "object" && !Array.isArray(parsed.profiles)
      ? parsed.profiles
      : {};

  let selectedProfile = {};
  if (profileName) {
    selectedProfile = profiles[profileName];
    if (!selectedProfile || typeof selectedProfile !== "object" || Array.isArray(selectedProfile)) {
      throw new Error(`profile '${profileName}' not found in config file`);
    }
  }

  return {
    config: {
      ...defaults,
      ...selectedProfile
    },
    selectedProfileName: profileName || null
  };
}

function applyConfigAndArgs(config, args) {
  const merged = { ...(config || {}) };

  if (args.sessionId) merged.session_id = args.sessionId;
  if (args.input) merged.input = args.input;
  if (args.inputFile) merged.input_file = args.inputFile;
  if (args.metadataFile) merged.metadata_file = args.metadataFile;
  if (args.outputFile) merged.output_file = args.outputFile;
  if (args.workspaceDir) merged.workspace_dir = args.workspaceDir;
  if (args.runtimeDir) merged.runtime_dir = args.runtimeDir;
  if (args.pretty) merged.pretty = true;

  return merged;
}

function applyRuntimeEnvFromConfig(config) {
  if (!config || typeof config !== "object") {
    return;
  }

  const mappings = [
    ["token_path", "TOKEN_PATH"],
    ["pi_provider", "PI_PROVIDER"],
    ["pi_model", "PI_MODEL"],
    ["system_prompt", "SYSTEM_PROMPT"],
    ["inference_timeout_ms", "INFERENCE_TIMEOUT_MS"]
  ];

  for (const [configKey, envKey] of mappings) {
    const value = config[configKey];
    if (value == null) {
      continue;
    }
    process.env[envKey] = String(value);
  }
}

function resolveOutputPath(outputFile, workspaceDir) {
  if (!outputFile) {
    return null;
  }
  if (path.isAbsolute(outputFile)) {
    return outputFile;
  }
  return path.join(workspaceDir, outputFile);
}

function exitCodeForResponse(payload) {
  if (!payload || payload.status === "ok") {
    return 0;
  }

  switch (payload.error_code) {
    case "BAD_REQUEST":
      return 2;
    case "TOKEN_MISSING":
      return 3;
    case "MODEL_NOT_FOUND":
      return 4;
    case "UPSTREAM_INFERENCE_FAILED":
      return 5;
    default:
      return 10;
  }
}

function printJson(payload, pretty) {
  const text = JSON.stringify(payload, null, pretty ? 2 : 0);
  process.stdout.write(`${text}\n`);
}

async function writeRunRecord({ runtimeDir, responsePayload, sessionId, outputPath }) {
  const runsDir = path.join(runtimeDir, "runs");
  await mkdir(runsDir, { recursive: true });

  const requestId = responsePayload?.request_id || "no-request-id";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(runsDir, `${timestamp}-${requestId}.json`);

  const record = {
    timestamp: new Date().toISOString(),
    session_id: sessionId,
    request_id: requestId,
    status: responsePayload?.status || "error",
    error_code: responsePayload?.error_code || null,
    output_chars: typeof responsePayload?.output === "string" ? responsePayload.output.length : 0,
    output_file: outputPath || null
  };

  await writeFile(filePath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return filePath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(HELP_TEXT);
    return;
  }

  const { config: fileConfig, selectedProfileName } = await loadCliConfig(args.configFile, args.profile);
  const effective = applyConfigAndArgs(fileConfig, args);

  const workspaceDir = effective.workspace_dir || process.env.AGENT_WORKSPACE_DIR || "/workspace";
  const runtimeDir = effective.runtime_dir || process.env.AGENT_RUNTIME_DIR || "/runtime";

  await mkdir(workspaceDir, { recursive: true });
  await mkdir(runtimeDir, { recursive: true });

  applyRuntimeEnvFromConfig(effective);

  if (!process.env.TOKEN_PATH) {
    if (process.env.AGENT_TOKEN_PATH) {
      process.env.TOKEN_PATH = process.env.AGENT_TOKEN_PATH;
    } else {
      const runtimeTokenPath = path.join(runtimeDir, "token.json");
      if (await fileExists(runtimeTokenPath)) {
        process.env.TOKEN_PATH = runtimeTokenPath;
      }
    }
  }

  let input = effective.input;
  if (!input && effective.input_file) {
    input = await readFile(effective.input_file, "utf8");
  }
  if (!input && args.positional?.length) {
    input = args.positional.join(" ");
  }
  if (!input) {
    input = await readStdinText();
  }

  let metadata = {};
  if (effective.metadata && typeof effective.metadata === "object" && !Array.isArray(effective.metadata)) {
    metadata = { ...effective.metadata };
  }
  if (effective.metadata_file) {
    metadata = { ...metadata, ...(await loadMetadata(effective.metadata_file)) };
  }

  const sessionId = effective.session_id;
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    throw new Error("--session-id is required");
  }

  const handler = createHandler();

  // Route structured runtime logs to stderr so stdout remains machine-readable response JSON.
  const originalLog = console.log;
  console.log = (...values) => console.error(...values);

  let response;
  try {
    response = await handler({
      body: {
        input: input || "",
        session_id: sessionId,
        metadata
      }
    });
  } finally {
    console.log = originalLog;
  }

  const payload = JSON.parse(response.body);

  let outputPath = null;
  if (payload.status === "ok" && effective.output_file) {
    outputPath = resolveOutputPath(effective.output_file, workspaceDir);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${payload.output}\n`, "utf8");
  }

  const runRecordPath = await writeRunRecord({
    runtimeDir,
    responsePayload: payload,
    sessionId,
    outputPath
  });

  payload.runtime = {
    workspace_dir: workspaceDir,
    runtime_dir: runtimeDir,
    run_record: runRecordPath,
    process_uid: typeof process.getuid === "function" ? process.getuid() : null,
    process_gid: typeof process.getgid === "function" ? process.getgid() : null,
    profile: selectedProfileName
  };

  printJson(payload, Boolean(effective.pretty));
  process.exitCode = exitCodeForResponse(payload);
}

main().catch((error) => {
  const payload = {
    status: "error",
    error_code: "CLI_FAILURE",
    message: error?.message || "CLI execution failed"
  };
  process.stderr.write(`${JSON.stringify(payload)}\n`);
  process.exitCode = 10;
});
