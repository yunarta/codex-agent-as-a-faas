# Technical Specification Document (TSD)

## Title

OpenFaaS Agent Request Envelope — Minimum Observability + Continuity Fields

## Scope

This document specifies the meaning and intended usage of the following request envelope fields **only**:

```json
{
  "work_id": "GAL-H-CMD-123",
  "lane": "S3_SM_GATE3",
  "run_id": "run-01J…",
  "request_id": "req-01J…",
  "input": { "message": "Run Gate3 checks." }
}
```

It defines:

* What each field is
* Who owns/creates it
* How an OpenFaaS Agent should use it
* What must be echoed in the response

Out of scope:

* Tool authorization (`tool_profile`), model selection, attachment handling
* Case-file / memory policies
* Jira schema details beyond basic references

---

## Definitions

### OpenFaaS Agent

A stateless HTTP function that:

* Receives a request envelope
* Optionally loads thread memory/state using derived keys
* Produces an assistant response and optionally tool-call instructions/results

### Cycle Master (Orchestrator)

The component that:

* Decides *which* agent to call
* Decides the current SDLC stage
* Mints correlation IDs (`run_id`, `request_id`)
* Persists outcomes to the system-of-record (e.g., Jira)

---

## Field Specifications

### 1) `work_id`

**Type:** string

**Example:** `GAL-H-CMD-123`

**Meaning:**

* Stable work anchor for a unit of work.
* Intended to map to a system-of-record key (commonly a Jira issue key).

**Ownership / Creation:**

* Created/selected by the **Cycle Master** when a work item is initiated.

**Agent Usage Requirements:**

* Treat as an immutable identifier for the duration of processing.
* Use as the primary key when:

  * reading any work-scoped state
  * writing any work-scoped output references

**Non-goals / Important Notes:**

* `work_id` is **not** an authorization token.
* Access control must be enforced outside this field (e.g., by the called agent endpoint and/or external authorization policy).

---

### 2) `lane`

**Type:** string (constrained to an enum)

**Example:** `S3_SM_GATE3`

**Meaning:**

* Identifies the **stage context** ("which channel of work") for the current operation.
* Used to prevent context bleed across different stages that may involve the same work item.

**Ownership / Creation:**

* Selected by the **Cycle Master** based on the SDLC stage.

**Agent Usage Requirements:**

* Use `lane` to:

  1. Determine which stage-specific behavior is expected (e.g., Gate3 checks)
  2. Derive a deterministic thread key (see “Derived Keys”)

**Recommended Constraints:**

* `lane` must be one of the pre-defined values.
* Avoid free-text lanes to prevent unbounded thread proliferation.

**Recommended Example Enum (illustrative):**

* `S0_MP`
* `S1_PO`
* `S2_ANALYST`
* `S3_SM_GATE3`
* `S4_IMPL`
* `S4_VERIFY`
* `S5_PO_DEMO`
* `S6_SM_RETRO`
* `S7_REFINE`

---

### 3) `run_id`

**Type:** string (ULID or UUID recommended)

**Example:** `run-01J…`

**Meaning:**

* Correlation ID for a **single orchestrator run / stage attempt**.
* Groups multiple requests and tool calls that belong to the same stage execution attempt.

**Ownership / Creation:**

* Minted by the **Cycle Master**.

**Agent Usage Requirements:**

* Must be treated as read-only.
* Must be included in:

  * logs
  * tool-call metadata (if any)
  * response envelope (echo)

**Operational Guidance:**

* If the Cycle Master retries the same stage after changes, it should mint a **new** `run_id`.

---

### 4) `request_id`

**Type:** string (ULID/UUID recommended)

**Example:** `req-01J…`

**Meaning:**

* Correlation ID for **one HTTP request** to an agent.
* Used for distributed tracing and debugging.

**Ownership / Creation:**

* Minted by the **Cycle Master** (or upstream gateway) per HTTP call.

**Agent Usage Requirements:**

* Must be treated as read-only.
* Must be included in:

  * logs
  * tool-call metadata (if any)
  * response envelope (echo)

**Uniqueness Constraint:**

* Should be unique per HTTP call.

---

### 5) `input.message`

**Type:** string

