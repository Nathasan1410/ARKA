## 0. Purpose

This brief defines how the MVP demo should behave from the user’s perspective.

Goal:

```txt
Reach MVP state by integrating frontend, simulator, AuditEvent generation, OpenClaw/Telegram flow, and 0G proof status.
```

This is not an implementation plan yet.

This brief answers:

```txt
What does the user click?
What data is created?
What AuditEvent appears?
What does the dashboard show?
What does OpenClaw/Telegram do?
What proof state is visible?
How can this expand later without rebuilding the product?
```

Final anchor:

> **MVP frontend should feel like one connected audit loop, not separate disconnected tools.**

---

## 1. Product Boundary

ARKA MVP is not a full POS.

ARKA MVP is not a full inventory app.

ARKA MVP is not ERP.

ARKA MVP frontend exists to demonstrate one thing:

```txt
Business intent + physical movement → AuditEvent → triage → proof
```

So the frontend must prioritize:

```txt
scenario execution
AuditEvent visibility
OpenClaw decision visibility
proof status visibility
```

Do not prioritize:

```txt
full admin settings
real payments
customer management
stocktaking
supplier management
complex auth
multi-branch permissions
```

---

## 2. MVP Interaction Strategy

The MVP should be **scenario-card driven**, not fully free-form.

Instead of building a complete POS and inventory system, the frontend should provide prebuilt scenario cards:

P0 requires State A, State C, and State D. State B and State E are optional / best-if-time and must not block MVP.

```txt
State A — CLEAR
State B — SILENT_LOG
State C — REQUEST_EXPLANATION
State D — ESCALATE
State E — MOVEMENT_ONLY_CLEAR if time
```

Each scenario card should generate controlled demo data.

This keeps the demo:

```txt
fast
repeatable
judge-friendly
less fake-feeling
safe from accidental edge-case bugs
```

Later, scenario cards can expand into configurable simulators.

MVP rule:

> **Start with scenario cards. Add editable fields only if the core flow is already working.**

---

## 3. Demo World

The MVP uses one representative business world.

```txt
Business: Small protein bar / F&B shop
Core item: Whey Protein
Main product: Protein Shake
Usage rule: 1 Protein Shake = 30g Whey Protein
Inventory signal: weight movement simulator
Main proof path: AuditEvent → 0G Storage → 0G Chain
Main agent path: AuditEvent → OpenClaw → Telegram / Dashboard
```

This should be shown clearly in the UI so judges understand the scenario immediately.

---

## 4. MVP Screens

The frontend should have one main Dashboard / Audit Arena area with sections, not many disconnected apps.

Minimum screens / panels:

```txt
1. Scenario Runner
2. Order Simulator Panel
3. Inventory Movement Simulator Panel
4. AuditEvent List
5. AuditEvent Detail
6. OpenClaw / Telegram Panel
7. Proof Panel
```

These can live on one page for MVP.

Recommended route:

```txt
/dashboard
```

Optional later route:

```txt
/
```

for landing page.

---

## 5. Scenario Runner Panel

Purpose:

```txt
Let the demo operator trigger controlled ARKA states.
```

Scenario buttons:

P0 buttons: State A, State C, State D. Do not make State B/State E blockers.

```txt
Run State A — Clear
Run State B — Silent Log
Run State C — Request Explanation
Run State D — Escalate
Run State E — Movement Only Clear if implemented
```

Each scenario should show:

```txt
scenario name
expected outcome
whether proof path will run
whether Telegram/OpenClaw action will run
```

Example card:

```txt
State C — Request Explanation
3 Protein Shakes
Expected: 90g whey
Actual: 99g whey
Variance: 10%
Expected result: OVER_EXPECTED_USAGE / Moderate Variance
OpenClaw: REQUEST_EXPLANATION
Proof: 0G Storage + 0G Chain
```

MVP behavior:

```txt
Click scenario
↓
Create order/movement data
↓
Run reconciliation
↓
Create AuditEvent
↓
Display result
```

Better if time:

```txt
Allow user to edit actual movement before running.
```

But editable input is optional.

---

## 6. Order Simulator Panel

Purpose:

```txt
Show business intent.
```

For MVP, this does not need to be a full POS.

Minimum display:

```txt
Order ID
Product: Protein Shake
Quantity: 3
Cashier: Nina
Order status: Created / Done
Expected usage: 90g Whey Protein
Audit window: generated timestamp window
```

