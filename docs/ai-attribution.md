# AI Attribution

This document tracks material AI-assisted work in ARKA.

## 2026-04-30 - Web2 Dashboard Proof Panel

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)
- GPT-5.x explorer/worker subagents for bounded dashboard UX review and demo-service test coverage

### What AI Helped With
- Reviewed the Web2 MVP dashboard, shared/core proof path, and DB boundary for State A/C/D demo clarity.
- Refactored the dashboard to consume `POST /api/demo/run-scenario` results instead of creating AuditEvents and proof hashes in the browser.
- Added a server-side demo run service for order-shaped data, movement-shaped data, AuditEvent creation, deterministic fallback triage, local proof package hashing, and in-memory demo repository state.
- Added a dashboard-only simulated agent action route for owner approval, simulated staff message send, simulated staff reply, and final owner decision.
- Wired the dashboard to display deterministic local AuditEvent proof package hashes returned by the backend route while preserving honest 0G/OpenClaw/Telegram status labels.
- Improved dashboard copy and data display for expected vs actual usage, movement before/after quantities, proof failure/retry placeholders, and owner/staff simulated-message boundaries.
- Refactored the `/dashboard` layout into a clearer audit case console with a persistent scenario rail, case history, case summary, AuditEvent loop strip, Evidence / OpenClaw-Triage / Proof drilldowns, and always-visible local proof status.
- Added focused demo-service tests for State A, State C, State D, and invalid simulated-agent actions.

### Files / Areas Affected
- `apps/web/app/dashboard/dashboard-data.ts`
- `apps/web/app/dashboard/dashboard-shell.tsx`
- `apps/web/app/dashboard/demo-run-service.ts`
- `apps/web/app/api/demo/agent-action/route.ts`
- `apps/web/app/api/demo/run-scenario/route.ts`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/globals.css`
- `docs/real-vs-simulated.md`
- `docs/code-map.md`
- `docs/implementation-plan.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`
- `test/dashboard-demo-service.verify.test.ts`
- `test/dashboard-demo.vitest.config.ts`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- `pnpm.cmd exec vitest run --config test/dashboard-demo.vitest.config.ts`
- `pnpm.cmd --filter @arka/shared test`
- `pnpm.cmd --filter @arka/core test`
- `pnpm.cmd --filter @arka/agent test`
- `pnpm.cmd --filter @arka/db run typecheck`
- `pnpm.cmd --filter @arka/db run generate`
- `pnpm.cmd --filter @arka/web exec tsc -p tsconfig.json --noEmit --incremental false --ignoreDeprecations 6.0`
- `pnpm.cmd --filter @arka/web build`
- `pnpm.cmd run verify:arka-openclaw`
- Local dev-server HTTP smoke: `http://127.0.0.1:3010/dashboard` returned 200 with dashboard/proof-panel content.
- Local API route smoke for State A, State C, and State D returned expected status, severity, deterministic triage source, `LOCAL_ONLY`, `NOT_STARTED`, `NOT_REGISTERED`, and local package hashes.
- Local simulated-agent HTTP smoke for State C completed owner approval, simulated staff send, simulated staff reply, and final decision. State D completed owner-reviewed final decision.

## 2026-04-30 - Parallel Worker Handoff

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Consolidated the next S2-S6 parallel worker prompts into one repo-local handoff document.
- Preserved ARKA's AuditEvent-first, proof-layer, and OpenClaw boundary constraints for the next implementation phase.

### Files / Areas Affected
- `docs/parallel-worker-handoff-0g-openclaw.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only update.

## 2026-04-30 - OpenClaw Docs Truthfulness Patch

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)
- GPT-5.4-mini worker sessions for read-only repo/docs verification

### What AI Helped With
- Rechecked ARKA Markdown docs after the local OpenClaw fork and `arka-audit` plugin skeleton work.
- Patched stale wording that still implied no plugin skeleton existed or pointed workers at an older external plugin package path.
- Preserved the important boundary that the plugin skeleton static smoke and extension-local tests are verified, but gateway discovery/load, model-backed ARKA response, packages/agent gateway calls, and OpenClaw Telegram are still unverified.

### Files / Areas Affected
- `AGENTS.md`
- `Arka - OpenClaw Agent.md`
- `docs/openclaw-cross-layer-next-slices.md`
- `docs/openclaw-local-fork-plan.md`
- `docs/openclaw-s2b-handoff.md`
- `docs/parallel-codex-session-prompts.md`
- `docs/reused-libraries.md`
- `docs/technical-stack-brief.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Read-only worker verification plus local `rg` stale-claim search.
- `git diff --check`
- `pnpm.cmd run verify:arka-openclaw`

