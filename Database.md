# ARKA Database Brief — Final Review Draft

## 0. Positioning

Database ARKA bukan ERP, bukan warehouse management, bukan full POS database, dan bukan CCTV/video archive.

Database ARKA adalah **operational evidence layer** untuk membuat, menjelaskan, menindaklanjuti, dan membuktikan AuditEvent.

Anchor utama:

> **Local DB stores operational evidence. 0G stores sealed proof packages. 0G Chain stores proof anchors.**

Backend tetap bertugas sebagai:

> **AuditEvent generator.**

Database harus mendukung backend untuk menjawab:

```txt
What was expected to happen?
What physically happened?
Was the difference acceptable?
What evidence supports that conclusion?
What actions happened after the case was created?
Can the case be verified later?
```

---

## 1. Core Database Principle

Semua data yang disimpan harus membantu salah satu dari ini:

```txt
1. Create AuditEvent
2. Explain AuditEvent
3. Triage AuditEvent through OpenClaw
4. Prove AuditEvent through 0G / Chain
5. Review AuditEvent through Dashboard
```

Anti-bloat test:

```txt
Does this help create, explain, triage, or prove an AuditEvent?
```

If no, cut or move to future.

---

## 2. Local DB vs 0G vs Chain

### 2.1 Local DB

Local DB is the fast operational memory.

Used for:

```txt
- active operations
- POS/order simulation
- inventory movement tracking
- usage batch state
- AuditEvent generation
- OpenClaw reads/writes
- dashboard queries
- staff clarification flow
- proof metadata copy
```

Local DB is where ARKA works in real time.

---

### 2.2 0G Storage / Data Layer

0G Storage stores sealed proof packages.

Used for:

```txt
- AuditEvent proof package
- action proof package
- staff response package
- owner decision package
- final resolution package
- correction package
- selected action timeline snapshot
```

0G Storage is not the hot-path database.

It stores selected snapshots/packages that need to be verifiable later.

---

### 2.3 0G Chain

0G Chain is the proof registry.

Used for compact anchors:

```txt
- audit_event_id / case_id
- proof_type
- proof_hash
- 0G storage URI
- previous_proof_hash if correction/update
- actor role
- timestamp
```

0G Chain should not store raw operational data, private chat, full video, or full POS/movement records.

---

## 3. Agent Read Strategy

OpenClaw should read local DB first.

Default read path:

```txt
OpenClaw reads local AuditEvent
↓
OpenClaw sees proof status and last verified time
↓
If owner asks for verification, OpenClaw triggers verifyProofOnChain
↓
Local proof metadata updates last_verified_at
```

Do not make every OpenClaw query read chain first.

Reason:

```txt
Local DB = fast
0G/Chain = proof layer
Chain read = external dependency
```

OpenClaw can say:

```txt
Proof status: registered on-chain.
Last verified: 2026-04-28 14:20.
```

or:

```txt
Proof status: local only.
This case has not been sealed to 0G yet.
```

---

## 4. P0 Local Data Objects

These are the minimum local data objects ARKA needs for MVP.

---

### 4.1 Actor / User

Represents people involved in the audit flow.

Roles:

```txt
OWNER
STAFF / HANDLER
CASHIER
MANAGER
OPENCLAW_AGENT
SYSTEM
```

Purpose:

```txt
- identify cashier
- identify handler
- identify owner decision
- identify staff explanation
- identify who performed an action
```

MVP note:

```txt
Owner, cashier, and handler are enough.
Manager workflow can be later.
```

---

### 4.2 Product / Menu

Represents what is sold/requested in POS/order simulator.

Purpose:

```txt
- source of business intent
- needed to create order
- links to UsageRule
```

Example:

```txt
Protein Shake
Ayam Goreng
Nasi Goreng Ayam
Lampu Philips
Spark Plug
```

---

### 4.3 InventoryItem

Represents physical item/bahan/barang being tracked.

Purpose:

```txt
- source of physical inventory identity
- connects sensor/container/rack to item
- supports consumable and countable inventory
```

Must support:

```txt
- item name
- unit: g / ml / pcs
- current stock concept
- container/rack ID
- sensor ID
- tracking mode: consumable / countable
- unit weight for countable items
- value category: low value / high value
```

Example:

```txt
Whey Protein = consumable, grams
Chicken Breast = consumable, grams
Lampu Philips = countable, pcs, 15g each
Spark Plug = countable, pcs, 120g each
```

---

### 4.4 UsageRule / Recipe

Connects product/menu to expected inventory movement.

Purpose:

```txt
Product sold → expected physical movement
```

Examples:

```txt
Protein Shake = 30g whey
Ayam Goreng = 100g chicken breast
Nasi Goreng Ayam = 20g chicken breast
Lampu Philips = 1 pcs lamp = 15g
```

For countable inventory:

```txt
expected_weight = expected_unit_count × unit_weight
```

---

### 4.5 Order

Represents POS/order simulator output.

Purpose:

```txt
- source of business intent
- generates expected usage
- starts order-first audit lifecycle
```

Needs to capture:

```txt
- what was ordered
- quantity
- cashier
- created time
- done/completed status
- direct-out or service-window mode
```

MVP note:

```txt
This is not full POS production system.
It only needs enough to generate expected usage.
```

---

### 4.6 InventoryMovement

Represents raw physical movement.

Purpose:

```txt
- source of physical reality
- creates movement-only AuditEvent
- feeds order-based reconciliation
- opens or updates UsageBatch
```

Needs to capture:

```txt
- item moved
- quantity before
- quantity after
- movement amount
- movement type: OUT / RETURN / WASTE / ADJUSTMENT
- handler
- container/rack ID
- movement time
- evidence window
```

Important:

```txt
Raw InventoryMovement stays in local DB.
Selected movement snapshot can be included in 0G proof package.
Chain stores only hash/URI anchor.
```

---

### 4.7 UsageBatch

Represents bulk inventory taken out before being fully matched to POS orders.

Purpose:

```txt
- prevent false alerts in F&B
- allow bulk ingredients to be consumed across multiple orders
```

Example:

```txt
500g chicken OUT
5 Ayam Goreng sold
Expected usage = 500g
Batch remaining = 0g
Status: Clear
```

Needs to capture conceptually:

```txt
- item
- handler
- quantity taken out
- quantity consumed by POS
- quantity returned
- remaining quantity
- opened time
- closed time
- status
```

---

### 4.8 AuditEvent

The central case file.

Purpose:

```txt
- final truth object of one audit loop
- consumed by OpenClaw, Dashboard, Telegram, and 0G proof layer
```

Types:

```txt
ORDER_LINKED_AUDIT
MOVEMENT_ONLY_AUDIT
```

Stores summary + references:

```txt
- case type
- related order IDs
- related movement IDs
- related usage batch IDs
- expected quantity
- actual quantity
- variance
- slippage rate
- direction: overuse / underuse / unmatched / match
- status
- severity
- handler
- cashier if available
- evidence window
- evidence completeness
- recommended action
- audit proof status
```

Important rule:

```txt
AuditEvent should be self-contained enough for OpenClaw to explain it,
but raw details stay in source objects.
```

---

### 4.9 CaseNote

A note attached to an AuditEvent.

Purpose:

```txt
- owner note
- staff explanation
- OpenClaw reasoning note
- correction note
```

Example:

```txt
Staff says the 60g whey movement was a customer sample.
```

CaseNote is important because not every explanation should mutate the AuditEvent itself.

---

### 4.10 ActionLog

Records actions taken around an AuditEvent.

Purpose:

```txt
- make OpenClaw/owner/staff actions auditable
- support append-only accountability
- support future proof package timeline
```

Examples:

```txt
- OpenClaw recommended explanation request
- owner approved staff message
- staff replied
- OpenClaw forwarded summary
- owner marked silent log
- owner finalized decision
```

---

### 4.11 StaffClarificationRequest

Tracks explanation request lifecycle.

Purpose:

```txt
- manage owner-approved staff clarification flow
- track reminders and timeout
```

Lifecycle:

```txt
REQUESTED
REMINDED
RESPONDED
TIMEOUT
ESCALATED
```

Default timeout:

```txt
3 working days without explanation → escalate
```

---

### 4.12 OwnerPolicy

Stores owner-configurable preferences later.

Purpose:

```txt
- decide auto clear / silent log / request explanation / escalate
```

Possible policy settings:

```txt
- severity threshold for alert
- timeout duration
- auto-clear low-risk cases
- staff messaging approval requirement
- sample/demo tolerance policy
- high-value item sensitivity
```

For MVP:

```txt
Hardcode default owner policy.
Do not build policy UI.
```

---

### 4.13 ProofRecord

Local copy of 0G/chain proof metadata.

Purpose:

```txt
- show proof status fast
- avoid reading chain for every query
- allow OpenClaw to report last verified state
```

Stores conceptually:

```txt
- related AuditEvent / action / package
- proof type
- proof status
- proof hash
- 0G storage URI
- chain tx hash
- registered time
- last verified time
- verification status
- previous proof hash if correction
```

Proof statuses:

```txt
LOCAL_ONLY
STORED_ON_0G
REGISTERED_ON_CHAIN
VERIFIED
```

---

## 5. P1 / Later Data Objects

These are useful but not core MVP.

```txt
ManagerApproval
PatternFlag 
DailyReportSnapshot
RevenueMatchRecord
CCTVClipReference
EvidenceAccessGrant
Branch / Multi-branch hierarchy
SupplierRestock
Stocktake
SensorCalibration
```

Note:

PatternFlag is later, but simple repeated-pattern checks can exist in MVP as dynamic queries over recent AuditEvents and ActionLogs.

Some may be simulated or represented lightly for demo, but should not expand MVP into ERP.

Note:

DailyReportSnapshot being later does not mean daily report is later.

Daily report is P0 as an OpenClaw feature, but it can be generated dynamically from existing AuditEvents and ActionLogs during MVP.

---

## 6. Conceptual Relationships

### 6.1 Product → UsageRule → InventoryItem

```txt
Product/Menu
   ↓ uses
UsageRule
   ↓ references
InventoryItem
```

Example:

```txt
Ayam Goreng
   ↓ uses
100g chicken breast
   ↓ references
Chicken Breast inventory item
```

---

### 6.2 Order → Expected Usage → AuditEvent

```txt
Order
   ↓ generates
Expected Usage
   ↓ compared with
InventoryMovement / UsageBatch
   ↓ creates
AuditEvent
```

Order creates the business expectation.

---

### 6.3 InventoryMovement → UsageBatch / AuditEvent

```txt
InventoryMovement
   ↓ may open/update
UsageBatch
   ↓ may create
AuditEvent
```

Movement can start the audit loop if there is no POS yet.

---

### 6.4 AuditEvent → Notes / Actions / Proof

```txt
AuditEvent
   ↓ has many
CaseNotes
ActionLogs
StaffClarificationRequests
ProofRecords
```

AuditEvent is the case.  
CaseNotes and ActionLogs are the discussion/action timeline around the case.

---

### 6.5 OpenClaw → AuditEvent

```txt
OpenClaw reads:
- AuditEvent
- CaseNote
- ActionLog
- OwnerPolicy
- ProofRecord

OpenClaw writes:
- CaseNote
- ActionLog
- StaffClarificationRequest
- recommended action
```

OpenClaw should not directly rewrite:

```txt
- Order
- UsageRule
- InventoryMovement
- raw proof history
```

---

## 7. AuditEvent vs Raw Data

### 7.1 Raw Data

Raw data lives in source objects:

```txt
Order
InventoryMovement
UsageBatch
CaseNote
ActionLog
StaffClarificationRequest
```

Raw data is detailed operational evidence.

---

### 7.2 AuditEvent

AuditEvent stores:

```txt
- summary
- result
- status
- severity
- references to raw data
- evidence completeness
- recommended action
- proof status
```

AuditEvent must be readable by OpenClaw without needing to reconstruct everything from scratch.

---

### 7.3 Proof Package

Proof package stores selected snapshots of raw data + AuditEvent summary.

This prevents raw local data from being silently rewritten without proof history.

---

## 8. Proof Package Options

### Option A — Minimal Proof Package

Fastest for demo.

Contains:

```txt
- audit_event_id
- case_type
- status
- severity
- expected vs actual summary
- variance / slippage
- handler / cashier
- evidence window
- related object IDs
- OpenClaw summary
- timestamp
```

Pros:

```txt
simple
fast
safe for demo
```

Cons:

```txt
less complete as evidence package
```

---

