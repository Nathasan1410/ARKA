# OpenClaw S2B Integration Handoff

Date: 2026-04-29

Historical status for S2B: RESEARCHED ONLY. No OpenClaw gateway, plugin, skill, Telegram channel, or ARKA runtime integration was started or verified in that session.

This file is archival handoff context, not the current source of truth. For current status, use `docs/openclaw-local-fork-plan.md`, `docs/openclaw-plugin-skeleton-plan.md`, and `docs/openclaw-impact-assessment.md`.

Superseding status as of 2026-04-30:

```txt
OpenClaw source fork under openclaw/: verified.
Local install, strict-smoke build, direct CLI checks, local dev gateway connectivity, ARKA arka-audit skill loading, and MiniMax model discovery are verified.
Read-only `arka-audit` plugin skeleton static smoke is verified.
Model-backed ARKA OpenClaw response, OpenClaw gateway discovery/load of the plugin, packages/agent gateway calls, and OpenClaw Telegram remain unverified / not implemented.
Use docs/openclaw-local-fork-plan.md and docs/openclaw-impact-assessment.md for current status.
```

Research clone:

```txt
D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw
```

Research clone source:

```txt
https://github.com/openclaw/openclaw
```

Observed research commit:

```txt
e27fe55a
```

## 1. What OpenClaw Is Technically

OpenClaw is a gateway plus embedded agent runtime plus plugin/skills system. It is not a single function that ARKA can rename as an "OpenClaw agent".

| Area | Technical meaning for ARKA |
| --- | --- |
| Gateway | A long-running daemon started with `openclaw gateway`. It owns channel connections, WebSocket control/RPC, HTTP surfaces, OpenAI-compatible endpoints, health/status, and Control UI on the configured port, default `127.0.0.1:18789`. |
| Runtime | One embedded agent runtime per gateway. The runtime resolves sessions, loads workspace files and skills, assembles prompt context, calls the configured model provider, executes tools, streams output, and persists OpenClaw session transcripts. |
| Workspace | The agent cwd and prompt-memory folder. Default is `~/.openclaw/workspace`. It contains `AGENTS.md`, `SOUL.md`, `TOOLS.md`, optional `skills/`, and related private workspace files. |
| Skills | Markdown instruction packs loaded from workspace and configured skill folders. They teach the model when and how to use tools. Skills are not executable integration by themselves unless tools/plugins exist. |
| Plugins | Runtime extensions loaded by OpenClaw. Plugins can register agent tools, commands, hooks, providers, channels, HTTP routes, services, CLI commands, and metadata via the plugin SDK. |
| Tools | Typed functions registered by core or plugins with schemas and `execute` handlers. These are callable by the agent model during a run. Side-effecting tools should be narrowly scoped and often optional or approval-gated. |
| Channels | Gateway-owned messaging adapters. Telegram support is documented as a grammY-backed channel owned by the OpenClaw gateway, not by ARKA's `packages/agent`. |

### Message to Agent Action Flow

1. A user sends a message through a channel such as Telegram, WebChat, CLI, or a gateway RPC client.
2. The gateway normalizes the message, applies channel policy, pairing/allowlist checks, group mention rules, and session routing.
3. The gateway accepts an `agent` run, resolves the target session, and emits run lifecycle events.
4. The embedded runtime loads workspace bootstrap files, skills, prior session messages, plugin hook context, model settings, and available tool schemas.
5. The model produces assistant text and optional tool calls.
6. OpenClaw executes allowed tools, emits tool stream events, and feeds tool results back to the model.
7. The runtime finalizes the assistant answer, persists session data, and the gateway sends the response through the originating channel unless a tool or hook handled delivery.

For ARKA, this means OpenClaw should receive or fetch an `AuditEvent`, then use ARKA-specific tools to recommend triage outputs. It must not recompute or mutate reconciliation facts.

## 2. ARKA Integration Options

