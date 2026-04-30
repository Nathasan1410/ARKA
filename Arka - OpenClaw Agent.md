# ARKA OpenClaw Brief & Action Policy 

Research update:

```txt
OpenClaw is a gateway/runtime/plugin/skills system, not just a local TypeScript adapter.
ARKA should build on OpenClaw through an OpenClaw sidecar gateway plus ARKA-specific skill/plugin work.
packages/agent is ARKA's app-facing boundary and deterministic fallback, not the full OpenClaw runtime.
OpenClaw public source is now copied as a repo-local fork under openclaw/.
Local install, strict-smoke build, direct CLI checks, local dev gateway connectivity, ARKA skill loading, and MiniMax model discovery are verified.
Read-only `arka-audit` plugin skeleton static smoke is verified.
One local model-backed ARKA State C inference response is verified through OpenClaw `infer model run`. OpenClaw gateway discovery/load of the read-only `arka-audit` plugin is verified. Full OpenClaw ARKA agent session response, packages/agent gateway calls, and OpenClaw Telegram are not verified yet.
```

## 0. Positioning

OpenClaw is ARKA’s Layer-1 conversational dashboard and conflict-resolution agent.

It does not replace the owner’s judgment. It reduces the amount of manual review by deciding which AuditEvents are safe to clear, which should be silently logged, which need explanation, and which must be escalated.

For MVP/demo, the rules can be hardcoded. Later, they should become owner-configurable policies.

## 0.1 OpenClaw Primary Object

OpenClaw should always start from AuditEvent.

AuditEvent is OpenClaw’s primary object for triage, explanation, escalation, owner conversation, staff clarification, and daily summary.

Related orders, inventory movements, usage batches, notes, action logs, and proof records are supporting context, not the primary source of truth.

OpenClaw should not reconstruct truth directly from raw database tables.

Clarification:

```txt
AuditEvent.status = business/reconciliation result (what happened)
OpenClaw.triageOutcome = OpenClaw decision on what to do next
caseResolutionStatus = final owner/auditor decision after OpenClaw/Dashboard actions
```

Default flow:

```txt
OpenClaw reads AuditEvent
↓
OpenClaw checks status, severity, proof status, evidence completeness, and recommended action
↓
If needed, OpenClaw requests supporting summaries through backend tools
↓
OpenClaw decides triage outcome:
- AUTO_CLEAR
- SILENT_LOG
- REQUEST_EXPLANATION
- ESCALATE
```

---

## 1. Can the 4 conditions be rule-based and owner-configurable?

Yes.

The four OpenClaw actions can be decided by rule-based policy:

```txt
1. setTriageAutoClear
2. setTriageSilentLog
3. requestExplanation
4. recommendEscalation
```

Naming note:

```txt
recommendEscalation = OpenClaw determines the case deserves owner attention.
sendOwnerAlert = message delivery action through Telegram.
```

Decision inputs:

```txt
- AuditEvent status
- AuditEvent severity
- case type
- net movement
- evidence completeness
- handler known / unknown
- explanation exists / missing
- item value
- repeat pattern
- proof status
```

For demo, we should not build a full policy editor. Instead, define default rules and say:

> “In production, owners can customize thresholds and escalation rules.”

Important rule:

Backend creates AuditEvent.  
OpenClaw operates on AuditEvent.  
OpenClaw does not overwrite reconciliation facts.

```txt
OpenClaw must not overwrite AuditEvent.status, expected quantity, actual quantity, variance, severity, or related evidence references.

OpenClaw only writes:
* triageOutcome
* CaseNote
* ActionLog
* StaffClarificationRequest
* caseResolutionStatus / resolution recommendation
```



---

### 2.1 Auto Clear

OpenClaw can auto-clear deterministic low-risk cases.

Use when:

```txt
* net movement = 0
* item fully returned
* variance within normal threshold
* usage batch fully consumed by matching POS
* no loss detected
```

Important:

```txt
Auto Clear does not rewrite reconciliation facts.
It only sets triageOutcome = AUTO_CLEAR or caseResolutionStatus = CLEARED_BY_POLICY.
```

### 2.2 Silent Log

OpenClaw should silently log low-risk cases instead of disturbing the owner.

Use when:

```txt  
Silent Log is used for low-risk cases based on severity + item value.

Default:
- Normal → usually Auto Clear
- Minor → usually Silent Log
- Moderate → Silent Log for low-value items, Request Explanation for high-value items
```

Example:

```txt
Expected: 500g
Actual: 520g
Variance: 4%
Status: Normal / Minor
Action: Silent log
```

These cases appear in daily report and dashboard history.

---

### 2.3 Request Explanation

OpenClaw should request explanation when there is unresolved movement, but not enough reason to immediately alert the owner.

