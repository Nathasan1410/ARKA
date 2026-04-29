# ARKA Backend Brief — Updated MVP

## 0. Positioning

Backend ARKA tugasnya:

> Mengubah **POS order + usage rule + inventory movement** menjadi **AuditEvent** yang bisa dibaca Dashboard, OpenClaw, Telegram, dan 0G.

OpenClaw research impact:

```txt
OpenClaw is a sidecar gateway/runtime/plugin/skills system.
Backend should expose controlled AuditEvent context to OpenClaw later, but must not depend on OpenClaw to create AuditEvents.
packages/agent deterministic fallback can be used when OpenClaw gateway/plugin is unavailable.
```

Backend ARKA harus menjawab satu pertanyaan utama:

> **Can we prove what happened between a business transaction and physical inventory movement?**

ARKA backend bukan ERP, bukan warehouse management, bukan full POS production system, bukan CCTV AI system.

> **ARKA backend MVP is an AuditEvent generator.**

It receives:

* order data
* usage rule data
* inventory movement data

It produces:

* an AuditEvent that explains whether physical usage matches expected business activity.

---

## 1. Backend MVP Principles

### Rule #1 — Backend tidak perlu ngerti semua industri

Backend cuma perlu ngerti pola universal:

```txt
Something was expected to happen.
Something physically happened.
Was the difference acceptable?
```

Mau F&B, apotek, bengkel, toko lampu, gudang, semuanya bisa masuk ke pola ini.

---

### Rule #2 — Tangkap 4 sumber kebenaran saja

Untuk MVP, backend hanya perlu capture:

1. **Order Truth**
   Apa yang diminta / dibeli / dilayani?

2. **Expected Usage Truth**
   Berdasarkan order itu, barang/bahan apa yang seharusnya keluar?

3. **Physical Movement Truth**
   Barang/bahan apa yang benar-benar keluar / balik / berubah?

4. **Audit Truth**
   Apakah expected vs actual cocok?

Kalau empat ini rapi, OpenClaw, Dashboard, Telegram, dan 0G tinggal consume.

OpenClaw consumption rule:

```txt
OpenClaw consumes backend-created AuditEvent.
OpenClaw may append triage/recommendation/action outputs.
OpenClaw must not rewrite expected qty, actual qty, variance, status, severity, or evidence references.
```

---

### Rule #3 — Mulai dari audit lifecycle

ARKA supports two audit lifecycle patterns:

#### A. Order-First Lifecycle

Use when the business event starts from POS/order.

```txt
Order Created
        ↓
Expected Usage Created
        ↓
Inventory Movement Recorded
        ↓
Order Done / Audit Window Closed
        ↓
Reconciliation Run
        ↓
AuditEvent Created
```
Example:

- Retail item sold
- Direct-out product
- Service/menu item processed per order

#### B. Movement-First Lifecycle

Use when physical inventory moves before it can be fully matched to POS/order.

```
Inventory OUT
        ↓
Usage Batch Opened
        ↓
POS Orders Consume Batch
        ↓
Usage Batch / Audit Window Closed
        ↓
Reconciliation Run
        ↓
AuditEvent Created
```
Example:

- F&B staff takes bulk ingredient from storage
- Ingredient is used across multiple orders
- Item is taken out for inspection/demo and later returned

The key rule:

```
For order-based cases, the audit loop starts from Order Created.  
For batch-based or movement-only cases, the audit loop can start from Inventory OUT.
```
Industry bukan cuma beda cara menutup window-nya.  
Industry juga bisa beda dari mana audit loop dimulai.

---

### Rule #4 — Pakai Audit Window, bukan fulfillment system berat

**Audit Window** adalah rentang waktu saat inventory movement dianggap relevan untuk satu order atau satu usage batch.

Ada dua mode utama:

#### Mode A — Service Window

Untuk F&B, bengkel, dapur, servis.

```txt
Order Created
↓
Staff starts processing
↓
Inventory OUT
↓
Order marked DONE
↓
Optional RETURN
↓
Audit Window closes
↓
Reconciliation
```

