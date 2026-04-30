# OpenClaw Research and ARKA Integration Plan

Last updated: 2026-04-30

## Status

```txt
Research clone: DONE
OpenClaw local source fork in ARKA repo: YES, under openclaw/
OpenClaw local install in ARKA repo: YES, verified with pnpm 10.33.0
OpenClaw local build in ARKA repo: PARTIAL, build:strict-smoke verified; full build not verified
OpenClaw local CLI smoke: YES, direct source entrypoint verified
OpenClaw gateway connectivity: YES, local dev gateway status probe verified on 127.0.0.1:19001
ARKA workspace/skill loaded in OpenClaw: YES, arka-audit ready from openclaw-workspace
MiniMax model discovery: YES, minimax/MiniMax-M2.7 listed with auth=yes
	Model-backed ARKA inference turn: YES, one local `infer model run` State C response verified
	Full OpenClaw ARKA agent session turn: NO / NOT VERIFIED
	OpenClaw gateway plugin discovery/load (arka-audit): YES, verified
	OpenClaw runtime integrated with ARKA: NO
	ARKA deterministic fallback: YES, in packages/agent
```

Research source:

```txt
Upstream repo: https://github.com/openclaw/openclaw
Official docs: https://docs.openclaw.ai
Local research clone: D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw
```

The research clone remains outside `ARKA-github` as the upstream reference. ARKA now also has a repo-local copied source fork at `openclaw/` for future OpenClaw-side workspace/plugin/runtime work. The local fork can install, pass the targeted strict-smoke build, run direct CLI help/version commands, start a local dev gateway reachable by status probe, load the ARKA `arka-audit` skill, discover MiniMax M2.7, produce one bounded local model-backed ARKA State C response through `infer model run`, and load the read-only `arka-audit` plugin in the OpenClaw gateway. Full OpenClaw ARKA agent session response is still not verified, and ARKA app integration through `packages/agent` gateway calls remains unimplemented/unverified.

## What OpenClaw Is

OpenClaw is not a small agent function or SDK.

OpenClaw is a local-first personal AI assistant and gateway runtime. Its package description says it is a multi-channel AI gateway with extensible messaging integrations.

From the repo and docs, OpenClaw includes:

```txt
CLI entrypoint: openclaw
Gateway daemon / control plane
Agent runtime
Session storage
Workspace bootstrap files
Skills
Plugin SDK
Tool system
Messaging channels
Telegram support through grammY
WebSocket gateway protocol
Control UI / dashboard
Model/provider configuration
Sandbox/tool policy options
```

OpenClaw's product shape is:

```txt
User or channel message
-> OpenClaw Gateway
-> session / workspace / model / tools / skills / plugins
-> assistant response or tool/action
-> outbound channel delivery
```

This means ARKA should not describe `packages/agent` deterministic policy as "the OpenClaw agent." It is only an ARKA fallback policy until real OpenClaw runtime/plugin integration exists.

## Install and Run Shape

Upstream OpenClaw supports global installation, but ARKA is not using a global install for the hackathon repo.

Upstream reference install:

```bash
npm install -g openclaw@latest
# or
pnpm add -g openclaw@latest

openclaw onboard --install-daemon
```

ARKA local-fork install/build shape:

```powershell
pnpm --dir openclaw install
pnpm --dir openclaw run build:strict-smoke
node openclaw/openclaw.mjs --help
node openclaw/openclaw.mjs --version
node openclaw/openclaw.mjs --dev gateway status
```

Do not use global OpenClaw commands as the ARKA demo path unless the project explicitly switches strategy later.

Runtime requirement:

```txt
Node 24 recommended
Node 22.14+ supported
Windows native supported, but WSL2 is strongly recommended for full experience
```

Useful upstream runtime commands, adapted to local-fork entrypoints where possible:

```bash
node openclaw/openclaw.mjs --dev gateway run --port 19001 --verbose --allow-unconfigured
node openclaw/openclaw.mjs --dev gateway status
node openclaw/openclaw.mjs --dev skills list
node openclaw/openclaw.mjs --dev models list --provider minimax
```

From source, the repo uses:

```txt
package manager: pnpm
packageManager: pnpm@10.33.0
Node engine: >=22.14.0
build: node scripts/build-all.mjs
dev/start: node scripts/run-node.mjs
test: node scripts/test-projects.mjs
fast tests: node scripts/run-vitest.mjs run --config test/vitest/vitest.unit.config.ts
```

