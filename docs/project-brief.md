## 0. One-Line Summary

**ARKA is an AuditEvent-first system that compares business intent with physical inventory movement, uses an OpenClaw-powered conversational triage layer to reduce manual review, and anchors important proof packages through 0G Storage and 0G Chain.**

---

## 1. Origin Story

ARKA started from a simple trust problem.

A business owner can see sales data, POS records, inventory reports, staff notes, and CCTV footage — but these sources are often fragmented, delayed, reactive, and easy to reinterpret after the fact.

The original inspiration came from a protein bar scenario:

```txt
A protein shake business receives complaints that shakes do not contain enough protein.
At the same time, whey inventory is disappearing faster than expected.
The owner later discovers staff were giving away or misusing supplies.
```

The problem is not only theft.

The deeper problem is:

```txt
How can a business prove what happened between a transaction and physical inventory movement without reviewing hours of CCTV or blindly trusting internal reports?
```

ARKA asks:

> Can we build a visible, accountable audit assistant that checks business intent against physical reality, reduces manual review, and produces tamper-resistant proof packages?

---

## 2. Name

**ARKA** is inspired by a Sanskrit word associated with sunlight / sunray.

The meaning fits the product:

```txt
ARKA shines light on unclear operational events.
ARKA does not accuse.
ARKA reveals evidence and helps humans decide.
```

---

## 3. Core Thesis

ARKA is not trying to make blockchain useful by forcing payments into every product.

ARKA’s thesis is:

> Blockchain can be valuable as an accountability and proof layer for AI-assisted operational decisions.

In ARKA:

```txt
AI helps interpret and triage evidence.
Local systems handle fast operations.
0G Storage stores sealed proof packages.
0G Chain anchors proof references.
Humans remain responsible for final decisions.
```

This creates a system where:

```txt
business data is explainable,
AI actions are visible,
important cases are sealed,
and later disputes can be reviewed against proof packages.
```

---

## 4. Product Positioning

ARKA is:

```txt
An AuditEvent generator.
An operational evidence layer.
A visible AI triage assistant.
A proof package system.
A dashboard for business-vs-physical reconciliation.
A 0G Storage + 0G Chain proof demo.
```

ARKA is not:

```txt
ERP.
Warehouse management.
Full POS production system.
Cashierless checkout clone.
Full CCTV AI system.
HR punishment system.
Legal accusation engine.
```

Final positioning:

> **ARKA turns business intent and physical inventory movement into AuditEvents that can be triaged by OpenClaw and proven through 0G.**

---

## 5. The Universal Pattern

ARKA does not need to understand every industry in full detail.

It only needs to capture a universal pattern:

```txt
Something was expected to happen.
Something physically happened.
Was the difference acceptable?
```

This can apply to:

```txt
F&B: protein shake uses whey.
Retail: lamp or spark plug leaves shelf.
Pharmacy: medicine is sold and item leaves inventory.
Workshop: sparepart is taken for a repair.
Kitchen: ingredient is used across multiple orders.
```

But ARKA MVP focuses on one representative world:

```txt
Small protein bar / F&B shop.
Core item: Whey Protein.
Main product: Protein Shake.
```

---

## 6. Core Architecture

ARKA has six conceptual layers.

```txt
Backend = creates AuditEvent
Database = stores operational evidence + proof metadata
OpenClaw = operates on AuditEvent as Layer-1 conversational triage
Dashboard = Layer-2 visual investigation
0G Storage = sealed proof packages
0G Chain = proof anchors
```

### 6.1 Backend

The backend turns:

```txt
Order + Usage Rule + Inventory Movement
```

into:

```txt
AuditEvent
```

The backend is the source of reconciliation truth.

It determines:

```txt
expected quantity
actual quantity
variance
status
severity
recommended action
proof status
```

### 6.2 Database

The local database is the fast operational evidence layer.

It stores:

```txt
orders
products
usage rules
inventory items
inventory movements
usage batches
AuditEvents
CaseNotes
ActionLogs
StaffClarificationRequests
ProofRecords
OwnerPolicy defaults
```

It is not the public proof layer.

### 6.3 OpenClaw

OpenClaw is ARKA’s Layer-1 conversational dashboard.

Implementation note:

```txt
OpenClaw is a gateway/runtime/plugin/skills system.
ARKA should integrate it as a sidecar gateway with an ARKA-specific skill/plugin when verified.
packages/agent is ARKA's app-facing client boundary and deterministic fallback, not the full OpenClaw runtime.
```

