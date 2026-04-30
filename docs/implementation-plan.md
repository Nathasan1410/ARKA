# ARKA P0 Implementation Plan

Last updated: 2026-05-01

This is the implementation plan for turning the current ARKA planning docs into a working hackathon MVP.

It does not replace the architecture briefs. It turns them into execution steps.

## 0. Implementation Anchor

Build the smallest reliable ARKA loop first:

```txt
Scenario card
-> Order / Usage Rule / Movement
-> Reconciliation
-> AuditEvent
-> OpenClaw sidecar/plugin triage or deterministic fallback triage
-> Dashboard visibility
-> AuditEvent Proof Package
-> 0G Storage upload attempt
-> 0G Chain anchor attempt
-> README / demo truthfulness update
```

P0 required scenario cards:

```txt
State A - CLEAR
State C - REQUEST_EXPLANATION
State D - ESCALATE
```

Optional / best-if-time:

```txt
State B - SILENT_LOG
State E - MOVEMENT_ONLY_CLEAR
```

Do not build P1/P2 before State A/C/D work end-to-end.

## 1. Non-Negotiable Rules

Implementation must preserve these rules:

```txt
Backend creates AuditEvent.
Database stores operational evidence + proof metadata.
OpenClaw reads AuditEvent first and does not overwrite reconciliation facts.
Dashboard visualizes and investigates.
0G Storage stores sealed proof packages.
0G Chain anchors selected proof package hashes/references.
```

OpenClaw may write:

```txt
triageOutcome
CaseNote
ActionLog
StaffClarificationRequest
caseResolutionStatus / recommendation
```

OpenClaw must not overwrite:

```txt
AuditEvent.status
expected quantity
actual quantity
variance
severity
evidence references
proof history
```

Proof failures must not delete or invalidate an AuditEvent.

## 2. Phase 1 - Repo Scaffold

Goal: create the project structure without implementing speculative features.

Target structure:

```txt
apps/web
contracts
packages/core
packages/shared
packages/agent
docs
```

Steps:

```txt
1. Confirm package manager/workspace setup (pnpm workspaces likely default).
2. Scaffold Next.js App Router app in apps/web.
3. Add packages/core for deterministic audit/reconciliation logic.
4. Add packages/shared for enums, types, and validation schemas.
5. Add packages/agent as ARKA's OpenClaw client boundary with deterministic fallback.
6. Add contracts for AuditProofRegistry and deployment scripts.
7. Add .env.example categories, without secrets.
```

Initial `.env.example` categories:

```txt
DATABASE_URL
ZG_CHAIN_RPC_URL
ZG_CHAIN_ID
ZG_REGISTRAR_PRIVATE_KEY
ZG_STORAGE_INDEXER_RPC
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET
APP_BASE_URL
AUDIT_PROOF_REGISTRY_ADDRESS
```

Verification:

```txt
Package manager install succeeds.
Workspace scripts can run.
No secrets are committed.
```

Docs to update:

```txt
docs/reused-libraries.md if starter kits/templates/libraries are added.
docs/real-vs-simulated.md only if feature truthfulness changes.
```

## 3. Phase 2 - Shared Types and Demo Fixtures

Goal: define the data vocabulary used by every later layer.

Implement in `packages/shared`:

```txt
AuditEvent.status enum
severity enum
OpenClaw.triageOutcome enum
auditProofStatus enum
storage_status enum
chain_status enum
case type enum
proof type enum
actor role enum
```

Canonical enums come from `docs/mvp-demo-interaction-brief.md`.

Seed demo world:

```txt
Owner: Arka Owner
Cashier: Nina
Handler: Joni
Product: Protein Shake
Inventory item: Whey Protein
Usage rule: 1 Protein Shake = 30g Whey Protein
Container: RACK-WHEY-01
```

Scenario payloads:

```txt
State A: order 3 Protein Shakes, movement 90g OUT
State C: order 3 Protein Shakes, movement 99g OUT
State D: order 3 Protein Shakes, movement 160g OUT
```

Verification:

```txt
Types compile.
Scenario fixtures can be imported by core logic and the web app.
```

## 4. Phase 3 - Core Reconciliation