Example:

* Pesanan protein shake dibuat.
* Whey keluar.
* Staff klik DONE.
* Kalau ada bahan balik, dicatat.
* Reconciliation jalan.

#### Mode B — Direct Out

Untuk apotek, toko lampu, sparepart retail.

```txt
Payment Completed
↓
Item OUT
↓
Order auto-DONE
↓
Reconciliation
```

Example:

* Customer beli 2 lampu Philips.
* Scanner/RFID detect 2 lampu keluar.
* Done.

Backend cukup tahu:

```txt
This order uses SERVICE_WINDOW or DIRECT_OUT.
```

---

### Rule #5 — AuditEvent adalah pusat semuanya

> **AuditEvent will be used by everything.**

Jadi sistem lain jangan baca raw data dulu. Mereka baca AuditEvent.

Yang bakal consume AuditEvent:

* Dashboard
* OpenClaw Agent
* Telegram alert
* 0G proof layer
* Pattern Analyzer later
* Demo video

Backend harus memperlakukan AuditEvent sebagai:

> **Final truth object of one audit loop.**

Important clarification:

AuditEvent is the final truth object of the reconciliation loop, not necessarily the final resolution of the case.

Case resolution happens later through OpenClaw/Dashboard actions, and is recorded through CaseNote, ActionLog, StaffClarificationRequest, ProofRecord, and Final Resolution Package.

Bukan sekadar log.
Bukan sekadar notification.
Dia adalah **case file**.

---

## 2. What Backend MVP Needs to Capture

Untuk MVP, backend perlu capture hal-hal ini saja.

---

### 2.1 Order

Backend perlu tahu:

```txt
Order apa?
Siapa cashier?
Kapan dibuat?
Produk apa saja?
Quantity berapa?
Statusnya apa?
Apakah sudah done?
```

Purpose:

> Ini sumber **business intent**.

---

### 2.2 Product / Menu

Backend perlu tahu:

```txt
Produk/menu apa yang dijual?
Harganya berapa?
Satuan bisnisnya apa?
```

Purpose:

> POS butuh produk untuk bikin order.

---

### 2.3 Usage Rule / Recipe

Usage Rule adalah aturan yang menghubungkan produk yang dijual dengan inventory fisik yang seharusnya berubah.

Backend perlu tahu:

```txt
Kalau produk ini dibuat/dijual, bahan/barang apa yang seharusnya keluar?
Berapa quantity normalnya?
Berapa toleransinya?
Kalau barangnya dihitung pakai berat, berapa berat per unitnya?
```

Ini penting karena ARKA bukan cuma tracking bahan curah seperti whey, ayam, tepung, atau minyak. ARKA juga harus bisa tracking barang satuan seperti lampu, sparepart, obat, busi, filter, dan item retail lain yang jumlahnya bisa dibaca dari berat total.

Example:

```txt
Protein Shake = 30g whey
Ayam Goreng = 100g chicken breast
Nasi Goreng Ayam = 20g chicken breast

Lampu Philips = 1 pcs lamp
1 pcs Lampu Philips = 15g
3 pcs Lampu Philips = 45g
```

Untuk barang satuan, backend bisa translate:

```txt
Expected sold item: 1 lampu
Expected weight out: 15g
```

atau:

```txt
Expected remaining stock: 3 lampu = 45g
Actual remaining weight: 30g
Difference: 15g
Meaning: kemungkinan 1 lampu hilang / tidak tercatat
```

Purpose:

> Ini sumber **expected usage** dan **expected physical quantity**.

Usage Rule harus support dua tipe inventory:

1. **Consumable inventory**
   Contoh: whey, ayam, tepung, minyak.
   Fokus: berapa banyak bahan yang dipakai.

2. **Countable inventory**
   Contoh: lampu, busi, filter, sparepart, obat.
   Fokus: berapa jumlah unit yang tersisa/keluar, bisa dibantu dari berat total.

Rule sederhana:

```txt
expected_weight = expected_unit_count × unit_weight
```

Example:

```txt
POS jual 1 Lampu Philips.
1 lampu = 15g.
Expected inventory drop = 15g.

Kalau sensor detect drop 30g:
Actual = 2 lampu keluar.
Expected = 1 lampu keluar.
Flag: 1 extra lamp unverified.
```

---

### 2.4 Inventory Movement

Backend perlu tahu:

```txt
Barang apa yang keluar?
Berapa banyak?
Kapan?
Dari sensor/scanner/simulator mana?
Siapa handler-nya?
Apakah barang balik?
```

Purpose:

> Ini sumber **physical reality**.

Movement tidak selalu berarti masalah. Movement bisa clear kalau barang balik, atau bisa jadi bagian dari Usage Batch.

---

### 2.5 AuditEvent

Backend perlu tahu hasil akhirnya:

```txt
Expected berapa?
Actual berapa?
Selisih berapa?
Masih masuk tolerance atau tidak?
Overuse atau underuse?
Severity apa?
Perlu alert atau tidak?
Audit proof status apa?
```

Purpose:

> Ini yang dibaca Agent, Dashboard, Telegram, dan 0G.

---

## 3. AuditEvent Definition

AuditEvent adalah:

> **AuditEvent is the central case file that explains what physically happened, what business event it should match, and whether the difference needs review.**  
> **Audit Proof Package is the sealed/verifiable snapshot of that AuditEvent plus selected supporting evidence.**

AuditEvent minimal berisi:

1. **Case Type**
   `ORDER_LINKED_AUDIT` / `MOVEMENT_ONLY_AUDIT`

2. **Business Context**
   POS/order data if available

3. **Physical Movement**
   Before-after quantity/weight, item, container, sensor/source

4. **People Context**
   Cashier if POS exists
   Handler/scanner/person who moved item

5. **Time Context**
   When order happened
   When movement happened
   When order/movement was closed/done

6. **Expected vs Actual**
   Expected usage/quantity if available
   Actual movement
   Difference

7. **Business Analysis**
   Slippage rate
   Direction: over / under / unmatched
   Severity/status in business language

8. **Evidence Package**
   Raw movement reference
   POS reference
   CCTV/evidence window if available
   Audit proof status / 0G reference later

9. **Recommended Action**
   What should owner/manager check next?

---

## 4. AuditEvent Case Types

### 4.1 ORDER_LINKED_AUDIT

Use when there **is a POS/order**.

Includes:

```txt
- POS/order
- expected usage from usage rule / recipe
- inventory movement before-after
- cashier
- handler
- done/completed time
- actual usage
- slippage rate
- evidence window
- final business analysis
```

Example:

```txt
POS says:
3 Protein Shakes sold.

Expected:
90g whey.

Actual movement:
160g whey removed.

Result:
Usage exceeded expected range.
Needs review.
```

This is the strongest case because ARKA can compare **business intent vs physical reality**.

---

### 4.2 MOVEMENT_ONLY_AUDIT

Use when there is **inventory movement but no matching POS/order yet**.

This is not weaker. This is important because movement can happen without immediate sale.

Includes:

```txt
- inventory movement before-after
- item/container
- handler/scanner
- movement time
- whether the item was returned or not
- business analysis
- recommended action
```

Optional/system-generated:

```txt
- nearby POS result
- active usage batch
- return movement
- matching POS orders
```

Nearby POS should **not** be a minimum input. It is only needed if the movement creates unexplained loss or needs matching context.

Handler should be captured whenever possible.
For MVP demo, normal scenarios include handler.
If handler is missing, create AuditEvent anyway and mark evidence completeness lower.
Missing handler can trigger Review Needed or Escalate.

#### Example 1 — Movement without return

```txt
Whey container dropped by 60g.
No POS order found within the audit window.
Handler: Staff A.
Result: Unmatched inventory movement.
Needs review.
```

#### Example 2 — Customer inspected item, then returned it

