import {
  TriageOutcome,
  type AuditEvent,
} from '@arka/shared';
import {
  resolveOpenClawTriageDecision,
  TriageOptions,
  TriageSource,
} from './openclaw-adapter';

export type TriageAuditEvent = AuditEvent & {
  triageOutcome: TriageOutcome;
  triageSource: TriageSource;
};

export function triageAuditEvent(auditEvent: Readonly<AuditEvent>, options?: TriageOptions): TriageAuditEvent {
  const { triageOutcome, triageSource } = resolveOpenClawTriageDecision(auditEvent, options);

  return {
    ...auditEvent,
    triageOutcome,
    triageSource,
  };
}

export function determineTriageOutcome(auditEvent: Readonly<AuditEvent>, options?: TriageOptions): TriageOutcome {
  return resolveOpenClawTriageDecision(auditEvent, options).triageOutcome;
}

export function formatOwnerRecommendation(auditEvent: AuditEvent, triageOutcome: TriageOutcome): string {
  if (triageOutcome === TriageOutcome.AUTO_CLEAR) {
    return `Case ${auditEvent.caseId} can be auto-cleared.`;
  }

  if (triageOutcome === TriageOutcome.REQUEST_EXPLANATION) {
    return `Case ${auditEvent.caseId} needs owner approval before asking ${auditEvent.handlerName} for an explanation.`;
  }

  return `Case ${auditEvent.caseId} should escalate for immediate owner review.`;
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