Goal: make ARKA create correct AuditEvents without depending on UI, Telegram, OpenClaw runtime, 0G, or database infrastructure.

Implement in `packages/core`:

```txt
calculateExpectedUsage(order, usageRule)
calculateNetMovement(movements)
calculateVariance(expected, actual)
determineAuditStatus(expected, actual, movementContext)
determineSeverity(variancePercent)
createAuditEvent(input)
```

Initial thresholds:

```txt
0-5%       NORMAL
>5-7%      MINOR_VARIANCE
>7-10%     MODERATE_VARIANCE
>10-20%    SIGNIFICANT_VARIANCE
>20%       CRITICAL_REVIEW
```

Expected P0 outputs:

```txt
State A -> CLEAR / NORMAL
State C -> OVER_EXPECTED_USAGE / MODERATE_VARIANCE / REQUEST_EXPLANATION later
State D -> OVER_EXPECTED_USAGE / CRITICAL_REVIEW / ESCALATE later
```

Important detail:

State C uses exactly 10% variance. The docs currently classify it as `MODERATE_VARIANCE`. Implement the threshold boundary to preserve that demo result.

Verification:

```txt
Vitest unit tests for State A/C/D.
Tests prove expected quantity, actual quantity, variance, status, and severity.
No database, UI, Telegram, or 0G required for these tests.
```

## 5. Phase 4 - OpenClaw Agent Boundary

Goal: make ARKA's agent layer ready for a real OpenClaw sidecar gateway/plugin path while preserving a deterministic fallback that can triage AuditEvents without requiring LLM or full OpenClaw runtime.

Important correction:

```txt
The deterministic policy is not the final OpenClaw agent.
It is the fallback behavior behind the ARKA agent interface.
OpenClaw is a gateway/runtime/plugin/skills system, not just a local adapter.
The preferred path is OpenClaw sidecar gateway + ARKA OpenClaw skill/plugin + packages/agent client/fallback boundary.
See docs/openclaw-research-and-integration-plan.md.
```

Implement in `packages/agent`:

```txt
OpenClaw client/adapter interface
deterministic fallback policy
triageAuditEvent(auditEvent, ownerPolicy)
formatOwnerRecommendation(auditEvent, triageOutcome)
createActionLogForTriage(...)
createCaseNoteForTriage(...)
```

Current OpenClaw setup status:

```txt
OpenClaw source fork under openclaw/: verified.
Local install: verified.
Strict-smoke build: verified.
Direct source CLI help/version/gateway-help: verified.
Local dev gateway connectivity: verified.
ARKA arka-audit workspace skill loading: verified.
MiniMax model discovery/auth: verified.
Model-backed ARKA inference turn: verified once through local `infer model run` with MiniMax M2.7.
Full OpenClaw ARKA agent session turn: not verified.
	ARKA OpenClaw read-only plugin skeleton: implemented / static-smoke and extension-test verified.
	OpenClaw gateway discovery/load of the plugin: verified.
	packages/agent gateway/client call path: not implemented.
	OpenClaw Telegram for ARKA: not implemented.
```

Before claiming ARKA is OpenClaw-integrated:

```txt
1. Verify OpenClaw gateway discovery/load of the existing read-only `arka-audit` plugin (VERIFIED).
2. Debug a full OpenClaw ARKA agent session turn with the ARKA workspace/skill loaded.
3. Connect packages/agent to the OpenClaw gateway/plugin only after the full agent session path is proven.
4. Return OPENCLAW_RUNTIME only after a verified gateway/plugin response.
5. Persist OpenClaw run/session/message refs only after the real path exists.
6. Keep deterministic fallback available if OpenClaw runtime/provider fails or times out.
```

P0 deterministic rules:

```txt
CLEAR / NORMAL -> AUTO_CLEAR
OVER_EXPECTED_USAGE / MODERATE_VARIANCE / HIGH_VALUE -> REQUEST_EXPLANATION
OVER_EXPECTED_USAGE / CRITICAL_REVIEW -> ESCALATE
MINOR_VARIANCE -> SILENT_LOG if State B is implemented
```

P0 owner policy:

```txt
hardcoded default owner policy
no policy settings UI
owner approval required before staff message
```