```txt
Customer asks to see a spark plug.
Staff takes 1 spark plug from shelf.
No POS order is created.
Spark plug is returned to shelf within the audit window.

Inventory OUT: 1 pcs / 120g
Inventory RETURN: 1 pcs / 120g
Net movement: 0 pcs / 0g

Result: Clear.
Reason: Item was returned and no net inventory loss was detected.
```

Movement-only audit can result in either:

```txt
CLEAR
```

or:

```txt
REVIEW_NEEDED
```

depending on whether the movement is explainable and whether there is net inventory loss.

---

## 5. Minimum Inputs to Create AuditEvent

### 5.1 MOVEMENT_ONLY_AUDIT minimum input

```txt
1. Item moved
2. Quantity before
3. Quantity after
4. Movement amount
5. Time happened
6. Container/rack ID
7. Evidence window
8. Handler
```

Handler should be required if possible, because if something is missing, someone needs to be responsible for explaining the movement.

Optional/system-generated:

```txt
- nearby POS result
- active usage batch
- return movement
- matching POS orders
```

---

### 5.2 ORDER_LINKED_AUDIT minimum input

```txt
1. POS/order
2. Usage rule/recipe
3. Inventory movement OR active usage batch
4. Audit window
5. Same movement fields as Movement-Only Audit (1-8)
```

---

## 6. Matching Window

For both AuditEvent case types, ARKA needs a **matching window**.

Example:

```txt
Movement start at 15:03.
Movement ended at 15:09.
Search POS from 14:58–15:14.
```

Because physical movement and POS are not always at the exact same second.

AuditEvent should include:

```txt
matching_window_start
matching_window_end
```

Without this, Agent/Dashboard cannot explain why ARKA says “no matching POS.”

---

## 7. Evidence Completeness

Evidence completeness is not AI confidence. It means how complete the case evidence is.

Example:

```txt
Evidence completeness:
- POS found: yes
- inventory movement found: yes
- handler known: yes
- CCTV window available: yes
- audit proof status: local only
```

This helps ARKA be honest.

Instead of saying:

```txt
This is definitely suspicious.
```

It can say:

```txt
This case has strong evidence because POS, movement, handler, and timestamp are all available.
```

Or:

```txt
This case needs review because movement was detected, but handler identity is missing.
```

### Audit Proof Status

Audit proof means the verifiable/sealed version of the AuditEvent case file.

It does **not** mean proof that someone stole.

It means:

> Proof that this AuditEvent existed at this time, with these inputs, this analysis, and this evidence reference.

Suggested statuses:

```txt
LOCAL_ONLY
STORED_ON_0G
REGISTERED_ON_CHAIN
VERIFIED
```

Simple meaning:

```txt
AuditEvent = the case file.
Audit Proof Package = sealed/verifiable version of the case file.
0G Storage = where the sealed case file is stored.
0G Chain = where the fingerprint/hash of the case file is registered.
```

---

## 8. Movement-Only Audit Logic

Movement without POS is not automatically bad.
```
Possible explanations for movement-only cases:
- sample
- demo
- customer tasting
- staff checking stock
- item inspection
- waste
- mistake
- unauthorized usage
- approved exception
```
Basic rule:

```txt
If net movement = 0
→ Clear

If net movement > 0 loss
→ Try to match with POS / usage rule / active batch

If no explanation found
→ Review Needed
```

Flow:

```txt
Movement happened
↓
Was the item returned?
↓
If yes and net loss = 0 → Clear
↓
If no or partial return → check whether movement can be explained
↓
If explained → Clear / In Use
↓
If unexplained → Review Needed
```

---

## 9. Usage Batch

F&B has an important behavior:

```txt
Staff takes 500g chicken from storage.
They use it across multiple orders.
They take more when it runs out.
```

So backend cannot force every inventory movement to match exactly one POS order.

### Definition

> **A Usage Batch represents inventory that was taken out before being fully matched to POS orders.**

It prevents ARKA from falsely flagging normal F&B prep behavior, where staff takes a bulk amount of ingredient and uses it across multiple orders.

