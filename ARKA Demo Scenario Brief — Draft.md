## 0. Goal

MVP demo scenario harus minimal, tapi tidak shallow.

Kita tidak akan bikin banyak business vertical.

Kita akan bikin **one representative demo world** dengan beberapa controlled case states.

Demo world:

```txt
Small protein bar / F&B shop
Core item: Whey Protein
Main product: Protein Shake
Main inventory signal: weight movement simulator
Main proof path: AuditEvent → 0G Storage → 0G Chain
Main agent path: AuditEvent → OpenClaw → Telegram / Dashboard
```

Reason:

```txt
F&B/protein bar directly matches ARKA origin story.
Whey is high-value enough to justify review.
Weight movement is easy to simulate.
Usage rule is simple.
AuditEvent states are easy to explain.
0G proof flow is easy to show.
```

---

## 1. Demo Philosophy

Do not build 10 unrelated scenarios.

Build one scenario harness that can generate several AuditEvent states.

This gives us:

```txt
minimal product surface
clear demo story
multiple ARKA states
expandability
less fake-feeling simulation
```

The MVP should show:

```txt
1. Normal sale can clear.
2. Small variance can be silently logged.
3. High-value unexplained movement can request explanation.
4. Critical variance can escalate.
5. Returned item / net zero movement does not cause panic.
6. Proof package can be sealed to 0G Storage.
7. Important proof can be anchored to 0G Chain.
```

---

## 2. Core Demo Objects

### 2.1 Actor Seed Data

```txt
Owner: Arka Owner
Cashier: Nina
Handler: Joni
System Agent: OpenClaw / ARKA Agent
```

### 2.2 Inventory Items

```txt
Whey Protein
unit: gram
value category: HIGH_VALUE
container/rack: RACK-WHEY-01
tracking mode: consumable

Spark Plug / Sample Item
unit: pcs
data unit weight: 120g per item
value category: HIGH_VALUE
container/rack: RACK-SPARK-01
tracking mode: countable
```

MVP can focus only on Whey Protein first.  
Spark Plug / returned item case is optional if time allows.

### 2.3 Product / Menu

```txt
Protein Shake
price: demo value
usage rule: 30g whey per serving
```

### 2.4 Usage Rule

```txt
1 Protein Shake = 30g Whey Protein
Tolerance: use backend default variance rules
```

---

## 3. Core Demo Flow

```txt
Admin setup
↓
Create Product: Protein Shake
↓
Create Inventory Item: Whey Protein
↓
Define Usage Rule: Protein Shake = 30g whey
↓
Cashier creates POS order
↓
Simulator creates inventory movement
↓
Order marked done / audit window closed
↓
Reconciliation runs
↓
AuditEvent created
↓
OpenClaw triages AuditEvent
↓
Dashboard displays case
↓
Proof package stored on 0G Storage
↓
Important case anchored on 0G Chain
↓
Owner receives Telegram/OpenClaw flow if needed
```

---

## 4. MVP State Matrix

Instead of many business scenarios, build these state cards.

Each card uses the same system and same data model.

---

### State A — CLEAR / Normal Usage

Purpose:

```txt
Show ARKA does not panic when expected and actual match.
```

Inputs:

```txt
Order: 3 Protein Shakes
Expected whey: 90g
Actual movement: 90g OUT
Handler: Joni
Cashier: Nina
```

Expected result:

```txt
AuditEvent.status = CLEAR
severity = Normal
OpenClaw.triageOutcome = AUTO_CLEAR
No immediate owner alert
Case appears in dashboard history
```

Proof:

```txt
Optional for demo.
Can stay local or be stored to 0G if we want to show all demo events proofed.
```

---

### State B — SILENT_LOG / Small Variance

Purpose:

```txt
Show ARKA can reduce owner noise.
```

Inputs:

```txt
Order: 3 Protein Shakes
Expected whey: 90g
Actual movement: 96g OUT
Difference: +6g
Variance: 6.67%
```

Expected result:

```txt
AuditEvent.status = OVER_EXPECTED_USAGE
severity = Minor Variance
OpenClaw.triageOutcome = SILENT_LOG
No immediate owner alert
Included in daily summary / dashboard history
```