| Option | Fit | Pros | Risks | Verdict |
| --- | --- | --- | --- | --- |
| OpenClaw sidecar gateway plus ARKA skill/plugin | Strong | Matches upstream architecture, keeps OpenClaw honest, lets Telegram and tool calls stay gateway-owned, avoids vendoring. | Requires smoke setup, model credentials, plugin packaging, and later ARKA API/DB tool backing. | Recommended integration path. |
| ARKA-owned grammY Telegram plus OpenClaw only for reasoning | Medium | Faster if only owner alert is needed; ARKA controls bot flow. | Splits channel ownership from OpenClaw, duplicates Telegram policy, weakens "built on OpenClaw" story. | Use only if P0 needs a minimal real Telegram alert and OpenClaw gateway setup is not stable. |
| Vendoring/copying OpenClaw source | Superseded | ARKA now uses a repo-local OpenClaw source fork with attribution. | Large maintenance burden and higher review surface; must avoid claiming upstream code as ARKA-authored. | Current path is documented in `docs/openclaw-local-fork-plan.md`. |
| Fork/submodule strategy | Current for local fork | Useful because ARKA must patch/add local workspace and plugin skeleton files. | More repo management and reviewer complexity; still needs plugin/runtime integration. | Current P0 OpenClaw path, but not a substitute for gateway/plugin verification. |
| Direct library import from OpenClaw internals | Poor | Could look quick for a local call. | Internals are not the public boundary; bypasses gateway/session/channel/plugin contracts; brittle. | Avoid. |

### Recommendation

For hackathon P0, keep ARKA's deterministic fallback as the verified local path and pursue OpenClaw as a sidecar gateway plus ARKA workspace skill/plugin in a separate smoke slice. Do not block AuditEvent creation, dashboard investigation, proof package creation, 0G Storage, or 0G Chain on OpenClaw Telegram.

The first real OpenClaw claim should be limited to:

```txt
OpenClaw gateway runs locally, loads an ARKA workspace skill/plugin, can fetch or receive an AuditEvent, and can produce allowed triage actions without mutating reconciliation facts.
```

Until that is verified, ARKA should say:

```txt
OpenClaw researched; ARKA has an OpenClaw-facing deterministic fallback boundary, not a real OpenClaw runtime integration yet.
```

## 3. Minimal Smoke Setup Plan

### Prerequisites

| Requirement | Status / command |
| --- | --- |
| Node | OpenClaw package declares Node `>=22.14.0`; README recommends Node 24. This machine reports `node --version` as `v24.14.1`. |
| pnpm | OpenClaw package declares `pnpm@10.33.0`; this machine reports `pnpm.cmd --version` as `10.28.1`. Upgrade may be needed if source dev commands fail. |
| OS | Native Windows is possible, but upstream README strongly recommends WSL2 for Windows. Native Windows may hit path, service, and process-management friction. |
| Global CLI | `openclaw` is not currently on PATH in this ARKA session. |
| Secrets | Real agent turns require a configured model provider/auth profile. Telegram requires a BotFather token. |

### Install Options

Do not run global install without explicit approval.

Approved global install path:

```powershell
npm install -g openclaw@latest
openclaw --version
openclaw --help
```

Alternative global pnpm install:

```powershell
pnpm.cmd add -g openclaw@latest
openclaw --version
```

Source research path, for local OpenClaw development only:

```powershell
cd D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw
pnpm.cmd install
pnpm.cmd build
pnpm.cmd ui:build
```

Source install was not run in this session.

### First Smoke Commands

After installing the CLI or building from source:

```powershell
openclaw setup
openclaw gateway --port 18789 --verbose
```

In a second terminal:

```powershell
openclaw gateway status --require-rpc
openclaw status
openclaw doctor
openclaw channels status --probe
openclaw skills list
```

Control UI:

```txt
http://127.0.0.1:18789
```

