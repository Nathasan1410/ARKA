import {
  createAuditEventFromScenario,
  createAuditEventProofPackageArtifact,
} from '@arka/core';
import {
  demoScenarioSeeds,
  demoWorldSeed,
  ScenarioKey,
  TriageOutcome,
  type ScenarioKey as ScenarioKeyType,
} from '@arka/shared';
import {
  createActionLogForTriage,
  createCaseNoteForTriage,
  formatOwnerRecommendation,
  triageAuditEvent,
} from '@arka/agent';
import type { DashboardPersistenceStatus, DashboardRun, RunScenarioResponse } from './dashboard-data';

const INITIAL_SCENARIO = ScenarioKey.STATE_A;
const WINDOW_START_HOUR = 15;
const WINDOW_START_MINUTE = 54;
const WINDOW_SPACING_MINUTES = 7;
const WINDOW_DURATION_MINUTES = 5;
const MAX_HISTORY = 12;

type DemoRunRepository = {
  getHistory(): Promise<DashboardRun[]>;
  saveRun(run: DashboardRun): Promise<DashboardRun[]>;
  persistenceStatus(): DashboardPersistenceStatus;
};

const memoryRuns: DashboardRun[] = [];

const inMemoryDemoRunRepository: DemoRunRepository = {
  async getHistory() {
    return [...memoryRuns];
  },
  async saveRun(run) {
    memoryRuns.unshift(run);
    memoryRuns.splice(MAX_HISTORY);
    return [...memoryRuns];
  },
  persistenceStatus() {
    if (process.env.DATABASE_URL) {
      return {
        mode: 'POSTGRES_CONFIGURED_UNVERIFIED',
        label: 'Postgres configured, not used by demo route',
        detail:
          'DATABASE_URL is present, but this MVP route still uses the in-memory demo repository until migrations and write/read behavior are verified.',
      };
    }

    return {
      mode: 'IN_MEMORY_DEMO',
      label: 'In-memory demo repository',
      detail: 'Scenario runs are stored in the Next.js server process only. No live Postgres persistence is claimed.',
    };
  },
};

export async function getDashboardInitialState(): Promise<RunScenarioResponse> {
  const repository = getDemoRunRepository();
  const history = await repository.getHistory();

  if (history.length > 0) {
    return {
      run: history[0],
      history,
      persistence: repository.persistenceStatus(),
    };
  }

  return runDashboardScenario(INITIAL_SCENARIO);
}

export async function runDashboardScenario(scenarioKey: ScenarioKeyType): Promise<RunScenarioResponse> {
  const repository = getDemoRunRepository();
  const history = await repository.getHistory();
  const runNumber = history.length + 1;
  const run = await createDashboardRun(scenarioKey, runNumber, repository.persistenceStatus());
  const nextHistory = await repository.saveRun(run);

  return {
    run,
    history: nextHistory,
    persistence: repository.persistenceStatus(),
  };
}

export function parseScenarioKey(value: unknown): ScenarioKeyType | null {
  if (value === ScenarioKey.STATE_A || value === ScenarioKey.STATE_C || value === ScenarioKey.STATE_D) {
    return value;
  }

  return null;
}

function getDemoRunRepository(): DemoRunRepository {
  return inMemoryDemoRunRepository;
}