Verification:

```txt
Unit tests for State A/C/D triage.
Test that triage does not mutate reconciliation facts.
```

Truthfulness:

```txt
If deterministic fallback is used, label it as deterministic fallback even though local OpenClaw setup is partially verified.
Gateway connectivity, skill loading, model discovery, and one local `infer model run` response are not the same as ARKA app integration.
Do not claim OpenClaw-backed triage unless ARKA actually sends/receives through OpenClaw gateway/plugin.
```

## 6. Phase 5 - Local Persistence / Database

Goal: persist the local operational evidence needed by the dashboard and proof flow.

Recommended stack:

```txt
Postgres
Drizzle ORM
```

P0 tables / models:

```txt
Actor
Product
InventoryItem
UsageRule
Order
InventoryMovement
AuditEvent
CaseNote
ActionLog
ProofRecord
OwnerPolicy default
```

UsageBatch:

```txt
Keep as minimal backend/core concept if needed.
Do not build UsageBatch UI for P0 unless required by implementation.
```

Verification:

```txt
Migration or schema generation succeeds.
Seed script creates demo world.
Scenario run can write/read AuditEvents.
```

Docs:

```txt
Update docs/real-vs-simulated.md when local generation becomes real.
```

## 7. Phase 6 - Dashboard / Audit Arena

Goal: build the demo interface around the core loop.

Route:

```txt
/dashboard
POST /api/demo/run-scenario for local A/C/D scenario execution
POST /api/demo/admin-movement for dashboard-entered order quantity + movement grams
POST /api/demo/agent-action for dashboard-only simulated owner/staff/final-decision actions
```

P0 panels:

```txt
Scenario Runner
Order Simulator Panel
Inventory Movement Simulator Panel
AuditEvent List
AuditEvent Detail
OpenClaw / Telegram Panel
Proof Panel
```

Scenario Runner actions:

```txt
Run State A
Run State C
Run State D
```

State B/E:

```txt
Do not implement before A/C/D work end-to-end unless explicitly requested.
```

Dashboard success criteria:

```txt
User can run A/C/D.
Dashboard calls the local scenario route and shows returned Order, Movement, AuditEvent data.
Dashboard can run a local admin movement simulation from entered order quantity and movement grams.
AuditEvent detail explains expected vs actual.
OpenClaw triage outcome is visible.
Dashboard simulation can advance owner approval, staff message preview/send, simulated staff reply, and final owner decision without claiming real Telegram or OpenClaw runtime.
Proof status is visible even if proof integration is not yet real.
Local AuditEvent proof package hash is visible before any 0G upload or chain registration.
Persistence mode is visible and must say in-memory demo until real Postgres write/read is verified.
```

Verification:

```txt
Manual UI verification for A/C/D.
Build/lint/typecheck if available.
Screenshot/manual notes for demo flow if useful.
```

Truthfulness:

```txt
Proof status must show LOCAL_ONLY / simulated states honestly until 0G is real.
Dashboard-local package hashing must not be described as 0G Storage upload or on-chain anchoring.
The in-memory demo repository must not be described as real database persistence.
```

## 8. Phase 7 - AuditEvent Proof Package

Goal: create the sealed JSON package locally before any external upload.

Implement in `packages/core` or a proof module:

```txt
buildAuditEventProofPackage(auditEvent, supportingSummaries)
canonicalizeProofPackage(package)
hashProofPackage(canonicalPackage)
```

Package should include:

```txt
audit_event_id
case_type
status
severity
expected quantity
actual quantity
variance
order summary
movement summary
usage rule summary
handler / cashier context
evidence window
backend recommended action
created_at
```

Important:

```txt
AuditEvent Proof Package creation must not depend on OpenClaw already running.
OpenClaw recommendation can be added later through final resolution or action timeline packages.
```

Verification:

```txt
Unit test that the same input produces the same canonical hash.
Unit test that State C or D creates a package.
```

## 9. Phase 8 - 0G Storage Upload

Goal: upload an AuditEvent Proof Package JSON to 0G Storage and store returned proof metadata.

Current verified direction:

```txt
Package: @0gfoundation/0g-ts-sdk
Wallet library: ethers
RPC: https://evmrpc-testnet.0g.ai
Chain ID: 16602
Indexer example: https://indexer-storage-testnet-turbo.0g.ai
Upload response: { rootHash, txHash }
```

Implementation steps:

```txt
1. Write proof package JSON to a temporary file or supported upload input.
2. Create ZgFile from file path.
3. Compute Merkle tree / root hash.
4. Create ethers provider and funded signer.
5. Create Indexer with configured storage indexer RPC.
6. Upload through indexer.
7. Save rootHash, txHash, storage_status, auditProofStatus in ProofRecord.
8. Handle upload failure as FAILED_TO_STORE / RETRY_PENDING without deleting AuditEvent.
```

P0 status behavior:

```txt
Before upload: LOCAL_ONLY / NOT_STARTED
During upload: PENDING_UPLOAD
Success: STORED_ON_0G / STORED
Failure: LOCAL_ONLY / FAILED_TO_STORE
Retry planned: RETRY_PENDING
```

Verification:

```txt
At least one State C or State D case completes real 0G Storage upload.
Record rootHash and txHash in local ProofRecord.
Dashboard shows the rootHash/txHash.
```

Fallback:

```txt
If SDK integration fails, generate proof package and local hash, mark 0G as PARTIAL/SIMULATED, and record blocker in technical-debt.md.
CLI fallback can be attempted if time allows.
```

## 10. Phase 9 - 0G Chain AuditProofRegistry

Goal: anchor selected proof package metadata on 0G Chain.

Current verified direction:

```txt
Network: 0G-Galileo-Testnet
Chain ID: 16602
RPC: https://evmrpc-testnet.0g.ai
Explorer: https://chainscan-galileo.0g.ai
Faucet: https://faucet.0g.ai
Compiler setting: evmVersion = cancun
Suggested contract stack: Hardhat + ethers for deploy/calls
```

Contract:

```txt
AuditProofRegistry
```

P0 contract responsibilities:

```txt
register AUDIT_EVENT_CREATED proof anchor
store audit_event_id / case_id
store proof_type
store local_package_hash
store 0g_root_hash
store storage tx hash or reference if useful
store registered_by / actor role
store timestamp
emit ProofRegistered event
read proof metadata
```

Access model:

```txt
contract owner / deployer = admin
authorized registrar = backend/proof service wallet
public users = read only
```

Implementation steps:

```txt
1. Implement minimal Solidity contract.
2. Add Hardhat config for 0G Galileo.
3. Add unit tests for registrar permission and proof registration.
4. Deploy to 0G testnet with funded registrar/deployer.
5. Save contract address in env / README when real.
6. Register proof anchor after 0G Storage upload succeeds.
7. Save chain tx hash and chain_status in ProofRecord.
```

P0 status behavior:

```txt
Before registration: NOT_REGISTERED
During registration: PENDING_REGISTRATION
Success tx submitted: REGISTERED
Confirmed/read back: ANCHOR_CONFIRMED
Failure: FAILED_TO_REGISTER
```

Verification:

```txt
At least one State C or State D case completes real 0G Chain anchor registration.
Dashboard shows tx hash and chain status.
Optional: read back contract data to mark ANCHOR_CONFIRMED.
```

Fallback:

```txt
If chain deployment/registration fails, keep 0G Storage result visible, show FAILED_TO_REGISTER / RETRY_PENDING, and record blocker in technical-debt.md.
```

## 11. Phase 10 - Telegram / Conversation Surface

Goal: show owner-facing OpenClaw behavior without risking the proof demo.

P0 baseline:

```txt
Dashboard-simulated OpenClaw/Telegram conversation if model-backed OpenClaw turn or Telegram channel remains unstable.
Owner alert/recommendation visible in dashboard.
Owner approval preview visible.
ActionLog / CaseNote recorded.
```

Best MVP if time:

```txt
Real Telegram owner alert.
Dashboard fallback still remains available.
```

Current verified direction:

```txt
OpenClaw has channel/runtime support, and ARKA now has a local OpenClaw source fork plus verified dev gateway connectivity.
OpenClaw Telegram is still not implemented for ARKA.
If ARKA-owned Telegram is chosen instead, grammY remains the lightweight fallback library.
Dashboard simulation remains the P0-safe fallback.
```