Minimum actions:

```txt
Create demo order
Mark order done / close audit window
```

Scenario-driven behavior:

```txt
State A/B/C/D automatically creates 3 Protein Shakes.
State E does not create POS order.
```

Expansion path:

```txt
Add editable quantity.
Add more products.
Add direct-out mode.
Add countable retail item order.
```

MVP warning:

> Do not build full POS checkout.

---

## 7. Inventory Movement Simulator Panel

Purpose:

```txt
Show physical reality.
```

Minimum display:

```txt
Movement ID
Item: Whey Protein
Container: RACK-WHEY-01
Handler: Joni
Movement type: OUT / RETURN
Before quantity
After quantity
Movement amount
Movement time
Evidence window
```

Scenario-driven movement values:

```txt
State A: 90g OUT
State B: 96g OUT
State C: 99g OUT
State D: 160g OUT
State E: Spark Plug 1 item OUT + 1 item RETURN
```

Minimum actions:

```txt
Trigger movement
Trigger return if scenario supports it
```

Expansion path:

```txt
Manual amount input
Multiple movement events
Usage batch movement
Missing handler case
Sample/demo movement
CCTV clip reference metadata
Real hardware input
```

MVP warning:

> Movement simulator is not warehouse management. It exists to create physical evidence for AuditEvent.

---

## 8. Reconciliation Trigger

Purpose:

```txt
Convert order + usage rule + movement into AuditEvent.
```

MVP action:

```txt
Run Reconciliation
```

What happens:

```txt
1. Read order if present.
2. Read expected usage from usage rule.
3. Read movement events.
4. Calculate expected vs actual.
5. Calculate variance.
6. Determine AuditEvent.status.
7. Determine severity.
8. Create AuditEvent.
9. If scenario requires proof, create AuditEvent Proof Package.
10. Start 0G Storage / 0G Chain proof attempt if enabled.
11. Trigger OpenClaw triage from AuditEvent.
12. Dashboard updates proof and triage status as results arrive.
```

Note:

```txt
AuditEvent Proof Package creation must not depend on OpenClaw already running.
OpenClaw reads AuditEvent and proof metadata after the AuditEvent exists.
```

For demo simplicity:

```txt
Scenario button can run all steps automatically.
```

But UI should still show the steps so the judge sees the logic.

---

## 9. AuditEvent List

Purpose:

```txt
Show case history and make ARKA feel like an audit system.
```

Minimum columns:

```txt
Case ID
Scenario
Status
Severity
Handler
Triage Outcome
Proof Status
Created At
```

Example rows:

```txt
CASE-001 | State A | CLEAR | Normal | Joni | AUTO_CLEAR | LOCAL_ONLY
CASE-002 | State C | OVER_EXPECTED_USAGE | Moderate | Joni | REQUEST_EXPLANATION | REGISTERED_ON_CHAIN
CASE-003 | State D | OVER_EXPECTED_USAGE | Critical | Joni | ESCALATE | REGISTERED_ON_CHAIN
```

Row click opens AuditEvent Detail.

Expansion path:

```txt
filter by handler
filter by severity
filter by status
filter by proof status
pattern-lite count
```

---

## 10. AuditEvent Detail

Purpose:

```txt
Explain what ARKA saw, compared, and concluded.
```

Minimum sections:

```txt
Case Summary
Expected vs Actual
Business Context
Physical Movement
People Context
Evidence Window
OpenClaw Recommendation
Proof Status
```

Minimum fields:

```txt
AuditEvent ID
Case type
Status
Severity
Expected quantity
Actual quantity
Difference
Variance percentage
Order summary
Movement summary
Handler
Cashier
Evidence window
Recommended action
Audit proof status
```

Important UI principle:

> The detail page should answer: “Why did ARKA flag or clear this case?”

Avoid accusatory labels.

Use:

```txt
Needs review
Usage above expected range
Movement without matching sale
Explanation requested
Proof package created
```

Do not use:

```txt
Theft detected
Fraud
Culprit
Guilty
```

---

## 11. OpenClaw / Telegram Panel

Purpose:

```txt
Show ARKA as a visible triage assistant.
```

This panel can show either real Telegram events or simulated Telegram preview depending on implementation status.

P0 required panel states:

```txt
No action needed
Silent log
Owner alert pending
Owner approval needed
Staff message preview
ActionLog / CaseNote recorded
```

Better if time:

```txt
Staff reply received
Owner final decision pending
Final decision recorded
```

---

### 11.1 State A — Clear

```txt
OpenClaw:
Usage looks normal.
No owner alert sent.
Case added to history.
```

Action:

```txt
setTriageAutoClear
```

---

### 11.2 State B — Silent Log

```txt
OpenClaw:
Minor variance detected.
This is below immediate alert threshold.
I will include it in dashboard history / daily summary.
```

Action:

```txt
setTriageSilentLog
```

---

### 11.3 State C — Request Explanation

Owner message:

```txt
ARKA created a review case.

Case:
3 Protein Shakes expected 90g whey.
Sensor movement recorded 99g whey.
Difference: +9g above expected range.
Handler: Joni.
Evidence window: 15:54–15:59.

Recommended action:
Ask Joni for explanation.

Options:
1. Approve explanation request
2. Silent log
3. Open dashboard
```

After owner approval:

```txt
Message preview to Joni:
ARKA needs clarification for an inventory review case.
Item: Whey Protein
Expected: 90g
Movement recorded: 99g
Window: 15:54–15:59
Please explain what happened.

Confirm send?
```

MVP actions:

```txt
Owner approves explanation request
OpenClaw records ActionLog
Staff reply can be simulated or real
```

---

### 11.4 State D — Escalate

Owner message:

```txt
Critical review case detected.

Expected: 90g Whey Protein
Actual: 160g movement
Difference: +70g
Handler: Joni
Evidence window: 15:54–15:59
Proof status: stored on 0G / registered on-chain if available

Recommended action:
Review immediately or request explanation.
```

MVP actions:

```txt
sendOwnerAlert or simulated alert
record ActionLog
show dashboard link / case detail
```

---

## 12. Telegram Real vs Simulated Rule

Telegram must not block the core proof demo.

Target:

```txt
Telegram owner alert = REAL if stable
Telegram staff reply = optional
Dashboard Telegram preview = fallback
```

If Telegram is not stable:

```txt
Mark Telegram as PARTIAL/SIMULATED.
Use the dashboard OpenClaw panel to show the conversation state.
```

If Telegram is stable:

```txt
Owner alert should be sent through Telegram.
Owner approval can be captured through Telegram button/reply or dashboard button.
Staff reply can be real only if time allows.
```

Do not make 0G proof upload or chain registration block Telegram response.

---

## 13. Proof Panel

Purpose:

```txt
Show that important AuditEvents can be sealed and anchored.
```

Minimum fields:

```txt
Audit Proof Status
Proof Type
Local Package Hash
0G Root Hash
0G Storage Reference / URI if available
Chain Status
Chain Tx Hash
Registered At
Last Verified At
Verify Action
```

Minimum proof behavior:

```txt
State C and State D should both attempt the proof path.
State A, B, and E can stay local or be proofed if easy.
```

Minimum MVP success:

```txt
- at least one important case, State C or State D, completes real 0G Storage upload
- at least one important case completes real 0G Chain anchor registration
- both states must still show proof status, including failure/retry state if proof integration fails
```

Proof status display (separate lifecycle vs operational states):

```txt
Audit Proof Status:
- LOCAL_ONLY
- STORED_ON_0G
- REGISTERED_ON_CHAIN
- VERIFIED

Storage Status:
- NOT_STARTED
- PENDING_UPLOAD
- STORED
- FAILED_TO_STORE
- RETRY_PENDING

Chain Status:
- NOT_REGISTERED
- PENDING_REGISTRATION
- REGISTERED
- FAILED_TO_REGISTER
- ANCHOR_CONFIRMED
```

MVP note:

```txt
FAILED_TO_STORE and FAILED_TO_REGISTER are operational states, not AuditEvent business statuses.
They should not delete or invalidate the AuditEvent.
```

---

## 14. Frontend Flow Per Scenario

### 14.1 State A — Clear

```txt
Click Run State A
↓
Order created: 3 Protein Shakes
↓
Movement created: 90g Whey OUT
↓
Reconciliation runs
↓
AuditEvent created: CLEAR / Normal
↓
OpenClaw triage: AUTO_CLEAR
↓
Dashboard shows case in history
↓
No owner alert
```

---

### 14.2 State B — Silent Log

