# ARKA Code Map

This is the intended repo map after the first scaffold pass. It is a planning doc only.

## Scaffold Tree

```txt
apps/web
packages/shared
packages/core
packages/agent
contracts
docs
```

## Ownership Boundaries

### `apps/web`

Owns the user-facing Next.js app, dashboard screens, simulator UI, and route handlers.

Must include:

- Dashboard / Audit Arena UI
- Scenario runner UI
- Order and movement simulator panels
- AuditEvent list and detail views
- Proof status views
- Lightweight route handlers for local app needs

Must not include:

- Core reconciliation rules
- Shared enums/types duplicated from other packages
- Contract code
- OpenClaw policy logic
- Drizzle schema definitions as the first source of truth

### `packages/shared`

Owns the shared vocabulary used across the repo.

Must include:

- Enums
- Types
- Validation schemas
- Canonical scenario payload shapes
- Shared constants that must match across web, core, agent, and contracts

Must not include:

- UI components
- Database access code
- Contract deployment code
- Environment-specific logic
- Business rules that require runtime state

### `packages/core`

Owns deterministic domain logic.

Must include:

- Order and usage calculations
- Reconciliation logic
- AuditEvent creation
- Proof-package building helpers if they are pure and deterministic
- Core test fixtures that exercise the P0 scenarios

Must not include:

- React components
- Database client code
- Telegram or OpenClaw transport code
- Chain or storage SDK calls
- Mutable application state outside explicit function inputs

### `packages/agent`

Owns the OpenClaw-facing adapter layer.

Must include:

- Deterministic triage logic
- Owner recommendation formatting
- Case note and action log generation helpers
- Thin boundary code for future LLM or agent runtime integration

Must not include:

- Core reconciliation rules
- UI rendering
- Contract code
- Database schema ownership
- Proof upload or chain anchoring logic

### `contracts`

Owns smart contracts and deployment artifacts for proof anchoring.

Must include:

- `AuditProofRegistry`
- Solidity tests
- Deployment scripts
- Chain-specific config needed for contract work

Must not include:

- Frontend code
- Shared app types copied by hand instead of imported
- Database schema
- Proof package assembly logic
- Telegram, OpenClaw, or dashboard logic

### `docs`

Owns planning, attribution, status, and implementation notes.

Must include:

- Architecture briefs
- Implementation plans
- Code maps
- Database-structure planning
- Truthfulness/status docs

Must not include:

- Source code
- Schema migrations
- Build artifacts
- Contract binaries
- Generated runtime output

## First-Implementation Boundary

The first implementation pass should make `packages/shared` and `packages/core` the earliest sources of truth for business behavior.

Sequence:

1. Define shared types and enums.
2. Implement core deterministic reconciliation.
3. Add agent triage boundaries on top of AuditEvent output.
4. Add `apps/web` screens and handlers that consume the shared/core layer.
5. Add database schema work after the above contracts are stable.
6. Add `contracts` and proof anchoring once the P0 loop is stable.

The database is not the first implementation layer. Drizzle schema should follow shared types and core logic, not define them.

