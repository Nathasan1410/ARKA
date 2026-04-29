# Changelog

All meaningful ARKA changes should be recorded here in human-readable language.

## 2026-04-29

### Added
- Consolidated S1-S5 remediation reports into `docs/remediation-plan.md`.
- Recorded the post-remediation verdict: no full restart is needed; the main remaining risks are real OpenClaw runtime integration, manual dashboard verification, live Postgres verification, and PM-level global verification.

### Why
- Creates a single coordination record after the five worker remediation passes and clarifies what is safe to continue versus what remains unverified.

### Verification
- Based on S1-S5 worker reports supplied by the repo owner.
- PM global verification gate passed:
  - `pnpm.cmd --filter @arka/shared test`
  - `pnpm.cmd --filter @arka/core test`
  - `pnpm.cmd --filter @arka/agent test`
  - `pnpm.cmd --filter @arka/db run typecheck`
  - `pnpm.cmd --filter @arka/db run generate`
  - `pnpm.cmd --filter @arka/web build`
  - `pnpm.cmd run typecheck`

### Added
- Added `docs/remediation-plan.md` to coordinate S1-S5 remediation after the OpenClaw boundary correction.
- Defined worker-specific remediation scopes for shared/core, agent/OpenClaw boundary, dashboard truthfulness, database alignment, and proof independence.

### Why
- Keeps parallel remediation focused on preserving valid work, correcting misleading OpenClaw boundaries, and avoiding a full project restart.

### Verification
- Documentation-only planning update.

### Added
- Added `docs/openclaw-impact-assessment.md` to document the severity, cross-codebase impact, restart verdict, affected areas, and required remediation after the OpenClaw integration misunderstanding.
- Updated `technical-debt.md` with follow-up blockers for EPERM-blocked verification and OpenClaw/dashboard package-boundary remediation.

### Why
- The OpenClaw issue is high severity for integration truthfulness, but the audit found it does not invalidate the AuditEvent-first core, database direction, proof package work, or dashboard shell.
- The project needs targeted remediation and clean verification, not a full rebuild from zero.

### Verification
- Inspected OpenClaw research docs, implementation plan, code map, agent files, shared types, core reconciliation, core proof package code, DB schema, and dashboard code.
- Attempted shared/core/agent tests and root typecheck; all were blocked by EPERM open/spawn permission errors in this session, so the checks are not counted as passed here.

### Added
- Added `docs/openclaw-research-and-integration-plan.md` after cloning and inspecting the upstream OpenClaw repository in a research-only folder outside the ARKA repo.
- Documented OpenClaw as a gateway/runtime/plugin/skills system and recommended an ARKA OpenClaw sidecar gateway plus plugin/skill integration path.
- Updated `technical-debt.md` to reflect that OpenClaw has been researched but not installed, modified, or verified as ARKA runtime integration.
- Updated OpenClaw-impacted architecture docs across backend, database, dashboard, technical stack, implementation plan, code map, checklist, project brief, and parallel-session prompts.

### Why
- Corrects the prior misunderstanding that an ARKA-local deterministic adapter is enough to represent the OpenClaw agent.
- Makes the cross-layer consequences explicit: backend creates AuditEvents independently, DB stores ARKA-owned OpenClaw outputs, dashboard labels fallback vs OpenClaw-backed results honestly, and proof remains independent from OpenClaw runtime.

### Verification
- Cloned `https://github.com/openclaw/openclaw` into `D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw`.
- Inspected upstream README, package metadata, architecture docs, agent runtime docs, agent loop docs, plugin docs, skills docs, workspace docs, configuration docs, and Telegram docs.

### Changed
- Refactored `packages/agent` into a clearer OpenClaw-facing boundary: `openclaw-adapter.ts` resolves runtime-vs-fallback behavior, `policy.ts` holds deterministic fallback rules, and `triage.ts` remains the public ARKA entry point.
- Preserved deterministic State A / State C / State D behavior while proving fallback still works when no OpenClaw runtime is available.
- Replaced the version-pinned agent test command with a normal `tsx` package script.

### Why
- Makes it explicit in code that ARKA does not yet contain a real OpenClaw runtime, only an adapter boundary and deterministic fallback.

### Verification
- `pnpm.cmd --filter @arka/agent test`
- `pnpm.cmd --filter @arka/agent run typecheck`

### Changed
- Reframed `packages/agent` as an OpenClaw-facing adapter boundary with deterministic fallback, not the final OpenClaw runtime.
- Updated the parallel session prompts with a dedicated OpenClaw source integration slice and stronger agent-worker reading requirements.
- Updated `technical-debt.md` and `docs/real-vs-simulated.md` to record that no OpenClaw source/runtime has been imported, modified, or verified yet.

### Why
- Prevents the deterministic A/C/D fallback from being mistaken for the real OpenClaw-backed ARKA agent.

### Verification
- Documentation-only correction.
- Inspected the repo for local OpenClaw source; only the ARKA OpenClaw brief is currently present.