Dashboard command if supported by the installed version:

```powershell
openclaw dashboard
```

Minimal agent command once a model provider is configured:

```powershell
openclaw agent --message "Summarize the ARKA AuditEvent triage rules from the workspace."
```

### Config, Workspace, and Session Locations

| Data | Default location |
| --- | --- |
| Config | `~/.openclaw/openclaw.json` |
| Workspace | `~/.openclaw/workspace` |
| Sessions | `~/.openclaw/agents/<agentId>/sessions/<sessionId>.jsonl` |
| Session index | `~/.openclaw/agents/<agentId>/sessions/sessions.json` |
| Pairing credentials | `~/.openclaw/credentials/` |
| Device pairing | `~/.openclaw/devices/` |

For isolated ARKA smoke testing, prefer explicit paths:

```powershell
$env:OPENCLAW_CONFIG_PATH='D:\Projekan\Macam2Hackathon\ARKA\_openclaw\openclaw.json'
$env:OPENCLAW_STATE_DIR='D:\Projekan\Macam2Hackathon\ARKA\_openclaw\state'
openclaw gateway --port 18789 --verbose
```

Suggested ARKA workspace outside the repo:

```txt
D:\Projekan\Macam2Hackathon\ARKA\_openclaw-workspace
```

### Can Test Without Secrets

| Check | Secret required? |
| --- | --- |
| `openclaw --help` | No |
| `openclaw --version` | No |
| `openclaw setup` / workspace seeding | No, but writes local OpenClaw config/workspace |
| `openclaw gateway status` against a running gateway | No for local gateway health, but auth/config may apply |
| Plugin package static build/test | No if no real ARKA backend call is made |
| `openclaw skills list` | No if CLI/gateway is installed and configured |

### Requires Secrets or External Setup

| Feature | Requirement |
| --- | --- |
| Real model-backed agent turn | Model provider config and credentials/auth profile |
| Telegram channel | Telegram BotFather token and pairing/allowlist approval |
| Real ARKA DB-backed tools | ARKA API or DB connection contract and credentials |
| Real proof status lookup | ARKA proof metadata API/DB contract |

## 4. ARKA Workspace Skill Plan

Keep this outside `ARKA-github` until the team decides whether to version a sanitized template.

Suggested workspace:

```txt
D:\Projekan\Macam2Hackathon\ARKA\_openclaw-workspace
```

### Workspace Files

| File | Purpose |
| --- | --- |
| `AGENTS.md` | ARKA operating rules: AuditEvent-first, P0 State A/C/D only, deterministic facts are source of truth, safe language, allowed tools, forbidden mutations. |
| `SOUL.md` | Agent identity and tone: calm audit assistant for owner/auditor, no accusations, no HR punishment, final decisions made by owner/auditor. |
| `TOOLS.md` | Tool conventions: call `get_audit_event` first, use only ARKA triage tools, do not send Telegram directly unless channel policy approves, proof status must be reported honestly. |
| `skills/arka-audit/SKILL.md` | Skill trigger and task-specific procedure for triaging ARKA AuditEvents. |

### `skills/arka-audit/SKILL.md` Outline

```markdown
---
name: arka-audit
description: Triage ARKA AuditEvents with owner-safe language and allowed actions only.
---

# ARKA Audit Skill

Use this skill when the user asks about an ARKA audit case, inventory movement,
order-linked reconciliation, proof status, or State A/C/D demo scenario.

## Required Flow

1. Read or fetch the AuditEvent first.
2. Treat expected quantity, actual quantity, variance, severity, evidence refs,
   and proof history as immutable facts.
3. Select only allowed ARKA actions:
   - setTriageAutoClear
   - setTriageSilentLog
   - requestExplanation
   - recommendEscalation
   - createCaseNote
   - createActionLog
   - prepareStaffClarificationRequest
4. For State C, prepare a staff clarification request but require owner approval
   before staff delivery.
5. Explain proof status honestly.
6. Use audit-safe language.

## Never Do

- Do not accuse staff.
- Do not claim theft or fraud.
- Do not overwrite reconciliation facts.
- Do not claim 0G upload or chain anchor unless the AuditEvent proof history says so.
- Do not send Telegram messages directly unless an approved OpenClaw/ARKA action explicitly does that.
```

