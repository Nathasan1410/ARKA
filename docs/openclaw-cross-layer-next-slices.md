# OpenClaw Cross-Layer Next Slices

Last updated: 2026-04-30

## Purpose

OpenClaw is the Layer-1 triage surface for ARKA, but it is not the owner of the system facts.

Keep this boundary explicit:

```txt
OpenClaw = conversational triage over AuditEvent
Backend/core = creates AuditEvent facts
Database = stores ARKA evidence and proof metadata
Proof layer = builds and uploads proof packages
0G Chain = registers proof anchors
```

OpenClaw may recommend, summarize, draft, and annotate.
It must not own or rewrite reconciliation facts, schema truth, proof uploads, or chain anchors.

## Verified Status Gate

Do not promote OpenClaw integration claims beyond what is verified today.

Current honest status:

```txt
Verified:
- local OpenClaw source fork
- local install and strict-smoke build
- local dev gateway connectivity
- ARKA skill loading
- MiniMax model discovery/auth

Not verified or not implemented:
- model-backed ARKA agent response
- OpenClaw gateway discovery/load of the read-only arka-audit plugin skeleton
- real ARKA backend/API wiring for plugin tools
- packages/agent gateway calls
- OpenClaw Telegram
```

This means any next slice must preserve deterministic fallback and honest labeling.

## Worker Order

Use this order unless a later gate fails:

1. Frontend visibility slice
2. Backend fact boundary slice
3. Database append-only metadata slice
4. Proof package slice
5. 0G Chain anchor slice

Each slice has its own gate. Do not start the next one until the previous gate is satisfied or the blocker is recorded.

## Slice 1 - Frontend Visibility

Goal:

```txt
Show OpenClaw as the central triage layer without implying it owns facts.
```

Scope:

```txt
apps/web
dashboard conversation / triage panel
runtime status badges
proof status display
triageSource display
```

Inputs:

```txt
AuditEvent
triageOutcome
triageSource
ProofRecord summary
OpenClaw runtime status
```

Output:

```txt
UI that clearly distinguishes:
- deterministic fallback
- OpenClaw-backed runtime
- local proof state
```

Gate:

```txt
The UI must never imply OpenClaw created the AuditEvent, rewrote the schema, uploaded 0G data, or registered the chain anchor.
```

## Slice 2 - Backend Fact Boundary

Goal:

```txt
Make the backend the only source that creates AuditEvent facts and hands read-only context to triage.
```

Scope:

```txt
backend API routes or service layer
packages/core reconciliation outputs
packages/agent boundary
```

Inputs:

```txt
order
movement
usage rule
reconciliation result
read-only AuditEvent context
```

Output:

```txt
immutable AuditEvent creation
append-only triage result storage
owner-facing clarification drafts
```

Gate:

```txt
Tests or review must show OpenClaw-facing code cannot overwrite expected quantity, actual quantity, variance, status, severity, or evidence references.
```

## Slice 3 - Database Append-Only Metadata

Goal:

```txt
Persist ARKA-owned triage and proof metadata without turning the database into OpenClaw internal state.
```

Scope:

```txt
packages/db schema
triage metadata fields
CaseNote / ActionLog / StaffClarificationRequest
ProofRecord
```

Inputs:

```txt
backend-generated AuditEvent
triageOutcome
triageSource
proof status fields
optional OpenClaw references only after a verified runtime path exists
```

Output:

```txt
append-only persistence for triage, evidence, and proof metadata
```

Gate:

```txt
The schema must remain honest: no full OpenClaw transcript mirroring for P0 and no required OpenClaw session refs before a real plugin/client path exists.
```

## Slice 4 - Proof Package

Goal:

```txt
Build the local proof package and hash before any storage upload is attempted.
```

Scope:

```txt
packages/core proof package builder
canonicalization
local hash generation
redacted summaries
ProofRecord update on local package creation
```

Inputs:

```txt
AuditEvent
supporting summaries
case type
status
severity
```

Output:

```txt
canonical proof JSON
local package hash
local proof status
```

Gate:

```txt
The proof package must exist independently of OpenClaw runtime availability.
OpenClaw may add a summary later, but it does not own package creation.
```

## Slice 5 - 0G Storage and 0G Chain

Goal:

```txt
Upload sealed proof packages and anchor them, with the backend/proof layer owning both operations.
```

Scope:

```txt
0G Storage upload path
0G Storage metadata capture
AuditProofRegistry chain anchor path
ProofRecord storage and chain status updates
```

Inputs:

```txt
local proof package
local package hash
0G root hash or storage reference
chain registration metadata
```

Output:

```txt
stored proof metadata
chain tx hash
verified proof lifecycle state
```

Gate:

```txt
0G upload must happen before chain registration, and chain registration must not be claimed unless the proof package and storage metadata are already verified.
OpenClaw must not directly upload or register anchors.
```

## Handoff Rule

When the next worker picks this up, the expected order of truth is:

```txt
AuditEvent facts first
triage second
proof package third
0G upload fourth
0G Chain anchor fifth
```

If any slice cannot be completed, record the blocker rather than reassigning ownership to OpenClaw.