### Option B — Complete Case Proof Package

Recommended for ARKA MVP.

Contains:

```txt
- AuditEvent snapshot
- related POS/order snapshot
- related InventoryMovement snapshot
- UsageRule snapshot
- UsageBatch snapshot if any
- CaseNotes included at sealing time
- ActionLogs included at sealing time
- StaffClarificationRequest status if any
- OpenClaw reasoning summary
- evidence window metadata
- previous proof hash if this is a correction/update
```

Pros:

```txt
stronger evidence story
better for 0G demo
more aligned with visible accountable agent narrative
```

Cons:

```txt
slightly more work than minimal package
```

---

### Option C — Timeline Proof Package

Best for owner/staff back-and-forth cases.

Contains timeline:

```txt
1. AuditEvent created
2. OpenClaw recommended action
3. Owner approved staff clarification
4. Staff replied
5. OpenClaw summarized response
6. Owner marked silent log / review / escalate
7. Final resolution
```

Pros:

```txt
best accountability narrative
```

Cons:

```txt
can become complex if we try to proof every message
```

---

### Recommended Proof Package Strategy

For MVP/demo:

```txt
Use Option B for AuditEvent proof.
Use lightweight Option C for final case resolution timeline.
```

Do not put every draft/chat message on-chain.

---

## 9. What Gets Stored Where

### 9.1 Local Only

```txt
- drafts
- temporary OpenClaw conversation state
- raw operational working data
- pending owner message preview
- unsent staff message draft
```

Editable until sent/finalized.

---

### 9.2 Local + 0G

```txt
- AuditEvent proof package
- staff response package
- owner decision package
- action timeline snapshot
- correction package
```

0G is for sealed evidence packages.

---

### 9.3 Local + 0G + Chain

```txt
- important AuditEvent proof anchor
- final owner decision
- case resolution
- correction after finalization
```

Chain stores compact proof anchor only.

---

## 10. Which Events Need Proof?

### For demo

```txt
All demo AuditEvents can be proofed.
```

Because demo volume is small and 0G visibility matters.

---

### For production

Recommended rule:

```txt
All AuditEvents are stored locally.
Review-needed / important AuditEvents are stored to 0G.
Final decisions are registered on-chain.
Critical corrections are registered on-chain.
```

This avoids chain spam while preserving accountability.

---

## 11. Proof Lifecycle

### 11.1 Draft

```txt
Draft message/action exists locally.
Can be edited or cancelled.
No proof needed.
```

---

### 11.2 Sent / Submitted

```txt
Message/action has been sent to another party.
No silent edit allowed.
If changed, append correction.
```

Can be stored to 0G if important.

---

### 11.3 Case Resolved

```txt
Owner/auditor makes final decision through OpenClaw or Dashboard.
Final resolution package is created.
Package is stored to 0G.
Hash/URI is registered on-chain.
```

---

### 11.4 Correction Appended

```txt
If something changes after being sent/final/sealed:
- create correction package
- reference previous proof hash
- store correction to 0G
- register correction anchor on-chain if important/final
```

Principle:

> Never rewrite history. Append corrections.

---

## 12. Recommended On-Chain Milestones

Milestone means important lifecycle moment worth anchoring on-chain.

Do not anchor every chat/draft.

Recommended MVP milestones:

```txt
1. AUDIT_EVENT_CREATED
   When a review-needed or demo AuditEvent is created.

2. STAFF_RESPONSE_SUBMITTED
   Optional for demo, useful if showing staff dispute/clarification.

3. OWNER_DECISION_FINALIZED
   When owner/auditor makes final decision.

4. CASE_RESOLVED
   When the case is closed.

5. CORRECTION_APPENDED
   When something changes after finalization/sealing.
```

Recommended MVP demo flow:

```txt
AuditEvent proof → chain
Staff response → 0G only
Final resolution → chain
```

This shows accountability without turning every conversation into a chain transaction.

---

## 13. Smart Contract Role

For MVP, use one contract conceptually:

```txt
AuditProofRegistry
```

It registers proof entries with different proof types:

```txt
AUDIT_EVENT_CREATED
ACTION_SUBMITTED
STAFF_RESPONSE_SUBMITTED
OWNER_DECISION_FINALIZED
CASE_RESOLVED
CORRECTION_APPENDED
```

