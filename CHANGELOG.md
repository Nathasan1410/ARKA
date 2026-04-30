# Changelog

All meaningful ARKA changes should be recorded here in human-readable language.

## 2026-04-30

### Changed
- Updated the OpenClaw impact assessment into a current cross-layer plan for frontend, backend/API, database, `packages/agent`, proof, 0G Storage, 0G Chain, Telegram, security, and the local `openclaw/` fork.
- Updated implementation, stack, database, code-map, MVP interaction, local-fork, and truthfulness docs so they reflect the verified local OpenClaw fork/gateway/skill/MiniMax setup without claiming model-backed ARKA integration.
- Updated root-level briefs and tracker docs (`AGENTS.md`, `Arka - OpenClaw Agent.md`, `0G Storage Brief.md`, `ARKA 0G Chain Brief — Concept Draft.md`, `ARKA Demo Scenario Brief — Draft.md`, `Backend-Final.md`, `Database.md`, `checklist.md`, `docs/project-brief.md`, `docs/parallel-codex-session-prompts.md`, and the historical S2B handoff) so they no longer preserve stale OpenClaw or proof claims.
- Refined OpenClaw status wording across docs after a verification pass so the read-only `arka-audit` plugin skeleton is credited as static-smoke and extension-test verified while gateway plugin load, model-backed ARKA response, packages/agent gateway calls, and Telegram remain unverified.
- Recorded Telegram token handling as human-needed security debt without storing the token.

### Added
- Added `docs/parallel-worker-handoff-0g-openclaw.md` with S2-S6 worker prompts for 0G Storage, 0G Chain, proof pipeline, dashboard proof UX, and OpenClaw gateway-load work.
- Added `docs/openclaw-plugin-skeleton-plan.md` with an implementation-ready docs-only plan for the first ARKA OpenClaw plugin skeleton under `openclaw/extensions/arka-audit/`.
- Updated `docs/openclaw-local-fork-plan.md` to point at the new skeleton plan and keep the first pass focused on a single read-only `get_audit_event` tool.
- Added `docs/openclaw-cross-layer-next-slices.md` to define the ordered frontend, backend, DB, proof, storage, and chain slices after OpenClaw became the central triage track.
- Added the read-only ARKA OpenClaw plugin skeleton under `openclaw/extensions/arka-audit/` with a single `get_audit_event` tool that returns `status: unavailable` until a real ARKA backend/API read path exists.
- Added extension-local tests for `openclaw/extensions/arka-audit/` covering manifest shape, tool registration, read-only unavailable output, immutable fact policy, explicit non-goals, and missing AuditEvent id rejection.
- Extended `test/arka-openclaw.verify.test.ts` to cover the plugin manifest, bundled extension metadata, read-only status, and explicit non-goals.

### Fixed
- Hardened `test/arka-openclaw.verify.test.ts` so the secret-file guard no longer recursively scans the entire local OpenClaw fork on HDD. It now skips large vendor/build directories and checks only bounded ARKA/OpenClaw env-file locations.

### Why
- OpenClaw is central to ARKA's Layer-1 triage story, so every sector needs a clear boundary: OpenClaw reads AuditEvents and appends safe triage outputs, while backend/core own facts and the proof layer owns 0G execution.

### Verification
- Documentation alignment pass.
- `pnpm.cmd run verify:arka-openclaw` passed after the documentation alignment.
- `pnpm.cmd run test:arka-openclaw` passed after the secret-scan test fix.
- `pnpm.cmd run verify:arka-openclaw` passed after the test fix.
- `pnpm.cmd --dir openclaw run test:extension arka-audit` passed after adding extension-local tests.
- Static tsx smoke checks passed for importing the plugin entrypoint, registering `get_audit_event`, and executing the unavailable read-only response.
- `pnpm.cmd run test:arka-openclaw` passed after adding extension-local plugin coverage.
- `pnpm.cmd run verify:arka-openclaw` passed after adding extension-local plugin coverage.
- Broader OpenClaw checks timed out in this HDD environment: `build:strict-smoke`, `test:contracts:plugins`, and lockfile-only install refresh.

## 2026-04-29

### Added
- Copied upstream OpenClaw source into `openclaw/` as a repo-local source fork for ARKA-specific OpenClaw-side work.
- Added an ARKA OpenClaw workspace draft under `openclaw/workspaces/arka/` with `AGENTS.md`, `SOUL.md`, `TOOLS.md`, and the `arka-audit` skill.
- Added `docs/openclaw-local-fork-plan.md` with local fork attribution, excluded artifacts, manual install/build/smoke commands, verified vs unverified status, and next steps.
- Added `test/arka-openclaw.verify.test.ts` and root scripts `test:arka-openclaw` / `verify:arka-openclaw` to cover the OpenClaw fork, ARKA workspace skill, backend/core AuditEvent creation, agent fallback, and cross-package verification.
- Updated reused-library, truthfulness, attribution, and technical-debt docs for the local OpenClaw fork.

### Why
- Moves OpenClaw from external research-only toward a repo-local source fork that can be built and modified for ARKA later, without pretending that runtime integration already exists.

### Verification
- Verified the copied fork excludes `.git`, `node_modules`, `dist`, build output, logs, cache/artifact folders, and `.env*` files.
- Verified `openclaw/LICENSE`, `openclaw/package.json`, and `openclaw/pnpm-lock.yaml` are present.
- Manual local-only `pnpm.cmd --dir openclaw install --reporter append-only` completed with pnpm 10.33.0.
- `pnpm.cmd --dir openclaw run build:strict-smoke` completed and produced build stamps.
- Direct source CLI checks passed with `node openclaw\openclaw.mjs --help`, `node openclaw\openclaw.mjs --version`, and `node openclaw\openclaw.mjs gateway --help`.
- `pnpm.cmd --dir openclaw run ui:build` completed manually, and the local dev gateway became reachable on `127.0.0.1:19001`.
- `node openclaw\openclaw.mjs --dev gateway status` reported `Connectivity probe: ok`, `Capability: connected-no-operator-scope`, and `Listening: 127.0.0.1:19001`.
- `node openclaw\openclaw.mjs --dev skills list` reports `arka-audit` ready from `openclaw-workspace`.
- `node openclaw\openclaw.mjs --dev models list --provider minimax` reports `minimax/MiniMax-M2.7` with `auth=yes`.
- A small model-backed ARKA prompt timed out after 4 minutes and was stopped, so model-backed OpenClaw triage remains unverified.
- `pnpm.cmd run verify:arka-openclaw` passed, including OpenClaw fork/workspace verification, shared tests, core/backend tests, agent tests, and root typecheck.
- Full `pnpm.cmd --dir openclaw run build`, model-backed OpenClaw triage, and ARKA packages/agent gateway integration remain unverified.

### Added
- Added `docs/openclaw-s2b-handoff.md` with an implementation-ready OpenClaw integration handoff covering gateway/runtime concepts, ARKA sidecar recommendation, smoke setup commands, workspace skill plan, plugin tool contracts, Telegram decision, and next worker slices.
- Updated `technical-debt.md` to record that OpenClaw smoke setup was researched but not installed or verified because no global install approval, model credentials, or Telegram token were provided.

### Why
- Keeps ARKA honest that `packages/agent` is still only an OpenClaw-facing deterministic fallback while giving the next worker a concrete path to real gateway/plugin/skill integration.

### Verification
- Documentation-only update.
- Inspected the local OpenClaw research clone at `D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw`.
- Confirmed local Node and pnpm versions; `openclaw` was not on PATH.

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
