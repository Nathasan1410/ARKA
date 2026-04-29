import {
  AuditEvent,
  AuditEventStatus,
  ScenarioKey,
  Severity,
  TriageOutcome,
} from '@arka/shared';

export type TriageAuditEvent = AuditEvent & {
  triageOutcome: TriageOutcome;
};

export function triageAuditEvent(auditEvent: AuditEvent): TriageAuditEvent {
  const triageOutcome = determineTriageOutcome(auditEvent);

  return {
    ...auditEvent,
    triageOutcome,
  };
}

export function determineTriageOutcome(auditEvent: AuditEvent): TriageOutcome {
  if (auditEvent.scenarioKey === ScenarioKey.STATE_A) {
    return TriageOutcome.AUTO_CLEAR;
  }

  if (auditEvent.scenarioKey === ScenarioKey.STATE_C) {
    return TriageOutcome.REQUEST_EXPLANATION;
  }

  if (auditEvent.scenarioKey === ScenarioKey.STATE_D) {
    return TriageOutcome.ESCALATE;
  }

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

  return TriageOutcome.AUTO_CLEAR;
}

export function formatOwnerRecommendation(auditEvent: AuditEvent, triageOutcome: TriageOutcome): string {
  if (triageOutcome === TriageOutcome.AUTO_CLEAR) {
    return `State ${auditEvent.caseId} can be auto-cleared.`;
  }

  if (triageOutcome === TriageOutcome.REQUEST_EXPLANATION) {
    return `State ${auditEvent.caseId} should request an explanation from ${auditEvent.handlerName}.`;
  }

  return `State ${auditEvent.caseId} should escalate for immediate review.`;
}

export function createActionLogForTriage(auditEvent: AuditEvent, triageOutcome: TriageOutcome): string {
  return [
    `case=${auditEvent.caseId}`,
    `status=${auditEvent.status}`,
    `severity=${auditEvent.severity}`,
    `triage=${triageOutcome}`,
  ].join(' | ');
}

export function createCaseNoteForTriage(auditEvent: AuditEvent, triageOutcome: TriageOutcome): string {
  return `${auditEvent.caseType} -> ${triageOutcome} for ${auditEvent.productName} with ${auditEvent.variancePercent.toFixed(
    2,
  )}% variance.`;
}