async function createDashboardRun(
  scenarioKey: ScenarioKeyType,
  runNumber: number,
  persistence: DashboardPersistenceStatus,
): Promise<DashboardRun> {
  const scenario = demoScenarioSeeds[scenarioKey];
  const createdAt = createScenarioTimestamp(runNumber);
  const evidenceWindowEndedAt = addMinutes(createdAt, WINDOW_DURATION_MINUTES);
  const caseId = `CASE-${String(runNumber).padStart(3, '0')}`;
  const auditEventId = `AE-${String(runNumber).padStart(3, '0')}`;
  const orderId = `ORD-${String(runNumber).padStart(3, '0')}`;
  const movementId = `MOV-${String(runNumber).padStart(3, '0')}`;
  const auditEvent = triageAuditEvent(
    createAuditEventFromScenario(scenario, {
      auditEventId,
      caseId,
      productName: demoWorldSeed.productName,
      inventoryItemName: demoWorldSeed.inventoryItemName,
      containerId: demoWorldSeed.containerId,
      handlerName: demoWorldSeed.handler.name,
      cashierName: demoWorldSeed.cashier.name,
      ownerName: demoWorldSeed.owner.name,
      createdAt,
    }),
  );
  const triageOutcome = auditEvent.triageOutcome ?? TriageOutcome.AUTO_CLEAR;
  const evidenceWindowLabel = formatClockWindow(runNumber);
  const movementBeforeGrams = 5000 - (runNumber - 1) * 250;
  const movementAfterGrams = movementBeforeGrams - auditEvent.actualMovementGrams;
  const backendRecommendedAction = getBackendRecommendedAction(auditEvent, triageOutcome);
  const proofArtifact = await createAuditEventProofPackageArtifact({
    auditEvent,
    supportingSummaries: {
      orderSummary: {
        orderId,
      },
      movementSummary: {
        movementId,
      },
      usageRuleSummary: {
        ruleId: 'RULE-PROTEIN-SHAKE-WHEY-001',
      },
      evidenceWindow: {
        startedAt: createdAt,
        endedAt: evidenceWindowEndedAt,
        sourceRef: 'local-dashboard-scenario',
        summary: `${auditEvent.inventoryItemName} movement reviewed for ${auditEvent.productName} order window ${evidenceWindowLabel} ICT.`,
      },
      evidenceCompleteness: 'Local fixture summaries only; no raw CCTV, no 0G upload, and no chain anchor in this route.',
      backendRecommendedAction,
    },
  });

  return {
    scenario,
    caseId,
    orderId,
    movementId,
    movementBeforeGrams,
    movementAfterGrams,
    createdAtLabel: formatDateLabel(createdAt),
    movementTimestampLabel: evidenceWindowLabel.split(' - ')[0],
    evidenceWindowLabel,
    evidenceWindowStartedAt: createdAt,
    evidenceWindowEndedAt,
    ownerAlertState: getOwnerAlertState(triageOutcome),
    ownerAlertCopy: getOwnerAlertCopy(auditEvent, triageOutcome, evidenceWindowLabel),
    staffMessagePreview: getStaffMessagePreview(auditEvent, triageOutcome, evidenceWindowLabel),
    ownerRecommendation: formatOwnerRecommendation(auditEvent, triageOutcome),
    actionLog: createActionLogForTriage(auditEvent, triageOutcome),
    caseNote: createCaseNoteForTriage(auditEvent, triageOutcome),
    proofSummary:
      'Backend route created a local AuditEvent proof package and SHA-256 hash. 0G Storage upload and 0G Chain registration are not started.',
    proofRecord: {
      proofRecordId: `PR-${String(runNumber).padStart(3, '0')}`,
      proofType: auditEvent.proofType,
      auditProofStatus: auditEvent.auditProofStatus,
      storageStatus: auditEvent.storageStatus,
      chainStatus: auditEvent.chainStatus,
      localPackageHash: proofArtifact.localPackageHash,
      storageRootHash: null,
      storageTxHash: null,
      chainTxHash: null,
      lastErrorMessage: null,
      failureState: 'No failed upload or registration',
      retryState: 'No retry queued. Retry placeholders become active only after a real upload or registration failure.',
    },
    triageRuntimeSummary:
      'Deterministic fallback is active. Real OpenClaw gateway, skill, plugin, and Telegram runtime are not connected in this dashboard path.',
    persistence,
    auditEvent,
  };
}

function createScenarioTimestamp(runNumber: number): string {
  const start = new Date(Date.UTC(2026, 3, 29, 8, WINDOW_START_MINUTE + (runNumber - 1) * WINDOW_SPACING_MINUTES, 0));
  return start.toISOString();
}

