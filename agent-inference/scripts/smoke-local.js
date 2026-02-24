import handler from "../handler.js";

const runLive = process.env.RUN_LIVE === "1";

const payload = {
  input: process.env.SMOKE_INPUT || "Summarize this sprint goal in one sentence.",
  session_id: process.env.SMOKE_SESSION_ID || "sprint1-smoke"
};

const event = { body: JSON.stringify(payload) };

const context = {
  status(code) {
    this.code = code;
  },
  code: null
};

if (!runLive) {
  console.log("smoke-local skipped live call (set RUN_LIVE=1 to execute against provider)");
  process.exit(0);
}

const res = await handler(event, context);
console.log("statusCode:", res.statusCode);
console.log("body:", res.body);
