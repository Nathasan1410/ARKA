# ARKA Database Structure Plan

This document is planning only. It does not define schema code yet.

## Boundary

The database comes after shared types and core logic.

Implementation note:

- Schema code lives in `packages/db` so Drizzle ownership stays separate from `apps/web` UI code and from `packages/shared` / `packages/core`, which remain the business-vocabulary and deterministic-logic sources of truth.

Order of work:

1. Define `packages/shared` types and enums.
2. Implement `packages/core` reconciliation and AuditEvent creation.
3. Add `packages/agent` triage boundaries and deterministic fallback.
4. Then translate the agreed data model into Drizzle schema.

The database should store operational evidence and proof metadata. It should not become the source of business rules.

OpenClaw research impact:

```txt
OpenClaw is a sidecar gateway/runtime/plugin/skills system.
The ARKA database should store ARKA-owned outputs from OpenClaw, not OpenClaw internal session state.
Do not mirror OpenClaw transcripts into the ARKA DB for P0.
The local OpenClaw fork, dev gateway connectivity, ARKA skill loading, and MiniMax model discovery are verified.
Model-backed ARKA triage, ARKA plugin writes, and packages/agent gateway calls are not verified yet.
If needed later, add optional references such as triage_source, openclaw_run_id, openclaw_session_id, openclaw_model_ref, openclaw_skill_name, or channel_message_ref.
```

Database boundary remains:

```txt
OpenClaw may append triage/action records.
OpenClaw must not overwrite AuditEvent reconciliation facts.
```

Current implementation note:

- `triageSource` is worth storing now because ARKA already distinguishes deterministic fallback vs future OpenClaw runtime output at the agent boundary, and the dashboard/docs need that truthfulness to survive persistence.
- `triageSource` is already represented in the schema.
- OpenClaw run/session/message/model/skill references remain deferred until a real sidecar/plugin write path exists.
- The Web2 MVP dashboard route currently uses a server-process in-memory demo repository behind a repository boundary. It creates Order-shaped, Movement-shaped, AuditEvent, and ProofRecord-shaped response data, but it does not yet write/read these rows through Postgres.
- Do not mark Postgres persistence as real until migrations are applied to a real database and the demo route writes and reads back the A/C/D path.

## P0 Models

### `Actor`

Represents a person or system role involved in the workflow.

Purpose:

- Identify owner, cashier, handler, and other relevant actors
- Support audit-safe references such as `actor_id` and role

Must not store:

- Unnecessary profile detail
- Policy logic
- UI state

### `Product`

Represents the sellable or tracked product in the scenario.

Purpose:

- Support order generation
- Tie orders to a named product like Protein Shake

Must not store:

- Reconciliation output
- Inventory movement history

### `InventoryItem`

Represents the inventory-tracked ingredient or stock item.

Purpose:

- Track the physical or logical stock unit used by usage rules

Must not store:

- Order logic
- OpenClaw decisions

### `UsageRule`

Represents the canonical expected-usage rule.

Purpose:

- Define expected consumption for a product
- Support deterministic reconciliation

Must not store:

- Live policy overrides
- Triage outcomes

### `Order`

Represents the order event that starts the P0 scenario.

Purpose:

- Capture the ordered product and quantity
- Feed expected-usage calculation

Must not store:

- Final reconciliation verdicts as the only source of truth
- Proof upload results

### `InventoryMovement`

Represents the actual movement of inventory in or out of the system.

Purpose:

- Record actual usage against the evidence window
- Feed reconciliation and variance calculation

Must not store:

- OpenClaw recommendations
- Contract anchoring details

### `AuditEvent`

Represents the backend-generated audit record.

Purpose:

- Store expected quantity, actual quantity, variance, status, severity, and evidence references
- Act as the primary object for OpenClaw and dashboard triage
- Allow appended triage metadata such as `triageOutcome` and `triageSource` without changing reconciliation facts

Must not store:

- Mutating policy decisions that overwrite history
- UI-specific presentation state

### `StaffClarificationRequest`

Represents the owner-approved request for a staff explanation.

Purpose:

- Track explanation-request lifecycle separately from immutable reconciliation facts
- Preserve request status such as `REQUESTED`, `REMINDED`, `RESPONDED`, `TIMEOUT`, and `ESCALATED`

Must not store:

- Rewritten audit facts
- Full chat transcript mirroring from OpenClaw internals

### `CaseNote`

Represents human- or agent-authored notes attached to the case.

Purpose:

- Preserve explanation context
- Support triage history

Must not store:

- Core reconciliation facts

### `ActionLog`

Represents a timeline entry for state changes or actions taken.

Purpose:

- Record triage actions
- Record owner-facing workflow steps

Must not store:

- Derived facts that already belong in `AuditEvent`

### `ProofRecord`

Represents local proof metadata for storage and chain status.

Purpose:

- Store proof package hash metadata
- Store 0G Storage and 0G Chain status fields
- Keep failure and retry visibility without deleting the `AuditEvent`

Must not store:

- Raw proof implementation logic
- Contract source

### `OwnerPolicy`

Represents the default owner-policy boundary used by the P0 workflow.

Purpose:

- Hold the default policy values that guide triage and notification behavior
- Provide a stable baseline before any policy UI exists

Must not store:

- Per-user UI preferences
- Dynamic business rules that belong in core logic

## Deferred or Minimal

### `UsageBatch`

Keep this minimal and deferred.

Use it only if the core reconciliation flow needs a batch concept to stay deterministic and honest.

Do not build UsageBatch UI for P0.

Do not promote it into a large planning surface before the A/C/D loop works.

## Relationship Notes

- `Actor` can be referenced by `Order`, `InventoryMovement`, `AuditEvent`, `CaseNote`, `ActionLog`, and `ProofRecord`.
- `Product` belongs to the order and scenario vocabulary.
- `InventoryItem` is the stock-side counterpart to the product/usage rule.
- `UsageRule` connects product intent to expected inventory usage.
- `Order` and `InventoryMovement` feed `AuditEvent`.
- `AuditEvent` is the parent object for triage visibility.
- `CaseNote`, `ActionLog`, and `ProofRecord` attach to the audit case lifecycle.
- `StaffClarificationRequest` attaches to `AuditEvent` as an append-only explanation workflow record.
- `OwnerPolicy` is the default policy baseline, not a business-rule engine.

## What This Layer Is Not

This database plan is not:

- A full ERP schema
- A warehouse management schema
- A POS schema
- A CCTV storage schema
- A human-resources punishment schema
- The first implementation layer

## When To Update This Doc

Update this doc when:

- The P0 model list changes
- A model becomes real instead of planned
- A model moves to P1 or is removed
- The boundary between core logic and database storage changes
- Proof metadata or status fields change
- `UsageBatch` stops being minimal or deferred
