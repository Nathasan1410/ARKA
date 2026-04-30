# AGENTS.md

Project and agent instructions for ARKA.

These instructions apply to all AI-assisted work in this repository.

---

## 1. Core Project Boundary

ARKA is a hackathon project focused on creating, triaging, and proving AuditEvents.

Preserve this architecture:

```txt
Backend = creates AuditEvent
Database = stores operational evidence + proof metadata
OpenClaw = operates on AuditEvent as Layer-1 conversational triage
Dashboard = Layer-2 visual investigation
0G Storage = sealed proof packages
0G Chain = proof anchors
```

OpenClaw implementation rule:

```txt
OpenClaw is a gateway/runtime/plugin/skills system.
Do not claim real OpenClaw integration from packages/agent deterministic fallback alone.
Use docs/openclaw-local-fork-plan.md, docs/openclaw-impact-assessment.md, and docs/openclaw-research-and-integration-plan.md before changing OpenClaw-related code.
Current honest status: local OpenClaw source fork, local install, strict-smoke build, direct CLI checks, local dev gateway connectivity, ARKA skill loading, MiniMax model discovery, and the read-only `arka-audit` plugin skeleton static smoke are verified; model-backed ARKA agent response, OpenClaw gateway discovery/load of the plugin, packages/agent gateway calls, and OpenClaw Telegram are not verified.
```

Product anchor:

> ARKA is an AuditEvent generator with an OpenClaw triage layer and 0G proof layer.

Do not turn ARKA into:

```txt
ERP
warehouse management
full POS production system
full CCTV AI system
HR punishment system
cashierless checkout clone
```

---

## 2. Fresh-Start and Reuse Rules

There is no old ARKA-specific code, contract, UI, Figma file, landing page, demo asset, or private prototype.

Everything ARKA-specific must be created during the hackathon and kept in visible project history.

Allowed if properly attributed:

```txt
Public open-source libraries
Public boilerplates
Starter kits
Next.js starter code
Scaffold-ETH or similar public templates
0G SDKs, docs, and examples
OpenClaw public framework/code
Generic UI components and icons
AI-assisted code reviewed by humans
```

Do not:

```txt
Use undisclosed pre-existing ARKA-specific code, UI, contracts, or assets.
Hide AI usage.
Claim unfinished features are working.
Claim 0G Compute, iNFT, YOLO, hardware, Telegram, encryption, access control, or other integrations are implemented unless they actually are.
Create one huge final commit.
```

Keep work commit-friendly. Avoid one huge final commit. Commit only when the human asks or project workflow requires it.

---

## 3. AI Transparency and Human Direction

AI tools are allowed, but AI usage must be transparent, attributable, human-directed, reviewed, and verified.

AI may assist with:

```txt
brainstorming
architecture review
code generation
debugging
documentation
tests
README writing
demo script drafting
UI copy
refactoring suggestions
smart contract review
prompt/spec planning
```

AI agents must not:

```txt
make product decisions silently
invent integrations that do not exist
claim generated code was manually written
submit unreviewed AI output as final
```

Humans provide project direction, review, testing, integration judgment, and final shipping decisions.

---

## 4. Documentation Update Triggers

Update documentation when the change affects what reviewers, teammates, or judges need to understand.

A meaningful milestone is a change that affects reviewer understanding, demo behavior, architecture, feature behavior, integration claims, or compliance status.

Typos, formatting-only edits, and tiny wording cleanup do not need separate documentation entries.

Batching documentation entries by work session is allowed.

### CHANGELOG.md

Update once per work session, PR, or meaningful milestone.

Update when:

```txt
a feature is added
a feature behavior changes
an integration is added or removed
a major document/spec is changed
a bug is fixed
a demo scenario changes
```

Do not update the changelog for every tiny edit.

### docs/ai-attribution.md

Update when AI materially helps with:

```txt
code
contracts
architecture/specs
documentation
tests
UI copy
debugging
```

Small typo fixes or formatting-only edits do not need separate attribution entries.

### docs/real-vs-simulated.md

Update only when the truthfulness status of a feature changes.

Examples:

```txt
0G Storage changes from planned to real
0G Chain changes from mocked to real
hardware input changes from simulated to real
YOLO remains future / placeholder
```

### docs/reused-libraries.md

Update only when adding:

```txt
starter kits
templates
boilerplates
copied public examples
major external libraries
```

### technical-debt.md

Update when an agent skips, defers, blocks, or knowingly leaves unfinished work that matters for implementation or demo reliability.

Use it for:

```txt
skipped verification steps
deferred implementation details
external setup needed from the human
integration blockers
temporary fallbacks
known risks accepted for the current milestone
follow-up tasks needed before claiming a feature is real
```

Do not use it for tiny TODOs that are handled in the same turn.

---

## 5. Engineering Behavior

Think before coding:

```txt
State assumptions explicitly.
Ask when something is unclear.
Surface tradeoffs.
Mention simpler approaches when available.
Push back when a requested approach is unnecessarily complex or risky.
```