Use when:

```txt
* movement has net loss
* handler is known
* no matching POS / return / usage batch explanation
* severity and item value policy say explanation is needed
* owner explicitly asks for explanation
```

Flow:

```txt
AuditEvent created
↓
OpenClaw recommends requesting explanation
↓
Owner approves message to staff
↓
OpenClaw or the selected Telegram/dashboard transport sends message to handler/staff only after that transport is implemented and verified
↓
Staff replies
↓
OpenClaw summarizes staff reply
↓
Owner receives summarized response
```

Important:

> Owner approval is required before OpenClaw messages staff.

---

### 2.4 Escalate to Owner

OpenClaw should escalate when the case is meaningful enough that owner attention is required.

Use when:

```txt
- Critical Review severity
- significant unexplained loss
- handler missing
- no explanation after timeout
- repeated suspicious pattern
- manager approval pattern = future trigger, not MVP trigger
- proof cannot be created for important case
```

Default timeout:

```txt
3 working days without explanation → escalate
```

For demo, escalation can happen instantly or be simulated as “after timeout.”

---

## 3. Owner Approval Before Staff Message

Owner approval is required before OpenClaw contacts staff.

Reason:

```txt
- prevents accidental accusation
- keeps owner accountable
- avoids OpenClaw acting too aggressively
- makes the system feel fair to staff
```

Recommended owner prompt:

```txt
OpenClaw:
This case needs clarification from Joni.

Reason:
- 60g whey removed
- no matching POS
- no return
- handler: Joni

Recommended action:
Ask Joni for explanation.

Reply:
1. Approve
2. Edit message
3. Cancel
```

---

## 4. Staff Reply Flow

Staff can reply through OpenClaw only after the channel integration is implemented and verified. Until then, the dashboard may simulate the staff reply flow.

But staff replies should not automatically resolve the case.

Flow:

```txt
Staff replies through the verified channel, or the dashboard simulates the reply
↓
OpenClaw summarizes staff explanation
↓
OpenClaw forwards summary to owner
↓
Owner decides final action
```

Example:

```txt
Staff:
Customer requested a whey sample.

OpenClaw to Owner:
Joni says the 60g whey movement was a customer sample.
No matching POS exists.
This is the first sample-related case from Joni today.

Recommended action:
Silent log, unless you want to request stricter sample policy.
```

---

## 5. Timeout Flow

Default timeout:

```txt
3 working days
```

Flow:

```txt
Day 0: explanation requested
Day 1: reminder
Day 2: warning / second reminder
Day 3: no response → escalate to owner
```

For MVP/demo:

```txt
- show timeout as configurable
- simulate reminder/escalation state
- do not build full scheduling if unnecessary
```

---

## 6. Owner Instruction Safety

Owner may send instructions through natural language.

Examples:

```txt
Oke masukin ini ke log.
```

```txt
Minta penjelasan ke Joni.
```

```txt
Kasih notice ke dia dan minta kejelasan.
```

OpenClaw should convert owner messages into safe structured actions.

### 6.1 Confirmation Before Action

Before sending message to staff, OpenClaw should show final message preview.

Example:

```txt
OpenClaw:
I will send this to Joni:

“ARKA needs clarification for an inventory review case.
Item: Whey Protein
Movement: 160g removed
Expected: 90g
Window: 15:54–15:59
Please explain what happened.”

Confirm send?
```

Owner replies:

```txt
Send
```

Then OpenClaw or the selected transport sends, only if the transport is implemented and verified. Otherwise the dashboard keeps it as a preview.

### 6.2 Revoke/Edit Rule

If message has not been sent yet:

```txt
Owner can edit/cancel freely.
```

If message has already been sent:

```txt
Do not edit the original message silently.
Create a correction/follow-up note instead.
```

This preserves auditability.

---

## 7. Blockchain / Audit Trail Concern

Editing does not kill the purpose of blockchain if we treat the audit trail as append-only.

Rule:

> Never rewrite history. Append corrections.

If owner changes instruction:

```txt
Original instruction remains logged.
Correction is added as a new event.
Reason is attached.
```

This is not glorified Web2 because:

```txt
- the original action is still visible
- the correction is visible
- the timeline is auditable
- the case file can be sealed later
```

Recommended rule:

```txt
Before message is sent to staff:
- owner can revise the draft
- only final sent instruction is logged as staff-facing communication

After message is sent to staff:
- no silent edit
- only follow-up/correction message
- log both original and correction
  
```

Important rule:

OpenClaw does not overwrite reconciliation result. OpenClaw writes triage/resolution state through CaseNote, ActionLog, StaffClarificationRequest, and case resolution fields.

For blockchain/0G:

```txt
- draft actions can remain local
- final case state / final proof package is sealed
- corrections after sealing become new append-only proof entries
```

No grace period is needed for MVP.

Better UX:

```txt
Warning before send.
Final confirmation before staff message.
Append-only correction after send.
```

---

## 8. Handler Lies in Explanation

OpenClaw should not decide whether staff is lying.

Flow:

```txt
Staff explanation received
↓
OpenClaw summarizes it
↓
OpenClaw compares explanation with AuditEvent evidence
↓
OpenClaw forwards summary to owner
↓
Owner decides next action
```

OpenClaw can say:

```txt
The explanation is consistent with the movement timing.
```

or:

```txt
The explanation does not fully explain the missing 60g.
```

But should avoid:

```txt
Staff is lying.
```

---

## 9. Staff Does Not Reply

Flow:

```txt
Request explanation
↓
Reminder
↓
Warning / second reminder
↓
Escalation to owner after 3 working days
```

Owner receives:

```txt
Joni has not responded to the clarification request after 3 working days.
Recommended action: review manually or escalate internally.
```

---

## 10. Multiple Handlers

For MVP:

```txt
Scope to one handler.
```

Later:

```txt
If multiple handlers are involved, OpenClaw can message all related handlers and collect separate explanations.
```

Do not build this into MVP.

---

## 11. Manager Approval / False Exception Risk

If manager approves exceptions, backend must record:

```txt
- who approved
- what was approved
- when it was approved
- reason/note
- related AuditEvent
```

This is important because manager approval itself can become part of the audit trail.

For current MVP/demo:

```txt
Owner is the primary decision maker.
Manager approval workflow can be planned for later.
```

Future use:

```txt
Dashboard can show manager-approved cases.
Pattern Analyzer can detect unusual manager approval behavior.
```

---

## 12. Owner Requests Punitive Action

OpenClaw should not execute punitive actions.

If owner says:

```txt
Punish him.
```

OpenClaw should respond safely:

```txt
I can record this as an owner instruction and request clarification from the staff member.
Final disciplinary action should be handled outside ARKA.
```

MVP rule:

```txt
OpenClaw can forward clarification requests.
OpenClaw cannot punish staff.

```

---

## 13. Low Severity but Repeated Pattern

Single low severity case:

```txt
Silent log.
```

Repeated low severity cases:

```txt
Pattern review.
```

For MVP:

```txt
Log the data.
Do not build full pattern analyzer yet unless needed.
```

MVP clarification:

For MVP, repeated pattern is a simple query/count over seeded or recent AuditEvents.

Example:

```txt
Joni had 3 review-needed cases involving whey protein in the last 3 days.
Full Pattern Analyzer and PatternFlag remain later.
```

---

## 14. Staff Dispute and Evidence Access

Staff can dispute a case.

They should be able to access appropriate evidence.

Evidence layers:

```txt
- AuditEvent summary
- movement timestamp
- item/container
- before/after quantity
- audit proof reference
- video timestamp reference if available
```

Video access should be controlled.

Possible future access levels:

```txt
- owner only
- staff involved in the case
- manager
- public only if intentionally published
```

Blockchain/0G stores proof metadata, not necessarily raw video.

Video can live in Web2/local storage and be accessed by timestamp/link.

---

## 15. Updated Action Policy Matrix

### Auto Clear

Use when:

```txt
- net movement = 0
- item fully returned
- variance within normal threshold
- usage batch fully consumed by matching POS
```

Action:

```txt
setTriageAutoClear
no owner alert
case stays in history
```

---

### Silent Log

Use when:

```txt
- minor variance
- low-value movement
- plausible explanation exists
- no repeated pattern yet
```

Action:

```txt
setTriageSilentLog
include in daily summary
no immediate owner alert
```

---

### Request Explanation

Use when:

```txt
- movement has net loss
- handler is known
- no matching POS/return/batch explanation
- severity and item value policy say explanation is needed
- owner explicitly asks for explanation
```

Action:

```txt
ask owner approval
send clarification request to handler
wait for reply
forward staff reply to owner
```

---

### Escalate to Owner

Use when:

```txt
- critical variance
- significant unexplained loss
- missing handler
- repeated cases
- no explanation after 3 working days
- suspicious manager approval pattern later / future trigger
```

Action:

```txt
send owner alert
include evidence summary
include recommended action
include dashboard/case link
```

---

## 17. Owner Policy Defaults for Demo

For demo, ARKA should use hardcoded default policy.

For production, this becomes owner-configurable policy.

### Daily Report MVP Rule

Daily report is not required for the P0 A/C/D proof demo. It is a later OpenClaw capability unless the core AuditEvent, proof, and triage path is already stable.

