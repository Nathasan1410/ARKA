# Changelog

All meaningful ARKA changes should be recorded here in human-readable language.

Command note: examples in this changelog use Codespaces/Linux defaults (`/workspaces/ARKA`, `pnpm`, `openclaw/openclaw.mjs`). Older entries may still contain Windows-specific spellings like `pnpm.cmd` and backslashes.

## 2026-05-01

### Fixed
- Made MVP demo operational evidence persistence idempotent for `proof_records`: repeated dashboard `updateRun` saves now merge into the latest proof record instead of appending unbounded duplicates. New proofs (different `proofType` or conflicting non-null proof hash/URI/chain tx) still append and link via `previous_proof_record_id`.
- Fixed root dashboard demo-service coverage bundling by stubbing `@arka/db` for that test, avoiding `pg` dynamic-require issues in the ESM data-URL bundling harness.

### Verification
- `pnpm.cmd --filter @arka/db run typecheck`
- `pnpm.cmd run typecheck`
- `pnpm.cmd exec vitest run test/dashboard-demo-service.verify.test.ts --pool=threads --poolOptions.threads.singleThread`
- Local Postgres: `docker compose --env-file .env.example up -d postgres` + `pnpm.cmd --filter @arka/db run migrate` + `pnpm.cmd run verify:postgres-demo`

## 2026-04-30 (Late)

### Changed
- Updated affected root and `docs/` planning/status documents after the OpenClaw inference smoke so future workers see the correct boundary: one local model-backed `infer model run` response and gateway discovery/load of `arka-audit` are verified, while a full agent session response, packages/agent gateway calls, Telegram, and 0G integrations remain unverified.
- Verified one model-backed ARKA OpenClaw-side inference turn through local `openclaw infer model run --local` using MiniMax M2.7 and an AuditEvent-first State C prompt.
- Updated OpenClaw truthfulness docs to distinguish the verified local inference + verified gateway plugin discovery/load from the still-unverified full OpenClaw agent session response, packages/agent gateway call path, Telegram, and 0G work.
- Added bounded local smoke controls in the OpenClaw fork for scoped runtime plugin loading, skipping provider runtime hooks, and disabling bundled tool startup during ARKA smoke debugging.
- Fixed `openclaw agent` (gateway mode) to use a start/wait/cache flow (`agent` ack -> `agent.wait` poll -> cached `agent` fetch) instead of relying on a single long-lived `expectFinal` RPC that could time out and trigger embedded fallback before the gateway produced a terminal result.

### Verification
- `node openclaw/openclaw.mjs --dev infer model run --local --model minimax/MiniMax-M2.7 --prompt <ARKA State C audit prompt> --json`
- Result returned `ok: true`, provider `minimax`, model `MiniMax-M2.7`, and `triageOutcome: REQUEST_EXPLANATION`.
- `cd openclaw && node scripts/run-vitest.mjs run --config test/vitest/vitest.commands.config.ts src/commands/agent-via-gateway.test.ts`

### Added
- Added an optional Postgres-backed dashboard demo-run store (`dashboard_demo_runs` JSONB) behind `ARKA_DEMO_REPOSITORY=postgres`, with explicit health-check gating so the dashboard falls back to in-memory history when migrations are missing or DB is unreachable.
- Added a `@arka/db` migration runner (`pnpm.cmd --filter @arka/db run migrate`) to apply generated Drizzle migrations to a real database using `DATABASE_URL`, without committing any secrets.
- Generated a new Drizzle migration for the `dashboard_demo_runs` table.
- Added best-effort operational evidence persistence for dashboard runs when Postgres mode is enabled (writes `orders`, `inventory_movements`, `audit_events`, and `proof_records` using demo-seeded actors/products/usage rules).

### Changed
- Added a working Admin Movement simulation slice to `/dashboard`: order quantity and Whey Protein OUT grams can be entered, posted to a local API route, reconciled through core AuditEvent logic, saved to demo history, and displayed with deterministic triage plus local proof hash.
- Added quick admin runs for clear, explanation, and critical review cases without adding disconnected pages or hollow controls.

