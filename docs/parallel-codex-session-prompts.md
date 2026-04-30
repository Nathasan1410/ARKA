# ARKA Parallel Codex Session Prompts

Last updated: 2026-04-29

Use this file to brief parallel Codex sessions before they work on ARKA.

Each session should receive:

```txt
1. The shared primer.
2. Exactly one session-specific task prompt.
```

Do not give one session multiple ownership scopes unless it is explicitly acting as integrator.

## Shared Primer For Every Session

You are working in:

```txt
D:\Projekan\Macam2Hackathon\ARKA\ARKA-github
```

Remote:

```txt
https://github.com/Nathasan1410/ARKA
branch: main
```

Recommended model/session setup:

```txt
Project manager / integrator: GPT-5.4 high
Default worker sessions: GPT-5.4-mini medium
Escalation-only worker: GPT-5.3-codex medium for hard integration/debugging only
```

Context guidance:

```txt
Keep worker context around 32k-64k when possible.
Read only the shared primer, your session-specific prompt, and the files/docs listed for your task.
Do not load every planning document unless you are the integration manager.
Use narrow file ownership to avoid conflicts with other Codex sessions.
```

Cost / escalation rule:

```txt
Use GPT-5.4-mini medium for bounded work such as tests, schema, contract skeleton, dashboard shell, and proof package builder.
Escalate to GPT-5.3-codex medium only for difficult cross-file debugging, package-resolution problems, Hardhat/Next/Drizzle integration issues, or conflict resolution.
Do not use higher-cost models for routine bounded tasks when the prompt and ownership scope are clear.
```

ARKA is a hackathon project. Preserve the architecture:

```txt
Backend = creates AuditEvent
Database = stores operational evidence + proof metadata
OpenClaw = operates on AuditEvent as Layer-1 conversational triage
Dashboard = Layer-2 visual investigation
0G Storage = sealed proof packages
0G Chain = proof anchors
```

Product anchor:

```txt
ARKA turns business intent and physical inventory movement into AuditEvents that can be triaged by OpenClaw and proven through 0G.
```

Do not expand ARKA into:

```txt
ERP
warehouse management
full POS production system
full CCTV AI system
HR punishment system
cashierless checkout clone
YOLO / 0G Compute / iNFT / multi-agent swarm for P0
```

P0 required scenario cards:

```txt
State A - CLEAR
State C - REQUEST_EXPLANATION
State D - ESCALATE
```

Optional / best-if-time only:

```txt
State B - SILENT_LOG
State E - MOVEMENT_ONLY_CLEAR
```

Current implementation status:

```txt
Workspace scaffold exists.
pnpm-lock.yaml exists.
pnpm.cmd install has completed.
pnpm.cmd run typecheck passes for packages/shared, packages/core, and packages/agent.
packages/shared contains canonical enums/types and A/C/D fixtures.
packages/core contains pure A/C/D reconciliation and AuditEvent creation.
packages/agent contains deterministic A/C/D triage fallback only.
OpenClaw has been researched, copied into openclaw/ as a repo-local source fork, locally installed, strict-smoke built, CLI-smoked, gateway-smoked, and configured to load the ARKA arka-audit skill.
MiniMax model discovery/auth is verified in the local smoke setup.
Read-only `arka-audit` plugin skeleton static smoke is verified.
Model-backed ARKA OpenClaw response, OpenClaw gateway discovery/load of the plugin, packages/agent gateway calls, and OpenClaw Telegram are not verified.
packages/db schema exists, but real Postgres migration/write-read verification is not done.
Dashboard UI shell exists for local A/C/D fixtures, but manual browser verification remains open.
Local proof package builder/hash exists in packages/core, but 0G upload is not implemented.
No contract implementation is implemented yet.
No 0G upload or chain registration is implemented yet.
No Telegram implementation is implemented yet.
```

Important domain distinction:

```txt
ScenarioKey = STATE_A / STATE_C / STATE_D
CaseType = ORDER_LINKED_AUDIT / MOVEMENT_ONLY_AUDIT
```

Do not conflate scenario names with audit lifecycle case types.

Canonical demo facts:

```txt
Business: Small protein bar / F&B shop
Product: Protein Shake
Inventory item: Whey Protein
Usage rule: 1 Protein Shake = 30g Whey Protein
Order quantity for A/C/D: 3 Protein Shakes
Expected usage: 90g Whey Protein
State A actual movement: 90g OUT
State C actual movement: 99g OUT
State C variance: 10%
State C severity: MODERATE_VARIANCE
State D actual movement: 160g OUT
State D severity: CRITICAL_REVIEW
Handler: Joni
Cashier: Nina
Owner: Arka Owner
```