## 5. ARKA OpenClaw Plugin Plan

Plugin package name suggestion:

```txt
@arka/openclaw-audit-plugin
```

Plugin id suggestion:

```txt
arka-audit
```

Recommended plugin SDK pattern:

```ts
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
```

Minimal manifest pattern:

```json
{
  "id": "arka-audit",
  "name": "ARKA Audit",
  "description": "AuditEvent triage tools for ARKA.",
  "activation": {
    "onStartup": true
  },
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "arkaApiBaseUrl": { "type": "string" },
      "apiKey": { "type": "string" }
    }
  },
  "uiHints": {
    "apiKey": {
      "label": "ARKA API key",
      "sensitive": true
    }
  }
}
```

### Tool Contracts

| Tool | Input shape | Output shape | Allowed to change | Must never change | DB now/later | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| `get_audit_event` | `{ auditEventId: string }` | `{ auditEvent, proofSummary?, caseNotes?, actionLogs? }` | Nothing; read-only. | Any AuditEvent fact, proof history, evidence ref. | Later reads from ARKA API/DB. For first smoke, may read a static fixture only if clearly labeled. | P0 |
| `set_triage_auto_clear` | `{ auditEventId: string, reason: string, sourceRunId?: string }` | `{ action: "setTriageAutoClear", triageOutcome: "AUTO_CLEAR", caseNoteDraft, actionLogDraft }` | Triage recommendation, CaseNote draft, ActionLog draft. | Reconciliation facts, lifecycle status, evidence, proof. | Later write via ARKA API/DB after approval of persistence boundary. | P0 |
| `set_triage_silent_log` | `{ auditEventId: string, reason: string, sourceRunId?: string }` | `{ action: "setTriageSilentLog", triageOutcome: "SILENT_LOG", caseNoteDraft, actionLogDraft }` | Triage recommendation and log draft. | Reconciliation facts, evidence, proof. | Later. | P1 unless State B is included. |
| `request_explanation` | `{ auditEventId: string, reason: string, ownerApprovalRequired: true, messageDraft?: string }` | `{ action: "requestExplanation", triageOutcome: "REQUEST_EXPLANATION", ownerApprovalRequired: true, staffClarificationRequestDraft }` | Request draft and owner approval recommendation. | Staff delivery, facts, proof, evidence. | Later. First implementation should draft only. | P0 |
| `recommend_escalation` | `{ auditEventId: string, reason: string, severitySummary: string }` | `{ action: "recommendEscalation", triageOutcome: "ESCALATE", caseNoteDraft, actionLogDraft }` | Escalation recommendation and owner-facing summary. | Final decision, facts, proof, evidence. | Later. | P0 |
| `create_case_note` | `{ auditEventId: string, noteType: string, body: string, sourceRunId?: string }` | `{ caseNoteDraft | caseNoteRecord, writeStatus: "draft" | "persisted" }` | CaseNote only. | AuditEvent facts, proof history, evidence. | Later persisted write; draft-only in first plugin smoke. | P0/P1 depending on persistence availability. |
| `create_action_log` | `{ auditEventId: string, actionType: string, outcome: string, sourceRunId?: string }` | `{ actionLogDraft | actionLogRecord, writeStatus: "draft" | "persisted" }` | ActionLog only. | AuditEvent facts, proof history, evidence. | Later persisted write. | P0/P1 depending on persistence availability. |
| `prepare_staff_clarification_request` | `{ auditEventId: string, handlerId?: string, handlerDisplayName?: string, question: string, ownerApprovalRequired: true }` | `{ staffClarificationRequestDraft, deliveryStatus: "not_sent", ownerApprovalRequired: true }` | Staff request draft only. | Sending message, facts, proof, evidence. | Later write after owner approval model is defined. | P0 for State C draft; delivery is P1. |