## 2026-04-30 - OpenClaw Plugin Skeleton Planning

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Inspected the local OpenClaw fork for plugin SDK structure, manifest shape, and bundled extension patterns.
- Drafted an implementation-ready docs-only skeleton plan for the first ARKA OpenClaw plugin pass.
- Implemented the first read-only `arka-audit` OpenClaw plugin skeleton with an unavailable `get_audit_event` tool.
- Added extension-local tests for the `arka-audit` OpenClaw plugin skeleton.
- Updated the local-fork plan to point at the new plugin skeleton plan and keep the first pass focused on a read-only `get_audit_event` tool.
- Recorded the documentation milestone in the changelog.

### Files / Areas Affected
- `docs/openclaw-plugin-skeleton-plan.md`
- `docs/openclaw-local-fork-plan.md`
- `openclaw/extensions/arka-audit/package.json`
- `openclaw/extensions/arka-audit/openclaw.plugin.json`
- `openclaw/extensions/arka-audit/index.ts`
- `openclaw/extensions/arka-audit/index.test.ts`
- `openclaw/extensions/arka-audit/src/get-audit-event.ts`
- `test/arka-openclaw.verify.test.ts`
- `technical-debt.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only update.
- Inspected the OpenClaw local fork docs and examples for plugin SDK structure and extension layout.
- `pnpm.cmd --dir openclaw run test:extension arka-audit`
- Static tsx smoke checks passed for plugin entrypoint import, tool registration, and unavailable read-only response.
- `pnpm.cmd run test:arka-openclaw`
- `pnpm.cmd run verify:arka-openclaw`
- Broader OpenClaw checks timed out and are recorded in `technical-debt.md`.

## 2026-04-30 - OpenClaw Test Stability And Next-Slice Planning

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)
- GPT-5.4-mini worker sessions for bounded docs/research tasks

### What AI Helped With
- Fixed the ARKA/OpenClaw secret-scan regression test so it no longer walks the entire local OpenClaw source fork on HDD.
- Kept the secret guard meaningful by scanning ARKA repo env files and bounded OpenClaw env locations without storing or echoing secrets.
- Stabilized `test:arka-openclaw` on Node 24 by forcing Vitest to run in a single-thread threads pool (avoids a fork-pool SSR fetch timeout before test collection).
- Added cross-layer next-slice planning for frontend, backend, database, proof, 0G Storage, and 0G Chain sequencing.

### Files / Areas Affected
- `test/arka-openclaw.verify.test.ts`
- `package.json`
- `docs/openclaw-cross-layer-next-slices.md`
- `docs/mvp-demo-interaction-brief.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- `pnpm.cmd run test:arka-openclaw`
- `pnpm.cmd run verify:arka-openclaw`

## 2026-04-30 - OpenClaw Cross-Layer Alignment

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Re-assessed how the verified local OpenClaw fork, gateway smoke, ARKA skill loading, and MiniMax model discovery affect ARKA's frontend, backend/API, database, proof, 0G Storage, 0G Chain, Telegram, and security boundaries.
- Rewrote the OpenClaw impact assessment as a current cross-layer integration plan.
- Updated implementation, stack, database, code-map, MVP interaction, local-fork, and truthfulness docs so they stay honest about what is verified versus still unimplemented.
- Audited root-level ARKA briefs and tracker docs for stale OpenClaw, Telegram, 0G Storage, and 0G Chain wording.
- Recorded Telegram token handling as a security follow-up without storing or repeating the token.

