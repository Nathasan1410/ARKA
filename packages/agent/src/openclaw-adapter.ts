import type {
  AuditEvent,
  TriageOutcome,
} from '@arka/shared';
import { determineDeterministicFallbackOutcome } from './policy';

export const TriageSource = {
  DETERMINISTIC_FALLBACK: 'DETERMINISTIC_FALLBACK',
  OPENCLAW_RUNTIME: 'OPENCLAW_RUNTIME',
} as const;

export type TriageSource = (typeof TriageSource)[keyof typeof TriageSource];

export type OpenClawRuntimeAdapter = {
  isAvailable(): boolean;
  triageAuditEvent(auditEvent: Readonly<AuditEvent>): TriageOutcome;
};

export type ResolvedTriageDecision = {
  triageOutcome: TriageOutcome;
  triageSource: TriageSource;
};

export type TriageOptions = {
  openClawRuntime?: OpenClawRuntimeAdapter | null;
};

export function resolveOpenClawTriageDecision(
  auditEvent: Readonly<AuditEvent>,
  options?: TriageOptions,
): ResolvedTriageDecision {
  const runtime = options?.openClawRuntime;

  if (runtime?.isAvailable()) {
    return {
      triageOutcome: runtime.triageAuditEvent(auditEvent),
      triageSource: TriageSource.OPENCLAW_RUNTIME,
    };
  }

  return {
    triageOutcome: determineDeterministicFallbackOutcome(auditEvent),
    triageSource: TriageSource.DETERMINISTIC_FALLBACK,
  };
}