Proof:

```txt
Optional.
Not necessary to anchor on-chain for demo unless showing all events.
```

---

### State C — REQUEST_EXPLANATION / High-Value Unexplained Movement

Purpose:

```txt
Main ARKA story.
Show business intent vs physical reality mismatch.
Show OpenClaw as Layer-1 conversational triage.
Show owner approval before staff message.
```

Inputs:

```txt
Order: 3 Protein Shakes
Expected whey: 90g
Actual movement: 99g OUT
Difference: +9g
Variance: 10%
Handler: Joni
Cashier: Nina
No return recorded
No approved sample note
Item: HIGH_VALUE
```

Expected result:

```txt
AuditEvent.status = OVER_EXPECTED_USAGE
severity = Moderate Variance
OpenClaw.triageOutcome = REQUEST_EXPLANATION
Owner approval required before staff message
```

OpenClaw owner message:

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

Proof:

```txt
AuditEvent Proof Package stored on 0G Storage.
0G Chain anchor registered for AUDIT_EVENT_CREATED.
```

---

### State D — ESCALATE / Critical Review

Purpose:

```txt
Show ARKA can interrupt owner when meaningful.
```

Inputs:

```txt
Order: 3 Protein Shakes
Expected whey: 90g
Actual movement: 160g OUT
Difference: +70g
Handler: Joni
No return recorded
No matching explanation
Item: HIGH_VALUE
```

Note:
Missing handler is an expansion card, not part of the primary State D demo.
Do not mix missing-handler escalation with critical-overuse escalation in the same state.

Expected result:

```txt
AuditEvent.status = OVER_EXPECTED_USAGE
severity = Critical Review
OpenClaw.triageOutcome = ESCALATE
Owner alert sent
Dashboard case link shown
```

OpenClaw owner message:

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

Proof:

```txt
Required for minimum proof demo:
- AuditEvent Proof Package stored on 0G Storage
- AUDIT_EVENT_CREATED anchor registered on 0G Chain

Better if time:
- Final Resolution Package created after owner decision
- FINAL_RESOLUTION anchor registered on 0G Chain
```

---

### State E — MOVEMENT_ONLY_CLEAR / Item Returned

Purpose:

```txt
Show movement-only does not automatically mean bad.
Show net movement = 0 can clear.
```

Inputs:

```txt
Item: Spark Plug
Movement: 1 item OUT / 120g
Return: 1 item IN / 120g
POS: none
Handler: Joni
```

Expected result:

```txt
AuditEvent.type = MOVEMENT_ONLY_AUDIT
net movement = 0
AuditEvent.status = CLEAR
OpenClaw.triageOutcome = AUTO_CLEAR
No owner alert
```

Proof:

```txt
Optional.
This case is mainly for explaining correctness and avoiding false panic.
```

MVP priority:

```txt
Optional if time allows.
Keep this as backup/demo expansion.
```

---

## Proof Priority Rule for Scenario Cards

For demo:

```txt
All scenario cards can create local AuditEvents.
State C and State D must go through the full proof path:
AuditEvent Proof Package â†’ 0G Storage â†’ 0G Chain anchor.

State A, State B, and State E may stay local or be stored to 0G if implementation is easy.
They do not need chain anchors unless we choose to show all demo events proofed.

Reason:

The proof demo should be deep for important cases, not shallow for every state.
```

---

## 5. What Is Truly P0?

P0 does not need every state fully automated.

True P0 should implement at least:

```txt
State A — CLEAR
State C or D — REVIEW / ESCALATE with proof flow
```

Best P0 if time:

```txt
State A — CLEAR
State B — SILENT_LOG
State C — REQUEST_EXPLANATION
State D — ESCALATE
State E — MOVEMENT_ONLY_CLEAR
```

But if time is tight:

```txt
Build State C/D deeply before building many shallow states.
```

Reason:

```txt
A shallow simulator with many fake states is weaker than one strong end-to-end case.
```

---

## 6. Minimum End-to-End Demo Path