### Added
- Added deterministic AuditEvent proof package building, canonical JSON serialization, and local SHA-256 package hashing in `packages/core`.
- Added proof tests covering stable hashes for semantically identical packages and proof package creation for State C / State D.

### Why
- Moves the proof layer from planning-only toward a verified local core, without claiming real 0G Storage or chain integration.

### Verification
- `pnpm.cmd install`
- `pnpm.cmd --filter @arka/core test`
- `pnpm.cmd run typecheck`

### Added
- Added Vitest-based unit test coverage for `packages/shared` demo fixtures and `packages/core` A/C/D reconciliation behavior.
- Added threshold-boundary assertions for 5%, 7%, 10%, and 20% severity classification.
- Added a regression test that keeps `ScenarioKey` distinct from `CaseType`.
- Added package-local `test` scripts and Vitest config for `packages/shared` and `packages/core`.

### Why
- Locks the canonical demo facts and reconciliation thresholds into executable tests before the dashboard, DB, and proof layers consume them.

### Verification
- `pnpm.cmd --filter @arka/shared test`
- `pnpm.cmd --filter @arka/core test`
- `pnpm.cmd --filter @arka/shared run typecheck`
- `pnpm.cmd --filter @arka/core run typecheck`

### Added
- Added `packages/db` as the dedicated Drizzle/Postgres schema package for ARKA P0 persistence.
- Implemented the first P0 database tables for `Actor`, `Product`, `InventoryItem`, `UsageRule`, `Order`, `InventoryMovement`, `AuditEvent`, `CaseNote`, `ActionLog`, `ProofRecord`, and `OwnerPolicy`.
- Added `packages/db/drizzle.config.ts` and a package `generate` script so the schema can generate SQL migrations without making the DB layer the source of business rules.
- Updated `docs/database-structure-plan.md`, `docs/reused-libraries.md`, and `technical-debt.md` for the new DB package and current verification boundary.

### Why
- Establishes the first local operational-evidence schema needed for AuditEvent persistence, OpenClaw triage history, and proof metadata, while preserving shared/core as the domain source of truth.

### Verification
- `pnpm.cmd install`
- `pnpm.cmd run typecheck`
- `pnpm.cmd --filter @arka/db run generate`

### Added
- Added `docs/technical-stack-brief.md` with the recommended MVP stack for ARKA.
- Documented the intended monorepo shape, frontend/backend/database choices, proof-layer tooling, Telegram flow, testing plan, deployment approach, and open verification questions.
- Added `docs/mvp-demo-interaction-brief.md` as the canonical MVP demo interaction spec (scenario-card driven dashboard flow).
- Clarified proof status separation (audit proof lifecycle vs storage ops vs chain ops), proof sequencing (proof package creation must not depend on OpenClaw), and canonical enum names for MVP planning.
- Added `checklist.md` as a feature-scope tracker across P0/P1/P2 (docs-only, implementation not started).
- Updated `AGENTS.md` with planning-to-implementation workflow rules and required `technical-debt.md` tracking for skipped work, blockers, and human-needed actions.
- Added `technical-debt.md` with current open implementation blockers for 0G Storage, 0G Chain, Telegram, and OpenClaw runtime verification.
- Added `docs/project-brief.md` as the canonical full-vision and roadmap brief for ARKA.
- Added `docs/implementation-plan.md` with the detailed P0 execution order, module targets, verification gates, and integration fallback rules.
- Added the first workspace scaffold (`apps/web`, `packages/shared`, `packages/core`, `packages/agent`, `contracts`) and pure TypeScript A/C/D domain logic.
- Added `docs/code-map.md` and `docs/database-structure-plan.md` to document implementation ownership and the planned P0 database boundary.
- Updated `docs/real-vs-simulated.md`, `docs/reused-libraries.md`, and `technical-debt.md` to reflect partial core implementation and resolved dependency installation.
- Added `pnpm-lock.yaml` after successful workspace dependency install.
- Added `docs/parallel-codex-session-prompts.md` with shared primer and six scoped prompts for parallel Codex sessions.

### Why
- Establishes a practical 1-week hackathon implementation direction before coding begins.
- Keeps the stack aligned with the AuditEvent-first architecture and the 0G Storage / 0G Chain split.

### Verification
- Documentation and scaffold changes.
- Retried Context7 MCP for Next.js, Drizzle ORM, and Hardhat documentation earlier in planning.
- Ran direct TypeScript checks with global `tsc.cmd` for `packages/shared`, `packages/core`, and `packages/agent`.
- `pnpm.cmd install` completed successfully after manual cleanup by the repo owner.
- `pnpm.cmd run typecheck` passed for `packages/shared`, `packages/core`, and `packages/agent`.

### Added - Initial Planning Docs
- Added initial ARKA planning documents for Backend, Database, OpenClaw, and 0G Storage.
- Added `AGENTS.md` with trigger-based documentation and compliance guardrails.
- Added starter docs: `docs/ai-attribution.md`, `docs/real-vs-simulated.md`, `docs/reused-libraries.md`.

### Why
- Establishes the project boundary, MVP logic, and proof model before implementation.

### Verification
- Documentation-only change.
- No code executed.