### Verification
- `pnpm --filter @arka/web exec tsc -p tsconfig.json --noEmit --incremental false --ignoreDeprecations 6.0`
- `pnpm exec vitest run --config test/dashboard-demo.vitest.config.ts`
- `pnpm --filter @arka/web build`
- Local dev-server smoke: `POST /api/demo/admin-movement` with `orderQuantity: 4` and `actualMovementGrams: 132` returned `OVER_EXPECTED_USAGE`, `REQUEST_EXPLANATION`, and `LOCAL_ONLY`.

### Verification (DB / Workspace)
- `pnpm.cmd --filter @arka/db run typecheck`
- `pnpm.cmd --filter @arka/db run generate`
- `pnpm.cmd --filter @arka/web build`
- `pnpm.cmd run verify:arka-openclaw`

## 2026-04-30

### Changed
- Verified OpenClaw gateway discovery/load of the bundled read-only `arka-audit` plugin (gateway startup reports it loaded when enabled in an isolated profile).
- Fixed the repo-level `verify:arka-openclaw` gate in Codespaces/Linux by adding a root `vitest.config.ts` alias for workspace source imports and by updating `packages/db/tsconfig.json` to resolve `@arka/shared` during typecheck.
- Fixed an OpenClaw fork `build:strict-smoke` TypeScript break (`runtimePlan.runtime` log access) so strict-smoke builds can complete (note: this fork currently requires `OPENCLAW_A2UI_SKIP_MISSING=1` due to missing A2UI vendor inputs).
- Added missing OpenClaw workspace templates (`openclaw/docs/reference/templates/IDENTITY.md`, `USER.md`) required by gateway/agent workspace initialization in this fork copy.
- Tightened the `/dashboard` MVP usability pass after subagent review: scenario cards now preview outcome, triage action, and proof path before running; case history now surfaces scenario, severity, and proof state; the triage tab is labeled as simulation.
- Refactored the `/dashboard` MVP shell into a task-focused audit case console with a persistent scenario rail, case history, case summary, AuditEvent loop strip, and Evidence / OpenClaw-Triage / Proof drilldowns.
- Kept local proof status visible in the main case command area while preserving detailed local package hash, 0G Storage, and 0G Chain placeholders in the proof view.
- Added root-level dashboard demo-service coverage for State A local-only proof, State C simulated explanation flow, State D owner-review flow, and invalid/unavailable simulated actions.
- Added a dashboard-only simulated agent interaction path through `POST /api/demo/agent-action`.
- State C can now be tested through owner approval, simulated staff message send, simulated staff reply, and final owner decision without waiting for real OpenClaw or Telegram.
- State D can now record a simulated owner-reviewed final decision while remaining clearly labeled as dashboard simulation.
- Refactored the Web2 dashboard path so State A/C/D clicks call `POST /api/demo/run-scenario` instead of assembling AuditEvents and proof hashes in the browser.
- Added a server-side demo run service that creates order-shaped data, movement-shaped data, AuditEvent facts, deterministic fallback triage, and local proof-record-shaped metadata through the existing shared/core/agent boundaries.
- Added an explicit in-memory demo repository/persistence label for the dashboard while real Postgres write/read verification remains unclaimed.
- Improved the `/dashboard` Web2 MVP shell so State A/C/D cards show expected usage, actual movement, difference, and variance before selection.
- Updated the dashboard proof panel to display a deterministic local AuditEvent proof package hash returned by the backend route while keeping 0G Storage, 0G Chain, Telegram, and real OpenClaw runtime labels honest as not connected.
- Added clearer movement before/after quantities, usage formula display, retry/failure placeholders, and simulated owner/staff message wording.
- Updated implementation, code-map, and truthfulness docs for the dashboard-local proof hash display.