### Files / Areas Affected
- `docs/openclaw-impact-assessment.md`
- `docs/code-map.md`
- `docs/implementation-plan.md`
- `docs/technical-stack-brief.md`
- `docs/database-structure-plan.md`
- `docs/mvp-demo-interaction-brief.md`
- `docs/openclaw-local-fork-plan.md`
- `docs/real-vs-simulated.md`
- `AGENTS.md`
- `Arka - OpenClaw Agent.md`
- `0G Storage Brief.md`
- `ARKA 0G Chain Brief — Concept Draft.md`
- `ARKA Demo Scenario Brief — Draft.md`
- `Backend-Final.md`
- `Database.md`
- `checklist.md`
- `docs/project-brief.md`
- `docs/parallel-codex-session-prompts.md`
- `docs/openclaw-s2b-handoff.md`
- `docs/0g-chain-brief.md`
- `technical-debt.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation alignment pass.
- `pnpm.cmd run verify:arka-openclaw` passed after the documentation alignment.

## 2026-04-29 - OpenClaw Local Fork And ARKA Workspace Draft

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Inspected the OpenClaw research clone, package metadata, license, source size, and workspace/plugin/skills documentation.
- Copied OpenClaw public source into `openclaw/` as a repo-local fork while excluding generated artifacts, dependencies, local config, and secrets.
- Added ARKA-specific OpenClaw workspace guidance and the `arka-audit` skill draft.
- Added executable cross-layer ARKA/OpenClaw verification coverage for the local fork, workspace skill, backend/core AuditEvent facts, agent fallback behavior, and secret-file guardrails.
- Attempted a local-only OpenClaw dependency install, monitored progress, stopped the long-running install by operator direction, and removed partial `node_modules`.
- Documented manual local install/build/gateway smoke commands and precise truthfulness status.

### Files / Areas Affected
- `openclaw/`
- `openclaw/workspaces/arka/AGENTS.md`
- `openclaw/workspaces/arka/SOUL.md`
- `openclaw/workspaces/arka/TOOLS.md`
- `openclaw/workspaces/arka/skills/arka-audit/SKILL.md`
- `test/arka-openclaw.verify.test.ts`
- `package.json`
- `.gitignore`
- `docs/openclaw-local-fork-plan.md`
- `docs/reused-libraries.md`
- `docs/real-vs-simulated.md`
- `technical-debt.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Confirmed OpenClaw upstream clone commit `e27fe55a` and MIT license.
- Confirmed copied `openclaw/` excludes `.git`, `node_modules`, `dist`, build output, logs, cache/artifact folders, and `.env*`.
- Manual local-only OpenClaw install completed with pnpm 10.33.0.
- `pnpm.cmd --dir openclaw run build:strict-smoke` completed successfully and generated build stamps.
- Direct source CLI checks passed with `node openclaw\openclaw.mjs --help`, `node openclaw\openclaw.mjs --version`, and `node openclaw\openclaw.mjs gateway --help`.
- `pnpm.cmd --dir openclaw run ui:build` completed manually, and local dev gateway connectivity was verified on `127.0.0.1:19001`.
- `node openclaw\openclaw.mjs --dev skills list` reports `arka-audit` ready from `openclaw-workspace`.
- `node openclaw\openclaw.mjs --dev models list --provider minimax` reports `minimax/MiniMax-M2.7` with `auth=yes`.
- A small model-backed ARKA prompt timed out after 4 minutes and was stopped, so model-backed OpenClaw triage remains unverified.
- `pnpm.cmd run verify:arka-openclaw` passed, including OpenClaw fork/workspace verification, shared tests, core/backend tests, agent tests, and root typecheck.
- Full OpenClaw production build, model-backed ARKA triage, and packages/agent gateway integration remain unverified.

## 2026-04-29 - OpenClaw S2B Integration Handoff

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Inspected the local OpenClaw research clone outside `ARKA-github`.
- Summarized OpenClaw as a gateway, embedded agent runtime, workspace, skills, plugins, tools, and channel system.
- Produced an implementation-ready handoff for ARKA's OpenClaw sidecar gateway plus ARKA skill/plugin integration path.
- Documented smoke setup prerequisites, commands, skill workspace shape, plugin tool contracts, Telegram tradeoffs, and next worker tasks.
- Recorded that no OpenClaw install, gateway run, plugin load, or Telegram integration was verified.