This is not warehouse management.
This is not full fulfillment.
This is only a temporary pool of physical inventory that is expected to be consumed by POS orders.

---

### Usage Batch Flow

```txt
Inventory OUT
↓
Open Usage Batch
↓
POS orders consume expected usage from batch
↓
When batch reaches 0 or closes
↓
Reconciliation runs
↓
AuditEvent created
```

Important rule:

> **Movement without immediate POS is not automatically bad. It can become an active usage batch waiting to be explained.**

---

### Usage Batch Examples

#### Case A — Clear

```txt
500g chicken OUT
5 Ayam Goreng sold
Expected usage = 500g
Batch remaining = 0g

Status: Clear
```

#### Case B — Overuse / Missing Explanation

```txt
500g chicken OUT
Only 3 Ayam Goreng sold
Expected usage = 300g
No return recorded
Remaining unexplained = 200g

Status: Review Needed
Reason: 200g chicken was not matched to POS or return.
```

#### Case C — Partial Return Clear

```txt
500g chicken OUT
3 Ayam Goreng sold
Expected usage = 300g
200g returned

Net usage = 300g
Status: Clear
```

#### Case D — More POS than batch

```txt
500g chicken OUT
6 Ayam Goreng sold
Expected usage = 600g

Status: Review Needed
Reason: POS expected 600g but only 500g movement was recorded.
Possible missing movement event or under-portioning.
```

---

## 10. Reconciliation Modes

ARKA backend needs two reconciliation modes.

### Mode 1 — Order-Based Reconciliation

For direct items / simple orders.

```txt
Order → Expected Usage → Movement → AuditEvent
```

Example:

```txt
POS sells 1 lamp.
Expected movement = 1 lamp / 15g.
Actual movement = 1 lamp / 15g.
Clear.
```

---

### Mode 2 — Batch-Based Reconciliation

For F&B / ingredients used across multiple orders.

```txt
Inventory OUT → Usage Batch → POS orders consume batch → Batch closes → AuditEvent
```

Example:

```txt
500g chicken OUT.
Orders consume 500g over time.
Clear.
```

---

## 11. Status and Severity Language

ARKA should avoid overly technical or accusatory language.

Avoid:

```txt
anomaly
theft detected
fraud
culprit found
```

Use business/audit-friendly language.

Use two fields:

```txt
status = what happened
severity = how serious it is
```

Clarification:

```txt
AuditEvent.status = business/reconciliation result (what happened)
OpenClaw.triageOutcome = OpenClaw decision on what to do next
caseResolutionStatus = final owner/auditor decision after OpenClaw/Dashboard actions
```

---

### Status Language  
  
```txt  
CLEAR  
REVIEW_NEEDED  
UNMATCHED_MOVEMENT  
OVER_EXPECTED_USAGE  
UNDER_EXPECTED_USAGE  
MISSING_MOVEMENT  
APPROVED_EXCEPTION
```

Human-friendly display labels:

```txt
CLEAR = Usage looks normal
REVIEW_NEEDED = Needs review
UNMATCHED_MOVEMENT = Movement without matching sale
OVER_EXPECTED_USAGE = Usage above expected range
UNDER_EXPECTED_USAGE = Usage below expected range
MISSING_MOVEMENT = Sale recorded, but no matching inventory movement
APPROVED_EXCEPTION = Explained by approved note
```

---

### Audit Proof Status

Audit proof status is separate from AuditEvent business status.

AuditEvent status explains what happened operationally.  
Audit proof status explains whether the case file has been sealed or verified.

```txt
LOCAL_ONLY
STORED_ON_0G
REGISTERED_ON_CHAIN
VERIFIED
```

Example:

status: OVER_EXPECTED_USAGE  
severity: SIGNIFICANT_VARIANCE  
auditProofStatus: REGISTERED_ON_CHAIN

Reason:

PROOF_REGISTERED is not an inventory/business status.  
It belongs to the proof lifecycle.