**Example:** `"Run Gate3 checks."`

**Meaning:**

* Natural language instruction for the agent.

**Ownership / Creation:**

* Provided by the Cycle Master and/or upstream caller.

**Agent Usage Requirements:**

* Interpret within the stage context implied by `lane`.
* For `S3_SM_GATE3`, the agent should:

  * perform the Gate3 checklist behavior expected for the SM Gate stage
  * produce a clear decision outcome and evidence pointers (if applicable)

**Validation Rules (recommended):**

* Must be present and non-empty.
* Maximum size should be bounded (enforced by gateway/orchestrator).

---

## Derived Keys (Determinism)

The request envelope above does not include `thread_id`. The agent can derive it deterministically.

### Deterministic `thread_id`

**Formula:**

* `thread_id = work_id + "::" + lane`

**Example:**

* `GAL-H-CMD-123::S3_SM_GATE3`

**Purpose:**

* Consistent lookup key for stage-scoped conversational state.

**Rationale:**

* Since `lane` encodes stage context, combining it with `work_id` yields a stable per-stage thread bucket.

---

## Request Handling Requirements (OpenFaaS Agent)

### A) Input Validation

On receipt, the agent must validate:

* `work_id` exists and is a string
* `lane` exists and matches allowed enum
* `run_id` exists and is a string
* `request_id` exists and is a string
* `input.message` exists and is non-empty

If validation fails:

* Return an error response that includes `work_id`, `lane`, `run_id`, `request_id` (if present)
* Do not attempt tool calls

### B) Context Binding

* Bind logs to `(run_id, request_id, work_id, lane)`.
* Derive `thread_id` and use it consistently for any state lookup.

### C) Stage-Appropriate Behavior

* Behavior must be consistent with `lane`.
* For `S3_SM_GATE3`, the output should emphasize:

  * gate decision (approve / reject / request-change)
  * checklist findings
  * required fixes (if any)
  * what will be re-validated

### D) Idempotency Guidance

* The agent should avoid duplicating external side effects if the same `(request_id)` is repeated.
* If external updates are required (e.g., commenting on Jira), the agent should include `request_id` in the comment/body metadata where feasible to detect duplicates.

---

## Response Contract (Minimum)

The agent must echo the correlation identifiers.

### Minimum Response Envelope

```json
{
  "work_id": "GAL-H-CMD-123",
  "lane": "S3_SM_GATE3",
  "run_id": "run-01J…",
  "request_id": "req-01J…",
  "assistant_message": "..."
}
```

### Optional Response Fields (if applicable)

* `decision`: `approve | reject | request-change`
* `evidence`: list of references (URLs, Jira keys, log pointers)
* `tool_calls`: list of tool invocation records (name + args + result references)
* `errors`: list of error objects

---

## Logging Requirements (Minimum)

Every log line emitted by the agent should include:

* `run_id`
* `request_id`
* `work_id`
* `lane`

Recommended log prefix format:

* `[run=<run_id> req=<request_id> work=<work_id> lane=<lane>]`

---

## Examples

### Example: Gate3 Request

```json
{
  "work_id": "GAL-H-CMD-123",
  "lane": "S3_SM_GATE3",
  "run_id": "run-01J9Z2...",
  "request_id": "req-01J9Z3...",
  "input": { "message": "Run Gate3 checks on the backlog." }
}
```

### Example: Gate3 Response (Decision)

```json
{
  "work_id": "GAL-H-CMD-123",
  "lane": "S3_SM_GATE3",
  "run_id": "run-01J9Z2...",
  "request_id": "req-01J9Z3...",
  "assistant_message": "Gate3 result: request-change. Missing verification steps for AC-2 and orphan task T-7.",
  "decision": "request-change",
  "evidence": ["Jira: GAL-H-CMD-123", "Checklist: Stage 3 Gate"],
  "errors": []
}
```

---

## Compliance Checklist

* [ ] Envelope fields validated
* [ ] `thread_id` derived deterministically from `work_id::lane`
* [ ] Logs include `(run_id, request_id, work_id, lane)`
* [ ] Response echoes correlation IDs
* [ ] Stage behavior aligned to `lane`
* [ ] Side effects guarded for idempotency via `request_id`