### Files / Areas Affected
- `docs/openclaw-s2b-handoff.md`
- `technical-debt.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only update.
- Inspected the OpenClaw research clone at `D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw`.
- Checked `node --version`, `pnpm.cmd --version`, and `Get-Command openclaw`; `openclaw` was not available on PATH.

## 2026-04-29 - S1-S5 Remediation Report Consolidation

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Consolidated worker reports from S1-S5 into the remediation plan.
- Summarized the remediation verdict, verification reported by each worker, remaining risks, and next-step recommendation.
- Kept the consolidation documentation-only and did not modify worker source code.

### Files / Areas Affected
- `docs/remediation-plan.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Based on S1-S5 worker reports supplied by the repo owner.
- PM global verification gate later passed for shared/core/agent tests, DB typecheck/generate, web build, and root typecheck.

## 2026-04-29 - Remediation Plan

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Created a focused remediation plan for the five completed worker streams after the OpenClaw boundary correction.
- Split remediation responsibilities across shared/core, agent/OpenClaw boundary, dashboard truthfulness, database alignment, and proof independence.
- Defined a global verification gate and completion report format for worker handoff.

### Files / Areas Affected
- `docs/remediation-plan.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only planning update.

## 2026-04-29 - OpenClaw Impact Assessment

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Performed a targeted impact audit after the OpenClaw integration misunderstanding was identified as high severity.
- Checked whether the finding invalidates the existing shared/core/db/proof/dashboard work.
- Mapped affected code boundaries, especially `packages/agent`, dashboard imports, database OpenClaw metadata gaps, and truthfulness documentation.
- Attempted verification checks and recorded that current session verification is blocked by EPERM permission errors.

### Files / Areas Affected
- `docs/openclaw-impact-assessment.md`
- `technical-debt.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Inspected OpenClaw research docs, implementation plan, code map, agent source, shared types, core reconciliation, core proof code, DB schema, and dashboard shell/data code.
- Attempted shared/core/agent tests and root typecheck, but they failed due EPERM environment/process permission errors in this session.

## 2026-04-29 - OpenClaw Research and Integration Plan

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Cloned and inspected the upstream OpenClaw repository in a research-only folder outside `ARKA-github`.
- Researched OpenClaw's gateway, agent runtime, workspace, skills, plugin SDK, hooks, configuration, and Telegram channel support.
- Corrected ARKA's OpenClaw implementation direction from "local deterministic adapter" to "OpenClaw sidecar gateway plus ARKA plugin/skill, with deterministic fallback."
- Documented a phased plan for OpenClaw smoke setup, ARKA workspace skill, ARKA OpenClaw plugin, and later packages/agent integration.
- Updated impacted backend, database, dashboard, technical stack, implementation, checklist, code-map, project-brief, and parallel-session docs to reflect the OpenClaw gateway/plugin model.

### Files / Areas Affected
- `docs/openclaw-research-and-integration-plan.md`
- `AGENTS.md`
- `Arka - OpenClaw Agent.md`
- `Backend-Final.md`
- `Database.md`
- `checklist.md`
- `docs/technical-stack-brief.md`
- `docs/implementation-plan.md`
- `docs/code-map.md`
- `docs/project-brief.md`
- `docs/mvp-demo-interaction-brief.md`
- `docs/database-structure-plan.md`
- `docs/parallel-codex-session-prompts.md`
- `docs/real-vs-simulated.md`
- `technical-debt.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Cloned `https://github.com/openclaw/openclaw` into `D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw`.
- Inspected upstream README, package metadata, architecture docs, agent runtime docs, agent loop docs, plugin docs, skills docs, workspace docs, configuration docs, and Telegram docs.
- This older research-only note has been superseded by later local-fork work: OpenClaw source now exists under `openclaw/`; local install, strict-smoke, direct CLI, gateway status, and skill loading are documented as verified, while model-backed ARKA response and ARKA app integration remain unverified.

## 2026-04-29 - OpenClaw Adapter Boundary Refactor

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Confirmed through a narrow local repo search that no OpenClaw source/runtime exists in the workspace yet.
- Refactored `packages/agent` so it reads as an OpenClaw-facing adapter boundary with deterministic fallback, rather than a standalone fake OpenClaw implementation.
- Split deterministic policy from the public triage entry point, added an explicit adapter/fallback boundary, and extended tests to cover runtime-unavailable fallback behavior.
- Replaced the brittle version-pinned `tsx` path in the agent test script with a normal package script.
- Updated truthfulness, changelog, and technical-debt docs to match the corrected boundary.

