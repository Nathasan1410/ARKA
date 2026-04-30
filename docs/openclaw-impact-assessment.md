# OpenClaw Cross-Layer Impact Assessment

Last updated: 2026-05-01

## Verdict

OpenClaw is now a central ARKA integration track, but it still has a precise boundary:

```txt
OpenClaw = Layer-1 conversational triage over AuditEvent
packages/agent = ARKA app-facing client boundary plus deterministic fallback
backend/core = source of AuditEvent facts
database = ARKA-owned evidence, triage outputs, and proof metadata
proof/storage/chain = ARKA proof layer, not OpenClaw-owned execution
dashboard = Layer-2 visual investigation and truthfulness display
```

Current verified OpenClaw status:

```txt
OpenClaw source fork under openclaw/: VERIFIED
OpenClaw local install: VERIFIED
OpenClaw strict-smoke build: VERIFIED
Direct local CLI help/version/gateway-help: VERIFIED
Local dev gateway connectivity: VERIFIED
ARKA arka-audit workspace skill loaded: VERIFIED
MiniMax model discovery/auth: VERIFIED
Model-backed ARKA inference response: VERIFIED through local `infer model run`
Full OpenClaw ARKA agent session response: NOT VERIFIED
ARKA plugin/tool integration: READ-ONLY SKELETON STATIC-SMOKE VERIFIED; GATEWAY LOAD NOT VERIFIED
packages/agent gateway/client call path: NOT IMPLEMENTED
OpenClaw Telegram channel for ARKA: NOT IMPLEMENTED
```

This means ARKA may honestly say it has a repo-local OpenClaw fork, a locally smoke-tested gateway, an ARKA skill loaded by OpenClaw, and one model-backed local OpenClaw inference response for ARKA State C. It must not yet say the ARKA app is integrated with OpenClaw until ARKA sends AuditEvents through a verified gateway/plugin/client path and receives an OpenClaw-backed result.

## Cross-Layer Fit

The right ARKA shape is:

```txt
Scenario / API
  -> packages/core creates immutable AuditEvent facts
  -> packages/db persists operational evidence and proof metadata
  -> packages/agent tries OpenClaw gateway/client when available
     -> OpenClaw workspace skill/plugin reads AuditEvent first
     -> deterministic fallback remains available if runtime/provider fails
  -> database appends triageOutcome, triageSource, CaseNote, ActionLog, StaffClarificationRequest
  -> dashboard shows both investigation data and runtime truthfulness
  -> proof layer creates/upload/anchors packages independently
```

Forbidden shape:

```txt
OpenClaw recalculates expected vs actual as source of truth.
OpenClaw mutates AuditEvent.status, severity, variance, quantities, evidence refs, or proof history.
OpenClaw directly uploads to 0G Storage or registers 0G Chain anchors.
Dashboard labels deterministic fallback as real OpenClaw-backed runtime.
DB mirrors full OpenClaw internal transcripts for P0.
```

## Sector Impact Matrix

| Sector | Impact | Required alignment |
| --- | --- | --- |
| Frontend / `apps/web` | Medium | Dashboard must treat OpenClaw as the visible triage center, but show `triageSource` and runtime status honestly. It should call ARKA APIs or `packages/agent`, not OpenClaw internals directly. |
| Backend / API routes | High | Backend remains the only source that creates AuditEvents. Future routes should expose AuditEvent context to OpenClaw tools and reject any attempt to rewrite reconciliation facts. |
| `packages/core` | Low | No OpenClaw dependency. Core remains pure reconciliation and proof package logic. OpenClaw outputs can be appended later, not used to create facts. |
| `packages/agent` | High | This becomes the ARKA client/fallback boundary. Next shape: deterministic fallback in `policy.ts`, gateway client in a future `openclaw-client.ts`, public `triageAuditEvent` returning `triageOutcome` and `triageSource`. |
| `packages/db` | Medium | Schema already stores `triageOutcome`, `triageSource`, `CaseNote`, `ActionLog`, `StaffClarificationRequest`, and `ProofRecord`. Add OpenClaw run/session/message refs only after a real plugin/client write path exists. |
| OpenClaw fork / `openclaw/` | High | This is where ARKA OpenClaw-side workspace, skills, and plugin/tool code should live or be prototyped. Do not store secrets, `node_modules`, or generated dist as project source. |
| Dashboard conversation panel | High | Should become the operator view of OpenClaw triage, owner approval, staff clarification preview, and proof status. P0 can still use deterministic fallback if OpenClaw model turns remain unstable. |
| 0G Storage | Low/Medium | OpenClaw may explain proof status or recommend package creation, but backend/proof layer owns package creation and upload. Proof package may later include OpenClaw action summaries as appended metadata. |
| 0G Chain | Low/Medium | OpenClaw may describe whether an anchor exists, but backend/proof registrar owns transactions. Do not put OpenClaw transcripts or staff messages on-chain. |
| Telegram / channels | Medium | OpenClaw Telegram is a good P1 path. P0 should not block AuditEvent/proof demo on Telegram; dashboard simulation remains acceptable until channel flow is verified. |
| Security / secrets | High | MiniMax key and OpenClaw smoke config stay outside repo. `.gitignore` must continue blocking `.env*`, smoke state, OpenClaw runtime state, and secrets. |

## Frontend Impact

The dashboard should present OpenClaw as the Layer-1 triage surface:

```txt
AuditEvent facts
OpenClaw/fallback recommendation
triageSource
owner approval state
staff clarification draft
CaseNote / ActionLog
proof lifecycle summary
```

Required UI truthfulness:

```txt
DETERMINISTIC_FALLBACK = local fallback, not real OpenClaw-backed output.
OPENCLAW_RUNTIME = only after packages/agent receives a verified OpenClaw gateway/plugin result.
Gateway connected / skill loaded / model discovered are setup statuses, not proof of ARKA triage integration.
```