Truthfulness rules:

```txt
Do not claim 0G Storage upload works unless real upload is implemented and verified.
Do not claim 0G Chain registry works unless real transaction/anchor is implemented and verified.
Do not claim Telegram works unless a real bot flow is implemented and verified.
Do not claim full ARKA OpenClaw integration works unless model-backed response, plugin/client path, and app call are implemented and verified.
Label deterministic triage as fallback-only even though local OpenClaw gateway/skill setup is partially verified.
If an agent task touches OpenClaw integration, it must first read docs/openclaw-research-and-integration-plan.md.
Proof failure must not delete or invalidate an AuditEvent.
```

Audit-safe language:

Use:

```txt
needs review
movement without matching sale
usage above expected range
explanation requested
evidence package created
final decision made by owner/auditor
```

Avoid:

```txt
AI proves theft
employee is guilty
fraud detected
automatic punishment
legally binding accusation
```

## Required Reading Order

Every session should read these first:

```txt
AGENTS.md
checklist.md
docs/implementation-plan.md
docs/code-map.md
docs/real-vs-simulated.md
technical-debt.md
```

Then read only the docs relevant to your task:

```txt
Dashboard/UI task -> docs/mvp-demo-interaction-brief.md, docs/technical-stack-brief.md
Database task -> Database.md, docs/database-structure-plan.md
Core logic task -> Backend-Final.md, ARKA Demo Scenario Brief - Draft.md, packages/shared/src/types.ts
Agent task -> Arka - OpenClaw Agent.md, docs/openclaw-research-and-integration-plan.md, docs/technical-stack-brief.md Section 8, docs/implementation-plan.md Phase 4, packages/agent/src/triage.ts
Proof task -> 0G Storage Brief.md, docs/0g-chain-brief.md, docs/implementation-plan.md
Contract task -> docs/0g-chain-brief.md, docs/technical-stack-brief.md
```

Keep context small. Do not read every file unless you are integrating.

## Coordination Rules

Each session owns only its assigned files.

Do not edit another session's files unless the user explicitly asks you to integrate.

Before editing:

```txt
1. Run git status --short.
2. Read your owned files.
3. Read only the relevant docs.
4. State a short plan.
```

After editing:

```txt
1. Run the relevant verification command.
2. Update docs only if a documented status or boundary changed.
3. Update technical-debt.md if you skipped a meaningful step, accepted risk, or need human setup.
4. Do not commit unless explicitly asked.
```

Use `pnpm.cmd`, not `pnpm`, on this Windows machine.

Preferred checks:

```txt
pnpm.cmd run typecheck
pnpm.cmd --filter @arka/shared run typecheck
pnpm.cmd --filter @arka/core run typecheck
pnpm.cmd --filter @arka/agent run typecheck
pnpm.cmd --filter @arka/web build
pnpm.cmd --filter @arka/contracts test
```

Only run checks relevant to your task.

## Session 1 Prompt - Core Test Owner

Goal:

```txt
Add focused tests for shared fixtures and core A/C/D reconciliation behavior.
```

Owned paths:

```txt
packages/shared/**
packages/core/**
package.json files only if test scripts/config are required
vitest config files if required
```

Do not edit:

```txt
apps/web
packages/agent
contracts
database files
proof integration files
```

Required work:

```txt
1. Add Vitest setup if not already present.
2. Add tests for State A expected=90 actual=90 CLEAR/NORMAL.
3. Add tests for State C expected=90 actual=99 variance=10 MODERATE_VARIANCE.
4. Add tests for State D expected=90 actual=160 CRITICAL_REVIEW.
5. Add tests for exact threshold behavior around 5%, 7%, 10%, 20%.
6. Add tests proving ScenarioKey and CaseType are distinct concepts.
```

Verification:

```txt
pnpm.cmd --filter @arka/core test
pnpm.cmd --filter @arka/shared run typecheck
pnpm.cmd --filter @arka/core run typecheck
```

Update docs:

```txt
Update docs/real-vs-simulated.md only if test coverage changes the feature truthfulness wording.
Update technical-debt.md if any intended test is skipped.
```

## Session 2 Prompt - Agent Boundary Owner

Goal:

```txt
Correct the ARKA agent boundary so packages/agent is clearly an OpenClaw-facing adapter with deterministic fallback, not the final OpenClaw runtime.
```

Owned paths:

```txt
packages/agent/**
package.json files only if test scripts/config are required
```

Do not edit:

```txt
packages/core reconciliation logic
apps/web
contracts
database files
proof integration files
```

Required work:

```txt
1. Read Arka - OpenClaw Agent.md before editing.
2. Inspect whether OpenClaw source/runtime is already available locally. If not, state that clearly.
3. Keep deterministic A/C/D policy as fallback, not as the final OpenClaw implementation.
4. Add or preserve tests for A -> AUTO_CLEAR, C -> REQUEST_EXPLANATION, and D -> ESCALATE.
5. Prove triage does not mutate reconciliation facts.
6. If OpenClaw repo/source integration is not implemented, update technical-debt.md with the exact skipped integration and next action.
7. Do not fake OpenClaw runtime behavior by renaming deterministic policy to OpenClaw.
8. Do not implement Telegram, DB writes, or proof calls in packages/agent.
```

Verification:

```txt
pnpm.cmd --filter @arka/agent test
pnpm.cmd --filter @arka/agent run typecheck
```

Update docs:

```txt
Update technical-debt.md if OpenClaw source/runtime integration is unavailable, skipped, or deferred.
Do not change docs/real-vs-simulated.md unless feature truthfulness changes.
```

## Session 2B Prompt - OpenClaw Gateway / Plugin Owner

Use this only after the deterministic fallback is stable and the user explicitly assigns OpenClaw integration.

Goal:

```txt
Advance real OpenClaw integration by using OpenClaw as a sidecar gateway/runtime with ARKA skill/plugin work, while preserving deterministic fallback behavior.
```

Owned paths:

```txt
packages/agent/**
openclaw/extensions/arka-audit/** only if explicitly implementing plugin code
openclaw/workspaces/arka/** only if explicitly changing OpenClaw workspace/skill behavior
docs/reused-libraries.md
docs/real-vs-simulated.md
technical-debt.md
```

Required work:

```txt
1. Read docs/openclaw-research-and-integration-plan.md before editing.
2. Use the repo-local OpenClaw source fork and sidecar gateway + ARKA skill/plugin path; do not create a second plugin package unless explicitly requested.
3. If running smoke setup, verify the smallest safe OpenClaw command and record exactly what works.
4. If creating plugin/skill code, keep it AuditEvent-first and forbid mutation of reconciliation facts.
5. If copying, vendoring, adding dependency, or modifying OpenClaw source, update docs/reused-libraries.md and docs/ai-attribution.md.
6. Keep ARKA-specific app behavior in packages/agent as a thin client/fallback boundary around AuditEvent input/output.
7. Ensure OpenClaw reads AuditEvent and proof metadata after AuditEvent exists.
8. Ensure OpenClaw cannot overwrite AuditEvent.status, expected quantity, actual quantity, variance, severity, or evidence references.
9. Keep deterministic fallback available if OpenClaw runtime/provider fails.
10. Add tests for fallback behavior and any OpenClaw adapter mapping that can run locally.
```

Verification:

```txt
pnpm.cmd --filter @arka/agent test
pnpm.cmd --filter @arka/agent run typecheck
```

## Session 3 Prompt - Dashboard Shell Owner

Goal:

```txt
Build the first minimal Next.js /dashboard shell using local A/C/D fixtures and pure core/agent functions.
```

Owned paths:

```txt
apps/web/**
```

Do not edit:

```txt
packages/shared
packages/core
packages/agent
contracts
database schema
proof implementation
```

Required work:

```txt
1. Create a minimal Next App Router dashboard route.
2. Show Scenario Runner with State A, State C, State D.
3. On scenario selection, compute/display Order, Movement, AuditEvent, and deterministic triage.
4. Include sections for AuditEvent detail, OpenClaw/Telegram panel, and Proof panel.
5. Proof panel should honestly show LOCAL_ONLY / NOT_STARTED / NOT_REGISTERED.
6. Do not implement DB, Telegram, 0G upload, or chain calls.
```

Design posture:

```txt
Operational dashboard, not landing page.
Dense but clear.
No marketing hero.
No accusatory language.
```

Verification:

```txt
pnpm.cmd --filter @arka/web build
manual local run only if asked or if build requires it
```

Update docs:

```txt
Update docs/real-vs-simulated.md if Dashboard UI becomes PARTIAL or REAL within local demo.
Update technical-debt.md if build cannot run or UI verification is skipped.
```

## Session 4 Prompt - Database Schema Owner

Goal:

```txt
Create the first P0 Drizzle/Postgres schema plan implementation, after checking current shared/core types.
```

Owned paths:

```txt
database package/path chosen by you, preferably one clear location:
packages/db/**
or apps/web/src/db/**
package manifests only if needed for Drizzle dependencies
docs/database-structure-plan.md only if the DB boundary changes
```

Do not edit:

```txt
packages/core reconciliation behavior
apps/web dashboard UI
contracts
proof upload logic
```

Required work:

```txt
1. Choose one DB code location and document why if not obvious.
2. Add P0 models: Actor, Product, InventoryItem, UsageRule, Order, InventoryMovement, AuditEvent, CaseNote, ActionLog, ProofRecord, OwnerPolicy default.
3. Keep UsageBatch minimal/deferred unless needed.
4. Do not build auth, ERP, permissions, supplier, branch, stocktake, or manager workflow.
5. Do not make DB the source of business rules; shared/core remains source of domain logic.
```

Verification:

```txt
pnpm.cmd run typecheck
schema generation/check command if available
```

Update docs:

```txt
Update docs/reused-libraries.md if adding Drizzle/Postgres packages.
Update technical-debt.md if DATABASE_URL or migration verification is blocked.
```

## Session 5 Prompt - Proof Package Owner

Goal:

```txt
Implement local AuditEvent Proof Package creation and canonical hashing. No 0G upload yet unless explicitly asked.
```

Owned paths:

```txt
packages/core/src/proof*
or a new packages/proof/**
package manifests only if needed
docs only if proof boundaries change
```

Do not edit:

```txt
apps/web
contracts
database schema
Telegram/OpenClaw runtime
```

Required work:

```txt
1. Build AuditEvent Proof Package JSON shape from existing AuditEvent and supporting summaries.
2. Canonicalize JSON deterministically.
3. Compute local_package_hash.
4. Add tests proving identical input creates identical hash.
5. Add tests proving State C or D can create a package.
6. Do not call 0G Storage SDK yet.
```

Important rule:

```txt
AuditEvent Proof Package creation must not depend on OpenClaw already running.
```

Verification:

```txt
pnpm.cmd --filter @arka/core test
pnpm.cmd run typecheck
```

Update docs:

```txt
Update docs/real-vs-simulated.md if local proof package creation becomes PARTIAL/REAL.
Update technical-debt.md if hashing/canonicalization is incomplete.
```

## Session 6 Prompt - Contract Owner

Goal:

```txt
Implement and test the minimal AuditProofRegistry contract for local Hardhat tests.
```

Owned paths:

```txt
contracts/**
```

Do not edit:

```txt
apps/web
packages/core
packages/shared
packages/agent
database schema
0G Storage upload logic
```

Required work:

```txt
1. Implement AuditProofRegistry.sol.
2. Support authorized registrar registration.
3. Register AUDIT_EVENT_CREATED proof anchors.
4. Store/read case ID, proof type, local package hash, 0G root hash/reference, actor role/wallet, timestamp.
5. Emit ProofRegistered event.
6. Add local tests for authorized registration, unauthorized rejection, and readback.
7. Configure Hardhat with evmVersion cancun.
8. Do not deploy to 0G testnet yet unless explicitly asked.
```

Current verified 0G direction:

```txt
Network: 0G-Galileo-Testnet
Chain ID: 16602
RPC: https://evmrpc-testnet.0g.ai
Explorer: https://chainscan-galileo.0g.ai
Faucet: https://faucet.0g.ai
Preferred transaction library for this repo: ethers
```

Verification:

```txt
pnpm.cmd --filter @arka/contracts test
pnpm.cmd --filter @arka/contracts build
```

Update docs:

```txt
Update docs/real-vs-simulated.md only after local contract tests pass or real chain deployment happens.
Update technical-debt.md if Hardhat install/build/test is blocked.
```

## Integration Manager Prompt

Use this only for a session responsible for reviewing and merging parallel outputs.

Goal:

```txt
Review all worker outputs for conflicts, domain drift, and verification gaps.
```

Responsibilities:

```txt
1. Run git status --short.
2. Inspect all changed files.
3. Ensure no session crossed ownership boundaries without reason.
4. Run pnpm.cmd run typecheck.
5. Run relevant tests after they exist.
6. Update CHANGELOG.md, docs/ai-attribution.md, docs/real-vs-simulated.md, docs/reused-libraries.md, and technical-debt.md only as triggered.
7. Prepare commit summary, but do not commit unless the human asks.
```

Pay special attention to:

```txt
ScenarioKey vs CaseType confusion
State C exact 10% MODERATE_VARIANCE boundary
OpenClaw mutating AuditEvent facts
proof failures invalidating AuditEvents
P1/P2 work sneaking into P0
claims that integrations are real before verification
```