```txt
Click Run State B
↓
Order created: 3 Protein Shakes
↓
Movement created: 96g Whey OUT
↓
Reconciliation runs
↓
AuditEvent created: OVER_EXPECTED_USAGE / Minor Variance
↓
OpenClaw triage: SILENT_LOG
↓
Dashboard shows case in history
↓
No immediate owner alert
```

---

### 14.3 State C — Request Explanation

```txt
Click Run State C
↓
Order created: 3 Protein Shakes
↓
Movement created: 99g Whey OUT
↓
Reconciliation runs
↓
AuditEvent created: OVER_EXPECTED_USAGE / Moderate Variance
↓
OpenClaw triage: REQUEST_EXPLANATION
↓
AuditEvent Proof Package created
↓
0G Storage upload attempted
↓
0G Chain anchor attempted
↓
Owner message shown/sent
↓
Owner approves explanation request
↓
ActionLog / CaseNote recorded
```

---

### 14.4 State D — Escalate

```txt
Click Run State D
↓
Order created: 3 Protein Shakes
↓
Movement created: 160g Whey OUT
↓
Reconciliation runs
↓
AuditEvent created: OVER_EXPECTED_USAGE / Critical Review
↓
OpenClaw triage: ESCALATE
↓
AuditEvent Proof Package created
↓
0G Storage upload attempted
↓
0G Chain anchor attempted
↓
Owner alert shown/sent
↓
Dashboard proof panel shows status
```

---

### 14.5 State E — Movement Only Clear

```txt
Click Run State E
↓
Movement created: Spark Plug OUT
↓
Return created: Spark Plug IN
↓
Reconciliation runs without POS
↓
AuditEvent created: MOVEMENT_ONLY_AUDIT / CLEAR
↓
OpenClaw triage: AUTO_CLEAR
↓
Dashboard shows no owner panic
```

State E is optional for MVP.

---

## 15. Expansion Without Rebuild

The MVP should be built so expansion means adding scenario cards, not rewriting the product.

Future scenario cards:

```txt
Sample/demo movement explained
Staff does not reply after timeout
Missing handler
Usage batch clear
Usage batch unexplained remainder
Countable retail item extra movement
Repeated low-severity pattern from same handler
CCTV clip reference available
Real hardware input
```

Frontend should support expansion through:

```txt
scenario configuration object
shared AuditEvent detail view
shared proof panel
shared OpenClaw panel
shared simulator event model
```

Do not create separate custom UI for every scenario.

---

## 16. Implementation Boundary

This brief does not define:

```txt
database schema
API route names
React component tree
Solidity contract details
0G SDK method names
Telegram bot command names
```

Those belong in implementation plan.

This brief only defines MVP interaction behavior.

### 16.1 Canonical Enums (Docs-Only)

These enums are the canonical reference for MVP planning. Do not invent new variants without updating docs.

AuditEvent.status:

```txt
CLEAR
REVIEW_NEEDED
UNMATCHED_MOVEMENT
OVER_EXPECTED_USAGE
UNDER_EXPECTED_USAGE
MISSING_MOVEMENT
APPROVED_EXCEPTION
```

severity:

```txt
NORMAL
MINOR_VARIANCE
MODERATE_VARIANCE
SIGNIFICANT_VARIANCE
CRITICAL_REVIEW
```

OpenClaw.triageOutcome:

```txt
AUTO_CLEAR
SILENT_LOG
REQUEST_EXPLANATION
ESCALATE
```

auditProofStatus:

```txt
LOCAL_ONLY
STORED_ON_0G
REGISTERED_ON_CHAIN
VERIFIED
```

storage_status:

```txt
NOT_STARTED
PENDING_UPLOAD
STORED
FAILED_TO_STORE
RETRY_PENDING
```

chain_status:

```txt
NOT_REGISTERED
PENDING_REGISTRATION
REGISTERED
FAILED_TO_REGISTER
ANCHOR_CONFIRMED
```

---

## 17. MVP Definition of Done

The MVP demo interaction is ready when:

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

## 18. Final Anchor

```txt
Order Simulator
↓
Inventory Movement Simulator
↓
Reconciliation
↓
AuditEvent
↓
OpenClaw triage
↓
Dashboard + Telegram
↓
0G Storage + 0G Chain proof status
```

Final phrasing:

> **ARKA MVP frontend is a scenario-driven Audit Arena: it lets judges run controlled business/physical movement cases, see the AuditEvent reasoning, watch OpenClaw triage the case, and inspect the proof path and verify it if implemented without turning the product into full POS or ERP.**