The minimum demo path should prove the full ARKA loop:

```txt
1. Create order: 3 Protein Shakes
2. Generate expected usage: 90g whey
3. Trigger movement: 99g or 160g whey OUT
4. Run reconciliation
5. Create AuditEvent
6. Display AuditEvent in Dashboard
7. OpenClaw triages the case
8. Owner receives Telegram/OpenClaw alert or recommendation
9. Backend creates AuditEvent Proof Package
10. Store package on 0G Storage
11. Register proof anchor on 0G Chain
12. Show proof status in Dashboard/OpenClaw
13. Owner finalizes decision
14. Create Final Resolution Package if implemented
```

This is the demo spine.

Everything else is expansion.

---

## 7. What Dashboard Must Show for MVP

Minimum dashboard views:

```txt
1. Simulator controls
   - Create order
   - Trigger movement
   - Run reconciliation

2. AuditEvent list
   - case ID
   - status
   - severity
   - handler
   - proof status

3. AuditEvent detail
   - expected vs actual
   - variance
   - item
   - order summary
   - movement summary
   - evidence window
   - OpenClaw recommendation

4. Proof panel
   - local package hash
   - 0G root hash
   - chain tx hash / registration status
   - verify status

5. OpenClaw action panel
   - triage outcome
   - owner recommendation
   - Telegram preview / simulated chat state
```

---

## 8. Telegram / OpenClaw MVP

Telegram can be real or partially simulated, but must be honest.

Minimum useful flow:

```txt
OpenClaw sends owner alert/recommendation.
Owner approves explanation request or final decision.
OpenClaw records ActionLog / CaseNote.
```

Staff reply can be:

```txt
P0 optional
simulated in dashboard if Telegram setup is too slow
real if Telegram bot is ready
```

Do not block core proof demo on staff Telegram reply.

---

## 9. 0G Proof MVP

Minimum proof path:

```txt
AuditEvent Proof Package → 0G Storage
AuditEvent proof anchor → 0G Chain
```

Better if time:

```txt
Final Resolution Package → 0G Storage
Final Resolution proof anchor → 0G Chain
```

Optional:

```txt
Staff Response Package → 0G Storage
Staff response anchor → only if really needed
```

Do not register every chat message on-chain.

---

## 10. What Is Real vs Simulated

Must be tracked honestly.

Suggested MVP truthfulness target:

```txt
Order simulator = REAL within demo system
Inventory movement simulator = REAL within demo system
Reconciliation Engine = REAL
AuditEvent Generator = REAL
OpenClaw triage policy = REAL rule-based + optional LLM summary
Telegram owner alert = REAL if bot works, otherwise PARTIAL/SIMULATED
0G Storage upload = REAL target
0G Chain registry = REAL target
Hardware input = SIMULATED or OPTIONAL
CCTV clip = METADATA ONLY
YOLO = PLANNED / FUTURE
0G Compute = PLANNED / FUTURE
```

---

## 11. Expansion Path

After MVP, expand by adding more scenario cards, not new product modules.

Expansion cards:

```txt
- Sample/demo movement explained
- Staff does not reply after timeout
- Missing handler
- Usage batch clear
- Usage batch unexplained remainder
- Countable retail item extra movement
- Repeated low-severity pattern from same handler
- CCTV clip reference available
```

This keeps ARKA focused while showing depth.

---

## 12. Final Recommendation

Build one representative demo world:

```txt
Protein bar / F&B shop
Whey Protein
Protein Shake
Weight movement simulator
OpenClaw owner flow
0G proof package + chain anchor
```

Implement enough scenario cards to show ARKA states:

```txt
CLEAR
SILENT_LOG
REQUEST_EXPLANATION
ESCALATE
MOVEMENT_ONLY_CLEAR if time
```

But prioritize one deep end-to-end path:

```txt
Order → Expected Usage → Movement → Reconciliation → AuditEvent → OpenClaw → 0G Storage → 0G Chain → Dashboard proof view
```

Final anchor:

> **MVP should feel small, but not shallow: one business world, one proof loop, multiple AuditEvent states.**
