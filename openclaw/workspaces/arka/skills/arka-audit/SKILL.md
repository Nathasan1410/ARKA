---
name: arka-audit
description: Triage ARKA AuditEvents with immutable reconciliation facts and owner-safe audit language.
---

# ARKA Audit Skill

Use this skill when the user asks about ARKA, AuditEvents, inventory movement, order-linked reconciliation, proof status, State A, State C, State D, or owner-facing audit triage.

## Required Procedure

1. Read or fetch the `AuditEvent` first.
2. Treat the `AuditEvent` as the source of truth for reconciliation facts.
3. Do not recalculate or overwrite expected quantity, actual quantity, variance, severity, status, evidence references, or proof history.
4. Select or recommend only allowed ARKA outputs.
5. Use owner-safe language.
6. State proof status honestly.
7. For staff clarification, prepare a draft and require owner approval before sending.

## Immutable Facts

Never mutate or reinterpret:

```txt
AuditEvent.status
expected quantity
actual quantity
variance
severity
evidence references
proof history
```

If any fact is missing or contradictory, say the case needs review and create a CaseNote-style explanation. Do not guess.

## Allowed Outputs

You may recommend or draft:

```txt
triageOutcome
owner recommendation
CaseNote
ActionLog
StaffClarificationRequest draft
caseResolutionStatus / recommendation
```

Allowed action names:

```txt
setTriageAutoClear
setTriageSilentLog
requestExplanation
recommendEscalation
createCaseNote
createActionLog
prepareStaffClarificationRequest
```

## P0 State Guidance

State A:

```txt
If the AuditEvent status is CLEAR and severity is NORMAL, recommend AUTO_CLEAR.
Use: "This case can be auto-cleared based on the recorded movement matching expected usage."
```

State C:

```txt
If the AuditEvent indicates moderate usage above expected range, recommend REQUEST_EXPLANATION.
Prepare a StaffClarificationRequest draft for the handler.
Require owner approval before any staff message is sent.
Use: "This case needs explanation before final owner decision."
```

State D:

```txt
If the AuditEvent indicates critical review severity, recommend ESCALATE.
Use: "This case should be escalated for immediate owner/auditor review."
Do not accuse staff.
```

## Forbidden Actions

Do not:

```txt
upload to 0G Storage
register on 0G Chain
claim 0G proof exists unless proof records say so
send Telegram messages
send staff messages without owner approval
write database records unless a verified ARKA tool explicitly does that
accuse staff of theft or fraud
declare anyone guilty
recommend punishment
```

## Safe Language

Prefer:

```txt
review
clarify
needs explanation
evidence suggests
usage above expected range
movement without matching sale
final decision belongs to owner/auditor
```

Avoid:

```txt
theft
fraud
guilty
stole
caught
punish
legally proven
```

## Output Shape For Manual Drafts

When no verified ARKA plugin tool is available, return a concise manual draft:

```txt
triageOutcome:
ownerRecommendation:
caseNoteDraft:
actionLogDraft:
staffClarificationRequestDraft:
proofStatusNote:
```

Make clear that the output is a recommendation or draft, not a persisted database write.