It reads AuditEvent first.

It does not reconstruct truth directly from raw tables.

It decides what should happen next:

```txt
AUTO_CLEAR
SILENT_LOG
REQUEST_EXPLANATION
ESCALATE
```

OpenClaw does not overwrite reconciliation facts.

It can write:

```txt
triageOutcome
CaseNote
ActionLog
StaffClarificationRequest
caseResolutionStatus / recommendation
```

### 6.4 Dashboard / Audit Arena

The dashboard is the visual investigation layer.

It should show:

```txt
scenario runner
order simulator panel
inventory movement simulator panel
AuditEvent list
AuditEvent detail
OpenClaw / Telegram panel
proof panel
```

The dashboard should make ARKA feel like one connected audit loop, not disconnected tools.

### 6.5 0G Storage

0G Storage is where ARKA stores sealed proof packages.

It is not the primary database.

It stores selected JSON proof packages such as:

```txt
AuditEvent Proof Package
Final Resolution Package
Correction Package
Optional Staff Response Package
Optional Action Timeline Package
```

### 6.6 0G Chain

0G Chain is ARKA’s proof anchor registry.

It does not store full audit data.

It stores compact anchors that point to sealed proof packages:

```txt
case_id / audit_event_id
proof_type
local_package_hash
0g_root_hash / storage_root
previous_proof_hash if correction
registered_by_wallet
registered_at
```

---

## 7. Main Object: AuditEvent

AuditEvent is the central case file.

It explains:

```txt
what business event happened,
what physical movement happened,
how expected and actual compare,
whether the difference is acceptable,
what evidence supports the conclusion,
and what action should happen next.
```

AuditEvent is used by:

```txt
Dashboard
OpenClaw
Telegram
0G proof layer
future pattern analyzer
README/demo video
```

Important distinction:

```txt
AuditEvent = final truth object of one reconciliation loop.
Case resolution = later owner/auditor decision.
```

Case resolution happens through:

```txt
OpenClaw / Dashboard action
CaseNote
ActionLog
StaffClarificationRequest
ProofRecord
Final Resolution Package
```

---

## 8. AuditEvent Case Types

### 8.1 ORDER_LINKED_AUDIT

Used when there is a POS/order.

Example:

```txt
Order: 3 Protein Shakes
Expected: 90g whey
Actual: 160g whey OUT
Result: Usage above expected range
```

This is the strongest demo case because it compares:

```txt
business intent vs physical reality
```

### 8.2 MOVEMENT_ONLY_AUDIT

Used when inventory moves without a matching POS/order.

Examples:

```txt
Staff takes item for customer inspection.
Item is returned.
Net movement = 0.
Result: Clear.
```

or:

```txt
Whey container drops by 60g.
No POS order found.
No return.
Result: Review needed.
```

Movement-only does not automatically mean bad.

---

## 9. Canonical Status and Enums

### 9.1 AuditEvent.status

```txt
CLEAR
REVIEW_NEEDED
UNMATCHED_MOVEMENT
OVER_EXPECTED_USAGE
UNDER_EXPECTED_USAGE
MISSING_MOVEMENT
APPROVED_EXCEPTION
```

### 9.2 Severity

```txt
NORMAL
MINOR_VARIANCE
MODERATE_VARIANCE
SIGNIFICANT_VARIANCE
CRITICAL_REVIEW
```

Default thresholds:

```txt
0–5%       NORMAL
>5–7%      MINOR_VARIANCE
>7–10%     MODERATE_VARIANCE
>10–20%    SIGNIFICANT_VARIANCE
>20%       CRITICAL_REVIEW
```

### 9.3 OpenClaw.triageOutcome

```txt
AUTO_CLEAR
SILENT_LOG
REQUEST_EXPLANATION
ESCALATE
```

### 9.4 auditProofStatus

```txt
LOCAL_ONLY
STORED_ON_0G
REGISTERED_ON_CHAIN
VERIFIED
```

### 9.5 storage_status

```txt
NOT_STARTED
PENDING_UPLOAD
STORED
FAILED_TO_STORE
RETRY_PENDING
```

### 9.6 chain_status

```txt
NOT_REGISTERED
PENDING_REGISTRATION
REGISTERED
FAILED_TO_REGISTER
ANCHOR_CONFIRMED
```

Important:

```txt
FAILED_TO_STORE and FAILED_TO_REGISTER are operational states.
They do not delete or invalidate the AuditEvent.
```

---