Contract role:

```txt
- store proof hash
- store 0G URI
- store proof type
- store actor role
- store timestamp
- link to previous proof hash when correction/update exists
```

Do not create multiple contracts for MVP.

Later possible split:

```txt
AuditProofRegistry
CaseResolutionRegistry
AccessPolicyRegistry
```

But not now.

---

## 14. Owner ↔ Staff Back-and-Forth Model

Do not put every back-and-forth chat directly on-chain.

Flow:

```txt
1. OpenClaw drafts message to staff
   → local only

2. Owner confirms send
   → ActionLog created locally
   → optional 0G action package

3. Staff replies
   → local first
   → 0G package if submitted/final

4. OpenClaw summarizes to owner
   → CaseNote / ActionLog

5. Owner makes final decision
   → Final Resolution Package
   → 0G Storage
   → Chain anchor
```

Rule:

```txt
Drafts are editable.
Sent/final messages are append-only.
Corrections become new entries.
```

---

## 15. Evidence Access Policy

Access policy concept:

```txt
Owner: full case
Staff: case summary involving them
Manager: branch case
Public: future only
```

For MVP:

```txt
Owner only, with optional staff evidence summary.
```

Video/raw CCTV:

```txt
Raw video stays Web2/local.
Proof package may include timestamp/clip reference.
```

Do not store raw video on-chain.

---

## 16. What OpenClaw Reads/Writes

Important rule:

AuditEvent is OpenClaw’s primary object.

Related objects are accessed only as summaries/references through controlled backend tools.

OpenClaw should not reconstruct truth directly from raw database tables.
It should start from AuditEvent, then request supporting summaries only when needed.

Clarification:

```txt
AuditEvent.status = business/reconciliation result (what happened)
OpenClaw.triageOutcome = OpenClaw decision on what to do next
caseResolutionStatus = final owner/auditor decision after OpenClaw/Dashboard actions
```

```txt
OpenClaw must not overwrite AuditEvent.status, expected quantity, actual quantity, variance, severity, or related evidence references.

OpenClaw only writes:
* triageOutcome
* CaseNote
* ActionLog
* StaffClarificationRequest
* caseResolutionStatus / resolution recommendation
```
### Reads

```txt
AuditEvent
InventoryMovement summary
Order summary
UsageBatch summary
CaseNotes
ActionLogs
OwnerPolicy
ProofRecord
RecentSimilarCases
```

### Writes

```txt
CaseNote
ActionLog
StaffClarificationRequest
triageOutcome
caseResolutionStatus / resolution recommendation
```

### Does Not Write

```txt
POS order
raw inventory movement
usage rule
proof history rewrite
punishment/payroll
```

OpenClaw can trigger proof actions later, but proof lifecycle should remain controlled by backend/proof layer.

---

## 17. MVP Database Scope

P0 data objects:

```txt
1. Actor / User
2. Product / Menu
3. InventoryItem
4. UsageRule / Recipe
5. Order
6. InventoryMovement
7. UsageBatch
8. AuditEvent
9. CaseNote
10. ActionLog
11. StaffClarificationRequest
12. OwnerPolicy default
13. ProofRecord
```

This is enough to support:

```txt
- POS/order simulation
- inventory movement simulation
- batch usage
- reconciliation
- AuditEvent creation
- OpenClaw triage
- Telegram owner/staff conversation
- 0G proof package
- chain proof registry
```

---

## 18. What Stays Out of MVP

Do not build full modules for:

```txt
- full ERP inventory
- warehouse management
- multi-branch hierarchy
- real payment
- full HR/staff discipline
- full manager approval workflow
- supplier reconciliation
- stock opname
- complete CCTV archive
- public evidence portal
- complex permission management
```

These can be future concepts, not MVP data architecture.

---

## 19. Final Database Anchor

```txt
Local DB = operational evidence.
0G Storage = sealed proof packages.
0G Chain = proof anchors.
```

Database ARKA exists to support:

```txt
AuditEvent creation
AuditEvent explanation
OpenClaw triage
Dashboard investigation
0G proof
Append-only accountability
```

Final phrasing:

> **ARKA database is not an ERP database. It is an operational evidence layer for creating, resolving, and proving AuditEvents.**