ARKA has already performed a local-fork smoke path. Local install, targeted strict-smoke build, direct source CLI help/version/gateway-help, local dev gateway connectivity, ARKA `arka-audit` skill loading, MiniMax model discovery, one local `infer model run` ARKA State C response, read-only `arka-audit` plugin skeleton static smoke, and gateway discovery/load of the read-only plugin are documented as verified in `docs/openclaw-local-fork-plan.md`. Full production build, full OpenClaw ARKA agent session response, OpenClaw Telegram, and `packages/agent` gateway calls remain unverified.

## Relevant OpenClaw Concepts For ARKA

### Gateway

OpenClaw Gateway is the long-lived process that owns channels, sessions, tools, events, and agent runs. Clients connect by WebSocket. The default port is `18789`.

For ARKA, this matters because real Telegram/OpenClaw behavior probably belongs in an OpenClaw Gateway process, not inside Next.js route handlers alone.

### Agent Runtime

OpenClaw runs an embedded agent runtime per Gateway. The runtime uses:

```txt
workspace files
skills
sessions
model config
tools
plugin hooks
message channels
```

The agent loop is:

```txt
intake
-> context assembly
-> model inference
-> tool execution
-> streaming replies
-> persistence
```

For ARKA, `AuditEvent` should enter as structured context/tool input, not as raw DB reconstruction.

### Workspace

OpenClaw workspaces contain files injected into agent context:

```txt
AGENTS.md
SOUL.md
TOOLS.md
IDENTITY.md
USER.md
BOOTSTRAP.md
skills/
memory/
```

For ARKA, we can create an ARKA-specific OpenClaw workspace containing:

```txt
AGENTS.md: ARKA audit rules and anti-accusation language
SOUL.md: "ARKA does not accuse; ARKA explains evidence"
TOOLS.md: ARKA tool behavior notes
skills/arka-audit/SKILL.md: how to triage AuditEvents
```

### Skills

Skills are instructions loaded into the agent. Each skill is a folder with `SKILL.md`.

For ARKA, skills are the lowest-risk first integration layer:

```txt
skill: arka-audit
purpose: teach OpenClaw how to read AuditEvents, avoid overwriting facts, and produce owner-safe recommendations
```

Skills alone do not create typed deterministic tools. They guide the model.

### Plugins

Plugins are the proper way to extend OpenClaw with capabilities. OpenClaw plugins can register:

```txt
agent tools
commands
hooks
HTTP routes
gateway RPC methods
channels
providers
session extensions
prompt/context injections
tool policies
```

For ARKA, a plugin is the likely correct integration target after basic smoke setup:

```txt
openclaw-plugin-arka
```

Potential ARKA plugin tools:

```txt
get_audit_event
set_triage_auto_clear
set_triage_silent_log
request_explanation
recommend_escalation
create_case_note
create_action_log
prepare_staff_clarification_request
```

These tool names should map to ARKA's existing action naming:

```txt
setTriageAutoClear
setTriageSilentLog
requestExplanation
recommendEscalation
sendOwnerAlert = Telegram delivery action
```

### Plugin Hooks

OpenClaw plugins can hook agent lifecycle events such as:

```txt
before_prompt_build
before_agent_reply
before_tool_call
after_tool_call
message_received
message_sending
agent_end
```

For ARKA, useful hooks may be:

```txt
before_prompt_build: inject selected AuditEvent context into the run
before_tool_call: block any attempt to mutate AuditEvent facts
message_sending: enforce owner-safe / non-accusatory language
agent_end: record ActionLog / CaseNote summary later
```

Do not overbuild hooks for P0. Start with tools plus skill/context.

### Telegram

OpenClaw has Telegram bot support through grammY. The docs describe:

```txt
bot token config
DM policy
pairing / allowlist / open / disabled
groups
group mention behavior
sender allowlists
gateway channel health
```

For ARKA, this means two viable Telegram paths exist:

```txt
Option A: Use OpenClaw Telegram channel for owner/staff conversation.
Option B: Keep ARKA-owned Telegram via grammY and use OpenClaw only for reasoning/actions.
```

Because ARKA P0 needs a reliable dashboard/proof demo, Option B may be simpler for hackathon P0. If the product story needs "built on OpenClaw," Option A is stronger but riskier.