### Files / Areas Affected
- `packages/agent/src/openclaw-adapter.ts`
- `packages/agent/src/policy.ts`
- `packages/agent/src/triage.ts`
- `packages/agent/src/index.ts`
- `packages/agent/src/triage.test.mjs`
- `packages/agent/package.json`
- `technical-debt.md`
- `docs/real-vs-simulated.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- `pnpm.cmd --filter @arka/agent test`
- `pnpm.cmd --filter @arka/agent run typecheck`

## 2026-04-29 - OpenClaw Agent Boundary Correction

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Audited the current agent direction after the deterministic triage slice was identified as too narrow for ARKA's OpenClaw-backed product story.
- Updated planning docs to state that `packages/agent` currently contains deterministic fallback behavior only.
- Added a dedicated OpenClaw source integration prompt for a later worker session.
- Updated truthfulness and technical debt docs so ARKA does not claim OpenClaw source/runtime integration before it exists.

### Files / Areas Affected
- `docs/parallel-codex-session-prompts.md`
- `docs/implementation-plan.md`
- `docs/code-map.md`
- `docs/real-vs-simulated.md`
- `technical-debt.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only correction.
- Inspected the repo for local OpenClaw source; only the ARKA OpenClaw brief is currently present.

## 2026-04-29 - Shared/Core Test Harness and A/C/D Regression Coverage

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Added Vitest setup for `packages/shared` and `packages/core`.
- Wrote shared fixture tests for the canonical protein-bar demo world and scenario seeds.
- Wrote core reconciliation tests for State A, State C, State D, severity threshold boundaries, and `ScenarioKey` vs `CaseType` separation.
- Updated the changelog and reused-libraries docs for the new test dependency and coverage milestone.

