import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

function getRuntimeDefaults() {
  return {
    provider: process.env.PI_PROVIDER || "openai-codex",
    modelName: process.env.PI_MODEL || "gpt-5.2-codex",
    timeoutMs: Number(process.env.INFERENCE_TIMEOUT_MS || 45000),
    systemPrompt: process.env.SYSTEM_PROMPT || "You are a pragmatic coding assistant. Respond concisely."
  };
}

function jsonLog(payload) {
  console.log(JSON.stringify(payload));
}

function readBody(event) {
  if (event == null || event.body == null) {
    throw Object.assign(new Error("Request body is required"), { code: "BAD_REQUEST" });
  }

  if (typeof event.body === "string") {
    try {
      return JSON.parse(event.body);
    } catch {
      throw Object.assign(new Error("Request body must be valid JSON"), { code: "BAD_REQUEST" });
    }
  }

  if (typeof event.body === "object") {
    return event.body;
  }

  throw Object.assign(new Error("Unsupported request body format"), { code: "BAD_REQUEST" });
}

function validatePayload(body) {
  if (!body || typeof body !== "object") {
    throw Object.assign(new Error("Payload must be an object"), { code: "BAD_REQUEST" });
  }

  if (typeof body.input !== "string" || body.input.trim() === "") {
    throw Object.assign(new Error("Field 'input' is required and must be a non-empty string"), { code: "BAD_REQUEST" });
  }

  if (typeof body.session_id !== "string" || body.session_id.trim() === "") {
    throw Object.assign(new Error("Field 'session_id' is required and must be a non-empty string"), { code: "BAD_REQUEST" });
  }

  return {
    input: body.input,
    sessionId: body.session_id,
    metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {}
  };
}

function getTokenPathCandidates() {
  const explicit = process.env.TOKEN_PATH;
  const cwd = process.cwd();

  if (explicit) {
    return [explicit];
  }

  return [
    path.join(cwd, "token.json"),
    path.resolve(cwd, "..", "token.json"),
    path.resolve(cwd, "..", "..", "token.json")
  ];
}

async function loadAccessToken() {
  const candidates = getTokenPathCandidates();
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const raw = await readFile(candidate, "utf8");
      const parsed = JSON.parse(raw);
      if (typeof parsed.access_token === "string" && parsed.access_token.trim() !== "") {
        return { token: parsed.access_token, source: candidate };
      }
      throw new Error("token.json exists but access_token is missing");
    } catch (error) {
      lastError = error;
    }
  }

  const err = new Error("token.json is required and must contain access_token");
  err.code = "TOKEN_MISSING";
  err.cause = lastError;
  throw err;
}

function makeResponse(statusCode, payload, context) {
  if (context && typeof context.status === "function") {
    context.status(statusCode);
  }

  return {
    statusCode,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  };
}

function normalizeOutput(message) {
  if (!message || !Array.isArray(message.content)) {
    return "";
  }

  return message.content
    .filter((item) => item && item.type === "text" && typeof item.text === "string")
    .map((item) => item.text)
    .join("\n")
    .trim();
}

function pickLastAssistantMessage(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message && message.role === "assistant") {
      return message;
    }
  }
  return null;
}

async function runInferenceWithAgent({
  agentFactory,
  model,
  input,
  sessionId,
  apiKey,
  systemPrompt,
  timeoutMs
}) {
  const agent = agentFactory({
    initialState: {
      systemPrompt,
      model
    },
    sessionId,
    getApiKey: async () => apiKey
  });

  const timeout = setTimeout(() => {
    agent.abort();
  }, timeoutMs);

  try {
    await agent.prompt(input);
  } finally {
    clearTimeout(timeout);
  }

  const assistantMessage = pickLastAssistantMessage(agent.state.messages || []);
  if (!assistantMessage) {
    const err = new Error("Inference provider returned no assistant message");
    err.code = "UPSTREAM_INFERENCE_FAILED";
    throw err;
  }

  if (assistantMessage.stopReason === "error" || assistantMessage.stopReason === "aborted") {
    const err = new Error(assistantMessage.errorMessage || "Inference provider returned error");
    err.code = "UPSTREAM_INFERENCE_FAILED";
    throw err;
  }

  return assistantMessage;
}

export function createHandler(deps = {}) {
  const getModelFn = deps.getModelFn || getModel;
  const agentFactory = deps.agentFactory || ((options) => new Agent(options));
  const runInferenceFn = deps.runInferenceFn || runInferenceWithAgent;
  const uuidFn = deps.uuidFn || randomUUID;
  const clockFn = deps.clockFn || (() => Date.now());
  const tokenLoader = deps.tokenLoader || loadAccessToken;

  return async function handler(event, context) {
    const startedAt = clockFn();
    const requestId = uuidFn();
    let sessionId = "unknown";

    try {
      const runtimeDefaults = getRuntimeDefaults();
      const body = readBody(event);
      const validated = validatePayload(body);
      sessionId = validated.sessionId;

      const { token, source } = await tokenLoader();

      const model = getModelFn(runtimeDefaults.provider, runtimeDefaults.modelName);
      if (!model) {
        throw Object.assign(
          new Error(`Model not found: ${runtimeDefaults.provider}/${runtimeDefaults.modelName}`),
          {
          code: "MODEL_NOT_FOUND"
          }
        );
      }

      const assistantMessage = await runInferenceFn({
        agentFactory,
        model,
        input: validated.input,
        sessionId: validated.sessionId,
        apiKey: token,
        systemPrompt: runtimeDefaults.systemPrompt,
        timeoutMs: runtimeDefaults.timeoutMs
      });

      const output = normalizeOutput(assistantMessage);
      if (!output) {
        throw Object.assign(new Error("Inference returned empty output"), {
          code: "UPSTREAM_INFERENCE_FAILED"
        });
      }
      const latencyMs = clockFn() - startedAt;

      jsonLog({
        timestamp: new Date().toISOString(),
        event: "inference_complete",
        request_id: requestId,
        session_id: validated.sessionId,
        input_chars: validated.input.length,
        output_chars: output.length,
        latency_ms: latencyMs,
        outcome: "ok",
        token_source: source
      });

      return makeResponse(
        200,
        {
          status: "ok",
          output,
          session_id: validated.sessionId,
          request_id: requestId
        },
        context
      );
    } catch (error) {
      const latencyMs = clockFn() - startedAt;
      const errorCode = error?.code || "UPSTREAM_INFERENCE_FAILED";

      let statusCode = 502;
      let message = error?.message || "Inference failed";

      if (errorCode === "BAD_REQUEST") {
        statusCode = 400;
      } else if (errorCode === "TOKEN_MISSING") {
        statusCode = 500;
      } else if (errorCode === "MODEL_NOT_FOUND") {
        statusCode = 500;
      } else if (message === "Inference provider returned no assistant message") {
        statusCode = 502;
      } else if (message === "aborted") {
        statusCode = 502;
        message = `Inference timed out after ${getRuntimeDefaults().timeoutMs}ms`;
      }

      jsonLog({
        timestamp: new Date().toISOString(),
        event: "inference_failed",
        request_id: requestId,
        session_id: sessionId,
        latency_ms: latencyMs,
        outcome: "error",
        error_code: errorCode,
        error_message: message
      });

      return makeResponse(
        statusCode,
        {
          status: "error",
          error_code: errorCode,
          message,
          request_id: requestId
        },
        context
      );
    }
  };
}

export default createHandler();
