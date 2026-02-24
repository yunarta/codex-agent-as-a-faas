Sprint 2 Capability Study: pi Stack
===================================

Goal
----

Assess what is feasible in Sprint 2 for agent tooling, with emphasis on Jira read/create tools in an OpenFaaS-hosted Node.js runtime.

Package Capability Matrix
-------------------------

`@mariozechner/pi-ai` (v0.52.9)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Unified LLM API with model/provider registry and tool-calling-first design.
- Supports streaming/non-streaming responses, tool calls, and token/cost tracking.
- Supports many providers including OpenAI Codex, plus OAuth flows for subscription-based providers.
- Good fit for inference and provider abstraction in serverless handlers.

`@mariozechner/pi-agent-core` (v0.52.9)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Stateful agent loop on top of `pi-ai` with message state, tool execution, event stream, follow-up/steering, and abort control.
- Native tool model (`AgentTool`) is suitable for implementing Jira tools (read/create issue) as first-class agent functions.
- Good fit for backend/runtime integration where you need agent orchestration, not just raw model calls.

`@mariozechner/pi-coding-agent` (v0.52.9)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Full terminal coding harness with built-in tools (`read`, `write`, `edit`, `bash`) and large extension surface (skills, prompts, extensions, themes, package system).
- Includes SDK/RPC modes and is ideal when you want an interactive operator environment.
- For OpenFaaS API runtime, this is usually too heavy as a direct dependency unless you specifically embed its SDK behaviors.

`@mariozechner/pi-tui` (v0.52.9)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Terminal UI framework (differential rendering, components, overlays, editors/selectors, key handling).
- Best used for CLI/TUI experiences, not for headless HTTP function execution.
- Not required for OpenFaaS function runtime.

Deep Dive: Skills, Prompts, Extensions, Themes, Package System
---------------------------------------------------------------

These capabilities are primarily surfaced in `@mariozechner/pi-coding-agent` and are best treated as operator-side customization, not function-runtime primitives.

Skills
~~~~~~

- Reusable markdown-based instructions (`SKILL.md`) that can be invoked explicitly or loaded by agent behavior.
- Good for standard operating procedures, such as Jira ticket triage rules or incident templates.
- In OpenFaaS runtime, mirror this idea as server-side instruction profiles so behavior is controlled by config, not ad hoc prompts.

Prompt Templates
~~~~~~~~~~~~~~~~

- Parameterized prompt snippets for recurring tasks.
- Useful to standardize agent requests, e.g., a fixed Jira issue creation prompt with placeholders for project/type/summary.
- In backend mode, implement this as named prompt presets in code/config and select by request metadata.

Extensions
~~~~~~~~~~

- TypeScript modules that add tools, commands, events, and custom logic in `pi-coding-agent`.
- This is the most relevant concept for Sprint 2: our OpenFaaS runtime can adopt the same pattern by registering tool handlers (`jira_read_issue`, `jira_create_issue`) around `pi-agent-core`.
- Recommendation: define a lightweight internal extension contract in code so future tools (Confluence, Slack, Git) follow the same shape.

Themes
~~~~~~

- UI styling concern for terminal apps; not relevant for headless OpenFaaS inference path.
- Keep out of runtime scope unless we build an operator console.

Package System
~~~~~~~~~~~~~~

- `pi-coding-agent` supports reusable package bundles (extensions/skills/prompts/themes).
- For our architecture, the analogous pattern is a versioned internal tools package (for example `agent-tools-jira`) consumed by the function.
- This gives clean release boundaries and easier rollout/rollback of tooling behaviors.

What This Means For Sprint 2
----------------------------

Recommended runtime stack for OpenFaaS function:

- Keep `@mariozechner/pi-ai` + `@mariozechner/pi-agent-core`.
- Add Jira tools as `AgentTool` implementations:

  - `jira_read_issue` (read issue by key or JQL)
  - `jira_create_issue` (create issue with project/summary/description/type)

- Keep `pi-coding-agent` and `pi-tui` out of the function runtime unless we add a separate interactive operator app.

Feasibility: Jira Tooling
-------------------------

Yes, feasible in Node.js:

- Implement Jira REST calls using either a Jira SDK package or direct `fetch` to Atlassian APIs.
- Wrap each operation as an `AgentTool` in `pi-agent-core`.
- Enforce auth and field validation at tool boundary.

Minimum env/config expected for implementation:

- `JIRA_BASE_URL`
- `JIRA_USER_EMAIL`
- `JIRA_API_TOKEN`
- `JIRA_PROJECT_KEY` (default project)

OpenFaaS Shared Storage Note (Discovery)
-----------------------------------------

For this Jira-tooling scope, persistent shared storage is optional.

- Jira read/create can be stateless (HTTP in, tool call out).
- Shared storage becomes relevant later for memory/session artifacts, cached context, or audit traces.
- For future memory work, decide between mounted volumes (NFS/PVC) versus external state store (Redis/S3/Postgres).

Memory and Conversation Continuity
----------------------------------

Current state:

- `pi-agent-core` is stateful in-process (message history is in `agent.state.messages`).
- In serverless OpenFaaS execution, process memory is not durable across invocations.

How to continue a conversation:

1. Require a stable `session_id` in request payload.
2. Load previous messages by `session_id` from an external store.
3. Initialize `Agent` with restored messages and `sessionId`.
4. Run `prompt()` (or `continue()` when last message is already user/toolResult).
5. Persist updated message history back to the store.

Recommended memory control model for Sprint 2:

- Short term: Redis or Postgres-backed message store keyed by `session_id`.
- Medium term: add compaction/summarization policy to cap token growth.
- Guardrails: max turns per session, max message bytes, and TTL for stale sessions.

Practical note on `continue()`:

- `continue()` is useful when you need to resume after tool results or recover from interrupted flows.
- It still requires restored context; by itself it does not provide persistence.

Risks and Constraints
---------------------

- OAuth/session-based providers may need token-refresh strategy if used in long-running interactions.
- Jira schema variability (custom fields/workflows) can break naive create payloads.
- Tool permissions must be constrained to avoid unsafe write actions.

Proposed Sprint 2 Execution (next)
----------------------------------

1. Implement `jira_read_issue` tool.
2. Implement `jira_create_issue` tool.
3. Add session persistence adapter (Redis/Postgres) keyed by `session_id`.
4. Add integration smoke tests for Jira tools plus multi-turn continuation.
5. Document shared-storage decision options in a dedicated architecture note.

Source References (Internet)
----------------------------

- https://www.npmjs.com/package/@mariozechner/pi-ai
- https://www.npmjs.com/package/@mariozechner/pi-agent-core
- https://www.npmjs.com/package/@mariozechner/pi-coding-agent
- https://www.npmjs.com/package/@mariozechner/pi-tui
- https://github.com/badlogic/pi-mono