### Files / Areas Affected
- `package.json`
- `pnpm-lock.yaml`
- `packages/shared/package.json`
- `packages/shared/vitest.config.ts`
- `packages/shared/test/demo-scenarios.test.ts`
- `packages/core/package.json`
- `packages/core/vitest.config.ts`
- `packages/core/test/reconciliation.test.ts`
- `CHANGELOG.md`
- `docs/reused-libraries.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- `pnpm.cmd --filter @arka/shared test`
- `pnpm.cmd --filter @arka/core test`
- `pnpm.cmd --filter @arka/shared run typecheck`
- `pnpm.cmd --filter @arka/core run typecheck`

## 2026-04-29 - Initial Drizzle/Postgres Schema Package

### AI Tool Used
- OpenAI Codex CLI (GPT-5.4)

### What AI Helped With
- Chose `packages/db` as the dedicated schema package to keep DB ownership separate from UI and deterministic business logic.
- Implemented the first Drizzle/Postgres schema for ARKA P0 persistence, covering actors, products, inventory items, usage rules, orders, inventory movements, audit events, notes, action logs, proof records, and owner policy defaults.
- Added a package-local Drizzle config and migration-generation script.
- Updated database-boundary and attribution docs, plus the changelog and technical debt entry for blocked DB verification.

### Files / Areas Affected
- `packages/db/*`
- `package.json`
- `docs/database-structure-plan.md`
- `docs/reused-libraries.md`
- `technical-debt.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- `pnpm.cmd install`
- `pnpm.cmd run typecheck`
- `pnpm.cmd --filter @arka/db run generate`

## 2026-04-29 - Technical Stack Brief

### AI Tool Used
- OpenAI Codex CLI (GPT-5.5)
- Context7 MCP for current documentation checks

### What AI Helped With
- Drafted the ARKA technical stack recommendation for a 1-week hackathon MVP.
- Compared Next.js route handlers, standalone API options, Postgres/Drizzle, 0G Storage, 0G Chain, OpenClaw integration posture, Telegram bot choices, testing, and deployment.
- Used Context7 for current Next.js, Drizzle ORM, and Hardhat documentation checks.
- Used official docs for 0G, Telegram, viem, Vercel, Vitest, Playwright, shadcn/ui, and OpenClaw.

### Files / Areas Affected
- `docs/technical-stack-brief.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only change.
- No code executed.

## 2026-04-29 - Local AuditEvent Proof Package + Canonical Hashing

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Implemented pure `packages/core` proof helpers for AuditEvent proof package assembly.
- Added deterministic canonical JSON serialization and local SHA-256 package hashing.
- Added proof tests for stable hashes and verified package creation for State C and State D.
- Updated truthfulness and changelog docs for the new local proof milestone.

### Files / Areas Affected
- `packages/core/src/proof.ts`
- `packages/core/src/index.ts`
- `packages/core/test/proof.test.ts`
- `docs/real-vs-simulated.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- `pnpm.cmd install`
- `pnpm.cmd --filter @arka/core test`
- `pnpm.cmd run typecheck`

## 2026-04-29 - MVP Demo Interaction Brief (Canonicalization + Precision Fixes)

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Copied the MVP demo interaction brief into the repo as the canonical reference doc.
- Split proof display statuses into: `auditProofStatus`, `storage_status`, and `chain_status` (to avoid conflating lifecycle and operational failures).
- Updated the reconciliation trigger sequencing so proof package creation does not depend on OpenClaw already running.
- Added a docs-only canonical enum list for MVP planning, including `ANCHOR_CONFIRMED` (and avoiding `VERIFIED_ON_CHAIN` naming drift).
- Added a one-line reminder in the technical stack brief to keep the MVP UI scenario-card driven first.
- Created `checklist.md` as a feature-scope and implementation tracking checklist derived from the current planning docs.
- Updated `AGENTS.md` with planning-to-implementation workflow rules and `technical-debt.md` tracking expectations.
- Created `technical-debt.md` with current known blockers and deferred decisions for implementation readiness.
- Added `docs/project-brief.md` as the canonical full-vision and roadmap brief based on the human-provided project brief.
- Drafted `docs/implementation-plan.md` with the detailed P0 execution sequence, module boundaries, verification gates, and fallback rules.

### Files / Areas Affected
- `docs/mvp-demo-interaction-brief.md`
- `docs/technical-stack-brief.md`
- `checklist.md`
- `AGENTS.md`
- `technical-debt.md`
- `docs/project-brief.md`
- `docs/implementation-plan.md`
- `CHANGELOG.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only change.
- No code executed.

## 2026-04-29 - Initial Workspace Scaffold and Core A/C/D Logic

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)
- GPT-5.4 Mini worker subagents for bounded scaffold/core/docs tasks

### What AI Helped With
- Created the initial pnpm workspace scaffold for `apps/web`, `packages/shared`, `packages/core`, `packages/agent`, and `contracts`.
- Added shared domain enums, demo seeds, pure reconciliation functions, AuditEvent creation, and deterministic triage for State A/C/D.
- Added `docs/code-map.md` and `docs/database-structure-plan.md`.
- Reviewed and corrected the first implementation boundary by separating `ScenarioKey` from `CaseType`.
- Updated truthfulness, reused-libraries, changelog, and technical-debt docs after implementation.
- Drafted `docs/parallel-codex-session-prompts.md` for six parallel Codex implementation sessions.

### Files / Areas Affected
- `.env.example`
- `.gitignore`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `apps/web/package.json`
- `contracts/package.json`
- `packages/shared/*`
- `packages/core/*`
- `packages/agent/*`
- `docs/code-map.md`
- `docs/database-structure-plan.md`
- `docs/parallel-codex-session-prompts.md`
- `docs/real-vs-simulated.md`
- `docs/reused-libraries.md`
- `technical-debt.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Direct TypeScript checks passed with global `tsc.cmd` for `packages/shared`, `packages/core`, and `packages/agent`.
- Repo owner completed `pnpm.cmd install`, producing `pnpm-lock.yaml`.
- Repo owner ran `pnpm.cmd run typecheck`, which passed for `packages/shared`, `packages/core`, and `packages/agent`.

### Status
- Planning / documentation.

## 2026-04-29 — Planning Docs Consistency + Guardrails

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Edited planning documents for consistency (Backend/OpenClaw/Database/0G Storage).
- Clarified boundaries: `AuditEvent.status` vs `OpenClaw.triageOutcome` vs `caseResolutionStatus`.
- Cleaned up naming and policy wording to avoid mutating reconciliation facts.
- Wrote a lean trigger-based `AGENTS.md`.

### Files / Areas Affected
- `AGENTS.md`
- `Backend-Final.md`
- `Database.md`
- `Arka - OpenClaw Agent.md`
- `0G Storage Brief.md`
- `CHANGELOG.md`
- `docs/*` (this directory)

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only change.
- No code executed.
