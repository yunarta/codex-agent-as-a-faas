import test from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "../handler.js";

function makeContext() {
  let code = null;
  return {
    status(value) {
      code = value;
    },
    get statusCode() {
      return code;
    }
  };
}

test("returns 200 for valid request", async () => {
  const handler = createHandler({
    uuidFn: () => "req-1",
    clockFn: (() => {
      let now = 1000;
      return () => (now += 20);
    })(),
    tokenLoader: async () => ({ token: "test-token", source: "/tmp/token.json" }),
    getModelFn: () => ({ id: "gpt-5.2-codex" }),
    runInferenceFn: async () => ({
      role: "assistant",
      content: [{ type: "text", text: "hello world" }]
    })
  });

  const context = makeContext();
  const response = await handler(
    {
      body: JSON.stringify({ input: "Say hello", session_id: "s1" })
    },
    context
  );

  assert.equal(response.statusCode, 200);
  assert.equal(context.statusCode, 200);

  const body = JSON.parse(response.body);
  assert.equal(body.status, "ok");
  assert.equal(body.output, "hello world");
  assert.equal(body.session_id, "s1");
  assert.equal(body.request_id, "req-1");
});

test("returns 500 TOKEN_MISSING when token cannot be loaded", async () => {
  const handler = createHandler({
    uuidFn: () => "req-2",
    tokenLoader: async () => {
      const err = new Error("token missing");
      err.code = "TOKEN_MISSING";
      throw err;
    }
  });

  const response = await handler({ body: { input: "x", session_id: "s2" } }, makeContext());
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 500);
  assert.equal(body.error_code, "TOKEN_MISSING");
});

test("returns 502 on upstream inference failure", async () => {
  const handler = createHandler({
    uuidFn: () => "req-3",
    tokenLoader: async () => ({ token: "test-token", source: "/tmp/token.json" }),
    getModelFn: () => ({ id: "gpt-5.2-codex" }),
    runInferenceFn: async () => {
      throw new Error("provider exploded");
    }
  });

  const response = await handler({ body: { input: "x", session_id: "s3" } }, makeContext());
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 502);
  assert.equal(body.error_code, "UPSTREAM_INFERENCE_FAILED");
});

test("returns 400 on invalid request", async () => {
  const handler = createHandler({ uuidFn: () => "req-4" });

  const response = await handler({ body: JSON.stringify({ session_id: "s4" }) }, makeContext());
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 400);
  assert.equal(body.error_code, "BAD_REQUEST");
});