## 10. MVP Demo World

MVP uses one representative demo world:

```txt
Business: Small protein bar / F&B shop
Core item: Whey Protein
Main product: Protein Shake
Usage rule: 1 Protein Shake = 30g Whey Protein
Inventory signal: weight movement simulator
Main proof path: AuditEvent → 0G Storage → 0G Chain
Main agent path: AuditEvent → OpenClaw → Telegram / Dashboard
```

MVP should be scenario-card driven.

Do not build a full free-form POS/inventory editor first.

---

## 11. MVP Scenario Cards

### Required P0 Scenario Cards

```txt
State A — CLEAR
State C — REQUEST_EXPLANATION
State D — ESCALATE
```

### Optional / Best-if-time Scenario Cards

```txt
State B — SILENT_LOG
State E — MOVEMENT_ONLY_CLEAR
```

---

### 11.1 State A — CLEAR

```txt
Order: 3 Protein Shakes
Expected: 90g whey
Actual: 90g whey OUT
Result: CLEAR / NORMAL
OpenClaw: AUTO_CLEAR
No owner alert
```

Purpose:

```txt
Show ARKA does not panic when expected and actual match.
```

---

### 11.2 State B — SILENT_LOG

```txt
Order: 3 Protein Shakes
Expected: 90g whey
Actual: 96g whey OUT
Difference: +6g
Variance: 6.67%
Result: OVER_EXPECTED_USAGE / MINOR_VARIANCE
OpenClaw: SILENT_LOG
No immediate owner alert
```

Purpose:

```txt
Show ARKA can reduce owner noise.
```

---

### 11.3 State C — REQUEST_EXPLANATION

```txt
Order: 3 Protein Shakes
Expected: 90g whey
Actual: 99g whey OUT
Difference: +9g
Variance: 10%
Result: OVER_EXPECTED_USAGE / MODERATE_VARIANCE
OpenClaw: REQUEST_EXPLANATION
Owner approval required before staff message
```

Purpose:

```txt
Show business intent vs physical reality mismatch.
Show OpenClaw as triage layer.
Show owner approval before staff message.
```

---

### 11.4 State D — ESCALATE

```txt
Order: 3 Protein Shakes
Expected: 90g whey
Actual: 160g whey OUT
Difference: +70g
Result: OVER_EXPECTED_USAGE / CRITICAL_REVIEW
OpenClaw: ESCALATE
Owner alert sent or shown
```

Purpose:

```txt
Show ARKA can interrupt owner when meaningful.
```

---

### 11.5 State E — MOVEMENT_ONLY_CLEAR

```txt
Item: Spark Plug
Movement: 1 item OUT / 120g
Return: 1 item IN / 120g
POS: none
Net movement: 0
Result: MOVEMENT_ONLY_AUDIT / CLEAR
OpenClaw: AUTO_CLEAR
No owner alert
```

Purpose:

```txt
Show movement-only does not automatically mean bad.
```

---

## 12. MVP Proof Requirement

State C and State D should both attempt the proof path.

Minimum MVP success:

```txt
At least one important case, State C or State D, completes real 0G Storage upload.
At least one important case, State C or State D, completes real 0G Chain anchor.
Both C and D must still show proof status, including failure/retry state if proof integration fails.
```

Do not require both C and D to succeed on 0G as a hard blocker.

---

## 13. MVP Interface Definition of Done

MVP interface is ready when:

```txt
User can run State A, C, and D from the dashboard.
Dashboard creates or displays Order, Movement, and AuditEvent data.
AuditEvent detail explains expected vs actual.
OpenClaw triage outcome is visible.
State C or D creates an AuditEvent Proof Package.
0G Storage proof status is visible.
0G Chain registration status is visible.
Owner alert/recommendation is visible through Telegram or dashboard simulation.
README / real-vs-simulated clearly states what is real and what is simulated.
```

Best MVP if time:

```txt
State B implemented.
State E implemented.
Real Telegram owner alert works.
Final Resolution Package works.
Verify proof action works.
```

---

## 14. P0 Feature Scope

### 14.1 Order Simulator

Build:

```txt
scenario-generated demo order
product quantity
cashier
order done / audit window closed
expected usage display
```

Do not build:

```txt
real payment
customer management
full POS checkout
receipt system
```

---

### 14.2 Usage Rule / Recipe

Build:

```txt
Protein Shake = 30g Whey Protein
expected usage calculation
countable-item support conceptually in shared types if easy
```

Do not build:

```txt
full recipe editor
inventory costing
supplier management
```

---

### 14.3 Inventory Movement Simulator

Build:

```txt
scenario-generated movement events
OUT / RETURN movement support
handler
container/rack
before/after quantity
movement amount
evidence window
```

Do not build:

```txt
warehouse management
stocktake
sensor calibration UI
complex manual inventory editor
```

---

### 14.4 Usage Batch

Build only if needed for core logic:

```txt
minimal conceptual support
no heavy UI
```

Better if time:

```txt
Usage batch scenario card
```

Do not block MVP on UsageBatch UI.

---

### 14.5 Reconciliation Engine

Build:

```txt
expected vs actual comparison
variance calculation
status calculation
severity calculation
case type handling
```

This is a core MVP requirement.

---

### 14.6 AuditEvent Generator

Build:

```txt
ORDER_LINKED_AUDIT
MOVEMENT_ONLY_AUDIT if State E implemented
AuditEvent summary
raw object references
recommended action
proof status
```

This is the center of ARKA.

---

### 14.7 OpenClaw Triage Layer

Build:

```txt
deterministic policy first
AUTO_CLEAR
SILENT_LOG
REQUEST_EXPLANATION
ESCALATE
CaseNote / ActionLog hooks
```

Do not require full OpenClaw runtime or LLM integration for MVP.

---

### 14.8 Telegram Conversation Flow

Build:

```txt
owner alert or dashboard-simulated alert
owner approval preview
staff message preview
ActionLog / CaseNote recording
```

P1:

```txt
real owner/staff Telegram role demo
staff reply lifecycle
```

Do not block core proof demo on Telegram.

---

### 14.9 Dashboard / Audit Arena

Build:

```txt
scenario runner
order panel
movement panel
AuditEvent list
AuditEvent detail
OpenClaw / Telegram panel
proof panel
```

Do not build full admin dashboard first.

---

### 14.10 0G Storage Proof Package

Build:

```txt
AuditEvent Proof Package builder
canonical local_package_hash
0G Storage upload path
ProofRecord update
failure/retry status display
```

Better if time:

```txt
Final Resolution Package
Staff Response Package
verification action
```

---

### 14.11 0G Chain Proof Registry

Build:

```txt
AuditProofRegistry.sol
AUDIT_EVENT_CREATED anchor
ProofRegistered event
chain tx hash storage
chain_status update
```

Better if time:

```txt
FINAL_RESOLUTION anchor
CORRECTION_APPENDED anchor
```

---

### 14.12 Demo Video + README

Build after the P0 loop works.

README must explain:

```txt
what ARKA is
what problem it solves
architecture
how to run demo
what is real vs simulated
0G Storage usage
0G Chain usage
contract address / tx if available
AI attribution
```

Demo video should show:

```txt
scenario run
AuditEvent reasoning
OpenClaw triage
proof package / 0G root
chain anchor / tx
real-vs-simulated honesty
```

---

## 15. P1 Roadmap

P1 features are valuable, but must not block P0.

### 15.1 Real Hardware Input

```txt
Read weight or scanner data from hardware.
Use hardware as alternate source for InventoryMovement.
```

### 15.2 CCTV Evidence Window / Clip Reference

```txt
Store timestamp / clip reference metadata.
Do not upload raw CCTV to 0G in MVP.
```

### 15.3 Landing Page

```txt
Explain problem, solution, architecture, demo, and 0G usage.
```

### 15.4 Pattern Summary Lite

```txt
Simple repeated-pattern query over recent AuditEvents.
Example: Joni has 3 whey overuse cases today.
```

### 15.5 Telegram Role Demo Mode

```txt
Prepared owner/staff demo identities.
Judges should not need shared account credentials.
Dashboard can remain fallback.
```

### 15.6 Staff Reply Lifecycle

```txt
Staff replies to OpenClaw.
OpenClaw summarizes response.
Owner decides final action.
```

### 15.7 Final Resolution Flow

```txt
Owner final decision.
Final Resolution Package.
Optional FINAL_RESOLUTION chain anchor.
```

---

## 16. P2 / Future Roadmap

### 16.1 YOLO / Vision Summary

Future only.

Use vision model to summarize evidence clips or still frames.

Do not block MVP.

### 16.2 0G Compute

Future only.

Potential future use:

```txt
verifiable AI inference
agent reasoning
vision summary
pattern analysis
```

### 16.3 iNFT

Future only.

Potential future use:

```txt
ownable/upgradable ARKA agent
embedded memory / intelligence
agent monetization
```

### 16.4 Multi-Agent Swarm

Future only.

Possible roles:

```txt
planner
reconciler
critic
owner assistant
compliance reviewer
```

Not MVP.

### 16.5 CCTV Auto-Clip System

Future only.

Potential flow:

```txt
AuditEvent evidence window
↓
auto-find clip
↓
clip reference shown in dashboard
↓
optional vision summary
```

Not MVP.

---

## 17. What We Intentionally Do Not Build Yet

```txt
Full POS
ERP
Warehouse management
Full inventory admin
Real payment
Complex auth
Complex permissions
Full CCTV AI
Raw CCTV upload to 0G
Automatic staff punishment
Legal accusation workflow
Full policy editor
Multi-branch operations
Supplier/restock workflows
```

---

## 18. Expansion Strategy

ARKA should expand by adding new scenario cards and integrations, not by becoming a bloated ERP.

Expansion should follow this order:

```txt
1. More scenario cards
2. More proof package types
3. Real data sources
4. Better OpenClaw conversation
5. Pattern summaries
6. Hardware / CCTV metadata
7. 0G Compute / iNFT / swarm experiments
```

Every expansion must pass the anti-bloat test:

```txt
Does this help create, explain, triage, prove, or review an AuditEvent?
```

If not, cut it.

---

## 19. Current Technical Stack Direction

Recommended stack:

```txt
Frontend: Next.js App Router + React + Tailwind + shadcn/ui
Backend: Next.js Route Handlers inside apps/web
Database: Postgres
ORM: Drizzle ORM
Core logic: pure TypeScript in packages/core
Contracts: Solidity AuditProofRegistry
0G Storage: 0G TypeScript SDK, CLI fallback
0G Chain: Hardhat deploy/test, viem or ethers for backend calls
Telegram: grammY
OpenClaw / LLM: OpenClaw sidecar gateway + ARKA skill/plugin when verified; packages/agent fallback/client boundary
Testing: Vitest + Hardhat tests + manual demo verification
Deployment: Vercel + hosted Postgres + 0G testnet + Telegram webhook
```

Important implementation posture:

```txt
Build packages/core first.
Do not let Telegram block proof demo.
Do not let 0G instability delete AuditEvents.
Do not build P1/P2 before A/C/D work end-to-end.
```

---

## 20. Project Phases

### Phase 0 — Planning

Status: mostly complete.

Includes:

```txt
Backend brief
Database brief
OpenClaw brief
0G Storage brief
0G Chain brief
Demo Scenario brief
MVP Demo Interaction brief
Technical Stack brief
AGENTS.md
real-vs-simulated tracking
AI attribution
```

### Phase 1 — Core MVP Implementation

```txt
Repo scaffold
shared enums/types
core logic
seed scenarios A/C/D
AuditEvent generation
dashboard scenario runner
AuditEvent list/detail
OpenClaw deterministic fallback triage
```

### Phase 2 — Proof MVP

```txt
AuditEvent Proof Package builder
0G Storage upload
AuditProofRegistry contract
0G Chain registration
Proof panel
```

### Phase 3 — Communication MVP

```txt
OpenClaw / Telegram panel
owner alert or simulated owner alert
ActionLog / CaseNote recording
```

### Phase 4 — Demo Packaging

```txt
README
demo video
real-vs-simulated update
contract address / proof root / tx links
submission checklist
```

### Phase 5 — P1 Enhancements

```txt
real Telegram role demo
State B/E
Final Resolution Package
Pattern summary lite
CCTV clip reference metadata
landing page
hardware input
```

### Phase 6 — Future Experiments

```txt
YOLO / vision summary
0G Compute
iNFT
multi-agent swarm
CCTV auto-clip system
```

---

## 21. Final Vision

ARKA begins as a proof-of-future hackathon MVP.

The MVP proves that:

```txt
business intent can be compared with physical inventory movement,
AI can triage operational evidence without becoming the final judge,
important cases can be sealed to decentralized storage,
and proof anchors can make case history harder to silently rewrite.
```

Long term, ARKA can become:

```txt
a visible audit assistant for small and multi-branch businesses,
a bridge between real-world operations and verifiable AI decisions,
a proof layer for inventory-sensitive workflows,
and an example of blockchain being useful beyond payments.
```

Final product philosophy:

> **ARKA is not here to accuse people. ARKA is here to make operational truth easier to see, explain, and prove.**