Final split:

```txt
status = what happened
severity = how serious
auditProofStatus = proof lifecycle
```
---

### Severity Language

```txt
0–5%
Normal

>5–7%
Minor Variance

>7–10%
Moderate Variance

>10–20%
Significant Variance

>20%
Critical Review
```

This sounds more professional than “slippage alarm.”

Example combinations:

```txt
status: OVER_EXPECTED_USAGE
severity: SIGNIFICANT_VARIANCE

Display:
Usage above expected range — Significant variance
```

```txt
status: UNMATCHED_MOVEMENT
severity: CRITICAL_REVIEW

Display:
Movement without matching sale — Critical review
```

```txt
status: CLEAR
severity: NORMAL

Display:
Usage looks normal
```

Final principle:

> ARKA should not accuse. ARKA should explain evidence and recommend review.

Instead of:

```txt
Employee stole inventory.
```

ARKA says:

```txt
Inventory movement exceeded expected range and no matching sale or exception was found.
```

---

## 12. Blockchain / 0G Rule

For MVP, backend should not think of blockchain as a database.

```txt
Local DB = fast operational memory
0G Storage = audit package memory
0G Chain = proof registry
```

Agent/Dashboard should read local first.

If needed:

```txt
verify proof on-chain
```

Not every query should read chain.

---

## 13. Alert Rule

Alert should not trigger from raw movement directly.

Alert should trigger from AuditEvent.

Correct flow:

```txt
Movement recorded
↓
Reconciliation runs
↓
AuditEvent created
↓
If severity high enough, alert
```

Incorrect flow:

```txt
Movement recorded
↓
Immediately panic
```

Because movement can be normal if there is an order, return, or active usage batch.

---

## 14. Backend Narrative Rule

Backend must support this narrative:

> “We don’t ask the AI to magically know the truth. We give the agent structured evidence: what was sold, what should have been used, what physically moved, and whether the difference is explainable.”

This is important.

If we say:

```txt
AI detects theft
```

It is weak and dangerous.

If we say:

```txt
AI audits structured evidence and explains unverified inventory movement
```

It is stronger, safer, and more professional.

Because ARKA is a visible agent, every AuditEvent should answer:

```txt
What did ARKA see?
What did ARKA compare?
Why did ARKA flag it?
What proof was created?
Can a human verify it? → must be yes
```

ARKA must show:

```txt
raw event
expected usage
actual movement
reasoning summary
proof reference
```

Not black box.

---

## 15. Backend MVP Final Scope

Backend MVP only needs:

```txt
1. Product/menu setup
2. Usage rule/recipe setup
3. POS order creation
4. Inventory movement recording
5. Usage Batch support for bulk F&B usage
6. Reconciliation
7. AuditEvent creation
8. Proof/alert hooks
```

This is still a brainstorm brief, not an implementation spec.

---

## 16. Backend Dataflow

```txt
BACKEND DATAFLOW

SETUP PHASE

Admin creates Product/Menu
Admin creates Inventory Item
Admin defines Usage Rule
- Product X requires Item Y amount Z
- Tolerance is configured per item usage
- Unit weight can be configured for countable inventory


OPERATIONAL LOOP

1. POS Order Created
   Backend records what was sold/requested.

2. Expected Usage Generated
   Backend calculates what inventory should be used based on usage rules.

3. Audit Window Opened
   Backend starts watching relevant inventory movement for this order or usage batch.

4. Inventory Movement Recorded
   Sensor, scanner, simulator, or manual input records what physically moved.

5. Optional Usage Batch Opened
   For bulk ingredient movement, backend opens a temporary usage batch.

6. Order Marked Done / Auto-Done
   For service-based businesses, staff marks order as completed.
   For direct-out businesses, order can auto-complete after payment/item out.

7. Audit Window / Usage Batch Closed
   Backend finalizes the movement window or batch.

8. Reconciliation Runs
   Backend compares expected usage against actual net movement.

9. AuditEvent Created
   Backend creates the case file containing expected, actual, variance, severity, status, evidence completeness, and proof hooks.

10. Downstream Systems React
   OpenClaw reads AuditEvent.
   Dashboard visualizes AuditEvent.
   Telegram sends alert if needed.
   0G stores proof package.
```