Implementation steps:

```txt
1. Keep dashboard simulation working first.
2. Prefer OpenClaw Telegram channel only after model-backed OpenClaw turns and ARKA plugin/client path are stable.
3. Use ARKA-owned grammY only if OpenClaw channel setup becomes a blocker and the demo still needs real Telegram.
4. Send owner alert for State C/D only if bot/channel is configured and verified.
5. Do not make Telegram wait on slow 0G Storage or chain work.
6. Record ActionLog / CaseNote regardless of transport.
```

Verification:

```txt
Dashboard simulation works for State C/D.
If real Telegram is enabled, send one owner alert and document it as REAL.
If not, mark Telegram as SIMULATED/PARTIAL in README and docs/real-vs-simulated.md.
```

## 12. Phase 11 - README, Real-vs-Simulated, Demo Video

Goal: package the demo honestly.

README must explain:

```txt
what ARKA is
problem / origin story
architecture
how to run locally
how to run State A/C/D
what is real vs simulated
0G Storage root hash if real
0G Chain contract address / tx hash if real
Telegram status
AI attribution
known limitations
```

Update `docs/real-vs-simulated.md` when statuses change:

```txt
Order simulator
Inventory movement simulator
Reconciliation Engine
AuditEvent Generator
OpenClaw deterministic triage
Dashboard UI
0G Storage upload
0G Chain registry
Telegram owner alert
Hardware input
CCTV metadata
YOLO / 0G Compute / iNFT
```

Demo video should show:

```txt
State A clear path
State C or D review path
AuditEvent detail
OpenClaw triage
Proof package root hash
Chain tx / anchor if real
Truthfulness note
```

## 13. Recommended Build Order

Use this order during implementation:

```txt
1. Scaffold repo and workspace.
2. Add shared enums/types.
3. Add demo fixtures.
4. Add core reconciliation tests for A/C/D.
5. Add AuditEvent generator.
6. Add OpenClaw-facing agent boundary with deterministic fallback.
7. Add basic dashboard with A/C/D.
8. Add local proof package builder and hashing.
9. Add 0G Storage upload.
10. Add AuditProofRegistry contract and local tests.
11. Add 0G Chain registration.
12. Add Telegram/dashboard conversation surface.
13. Update README and real-vs-simulated.
14. Record demo artifacts and unresolved technical debt.
```

## 14. Manual P0 Demo Verification Checklist

State A:

```txt
Run State A.
Order shows 3 Protein Shakes.
Expected usage shows 90g whey.
Movement shows 90g OUT.
AuditEvent is CLEAR / NORMAL.
OpenClaw triage is AUTO_CLEAR.
No owner alert is required.
```

State C:

```txt
Run State C.
Order shows 3 Protein Shakes.
Expected usage shows 90g whey.
Movement shows 99g OUT.
AuditEvent is OVER_EXPECTED_USAGE / MODERATE_VARIANCE.
OpenClaw triage is REQUEST_EXPLANATION.
Owner approval before staff message is visible.
Proof package is created.
0G Storage / 0G Chain status is visible.
```

State D:

```txt
Run State D.
Order shows 3 Protein Shakes.
Expected usage shows 90g whey.
Movement shows 160g OUT.
AuditEvent is OVER_EXPECTED_USAGE / CRITICAL_REVIEW.
OpenClaw triage is ESCALATE.
Owner alert or dashboard alert is visible.
Proof package is created.
0G Storage / 0G Chain status is visible.
```

Proof success minimum:

```txt
At least one important case, State C or D, completes real 0G Storage upload.
At least one important case, State C or D, completes real 0G Chain anchor.
Both C and D still show proof status, including failure/retry if integration fails.
```

## 15. What To Record in technical-debt.md

Add an entry when any of these happen:

```txt
0G SDK upload not verified
0G Chain deployment or registration fails
Telegram is simulated instead of real
OpenClaw runtime is not integrated
proof verification action is skipped
README cannot include real tx/root because integration failed
manual demo verification is incomplete
P0 scenario behavior differs from docs
```

Do not hide these in chat only.