Use the minimum code required to solve the task:

```txt
Avoid features beyond what was requested.
Avoid abstractions for single-use code.
Avoid unrequested configurability.
Avoid large rewrites for small changes.
```

Make surgical changes:

```txt
Touch only what is necessary.
Do not refactor unrelated code.
Match existing style.
Remove only unused code introduced by your own change.
Mention unrelated technical debt separately.
```

Turn tasks into verifiable goals:

```txt
Bug fix = reproduce, fix, verify.
Validation = cover invalid scenarios, make them pass.
Refactor = preserve behavior before and after.
```

For multi-step work, state a brief plan, implement the change, verify it, and document anything important.

### Planning-to-Implementation Workflow

Before implementing a feature, agents should check the current planning docs and tracker:

```txt
AGENTS.md
checklist.md
docs/mvp-demo-interaction-brief.md
docs/technical-stack-brief.md
docs/openclaw-research-and-integration-plan.md
docs/real-vs-simulated.md
relevant domain brief (Backend, Database, OpenClaw, 0G Storage, 0G Chain)
```

Implementation should follow this order unless the human explicitly redirects:

```txt
1. Preserve the AuditEvent-first architecture.
2. Keep P0 focused on State A, State C, and State D.
3. Implement local deterministic core behavior before optional integrations.
4. Verify the smallest meaningful slice.
5. Update truthfulness/docs only when the feature status changes.
6. Record blockers, skipped checks, or human-needed setup in technical-debt.md.
```

Agents should not silently promote P1/P2 ideas into P0.

When a requested implementation depends on external setup, agents should make the dependency explicit and continue with a safe local interface or documented fallback when possible.

### Skipped Work and Human-Needed Actions

If an agent cannot complete a relevant step, the final response is not enough. Add an entry to `technical-debt.md` when the skipped or blocked step affects:

```txt
feature correctness
demo reliability
integration truthfulness
deployment
security / secrets
0G Storage or 0G Chain verification
Telegram behavior
manual demo verification
```

Each `technical-debt.md` entry should include:

```txt
Date
Area
Status: BLOCKED / DEFERRED / RISK / NEEDS_HUMAN
What happened
Why it matters
Next action
Owner: Human / Agent / Both
```

---

## 6. Verification and Claim Honesty

Do not claim something works unless it was actually verified.

Run relevant checks when available:

```txt
type checks
tests
linting
build checks
contract compilation
local app startup
manual UI verification
demo scenario verification
```

If a check cannot be run, say what was skipped and why.

Clearly label feature status:

```txt
REAL
SIMULATED
MOCKED
PLACEHOLDER
PARTIAL
PLANNED
DOCUMENTATION-ONLY
```

Do not claim these unless implemented and verified:

```txt
0G Storage upload
0G Chain registry
0G Compute
iNFT
Telegram flow
hardware input
YOLO detection
encryption
access control
on-chain verification
```

Mocked or simulated features must be labeled in `README.md` and `docs/real-vs-simulated.md` when status changes.

Use audit-safe language:

```txt
needs review
movement without matching sale
usage above expected range
explanation requested
evidence package created
final decision made by owner/auditor
```

Avoid accusatory or legalistic claims:

```txt
AI proves theft
employee is guilty
fraud detected
automatic punishment
legally binding accusation
```

For MVP, preserve:

```txt
Local DB = operational evidence
0G Storage = sealed proof packages
0G Chain = proof anchors
```

---

## 7. Security and Privacy

Never commit:

```txt
.env
private keys
wallet seed phrases
API keys
private Telegram bot tokens
0G private keys
```

Use `.env.example` for required environment variables.

For 0G Storage proof packages:

```txt
redact by default
include audit-relevant summaries
prefer actor_id / role over full personal identity
do not upload raw CCTV video for MVP
do not upload private HR text
do not claim privacy, encryption, or access control unless implemented
```

---

## 8. Required Starter Docs

Create these files early and keep them updated by the triggers above:

```txt
CHANGELOG.md
checklist.md
technical-debt.md
docs/ai-attribution.md
docs/real-vs-simulated.md
docs/reused-libraries.md
```

Purpose:

```txt
CHANGELOG.md = human-readable project progress
checklist.md = feature scope and implementation tracker
technical-debt.md = skipped work, blockers, deferred decisions, and human-needed actions
docs/ai-attribution.md = material AI-assisted work
docs/real-vs-simulated.md = feature truthfulness status
docs/reused-libraries.md = reused libraries, starter kits, templates, and copied public examples
```

---

## 9. Agent Completion Report

Only required when the agent changes files.

For pure brainstorming, review, Q&A, or planning without file changes, no completion checklist is required.

When files change, report:

```txt
1. Files changed
2. Verification performed
3. Docs updated: yes/no and why
4. technical-debt.md updated: yes/no and why
5. Anything skipped and why
```

Keep the report concise and factual.