For MVP, daily report can be generated dynamically from AuditEvents, CaseNotes, ActionLogs, StaffClarificationRequests, and ProofRecords.

DailyReportSnapshot can remain a later data object if we want to cache or archive generated reports.

Do not build policy UI for MVP.

---

### 17.1 Variance Severity

Variance severity is already defined in backend rules:

```txt
0–5%       Normal
>5–7%      Minor Variance
>7–10%     Moderate Variance
>10–20%    Significant Variance
>20%       Critical Review
```

OpenClaw should consume backend severity, not recalculate it independently.

---

### 17.2 Item Value Category

For demo, items can be treated as:

```txt
LOW_VALUE
HIGH_VALUE
```

Admin can later configure item value sensitivity.

Default interpretation:

```txt
LOW_VALUE
- flour
- rice
- common ingredients
- low-cost consumables

HIGH_VALUE
- whey protein
- medicine
- spare parts
- electronics
- premium items
```

---

### 17.3 Silent Log Default

Silent Log means the owner is not interrupted immediately. The case appears in daily summary and dashboard history.

Default rule:

```txt
LOW_VALUE item:
- Normal → Auto Clear
- Minor Variance → Silent Log
- Moderate Variance → Silent Log
- Significant Variance → Request Explanation / maybe Escalate
- Critical Review → Escalate

HIGH_VALUE item:
- Normal → Auto Clear
- Minor Variance → Silent Log or Request Explanation
- Moderate Variance → Request Explanation
- Significant Variance → Escalate
- Critical Review → Escalate
```

Business logic:

```txt
For low-value items, small and medium variance should not spam the owner.
For high-value items, moderate variance already deserves clarification.
```

---

### 17.4 Request Explanation Default

Request Explanation is usually suggested by OpenClaw, then approved by owner before sending to staff.

Default rule:

```txt
Request explanation when:
- movement has net loss
- handler is known
- no matching POS / return / usage batch explanation
- variance is Moderate or Significant
- item is high-value and variance is above Minor
- owner explicitly asks OpenClaw to request explanation
```

Owner approval is required before OpenClaw messages staff.

---

### 17.5 Escalation Default

Escalation means OpenClaw interrupts the owner immediately.

Default rule:

```txt
Escalate immediately when:
- Critical Review severity
- HIGH_VALUE item with Significant Variance or above
- handler is missing
- repeated review-needed cases from same handler/item
- no explanation after 3 working days
- suspicious manager approval pattern later / future trigger
```

For demo, repeated pattern can be simulated with seeded cases.

---

### 17.6 Sample / Demo Tolerance Default

Sample/demo cases should not immediately become accusations.

Default rule:

```txt
If movement is marked as sample/demo:
- LOW_VALUE item: allow small sample once, Silent Log
- HIGH_VALUE item: Request Explanation even if small
- repeated sample/demo cases by same handler: Review Needed
- sample/demo with no handler: Escalate
```

Suggested demo policy:

```txt
LOW_VALUE sample threshold:
- up to Minor Variance → Silent Log
- Moderate and above → Request Explanation

HIGH_VALUE sample threshold:
- any unexplained sample/demo movement → Request Explanation
- Significant and above → Escalate
```

OpenClaw wording:

```txt
This movement was explained as a sample/demo. I logged it without immediate escalation because it is low value and within allowed policy.
```

or:

```txt
This movement was explained as a sample/demo, but the item is high-value or the amount exceeds policy. I recommend asking for clarification.
```

---

### 17.7 Owner Policy Future Configuration

Later, owner should be able to configure:

```txt
- item value category
- variance alert threshold
- sample/demo allowance
- staff explanation timeout
- whether minor cases go to daily summary
- whether high-value movement requires immediate clarification
```

For MVP:

```txt
Hardcode sane defaults.
Expose the concept in docs/demo.
Do not build policy UI.
```

---

## 18. Updated Final Anchor

```txt
Backend creates AuditEvent.
OpenClaw triages AuditEvent after gateway/plugin/client integration is verified; until then packages/agent deterministic fallback is the safe local path.
Owner controls serious actions.
Staff can explain through OpenClaw only after channel integration is verified.
Telegram or dashboard preview is the conversation layer depending on implementation status.
Dashboard is deeper visual investigation.
0G seals AuditEvent proof and final resolution proof only after 0G Storage upload and 0G Chain registration are implemented and verified.
```

Bottom Notes :
- Source is stored for evidence completeness, but OpenClaw usually abstracts it as sensor-backed movement unless source is relevant.
- 

Final phrasing:

> **OpenClaw is ARKA’s Layer-1 conversational dashboard and conflict-resolution operator. It does not punish or accuse. It triages AuditEvents, requests explanations with owner approval, forwards staff replies, and escalates only meaningful unresolved conflicts.**
