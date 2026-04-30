# ARKA Code Map

This is the current repo map for the ARKA MVP implementation boundary.

## Scaffold Tree

```txt
apps/web
packages/shared
packages/core
packages/agent
packages/db
contracts
openclaw
test
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
- Local proof package/hash display sourced from deterministic core helpers, while external 0G execution remains outside the web UI
- Lightweight route handlers for local app needs, including the local `POST /api/demo/run-scenario` MVP scenario path and `POST /api/demo/admin-movement` admin movement simulation path

Must not include:

- Core reconciliation rules
- Shared enums/types duplicated from other packages
- Contract code
- OpenClaw policy logic
- Drizzle schema definitions as the first source of truth
- 0G Storage upload or 0G Chain registration claims unless the real backend/proof path is implemented and verified
- Real database persistence claims unless Postgres migrations and demo route write/read behavior are verified

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

The deterministic triage code in this package is fallback behavior only. It should not be presented as the full OpenClaw runtime. OpenClaw is a sidecar gateway/runtime/plugin/skills system; the preferred ARKA path is an OpenClaw gateway plus ARKA skill/plugin, with `packages/agent` acting as the app-facing client/fallback boundary.

Must include:

- OpenClaw client/adapter interface
- Deterministic triage fallback
- Owner recommendation formatting
- Case note and action log generation helpers
- Thin boundary code for OpenClaw sidecar/plugin integration

Must not include:

- Core reconciliation rules
- UI rendering
- Contract code
- Database schema ownership
- Proof upload or chain anchoring logic

### `packages/db`

Owns the Drizzle/Postgres schema for ARKA operational evidence, triage outputs, and proof metadata.

Must include:

- Actor, product, inventory item, usage rule, order, movement, and AuditEvent tables
- Append-only CaseNote and ActionLog records
- StaffClarificationRequest records
- ProofRecord status and metadata
- `triageSource` so deterministic fallback and OpenClaw-backed output stay distinguishable after persistence

Must not include:

- Core reconciliation rules
- OpenClaw internal session/transcript mirroring for P0
- UI presentation state
- Contract source or proof package assembly logic

### `openclaw`

Owns the repo-local public OpenClaw source fork and ARKA OpenClaw-side workspace/skill/plugin work.

Current verified status:

- OpenClaw source fork exists under `openclaw/`
- Local install is verified
- Strict-smoke build is verified
- Direct source CLI help/version/gateway-help are verified
- Local dev gateway connectivity is verified
- ARKA `arka-audit` workspace skill loading is verified
- MiniMax model discovery/auth is verified

Still unverified / not implemented:

- Full production build
- Model-backed ARKA agent response
- ARKA OpenClaw plugin/tool integration
- `packages/agent` calling the OpenClaw gateway/plugin
- OpenClaw Telegram flow for ARKA

Must include:

- Upstream OpenClaw source and license attribution
- ARKA workspace/skill files under `openclaw/workspaces/arka`
- Future OpenClaw-side ARKA plugin/tool code after the SDK path is confirmed

Must not include:

- `.git`, `node_modules`, `dist`, generated build output, logs, caches, or secrets as committed project source
- MiniMax/API keys or Telegram tokens
- ARKA database schema ownership
- 0G Storage upload or 0G Chain registrar ownership

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
3. Add an OpenClaw-facing client boundary with deterministic fallback on top of AuditEvent output.
4. Add `apps/web` screens and handlers that consume the shared/core/agent layer.
5. Add database schema work after the above contracts are stable.
6. Use `openclaw/` for OpenClaw-side workspace/skill/plugin work, while `packages/agent` remains the ARKA app-facing client/fallback boundary.
7. Add `contracts` and proof anchoring once the P0 loop is stable.

The database is not the first implementation layer. Drizzle schema should follow shared types and core logic, not define them.
