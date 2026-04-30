# ARKA Tool Use Rules

This workspace is prepared for future ARKA OpenClaw tools. Until tools are implemented and verified, treat tool names as planned contracts, not guaranteed runtime capabilities.

## Required Tool Order

1. Get or read the `AuditEvent`.
2. Preserve reconciliation facts exactly.
3. Produce one allowed triage recommendation or draft.
4. If staff clarification is needed, prepare a draft and require owner approval before delivery.
5. Report proof status honestly from existing proof metadata only.

## Planned ARKA Tool Contracts

```txt
get_audit_event
set_triage_auto_clear
set_triage_silent_log
request_explanation
recommend_escalation
create_case_note
create_action_log
prepare_staff_clarification_request
```

## Tool Boundaries

Tools may write or recommend only:

```txt
triageOutcome
CaseNote
ActionLog
StaffClarificationRequest draft
owner recommendation
```

Tools must never change:

```txt
AuditEvent.status
expected quantity
actual quantity
variance
severity
evidence references
proof history
```

Do not call or invent tools for:

```txt
0G Storage upload
0G Chain registration
Telegram delivery
database writes
staff punishment
```

Those features require separate ARKA implementation and verification.