### Verification
- `git diff --check -- apps/web/app/dashboard/dashboard-shell.tsx apps/web/app/globals.css`
- `pnpm run verify:arka-openclaw`
- `pnpm --dir openclaw install`
- `OPENCLAW_A2UI_SKIP_MISSING=1 pnpm --dir openclaw run build:strict-smoke`
- `pnpm --dir openclaw run test:extension arka-audit`
- `pnpm --filter @arka/web exec tsc -p tsconfig.json --noEmit --incremental false --ignoreDeprecations 6.0`
- `pnpm exec vitest run --config test/dashboard-demo.vitest.config.ts` was retried after the usability patch but failed before collection with local `spawn EPERM`; previous successful run remains recorded below.
- `pnpm exec vitest run --config test/dashboard-demo.vitest.config.ts`
- `pnpm --filter @arka/shared test`
- `pnpm --filter @arka/core test`
- `pnpm --filter @arka/agent test`
- `pnpm --filter @arka/db run typecheck`
- `pnpm --filter @arka/db run generate`
- `pnpm --filter @arka/web exec tsc -p tsconfig.json --noEmit --incremental false --ignoreDeprecations 6.0`
- `pnpm --filter @arka/web build`
- `pnpm run verify:arka-openclaw`
- Local dev-server HTTP smoke: `http://127.0.0.1:3010/dashboard` returned 200 with dashboard/proof-panel content.
- Local API route smoke for State A, State C, and State D returned expected status, severity, deterministic triage source, `LOCAL_ONLY`, `NOT_STARTED`, `NOT_REGISTERED`, and local package hashes.
- Local simulated-agent HTTP smoke for State C completed owner approval, simulated staff send, simulated staff reply, and final decision. State D completed owner-reviewed final decision.

### Changed
- Updated the OpenClaw impact assessment into a current cross-layer plan for frontend, backend/API, database, `packages/agent`, proof, 0G Storage, 0G Chain, Telegram, security, and the local `openclaw/` fork.
- Updated implementation, stack, database, code-map, MVP interaction, local-fork, and truthfulness docs so they reflect the verified local OpenClaw fork/gateway/skill/MiniMax setup without claiming model-backed ARKA integration.
- Updated root-level briefs and tracker docs (`AGENTS.md`, `Arka - OpenClaw Agent.md`, `0G Storage Brief.md`, `ARKA 0G Chain Brief — Concept Draft.md`, `ARKA Demo Scenario Brief — Draft.md`, `Backend-Final.md`, `Database.md`, `checklist.md`, `docs/project-brief.md`, `docs/parallel-codex-session-prompts.md`, and the historical S2B handoff) so they no longer preserve stale OpenClaw or proof claims.
- Refined OpenClaw status wording across docs after a verification pass so the read-only `arka-audit` plugin skeleton is credited as static-smoke and extension-test verified, and gateway discovery/load is credited as verified (when enabled in an isolated profile), while a full OpenClaw ARKA agent session response, packages/agent gateway calls, and Telegram remain unverified.
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
- Hardened `test/arka-openclaw.verify.test.ts` so the secret-file guard no longer recursively scans the entire local OpenClaw fork on HDD. It now checks tracked `.env*` files in the repo plus a bounded set of OpenClaw workspace env locations (without storing or echoing secrets).
- Stabilized `pnpm run test:arka-openclaw` on Node 24 by forcing Vitest to run in a single-thread threads pool (avoids a fork-pool SSR `fetch` timeout before test collection).

### Why
- OpenClaw is central to ARKA's Layer-1 triage story, so every sector needs a clear boundary: OpenClaw reads AuditEvents and appends safe triage outputs, while backend/core own facts and the proof layer owns 0G execution.