---

## 17. What Not to Capture in MVP

These are valid, but not backend MVP:

```txt
Full CCTV processing
YOLO inference
Multi-branch franchise hierarchy
Advanced staff shift scheduling
Manager approval workflow
Supplier reconciliation
Payroll penalty
Consumer QR receipt
Full ERP inventory
Stock opname
Real payment
Complex role management
```

CCTV for now is only:

```txt
evidence window metadata
```

Example:

```txt
Review-needed AuditEvent happened around 15:55–15:58.
Suggested clip window: 15:54–15:59.
```
or
```
Inventory review case happened around 15:55–15:58.
Suggested clip window: 15:54–15:59.
```
Raw video can live in Web2/local. Backend only needs timestamp and clip reference.

---

## 18. Anti-Bloat Rule

Every backend idea must pass this test:

```txt
Does this help create a better AuditEvent?
```

If yes, consider it.

If no, cut it.

Examples:

```txt
Usage Rule? Yes. Needed for expected usage.
Inventory Movement? Yes. Needed for actual usage.
Usage Batch? Yes. Needed to avoid false alerts in F&B.
CCTV timestamp? Maybe. Helpful as evidence metadata.
YOLO? No, not needed for first AuditEvent.
Pattern Analyzer? No, needs many AuditEvents first.
Supplier shortage? No, different flow later.
Multi-branch? No, later.
```

---

## 19. Later Priorities After MVP

After MVP, these become priority:

1. **Pattern Analyzer**
   Used by Dashboard and OpenClaw to detect repeated behavior across AuditEvents.

2. **Daily Report Engine**
   Used by OpenClaw to summarize sales, inventory movement, and review-needed cases.

3. **Revenue Matching**
   Integrasi untuk menghitung apakah pemasukan match dengan POS/order data.

4. **CCTV Auto-Clip System**
   Optional: automatically cut clips based on evidence window.

---

## 20. Final Anchor

Current backend decision:

```txt
ARKA backend MVP is an AuditEvent generator.
```

It receives:

```txt
- order data
- usage rule data
- inventory movement data
- usage batch data if needed
```

It produces:

```txt
- an AuditEvent that explains whether physical usage matches expected business activity.
```

That’s the backend.

Not ERP.
Not full POS.
Not CCTV AI.
Not warehouse management.

> **AuditEvent generator.**

That’s the anchor.

## 21. Additional Backend Notes

Backend may need to support these concepts later, but they should be treated as backend reasoning objects, not full product modules yet.

### 21.1 Owner Policy

Stores owner-configurable preferences later:

```txt
- severity threshold for alert
- timeout duration
- whether OpenClaw can auto-clear low-risk cases
- whether staff messaging requires approval
- sample/demo tolerance policy
```

For MVP:

```txt
Hardcode default owner policy.
```

---

### 21.2 Case Note

A note attached to an AuditEvent.

Examples:

```txt
- owner note
- staff explanation
- OpenClaw reasoning note
- correction note
```

---

### 21.3 Action Log

Every OpenClaw action should create an action log.

Examples:

```txt
- OpenClaw recommended explanation request
- owner approved staff message
- staff replied
- OpenClaw forwarded summary
- owner marked silent log
```

---

### 21.4 Staff Clarification Request

Tracks explanation request lifecycle:

```txt
REQUESTED
REMINDED
RESPONDED
TIMEOUT
ESCALATED
```

---

### 21.5 Append-Only Correction

If something changes after being sent or sealed, do not edit history.

Add correction as a new event/note.

This preserves accountability.

---

### 21.6 Evidence Access Policy

Defines who can see what:

```txt
owner
staff involved
manager
public future mode
```

For MVP:

```txt
owner only, with optional staff evidence summary.
```