Plugin safety defaults:

```txt
All write-like tools should initially return drafts, not mutate ARKA DB.
Any future persisted write must go through an ARKA-owned API that validates the AuditEvent id, allowed action, actor/source, and immutable fact fields.
Tools must be idempotent or accept an idempotency key before real writes.
```

## 6. Future Shape of `packages/agent`

Current package status is acceptable as a local boundary and fallback:

```txt
packages/agent/src/openclaw-adapter.ts
packages/agent/src/policy.ts
packages/agent/src/triage.ts
```

Future shape:

| File | Responsibility |
| --- | --- |
| `packages/agent/src/policy.ts` | Keep deterministic fallback rules only. |
| `packages/agent/src/openclaw-client.ts` | Future gateway/client caller. It should call OpenClaw gateway or an ARKA OpenClaw plugin API when available. |
| `packages/agent/src/openclaw-adapter.ts` | Select OpenClaw client result when available; otherwise return deterministic fallback. Own timeout/error fallback semantics. |
| `packages/agent/src/triage.ts` | Public ARKA-facing API that returns `triageOutcome` and `triageSource`. |
| `packages/agent/src/openclaw-tool-contracts.ts` | Optional future shared TypeScript shapes for the ARKA plugin tools, if keeping plugin and app contracts aligned becomes useful. |

Rules:

```txt
Keep deterministic fallback.
Return triageOutcome and triageSource.
Do not let packages/agent own Telegram delivery directly unless ARKA chooses the ARKA-owned grammY option.
Do not let packages/agent own DB persistence, proof upload, or chain registration.
Do not label fallback output as OpenClaw runtime output.
```

## 7. Telegram Decision

| Option | Pros | Risks | Recommended phase |
| --- | --- | --- | --- |
| OpenClaw Telegram channel | Best alignment with OpenClaw architecture; channel, pairing, sessions, streaming, and approvals stay gateway-owned. | Requires BotFather token, gateway setup, pairing/allowlist, model provider, and plugin/skill integration. | P1, or P0.5 only after core proof demo is stable. |
| ARKA-owned grammY Telegram | Fastest path to a controlled owner alert flow if the team needs a visible Telegram moment. | Splits Telegram away from OpenClaw; more ARKA code; still needs truthfulness labels. | Conditional P0 fallback if a real Telegram alert is required. |
| Dashboard-only simulation | Most reliable for demo and does not require secrets. Keeps AuditEvent/proof flow unblocked. | Less impressive as conversational integration; must be labeled simulated. | Recommended P0 default. |

P0 recommendation:

```txt
Do not block AuditEvent and proof demo on Telegram. Use dashboard-only conversation simulation or deterministic fallback labels unless OpenClaw gateway plus Telegram is actually smoke-verified.
```

P1 recommendation:

```txt
Use OpenClaw Telegram channel with ARKA workspace skill and ARKA audit plugin only after gateway/plugin loading and channel policy are verified, so owner messages and approvals flow through the same gateway/runtime/channel system.
```

## 8. Exact Next Implementation Slices

### Task 1: OpenClaw Smoke Setup

Owned paths:

```txt
D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw
D:\Projekan\Macam2Hackathon\ARKA\_openclaw
D:\Projekan\Macam2Hackathon\ARKA\_openclaw-workspace
technical-debt.md
docs/real-vs-simulated.md only if status changes
```

Implement:

```txt
Check CLI availability.
Install OpenClaw only after human approval.
Run gateway locally on port 18789.
Run gateway status, status, doctor, and skills list.
Record exact command outputs and whether Control UI opens.
```