### Verification
- Documentation alignment pass.
- `pnpm run verify:arka-openclaw` passed after the documentation alignment.
- `pnpm run test:arka-openclaw` passed after the secret-scan test fix.
- `pnpm run verify:arka-openclaw` passed after the test fix.
- `pnpm --dir openclaw run test:extension arka-audit` passed after adding extension-local tests.
- Static tsx smoke checks passed for importing the plugin entrypoint, registering `get_audit_event`, and executing the unavailable read-only response.
- `pnpm run test:arka-openclaw` passed after adding extension-local plugin coverage.
- `pnpm run verify:arka-openclaw` passed after adding extension-local plugin coverage.
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
- Manual local-only `pnpm --dir openclaw install --reporter append-only` completed with pnpm 10.33.0.
- `pnpm --dir openclaw run build:strict-smoke` completed and produced build stamps.
- Direct source CLI checks passed with `node openclaw/openclaw.mjs --help`, `node openclaw/openclaw.mjs --version`, and `node openclaw/openclaw.mjs gateway --help`.
- `pnpm --dir openclaw run ui:build` completed manually, and the local dev gateway became reachable on `127.0.0.1:19001`.
- `node openclaw/openclaw.mjs --dev gateway status` reported `Connectivity probe: ok`, `Capability: connected-no-operator-scope`, and `Listening: 127.0.0.1:19001`.
- `node openclaw/openclaw.mjs --dev skills list` reports `arka-audit` ready from `openclaw-workspace`.
- `node openclaw/openclaw.mjs --dev models list --provider minimax` reports `minimax/MiniMax-M2.7` with `auth=yes`.
- A small full-agent ARKA prompt timed out after 4 minutes and was stopped, so full OpenClaw ARKA agent-session triage remained unverified. Later 2026-04-30 (Late) work verified a bounded `infer model run` ARKA response outside the full agent path.
- `pnpm run verify:arka-openclaw` passed, including OpenClaw fork/workspace verification, shared tests, core/backend tests, agent tests, and root typecheck.
- Full `pnpm --dir openclaw run build`, full OpenClaw ARKA agent-session triage, and ARKA packages/agent gateway integration remain unverified.

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
  - `pnpm --filter @arka/shared test`
  - `pnpm --filter @arka/core test`
  - `pnpm --filter @arka/agent test`
  - `pnpm --filter @arka/db run typecheck`
  - `pnpm --filter @arka/db run generate`
  - `pnpm --filter @arka/web build`
  - `pnpm run typecheck`

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
- `pnpm --filter @arka/agent test`
- `pnpm --filter @arka/agent run typecheck`

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
- `pnpm install`
- `pnpm --filter @arka/core test`
- `pnpm run typecheck`

### Added
- Added Vitest-based unit test coverage for `packages/shared` demo fixtures and `packages/core` A/C/D reconciliation behavior.
- Added threshold-boundary assertions for 5%, 7%, 10%, and 20% severity classification.
- Added a regression test that keeps `ScenarioKey` distinct from `CaseType`.
- Added package-local `test` scripts and Vitest config for `packages/shared` and `packages/core`.

### Why
- Locks the canonical demo facts and reconciliation thresholds into executable tests before the dashboard, DB, and proof layers consume them.

### Verification
- `pnpm --filter @arka/shared test`
- `pnpm --filter @arka/core test`
- `pnpm --filter @arka/shared run typecheck`
- `pnpm --filter @arka/core run typecheck`

### Added
- Added `packages/db` as the dedicated Drizzle/Postgres schema package for ARKA P0 persistence.
- Implemented the first P0 database tables for `Actor`, `Product`, `InventoryItem`, `UsageRule`, `Order`, `InventoryMovement`, `AuditEvent`, `CaseNote`, `ActionLog`, `ProofRecord`, and `OwnerPolicy`.
- Added `packages/db/drizzle.config.ts` and a package `generate` script so the schema can generate SQL migrations without making the DB layer the source of business rules.
- Updated `docs/database-structure-plan.md`, `docs/reused-libraries.md`, and `technical-debt.md` for the new DB package and current verification boundary.

### Why
- Establishes the first local operational-evidence schema needed for AuditEvent persistence, OpenClaw triage history, and proof metadata, while preserving shared/core as the domain source of truth.

### Verification
- `pnpm install`
- `pnpm run typecheck`
- `pnpm --filter @arka/db run generate`

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
- `pnpm install` completed successfully after manual cleanup by the repo owner.
- `pnpm run typecheck` passed for `packages/shared`, `packages/core`, and `packages/agent`.

### Added - Initial Planning Docs
- Added initial ARKA planning documents for Backend, Database, OpenClaw, and 0G Storage.
- Added `AGENTS.md` with trigger-based documentation and compliance guardrails.
- Added starter docs: `docs/ai-attribution.md`, `docs/real-vs-simulated.md`, `docs/reused-libraries.md`.

### Why
- Establishes the project boundary, MVP logic, and proof model before implementation.

### Verification
- Documentation-only change.
- No code executed.