The current dashboard shell already displays deterministic fallback and `triageSource`. The next UI slice should add a compact runtime status panel:

```txt
OpenClaw fork: verified
Gateway: local smoke verified
Skill: arka-audit loaded
Model: MiniMax discovered
ARKA plugin: read-only skeleton static-smoke and extension-test verified; gateway load not verified
ARKA app call: not implemented
```

## Backend/API Impact

Future backend route handlers should be shaped around safe OpenClaw tools:

```txt
GET audit event context
record triage outcome
create case note
create action log
prepare staff clarification request
record owner approval
read proof status
```

Backend must enforce immutable fields:

```txt
expectedUsageQuantity
actualMovementQuantity
netMovementQuantity
variancePercent
status
severity
scenarioKey
caseType
evidence refs
proof history
```

OpenClaw can recommend or append:

```txt
triageOutcome
triageSource
CaseNote
ActionLog
StaffClarificationRequest draft
owner recommendation
caseResolutionStatus later
```

## Database Impact

The current schema is broadly aligned because it stores ARKA-owned outputs instead of OpenClaw internals:

```txt
audit_events.triage_outcome
audit_events.triage_source
case_notes
action_logs
staff_clarification_requests
proof_records
```

Do not add full OpenClaw transcript persistence for P0. After the plugin/client path works, add only narrow references if needed:

```txt
openclaw_run_id
openclaw_session_id
openclaw_message_ref
openclaw_model_ref
openclaw_skill_name
openclaw_gateway_url/profile
```

Those fields should be optional and append-only where possible. They should help trace an OpenClaw recommendation without making OpenClaw the ARKA database.

## Proof, 0G Storage, And 0G Chain Impact

OpenClaw should be proof-aware, not proof-owning.

Allowed:

```txt
Read local ProofRecord.
Explain LOCAL_ONLY / STORED_ON_0G / REGISTERED_ON_CHAIN honestly.
Recommend creating or verifying a proof package.
Write an ActionLog that proof was requested or reviewed.
Contribute a summary to a Final Resolution Package after owner decision.
```

Not allowed:

```txt
Upload proof packages to 0G Storage directly.
Submit AuditProofRegistry transactions directly.
Overwrite proof status.
Delete AuditEvents when proof fails.
Put staff chat or private notes on-chain.
Claim a proof is stored or anchored before the backend verifies it.
```

Proof package sequencing remains:

```txt
AuditEvent Proof Package can be created before OpenClaw model response.
OpenClaw outputs can be included later in Action Timeline or Final Resolution packages.
0G Storage upload and 0G Chain registration remain backend/proof responsibilities.
```

## OpenClaw-Side Build Path

The local fork should be used for OpenClaw-side development in this order:

```txt
1. Keep `openclaw/workspaces/arka` as the instruction/skill layer.
2. Debug a successful minimal model-backed agent turn.
3. Verify OpenClaw gateway discovery/load of `openclaw/extensions/arka-audit`.
4. Wire read-only `get_audit_event` to a real ARKA backend/API read path.
5. Add append-only triage tools after DB/API contracts exist.
6. Connect `packages/agent` to the gateway/plugin with deterministic fallback.
```

Minimal plugin/tool set:

```txt
get_audit_event: P0 read-only
set_triage_auto_clear: P0 append/update triage only
request_explanation: P0 draft request, owner approval required before staff delivery
recommend_escalation: P0 append recommendation only
create_case_note: P0 append-only
create_action_log: P0 append-only
prepare_staff_clarification_request: P0 draft-only
set_triage_silent_log: P1 unless State B enters P0
```

## Recommended Next Slices

### Slice 1 - OpenClaw Model Turn Debug

Scope:

```txt
openclaw/
docs/openclaw-local-fork-plan.md
technical-debt.md
```

Goal:

```txt
Get `node openclaw\openclaw.mjs --dev agent --message "Reply with OK only."` to return a response using MiniMax.
Then test one ARKA State C prompt with arka-audit loaded.
```

Do not implement ARKA plugin/API/DB writes in this slice.

### Slice 2 - ARKA OpenClaw Plugin Gateway Load

Scope:

```txt
openclaw/extensions/arka-audit/
docs/openclaw-local-fork-plan.md
test/arka-openclaw.verify.test.ts
```

Goal:

```txt
Verify the existing read-only arka-audit plugin skeleton can be discovered/loaded by OpenClaw gateway.
Keep get_audit_event read-only and unavailable until ARKA backend/API read path exists.
```

Do not send Telegram, upload 0G, register chain anchors, or mutate reconciliation facts.

### Slice 3 - packages/agent Gateway Client

Scope:

```txt
packages/agent/**
test/arka-openclaw.verify.test.ts
```

Goal:

```txt
Add an optional OpenClaw gateway/client call path.
Return `OPENCLAW_RUNTIME` only after a verified response.
Fall back to deterministic policy on timeout, unavailable gateway, or invalid response.
```

## Honest Current Claim

Correct:

```txt
ARKA has a verified AuditEvent-first core for A/C/D.
ARKA has deterministic fallback triage for A/C/D.
ARKA has a repo-local OpenClaw source fork.
ARKA has a locally smoke-tested OpenClaw dev gateway.
ARKA has an ARKA `arka-audit` skill loaded by OpenClaw.
ARKA has MiniMax model discovery/auth in the local smoke setup.
```

Incorrect:

```txt
ARKA has a working model-backed OpenClaw agent turn.
ARKA packages/agent calls OpenClaw.
ARKA has an OpenClaw plugin writing DB records.
ARKA has OpenClaw Telegram running.
OpenClaw uploads to 0G Storage or registers 0G Chain anchors.
```