Do not implement:

```txt
No ARKA production code.
No ARKA API routes.
No DB writes.
No Telegram unless separate token approval is provided.
No 0G.
```

Verification commands:

```powershell
node --version
pnpm.cmd --version
Get-Command openclaw -ErrorAction SilentlyContinue
openclaw --version
openclaw setup
openclaw gateway --port 18789 --verbose
openclaw gateway status --require-rpc
openclaw status
openclaw doctor
openclaw skills list
```

Completion report:

```txt
1. Commands run
2. Gateway started yes/no
3. Control UI reachable yes/no
4. Workspace path used
5. Config/state paths used
6. Secrets used yes/no
7. What remains unverified
8. Docs updated
```

### Task 2: ARKA Workspace Skill Draft

Owned paths:

```txt
D:\Projekan\Macam2Hackathon\ARKA\_openclaw-workspace\AGENTS.md
D:\Projekan\Macam2Hackathon\ARKA\_openclaw-workspace\SOUL.md
D:\Projekan\Macam2Hackathon\ARKA\_openclaw-workspace\TOOLS.md
D:\Projekan\Macam2Hackathon\ARKA\_openclaw-workspace\skills\arka-audit\SKILL.md
docs/openclaw-s2b-handoff.md if factual correction needed
```

Implement:

```txt
Write the ARKA workspace rules and arka-audit skill.
Include AuditEvent-first procedure.
Include immutable fact rules.
Include allowed action names.
Include State A/C/D examples.
Include proof truthfulness language.
```

Do not implement:

```txt
No write-capable plugin tools yet.
No DB writes.
No Telegram delivery.
No source vendoring.
```

Verification commands:

```powershell
openclaw skills list
openclaw agent --message "Use the ARKA audit skill to explain how to handle State C without sending staff a message."
```

If model/provider secrets are missing, verify file structure only and record blocked runtime verification.

Completion report:

```txt
1. Workspace files changed
2. Skill loaded yes/no
3. Agent run verified yes/no
4. Missing secrets or setup
5. Any truthfulness doc updates
```

### Task 3: ARKA OpenClaw Plugin Skeleton

Historical S2B task. The current read-only skeleton now lives under `openclaw/extensions/arka-audit/`; next work should verify gateway load and real read-path wiring, not create a second package.

Owned paths if approved:

```txt
openclaw/extensions/arka-audit/**
docs/reused-libraries.md if new dependencies are added
docs/real-vs-simulated.md only if status changes
CHANGELOG.md
docs/ai-attribution.md
```

Implement:

```txt
Use the existing minimal OpenClaw plugin skeleton with `openclaw.plugin.json` and TypeScript entrypoint.
Register or extend only draft/read-only ARKA audit tools.
For first smoke, use fixture-backed get_audit_event or a no-write ARKA API client only if the API exists.
Return explicit writeStatus values.
```

Do not implement:

```txt
No direct DB connection from OpenClaw plugin unless explicitly chosen.
No real staff message delivery.
No proof upload or chain calls.
No mutation of AuditEvent facts.
```

Verification commands:

```powershell
pnpm.cmd --dir openclaw test:fast
openclaw plugins list
openclaw agent --message "Fetch audit event <fixture-id> and recommend the allowed ARKA triage action."
```

Completion report:

```txt
1. Files changed
2. Tools registered
3. Tools draft-only or persisted
4. Gateway/plugin load verified yes/no
5. Agent tool call verified yes/no
6. What remains simulated
```

## Current Truthful Statement

Use this wording until smoke setup changes the status:

```txt
ARKA has researched OpenClaw, keeps a deterministic OpenClaw-facing fallback in packages/agent, and has a repo-local OpenClaw fork with skill loading plus a read-only plugin skeleton static-smoke and extension-test verified. Model-backed ARKA response, gateway plugin load, packages/agent gateway calls, and Telegram integration remain unverified.
```
