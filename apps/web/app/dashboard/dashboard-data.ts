import { ScenarioKey, type AuditProofStatus, type ChainStatus, type DemoScenarioSeed, type ProofType, type StorageStatus } from '@arka/shared';
import type { TriageAuditEvent } from '@arka/agent';

const SCENARIO_SEQUENCE = [ScenarioKey.STATE_A, ScenarioKey.STATE_C, ScenarioKey.STATE_D] as const;

export type ScenarioCard = {
  key: (typeof SCENARIO_SEQUENCE)[number];
  title: string;
  expectedOutcome: string;
  intent: string;
  proofPath: string;
  triagePath: string;
};

export type DashboardProofRecord = {
  proofRecordId: string;
  proofType: ProofType;
  auditProofStatus: AuditProofStatus;
  storageStatus: StorageStatus;
  chainStatus: ChainStatus;
  localPackageHash: string;
  storageRootHash: string | null;
  storageTxHash: string | null;
  chainTxHash: string | null;
  lastErrorMessage: string | null;
  failureState: string;
  retryState: string;
};

export type DashboardPersistenceMode = 'IN_MEMORY_DEMO' | 'POSTGRES_CONFIGURED_UNVERIFIED';

export type DashboardPersistenceStatus = {
  mode: DashboardPersistenceMode;
  label: string;
  detail: string;
};

export type DashboardRun = {
  scenario: DemoScenarioSeed;
  caseId: string;
  orderId: string;
  movementId: string;
  movementBeforeGrams: number;
  movementAfterGrams: number;
  createdAtLabel: string;
  movementTimestampLabel: string;
  evidenceWindowLabel: string;
  evidenceWindowStartedAt: string;
  evidenceWindowEndedAt: string;
  ownerAlertState: string;
  ownerAlertCopy: string;
  staffMessagePreview: string | null;
  ownerRecommendation: string;
  actionLog: string;
  caseNote: string;
  proofSummary: string;
  proofRecord: DashboardProofRecord;
  triageRuntimeSummary: string;
  persistence: DashboardPersistenceStatus;
  auditEvent: TriageAuditEvent;
};

export type RunScenarioResponse = {
  run: DashboardRun;
  history: DashboardRun[];
  persistence: DashboardPersistenceStatus;
};

const SCENARIO_CARD_CONTENT: Record<(typeof SCENARIO_SEQUENCE)[number], Omit<ScenarioCard, 'key'>> = {
  STATE_A: {
    title: 'State A - Clear',
    expectedOutcome: 'CLEAR / NORMAL',
    intent: 'Order-linked movement matches expected whey usage.',
    proofPath: 'Local proof package preview',
    triagePath: 'AUTO_CLEAR / no owner alert',
  },
  STATE_C: {
    title: 'State C - Request Explanation',
    expectedOutcome: 'OVER_EXPECTED_USAGE / MODERATE_VARIANCE',
    intent: 'Usage sits 10% above expected range and needs clarification.',
    proofPath: 'Local proof package, 0G not started',
    triagePath: 'REQUEST_EXPLANATION / owner approval needed',
  },
  STATE_D: {
    title: 'State D - Escalate',
    expectedOutcome: 'OVER_EXPECTED_USAGE / CRITICAL_REVIEW',
    intent: 'Usage is materially above expected range and needs immediate review.',
    proofPath: 'Local proof package, chain not registered',
    triagePath: 'ESCALATE / owner alert preview',
  },
};

export const scenarioCards: readonly ScenarioCard[] = SCENARIO_SEQUENCE.map((key) => ({
  key,
  ...SCENARIO_CARD_CONTENT[key],
}));
