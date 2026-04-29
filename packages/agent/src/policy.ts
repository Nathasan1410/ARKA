import {
  AuditEventStatus,
  Severity,
  TriageOutcome,
  type AuditEvent,
} from '@arka/shared';

export function determineDeterministicFallbackOutcome(auditEvent: Readonly<AuditEvent>): TriageOutcome {
  if (auditEvent.status === AuditEventStatus.CLEAR && auditEvent.severity === Severity.NORMAL) {
    return TriageOutcome.AUTO_CLEAR;
  }

  if (
    auditEvent.status === AuditEventStatus.OVER_EXPECTED_USAGE &&
    auditEvent.severity === Severity.MODERATE_VARIANCE
  ) {
    return TriageOutcome.REQUEST_EXPLANATION;
  }

  if (
    auditEvent.status === AuditEventStatus.OVER_EXPECTED_USAGE &&
    auditEvent.severity === Severity.CRITICAL_REVIEW
  ) {
    return TriageOutcome.ESCALATE;
  }

  return TriageOutcome.REQUEST_EXPLANATION;
}