function addMinutes(isoTimestamp: string, minutesToAdd: number): string {
  const date = new Date(isoTimestamp);
  date.setUTCMinutes(date.getUTCMinutes() + minutesToAdd);
  return date.toISOString();
}

function formatDateLabel(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours() + 7).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes} ICT`;
}

function formatClockWindow(runNumber: number): string {
  const offsetMinutes = (runNumber - 1) * WINDOW_SPACING_MINUTES;
  const startMinutes = WINDOW_START_HOUR * 60 + WINDOW_START_MINUTE + offsetMinutes;
  const endMinutes = startMinutes + WINDOW_DURATION_MINUTES;
  return `${formatClock(startMinutes)} - ${formatClock(endMinutes)}`;
}

function formatClock(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getOwnerAlertState(triageOutcome: TriageOutcome): string {
  if (triageOutcome === TriageOutcome.AUTO_CLEAR) {
    return 'No action needed';
  }

  if (triageOutcome === TriageOutcome.REQUEST_EXPLANATION) {
    return 'Dashboard approval preview';
  }

  return 'Dashboard alert preview shown';
}

function getBackendRecommendedAction(auditEvent: DashboardRun['auditEvent'], triageOutcome: TriageOutcome): string {
  if (triageOutcome === TriageOutcome.AUTO_CLEAR) {
    return `Keep ${auditEvent.caseId} as a local clear audit record.`;
  }

  if (triageOutcome === TriageOutcome.REQUEST_EXPLANATION) {
    return `Request an explanation for ${auditEvent.caseId} only after owner approval.`;
  }

  return `Escalate ${auditEvent.caseId} for owner or auditor review before follow-up.`;
}

function getOwnerAlertCopy(
  auditEvent: DashboardRun['auditEvent'],
  triageOutcome: TriageOutcome,
  evidenceWindow: string,
): string {
  if (triageOutcome === TriageOutcome.AUTO_CLEAR) {
    return 'Usage looks normal. Case stays in local history without owner escalation.';
  }

  if (triageOutcome === TriageOutcome.REQUEST_EXPLANATION) {
    return [
      'ARKA created a review case.',
      `Expected ${auditEvent.expectedUsageGrams}g whey for ${auditEvent.orderQuantity} ${auditEvent.productName}s.`,
      `Movement recorded ${auditEvent.actualMovementGrams}g OUT during ${evidenceWindow}.`,
      `Recommended action: request explanation from ${auditEvent.handlerName}.`,
    ].join(' ');
  }

  return [
    'Critical review case created.',
    `Expected ${auditEvent.expectedUsageGrams}g and recorded ${auditEvent.actualMovementGrams}g OUT.`,
    `Evidence window: ${evidenceWindow}.`,
    'Recommended action: owner or auditor reviews immediately before any follow-up decision.',
  ].join(' ');
}

function getStaffMessagePreview(
  auditEvent: DashboardRun['auditEvent'],
  triageOutcome: TriageOutcome,
  evidenceWindow: string,
): string | null {
  if (triageOutcome === TriageOutcome.AUTO_CLEAR) {
    return null;
  }

  if (triageOutcome === TriageOutcome.REQUEST_EXPLANATION) {
    return [
      'ARKA needs clarification for an inventory review case.',
      `Item: ${auditEvent.inventoryItemName}`,
      `Expected: ${auditEvent.expectedUsageGrams}g`,
      `Recorded movement: ${auditEvent.actualMovementGrams}g OUT`,
      `Window: ${evidenceWindow}`,
      'Please explain what happened.',
    ].join('\n');
  }

  return [
    'Owner alert generated for immediate review.',
    `Case ${auditEvent.caseId} recorded ${auditEvent.actualMovementGrams}g movement for an expected ${auditEvent.expectedUsageGrams}g usage window.`,
    'Follow-up to staff stays pending until the owner or auditor confirms the next action.',
  ].join('\n');
}