## ARKA Fit

| Question | Status | Notes |
| --- | --- | --- |
| Can OpenClaw accept AuditEvent as primary input? | LIKELY | It accepts messages/context and plugins can inject context or expose tools. ARKA needs a skill/plugin that provides AuditEvent context explicitly. |
| Can OpenClaw expose deterministic actions like `requestExplanation`? | CONFIRMED conceptually | Plugin SDK supports registering tools and commands. Exact ARKA tool code is not implemented yet. |
| Can OpenClaw be constrained from mutating reconciliation facts? | LIKELY | Enforce through tool design, prompt rules, and `before_tool_call` guards. Do not expose write tools for AuditEvent facts. |
| Can OpenClaw produce CaseNote / ActionLog / StaffClarificationRequest outputs? | LIKELY | Tools can return structured output or call ARKA APIs later. For P0, keep output as recommendation payloads until DB write path is ready. |
| Can OpenClaw support Telegram later? | CONFIRMED | Telegram channel docs exist and describe bot token, DM policy, pairing, groups, and grammY-based support. |
| Should ARKA use OpenClaw as a direct library dependency? | UNCLEAR | OpenClaw is a full gateway app with plugin SDK exports. A plugin/sidecar route is safer than importing internals. |
| Can OpenClaw run safely as P0? | RISK | It needs Node >=22.14, config, model provider/auth, gateway setup, and possibly WSL2 on Windows. Keep deterministic fallback for demo reliability. |

## Recommended Integration Strategy

Recommendation:

```txt
Use the repo-local OpenClaw source fork as ARKA's OpenClaw-side development surface.
Run OpenClaw as a local sidecar gateway/runtime with an ARKA-specific workspace skill and plugin skeleton.
Keep packages/agent as ARKA's local integration boundary and deterministic fallback.
```

Why:

```txt
OpenClaw is large and already owns gateway/channel/session/plugin behavior.
The repo owner chose a local source fork instead of a global install so ARKA can build and adapt the OpenClaw-side agent path locally.
OpenClaw plugins are designed for this kind of extension.
This preserves the product story: ARKA's agent layer is built on OpenClaw.
This preserves demo safety: ARKA can still work through deterministic fallback if OpenClaw setup fails.
```

Avoid for now:

```txt
Directly importing OpenClaw internal src files into packages/agent.
Recopying upstream OpenClaw without preserving provenance.
Force-adding ignored OpenClaw generated folders such as node_modules, dist, dist-runtime, .local, or .artifacts.
Making OpenClaw runtime a hard blocker for AuditEvent/proof demo.
```

## Proposed Architecture

```txt
ARKA backend/core
  -> creates AuditEvent
  -> stores AuditEvent + ProofRecord locally

ARKA packages/agent
  -> deterministic fallback
  -> OpenClaw integration client/boundary

OpenClaw sidecar gateway
  -> ARKA workspace skill
  -> ARKA plugin tools
  -> optional Telegram channel

Dashboard
  -> shows deterministic fallback or OpenClaw-backed output honestly
```

## Cross-Layer Impact on ARKA

### Backend

OpenClaw research does not change the core backend rule:

```txt
Backend still creates AuditEvent.
Backend/proof layer still owns proof package creation, 0G Storage upload, and 0G Chain handoff.
OpenClaw should never be the source of reconciliation truth.
```

What changes:

```txt
Backend should expose AuditEvent context to OpenClaw through a controlled boundary.
Backend should provide safe tools or API routes for OpenClaw plugin actions later.
Backend should accept only allowed OpenClaw outputs: triageOutcome, recommendation, CaseNote, ActionLog, StaffClarificationRequest.
Backend should reject attempts to modify AuditEvent facts from OpenClaw.
```

Do not make backend wait on OpenClaw:

```txt
AuditEvent creation must complete without OpenClaw.
Proof package creation must not depend on OpenClaw.
If OpenClaw gateway is down, deterministic fallback should still provide P0 triage.
```

### Database

OpenClaw research does not require a new DB-first architecture.

Database should still store:

```txt
AuditEvent facts
triageOutcome
CaseNote
ActionLog
StaffClarificationRequest
ProofRecord
caseResolutionStatus / recommendation
```

Additional fields that may become useful:

```txt
triage_source: deterministic_fallback | openclaw_gateway | dashboard_simulation
openclaw_run_id: optional external run identifier
openclaw_session_id: optional external session identifier
openclaw_message_ref: optional Telegram/channel message reference
```

Do not add these until implementation needs them. The important database rule is still:

```txt
OpenClaw may append triage/action records.
OpenClaw must not overwrite reconciliation facts.
```

### Dashboard / Frontend

Dashboard copy must distinguish:

```txt
Deterministic fallback / OpenClaw preview
OpenClaw-backed result
Telegram-simulated conversation
Real Telegram conversation
```

The dashboard should show `triageSource` or equivalent once available.

For P0, dashboard can safely consume the deterministic fallback. When OpenClaw gateway/plugin is verified, the same panel can switch to showing OpenClaw-backed output without changing the AuditEvent core.

### Telegram

OpenClaw has Telegram support through its gateway/channel system.

ARKA now has two honest paths:

```txt
P0 reliable path: dashboard simulation or ARKA-owned grammY alert.
OpenClaw story path: OpenClaw Telegram channel + ARKA skill/plugin.
```

Do not mix the two silently. The UI and README must say which path is active.

### Proof / 0G

OpenClaw research does not change proof ownership:

```txt
OpenClaw does not upload directly to 0G Storage.
OpenClaw does not register directly on 0G Chain.
OpenClaw reads local ProofRecord and can explain proof status.
```

OpenClaw recommendations can be included later in final resolution or action timeline packages, but the initial AuditEvent Proof Package must not depend on OpenClaw already running.

### Parallel Work

The finding affects worker scope:

```txt
Agent/OpenClaw worker: OpenClaw smoke setup, ARKA skill/plugin, packages/agent client boundary.
Dashboard worker: label fallback vs OpenClaw-backed output honestly.
Backend worker: expose safe AuditEvent context and reject fact mutation.
Database worker: persist OpenClaw outputs and optional source/run metadata only when needed.
Proof worker: stay independent from OpenClaw runtime.
Telegram worker: choose ARKA-owned grammY vs OpenClaw channel explicitly.
```

## ARKA OpenClaw Plugin Shape

Current local-fork plugin skeleton:

```txt
openclaw/extensions/arka-audit
```

Current files:

```txt
openclaw/extensions/arka-audit/package.json
openclaw/extensions/arka-audit/openclaw.plugin.json
openclaw/extensions/arka-audit/index.ts
openclaw/extensions/arka-audit/src/get-audit-event.ts
```

Plugin responsibilities:

```txt
Register ARKA tools.
Expose only safe AuditEvent-first operations.
Inject ARKA audit rules into OpenClaw.
Prevent mutation of reconciliation facts.
Optionally call ARKA local API routes later.
Optionally prepare Telegram owner/staff messages later.
```

Plugin must not:

```txt
Recalculate expected/actual truth from raw DB tables.
Overwrite AuditEvent.status, expected qty, actual qty, variance, severity, or evidence refs.
Upload to 0G Storage directly.
Register chain anchors directly.
Accuse staff of theft/fraud.
```

## Suggested Phases

### Phase 1 - Research Clone And Local Fork

Done:

```txt
Cloned upstream OpenClaw to D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw
Read README, package scripts, architecture docs, agent docs, plugin docs, Telegram docs, workspace/skills docs.
Copied upstream OpenClaw source into ARKA-github/openclaw as a repo-local source fork.
Preserved upstream LICENSE and provenance.
```

Not done:

```txt
Do not treat the local fork as ARKA app integration by itself.
```

### Phase 2 - Minimal OpenClaw Smoke Setup

Goal:

```txt
Prove OpenClaw can run locally on this machine.
```

Current status:

```txt
Local install: verified.
Strict-smoke build: verified.
Direct local CLI help/version/gateway-help: verified.
Local dev gateway connectivity: verified.
Full production build: not verified.
Model-backed ARKA inference response: verified once through local `infer model run`.
Full OpenClaw ARKA agent session response: not verified.
```

Risks:

```txt
May need Node 22.14+ or Node 24.
May be smoother in WSL2.
May need model provider auth.
May create global user config under ~/.openclaw.
```

### Phase 3 - ARKA Workspace Skill

Created local-fork ARKA workspace:

```txt
openclaw/workspaces/arka
```

Files:

```txt
AGENTS.md
SOUL.md
TOOLS.md
skills/arka-audit/SKILL.md
```

The skill should teach:

```txt
AuditEvent-first triage
Allowed actions
Forbidden mutations
Owner-safe language
State A/C/D behavior
Proof status language
```

Current status:

```txt
arka-audit skill loads as ready from openclaw-workspace.
The skill is instruction-only; it is not the same as app integration.
```

### Phase 4 - ARKA OpenClaw Plugin

Current local-fork skeleton:

```txt
openclaw/extensions/arka-audit
```

Uses OpenClaw plugin SDK patterns:

```ts
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
```

Current implemented tool:

```txt
get_audit_event
```

Current behavior:

```txt
read-only skeleton, returns status=unavailable until ARKA backend/API read path exists
```

Future safe tools:

```txt
set_triage_auto_clear
set_triage_silent_log
request_explanation
recommend_escalation
create_case_note
create_action_log
```

For P0, tools can return structured payloads without DB writes. DB writes can come later through ARKA API/DB contracts.

Current status:

```txt
Static plugin smoke checks passed.
OpenClaw gateway discovery/load of the read-only plugin skeleton is verified.
```

### Phase 5 - Connect ARKA packages/agent

`packages/agent` should remain the ARKA app-facing boundary.

Future files:

```txt
packages/agent/src/openclaw-client.ts
packages/agent/src/openclaw-adapter.ts
packages/agent/src/policy.ts
packages/agent/src/triage.ts
```

Behavior:

```txt
If OpenClaw gateway is configured and reachable:
  send AuditEvent context to OpenClaw / call ARKA plugin path
  receive OpenClaw recommendation/action

If OpenClaw unavailable:
  use deterministic fallback
```

### Phase 6 - Telegram Decision

Choose one:

```txt
P0 safer: ARKA dashboard Telegram simulation + maybe ARKA-owned grammY owner alert.
P1 stronger OpenClaw story: OpenClaw Telegram channel with ARKA plugin/skill.
```

Do not make Telegram block:

```txt
AuditEvent generation
Proof package creation
0G Storage upload
0G Chain anchor
```

### Phase 7 - Truthfulness Update

Only after actual setup:

```txt
If OpenClaw gateway runs locally: OpenClaw runtime = PARTIAL/LOCAL
If ARKA plugin installed and used: OpenClaw integration = PARTIAL
If Telegram channel sends real alert: Telegram = REAL/PARTIAL
If only deterministic policy: OpenClaw = fallback only
```

## Immediate Next Work Recommendation

Do not keep rearranging local adapter files as the main OpenClaw task.

Next OpenClaw work should be:

```txt
S2B: run OpenClaw minimal smoke setup OR create ARKA workspace skill draft.
```

Best next task:

```txt
Run OpenClaw minimal smoke setup in research mode.
```

Inputs needed:

```txt
Confirm Node version on machine.
Decide whether to use native Windows or WSL2.
Decide whether installing global openclaw is acceptable.
Provide/choose model provider auth only if running real agent turn.
```

No secrets should be committed.

## Open Questions

```txt
Should ARKA ever need a global OpenClaw install, or is the local source fork enough for the demo?
Should ARKA keep the plugin under openclaw/extensions/arka-audit, or later extract it into a separate package for publishing?
Should Telegram P0 be OpenClaw-owned or ARKA-owned grammY?
Can a full OpenClaw ARKA agent session turn be made reliable on Windows without WSL2?
Which model provider will OpenClaw use during demo?
Will judges see OpenClaw dashboard/gateway or only ARKA dashboard?
```

## Current Honest Claim

Correct:

```txt
ARKA has deterministic OpenClaw-compatible fallback triage.
OpenClaw public source is copied as a repo-local fork under openclaw/.
Local install, strict-smoke build, direct CLI checks, local dev gateway connectivity, ARKA skill loading, and MiniMax model discovery are verified.
Real ARKA app integration through OpenClaw gateway/plugin/client is planned but not implemented.
```

Incorrect:

```txt
ARKA has a working model-backed OpenClaw agent turn for ARKA.
ARKA packages/agent calls OpenClaw gateway/plugin.
ARKA has an OpenClaw plugin writing DB records.
ARKA has OpenClaw Telegram running.
OpenClaw uploads to 0G Storage or registers 0G Chain anchors.
```
