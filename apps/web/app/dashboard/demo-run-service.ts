import {
  createAuditEvent,
  createAuditEventFromScenario,
  createAuditEventProofPackageArtifact,
} from '@arka/core';
import {
  checkDashboardDemoRunStoreHealth,
  getDashboardDemoRun,
  listDashboardDemoRuns,
  persistDemoOperationalEvidence,
  upsertDashboardDemoRun,
} from '@arka/db';
import {
  AuditProofStatus,
  CaseType,
  ChainStatus,
  demoScenarioSeeds,
  demoWorldSeed,
  MovementDirection,
  ScenarioKey,
  StorageStatus,
  TriageOutcome,
  type ScenarioKey as ScenarioKeyType,
} from '@arka/shared';
import {
  createActionLogForTriage,
  createCaseNoteForTriage,
  formatOwnerRecommendation,
  triageAuditEvent,
} from '@arka/agent';
import type { AdminSimulationInput, DashboardPersistenceStatus, DashboardRun, RunScenarioResponse } from './dashboard-data';
import type {
  AgentActionResponse,
  SimulatedAgentAction,
  SimulatedAgentInteraction,
  SimulatedAgentTimelineEntry,
} from './dashboard-data';
import { registerProofOnZeroGChain, resolveStorageRootHash } from './zero-g-chain-service';
import { storeCanonicalProofOnZeroG } from './zero-g-storage-service';

const INITIAL_SCENARIO = ScenarioKey.STATE_A;
const WINDOW_START_HOUR = 15;
const WINDOW_START_MINUTE = 54;
const WINDOW_SPACING_MINUTES = 7;
const WINDOW_DURATION_MINUTES = 5;
const MAX_HISTORY = 12;
const DEMO_REPOSITORY_ENV = 'ARKA_DEMO_REPOSITORY';
const DEMO_REPOSITORY_POSTGRES = 'postgres';

type DemoRunRepository = {
  getHistory(): Promise<DashboardRun[]>;
  saveRun(run: DashboardRun): Promise<DashboardRun[]>;
  updateRun(caseId: string, updater: (run: DashboardRun) => DashboardRun): Promise<DashboardRun[]>;
  persistenceStatus(): DashboardPersistenceStatus;
};

const memoryRuns: DashboardRun[] = [];
let totalRuns = 0;
let postgresDemoStatus: DashboardPersistenceStatus | null = null;
let postgresInitPromise: Promise<void> | null = null;

const inMemoryDemoRunRepository: DemoRunRepository = {
  async getHistory() {
    return [...memoryRuns];
  },
  async saveRun(run) {
    memoryRuns.unshift(run);
    memoryRuns.splice(MAX_HISTORY);
    totalRuns = Math.max(totalRuns, parseInt(run.caseId.split('-')[1], 10));
    return [...memoryRuns];
  },
  async updateRun(caseId, updater) {
    const runIndex = memoryRuns.findIndex((run) => run.caseId === caseId);

    if (runIndex === -1) {
      return [...memoryRuns];
    }

    memoryRuns[runIndex] = updater(memoryRuns[runIndex]);
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

const postgresDemoRunRepository: DemoRunRepository = {
  async getHistory() {
    const ok = await getPostgresDbOrNull();

    if (!ok) {
      return inMemoryDemoRunRepository.getHistory();
    }

    const rows = await listDashboardDemoRuns(MAX_HISTORY);
    const history = rows.map((row) => row.runPayload as DashboardRun).filter((run) => run && typeof run === 'object');

    totalRuns = Math.max(totalRuns, ...history.map((run) => parseCaseNumber(run.caseId)));
    return history;
  },
  async saveRun(run) {
    const ok = await getPostgresDbOrNull();

    if (!ok) {
      return inMemoryDemoRunRepository.saveRun(run);
    }

    await upsertDashboardDemoRun({
      caseId: run.caseId,
      scenarioKey: run.scenario.scenarioKey,
      runPayload: run,
    });

    try {
      await persistDemoOperationalEvidence({
        auditEvent: run.auditEvent,
        externalOrderId: run.orderId,
        movementType: 'OUT',
        movementBeforeQuantity: run.movementBeforeGrams,
        movementAfterQuantity: run.movementAfterGrams,
        evidenceWindowStartAt: run.evidenceWindowStartedAt,
        evidenceWindowEndAt: run.evidenceWindowEndedAt,
        proofHash: run.proofRecord.localPackageHash,
        chainTransactionHash: run.proofRecord.chainTxHash,
        storageUri: run.proofRecord.storageRootHash ? `0g://${run.proofRecord.storageRootHash}` : null,
        lastErrorMessage: run.proofRecord.lastErrorMessage,
      });
    } catch (error) {
      // The dashboard demo history is still persisted via `dashboard_demo_runs`.
      // This is best-effort operational evidence persistence for the MVP.
      postgresDemoStatus = {
        mode: 'POSTGRES_ACTIVE_REAL',
        label: 'Postgres demo persistence active (evidence partial)',
        detail: `Dashboard demo history is persisted in Postgres (dashboard_demo_runs). Operational evidence persistence failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }

    return this.getHistory();
  },
  async updateRun(caseId, updater) {
    const ok = await getPostgresDbOrNull();

    if (!ok) {
      return inMemoryDemoRunRepository.updateRun(caseId, updater);
    }

    const current = (await getDashboardDemoRun(caseId)) as DashboardRun | null;
    if (!current) {
      return this.getHistory();
    }

    const next = updater(current);

    await upsertDashboardDemoRun({
      caseId: next.caseId,
      scenarioKey: next.scenario.scenarioKey,
      runPayload: next,
    });

    try {
      await persistDemoOperationalEvidence({
        auditEvent: next.auditEvent,
        externalOrderId: next.orderId,
        movementType: 'OUT',
        movementBeforeQuantity: next.movementBeforeGrams,
        movementAfterQuantity: next.movementAfterGrams,
        evidenceWindowStartAt: next.evidenceWindowStartedAt,
        evidenceWindowEndAt: next.evidenceWindowEndedAt,
        proofHash: next.proofRecord.localPackageHash,
        chainTransactionHash: next.proofRecord.chainTxHash,
        storageUri: next.proofRecord.storageRootHash ? `0g://${next.proofRecord.storageRootHash}` : null,
        lastErrorMessage: next.proofRecord.lastErrorMessage,
      });
    } catch (error) {
      postgresDemoStatus = {
        mode: 'POSTGRES_ACTIVE_REAL',
        label: 'Postgres demo persistence active (evidence partial)',
        detail: `Dashboard demo history is persisted in Postgres (dashboard_demo_runs). Operational evidence persistence failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }

    return this.getHistory();
  },
  persistenceStatus() {
    return postgresDemoStatus ?? {
      mode: 'POSTGRES_ENABLED_BUT_FALLBACK_TO_MEMORY',
      label: 'Postgres enabled, using in-memory fallback',
      detail: `${DEMO_REPOSITORY_ENV}=${DEMO_REPOSITORY_POSTGRES} is set, but Postgres has not been reached yet.`,
    };
  },
};

export async function getDashboardInitialState(): Promise<RunScenarioResponse> {
  const repository = getDemoRunRepository();
  const history = await repository.getHistory();
  totalRuns = Math.max(totalRuns, ...history.map((run) => parseCaseNumber(run.caseId)));

  if (history.length > 0) {
    totalRuns = Math.max(...history.map(r => parseInt(r.caseId.split('-')[1], 10)));
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
  totalRuns++;
  const run = await createDashboardRun(scenarioKey, totalRuns, repository.persistenceStatus());
  const nextHistory = await repository.saveRun(run);

  return {
    run,
    history: nextHistory,
    persistence: repository.persistenceStatus(),
  };
}

export async function runAdminMovementSimulation(input: AdminSimulationInput): Promise<RunScenarioResponse> {
  const repository = getDemoRunRepository();
  totalRuns++;
  const run = await createAdminSimulationRun(input, totalRuns, repository.persistenceStatus());
  const nextHistory = await repository.saveRun(run);

  return {
    run,
    history: nextHistory,
    persistence: repository.persistenceStatus(),
  };
}

export async function runSimulatedAgentAction(
  caseId: string,
  action: SimulatedAgentAction,
): Promise<AgentActionResponse | null> {
  const repository = getDemoRunRepository();
  const history = await repository.getHistory();
  const currentRun = history.find((run) => run.caseId === caseId);

  if (!currentRun || !currentRun.simulatedAgent.availableActions.includes(action)) {
    return null;
  }

  const nextHistory = await repository.updateRun(caseId, (run) => ({
    ...run,
    ...applySimulatedAgentAction(run, action),
  }));
  const nextRun = nextHistory.find((run) => run.caseId === caseId);

  if (!nextRun) {
    return null;
  }

  return {
    run: nextRun,
    history: nextHistory,
    persistence: repository.persistenceStatus(),
  };
}

export async function storeProofOnZeroGForRun(caseId: string): Promise<RunScenarioResponse | null> {
  const repository = getDemoRunRepository();
  const history = await repository.getHistory();
  const currentRun = history.find((run) => run.caseId === caseId);

  if (!currentRun) {
    return null;
  }

  if (currentRun.proofRecord.storageTxHash && currentRun.proofRecord.storageRootHash) {
    return {
      run: currentRun,
      history,
      persistence: repository.persistenceStatus(),
    };
  }

  try {
    const proofArtifact = await buildProofArtifactForRun(currentRun);
    const upload = await storeCanonicalProofOnZeroG(proofArtifact.canonicalJson);
    const nextHistory = await repository.updateRun(caseId, (run) => ({
      ...run,
      proofSummary:
        '0G Storage upload succeeded. The proof package now has a real storage root hash and can be anchored on 0G Chain.',
      proofRecord: {
        ...run.proofRecord,
        auditProofStatus: AuditProofStatus.STORED_ON_0G,
        storageStatus: StorageStatus.STORED,
        storageRootHash: upload.storageRootHash,
        storageTxHash: upload.storageTxHash,
        lastErrorMessage: null,
        failureState: 'No failed upload or registration',
        retryState: 'Ready for 0G Chain anchoring.',
      },
      auditEvent: {
        ...run.auditEvent,
        auditProofStatus: AuditProofStatus.STORED_ON_0G,
        storageStatus: StorageStatus.STORED,
      },
    }));
    const nextRun = nextHistory.find((run) => run.caseId === caseId);

    if (!nextRun) {
      return null;
    }

    return {
      run: nextRun,
      history: nextHistory,
      persistence: repository.persistenceStatus(),
    };
  } catch (error) {
    const failureMessage = error instanceof Error ? error.message : '0G Storage upload failed.';
    const nextHistory = await repository.updateRun(caseId, (run) => ({
      ...run,
      proofSummary:
        '0G Storage upload failed. Retry the 0G path first; if the testnet remains unstable, pivot to the documented IPFS fallback for the hackathon demo.',
      proofRecord: {
        ...run.proofRecord,
        storageStatus: StorageStatus.FAILED_TO_STORE,
        lastErrorMessage: failureMessage,
        failureState: failureMessage,
        retryState: 'Retry 0G Storage upload. If instability persists, switch to the documented IPFS fallback path.',
      },
      auditEvent: {
        ...run.auditEvent,
        storageStatus: StorageStatus.FAILED_TO_STORE,
      },
    }));
    const nextRun = nextHistory.find((run) => run.caseId === caseId);

    if (!nextRun) {
      return null;
    }

    return {
      run: nextRun,
      history: nextHistory,
      persistence: repository.persistenceStatus(),
    };
  }
}

export async function registerProofOnChainForRun(
  caseId: string,
  manualStorageRootHash: string | null,
): Promise<RunScenarioResponse | null> {
  const repository = getDemoRunRepository();
  const history = await repository.getHistory();
  const currentRun = history.find((run) => run.caseId === caseId);

  if (!currentRun) {
    return null;
  }

  if (currentRun.proofRecord.chainTxHash) {
    return {
      run: currentRun,
      history,
      persistence: repository.persistenceStatus(),
    };
  }

  const suppliedStorageRootHash = manualStorageRootHash?.trim() || null;

  try {
    const storageRootHash = resolveStorageRootHash(currentRun.proofRecord.storageRootHash, suppliedStorageRootHash);
    const registration = await registerProofOnZeroGChain({
      caseId: currentRun.caseId,
      proofType: currentRun.proofRecord.proofType,
      localPackageHash: currentRun.proofRecord.localPackageHash,
      storageRootHash,
    });

    const nextHistory = await repository.updateRun(caseId, (run) => {
      const resolvedStorageRootHash = run.proofRecord.storageRootHash ?? storageRootHash;

      return {
        ...run,
        proofSummary:
          resolvedStorageRootHash === storageRootHash && run.proofRecord.storageRootHash === null
            ? '0G Chain registration succeeded using a manually supplied external 0G storage root hash. In-app 0G Storage upload is still pending.'
            : '0G Chain registration succeeded for this proof package. Storage root hash and chain anchor are now linked in the demo record.',
        proofRecord: {
          ...run.proofRecord,
          auditProofStatus: AuditProofStatus.REGISTERED_ON_CHAIN,
          chainStatus: ChainStatus.ANCHOR_CONFIRMED,
          storageRootHash: resolvedStorageRootHash,
          chainTxHash: registration.chainTxHash,
          lastErrorMessage: null,
          failureState: 'No failed upload or registration',
          retryState: `0G Chain anchor confirmed at block ${registration.blockNumber.toString()}.`,
        },
        auditEvent: {
          ...run.auditEvent,
          auditProofStatus: AuditProofStatus.REGISTERED_ON_CHAIN,
          chainStatus: ChainStatus.ANCHOR_CONFIRMED,
        },
      };
    });

    const nextRun = nextHistory.find((run) => run.caseId === caseId);

    if (!nextRun) {
      return null;
    }

    return {
      run: nextRun,
      history: nextHistory,
      persistence: repository.persistenceStatus(),
    };
  } catch (error) {
    const failureMessage = error instanceof Error ? error.message : '0G Chain registration failed.';
    const nextHistory = await repository.updateRun(caseId, (run) => {
      const resolvedStorageRootHash = run.proofRecord.storageRootHash ?? suppliedStorageRootHash;
      const hasStorageRootHash = Boolean(resolvedStorageRootHash);

      return {
        ...run,
        proofSummary: hasStorageRootHash
          ? '0G Chain registration failed after a storage root hash was available. Retry after fixing chain connectivity or registrar configuration.'
          : '0G Chain registration could not start because no real 0G storage root hash was available yet.',
        proofRecord: {
          ...run.proofRecord,
          chainStatus: ChainStatus.FAILED_TO_REGISTER,
          storageRootHash: resolvedStorageRootHash,
          lastErrorMessage: failureMessage,
          failureState: failureMessage,
          retryState: 'Retry the chain registration after the registrar env vars, RPC access, and storage root hash are confirmed.',
        },
        auditEvent: {
          ...run.auditEvent,
          chainStatus: ChainStatus.FAILED_TO_REGISTER,
        },
      };
    });

    const nextRun = nextHistory.find((run) => run.caseId === caseId);

    if (!nextRun) {
      return null;
    }

    return {
      run: nextRun,
      history: nextHistory,
      persistence: repository.persistenceStatus(),
    };
  }
}

export function parseScenarioKey(value: unknown): ScenarioKeyType | null {
  if (value === ScenarioKey.STATE_A || value === ScenarioKey.STATE_C || value === ScenarioKey.STATE_D) {
    return value;
  }

  return null;
}

export function parseSimulatedAgentAction(value: unknown): SimulatedAgentAction | null {
  if (
    value === 'APPROVE_EXPLANATION_REQUEST' ||
    value === 'SEND_STAFF_MESSAGE' ||
    value === 'SIMULATE_STAFF_REPLY' ||
    value === 'RECORD_FINAL_DECISION' ||
    value === 'SILENT_LOG_CASE' ||
    value === 'MARK_OWNER_REVIEWED'
  ) {
    return value;
  }

  return null;
}

function getDemoRunRepository(): DemoRunRepository {
  const requested = process.env[DEMO_REPOSITORY_ENV]?.trim().toLowerCase();
  if (requested === DEMO_REPOSITORY_POSTGRES) {
    return postgresDemoRunRepository;
  }

  return inMemoryDemoRunRepository;
}

function parseCaseNumber(caseId: string): number {
  const parts = caseId.split('-');
  const suffix = parts.length > 1 ? parts[1] : '';
  const parsed = parseInt(suffix, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function buildProofArtifactForRun(run: DashboardRun) {
  const isAdminSimulation = run.actionLog.includes('admin_movement_simulation_saved');
  const triageOutcome = run.auditEvent.triageOutcome ?? TriageOutcome.AUTO_CLEAR;
  const backendRecommendedAction = getBackendRecommendedAction(run.auditEvent, triageOutcome);
  const proofArtifact = await createAuditEventProofPackageArtifact({
    auditEvent: run.auditEvent,
    supportingSummaries: {
      orderSummary: {
        orderId: run.orderId,
      },
      movementSummary: {
        movementId: run.movementId,
      },
      usageRuleSummary: {
        ruleId: 'RULE-PROTEIN-SHAKE-WHEY-001',
      },
      evidenceWindow: {
        startedAt: run.evidenceWindowStartedAt,
        endedAt: run.evidenceWindowEndedAt,
        sourceRef: isAdminSimulation ? 'local-dashboard-admin-simulation' : 'local-dashboard-scenario',
        summary: isAdminSimulation
          ? `${run.auditEvent.inventoryItemName} movement was entered in the dashboard admin simulation for ${run.auditEvent.productName}.`
          : `${run.auditEvent.inventoryItemName} movement reviewed for ${run.auditEvent.productName} order window ${run.evidenceWindowLabel} ICT.`,
      },
      evidenceCompleteness: isAdminSimulation
        ? 'Dashboard admin simulation only; no raw CCTV, no 0G upload, and no chain anchor in this route.'
        : 'Local fixture summaries only; no raw CCTV, no 0G upload, and no chain anchor in this route.',
      backendRecommendedAction,
    },
  });

  if (proofArtifact.localPackageHash !== run.proofRecord.localPackageHash) {
    throw new Error('Rebuilt proof package hash did not match the stored local hash for this run.');
  }

  return proofArtifact;
}

async function getPostgresDbOrNull() {
  if (!process.env.DATABASE_URL) {
    postgresDemoStatus = {
      mode: 'POSTGRES_ENABLED_BUT_FALLBACK_TO_MEMORY',
      label: 'Postgres enabled, using in-memory fallback',
      detail: `${DEMO_REPOSITORY_ENV}=${DEMO_REPOSITORY_POSTGRES} is set, but DATABASE_URL is missing.`,
    };

    return null;
  }

  try {
    if (!postgresInitPromise) {
      postgresInitPromise = (async () => {
        await checkDashboardDemoRunStoreHealth();
      })();
    }

    await postgresInitPromise;
    postgresDemoStatus = {
      mode: 'POSTGRES_ACTIVE_REAL',
      label: 'Postgres demo persistence active',
      detail: 'Dashboard demo history is persisted in Postgres (table: dashboard_demo_runs).',
    };

    return true;
  } catch (error) {
    postgresInitPromise = null;
    postgresDemoStatus = {
      mode: 'POSTGRES_ENABLED_BUT_FALLBACK_TO_MEMORY',
      label: 'Postgres enabled, using in-memory fallback',
      detail: `Postgres init failed; using in-memory demo repository. ${error instanceof Error ? error.message : ''}`.trim(),
    };
    return false;
  }
}

function createScenarioSeedFromAuditEvent(auditEvent: DashboardRun['auditEvent']): DashboardRun['scenario'] {
  const scenarioKey = getScenarioKeyForAuditEvent(auditEvent);

  return {
    scenarioKey,
    caseType: auditEvent.caseType,
    label: 'Admin Sim',
    orderQuantity: auditEvent.orderQuantity,
    actualMovementGrams: auditEvent.actualMovementGrams,
    movementDirection: MovementDirection.OUT,
    expectedUsageGrams: auditEvent.expectedUsageGrams,
    variancePercent: auditEvent.variancePercent,
    status: auditEvent.status,
    severity: auditEvent.severity,
    triageOutcome: auditEvent.triageOutcome ?? TriageOutcome.AUTO_CLEAR,
    auditProofStatus: auditEvent.auditProofStatus,
    storageStatus: auditEvent.storageStatus,
    chainStatus: auditEvent.chainStatus,
    proofType: auditEvent.proofType,
  };
}

function getScenarioKeyForAuditEvent(auditEvent: DashboardRun['auditEvent']): ScenarioKeyType {
  if (auditEvent.triageOutcome === TriageOutcome.AUTO_CLEAR) {
    return ScenarioKey.STATE_A;
  }

  if (auditEvent.triageOutcome === TriageOutcome.REQUEST_EXPLANATION) {
    return ScenarioKey.STATE_C;
  }

  return ScenarioKey.STATE_D;
}

async function createAdminSimulationRun(
  input: AdminSimulationInput,
  runNumber: number,
  persistence: DashboardPersistenceStatus,
): Promise<DashboardRun> {
  const createdAt = createScenarioTimestamp(runNumber);
  const evidenceWindowEndedAt = addMinutes(createdAt, WINDOW_DURATION_MINUTES);
  const caseId = `CASE-${String(runNumber).padStart(3, '0')}`;
  const auditEventId = `AE-${String(runNumber).padStart(3, '0')}`;
  const orderId = `ORD-${String(runNumber).padStart(3, '0')}`;
  const movementId = `MOV-${String(runNumber).padStart(3, '0')}`;
  const auditEvent = triageAuditEvent(
    createAuditEvent({
      auditEventId,
      caseId,
      scenarioKey: ScenarioKey.STATE_C,
      caseType: CaseType.ORDER_LINKED_AUDIT,
      orderQuantity: input.orderQuantity,
      usageRuleGramsPerUnit: demoWorldSeed.usageRule.gramsPerUnit,
      actualMovementGrams: input.actualMovementGrams,
      movementDirection: MovementDirection.OUT,
      productName: demoWorldSeed.productName,
      inventoryItemName: demoWorldSeed.inventoryItemName,
      containerId: demoWorldSeed.containerId,
      handlerName: demoWorldSeed.handler.name,
      cashierName: demoWorldSeed.cashier.name,
      ownerName: demoWorldSeed.owner.name,
      createdAt,
    }),
  );
  const scenario = createScenarioSeedFromAuditEvent(auditEvent);
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
        sourceRef: 'local-dashboard-admin-simulation',
        summary: `${auditEvent.inventoryItemName} movement was entered in the dashboard admin simulation for ${auditEvent.productName}.`,
      },
      evidenceCompleteness: 'Dashboard admin simulation only; no raw CCTV, no 0G upload, and no chain anchor in this route.',
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
    actionLog: `${createActionLogForTriage(auditEvent, triageOutcome)} | admin_movement_simulation_saved`,
    caseNote: `${createCaseNoteForTriage(auditEvent, triageOutcome)} Order and movement were entered from the dashboard admin simulation panel.`,
    proofSummary:
      'Backend route created a local AuditEvent proof package and SHA-256 hash from the admin movement simulation. 0G Storage upload and 0G Chain registration are not started.',
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
    simulatedAgent: createInitialSimulatedAgentInteraction(auditEvent, triageOutcome, evidenceWindowLabel),
    triageRuntimeSummary:
      'Dashboard simulation is active. Real OpenClaw gateway, skill, plugin, and Telegram runtime are not connected in this dashboard path.',
    persistence,
    auditEvent,
  };
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
    simulatedAgent: createInitialSimulatedAgentInteraction(auditEvent, triageOutcome, evidenceWindowLabel),
    triageRuntimeSummary:
      'Dashboard simulation is active. Real OpenClaw gateway, skill, plugin, and Telegram runtime are not connected in this dashboard path.',
    persistence,
    auditEvent,
  };
}

function applySimulatedAgentAction(
  run: DashboardRun,
  action: SimulatedAgentAction,
): Pick<DashboardRun, 'actionLog' | 'caseNote' | 'ownerAlertState' | 'simulatedAgent'> {
  const createdAtLabel = formatDateLabel(new Date().toISOString());
  const interaction = run.simulatedAgent;
  const baseTimeline = interaction.timeline;

  if (action === 'APPROVE_EXPLANATION_REQUEST') {
    const staffMessage = getStaffMessagePreview(
      run.auditEvent,
      TriageOutcome.REQUEST_EXPLANATION,
      run.evidenceWindowLabel,
    );

    return {
      ownerAlertState: 'Owner approved explanation request',
      actionLog: `${run.actionLog} | owner_approved_explanation_request`,
      caseNote: `${run.caseNote} Owner approved a simulated staff clarification request.`,
      simulatedAgent: {
        ...interaction,
        status: 'STAFF_MESSAGE_READY',
        headline: 'Staff message ready for simulated send',
        staffMessage,
        availableActions: ['SEND_STAFF_MESSAGE', 'SILENT_LOG_CASE'],
        timeline: [
          ...baseTimeline,
          createTimelineEntry('Owner approval recorded', 'Owner approved asking Joni for clarification.', 'Owner', createdAtLabel),
        ],
      },
    };
  }

  if (action === 'SEND_STAFF_MESSAGE') {
    return {
      ownerAlertState: 'Simulated staff message sent',
      actionLog: `${run.actionLog} | simulated_staff_message_sent`,
      caseNote: `${run.caseNote} Simulated staff message was sent from the dashboard preview.`,
      simulatedAgent: {
        ...interaction,
        status: 'STAFF_MESSAGE_SENT',
        headline: 'Waiting for simulated staff reply',
        availableActions: ['SIMULATE_STAFF_REPLY'],
        timeline: [
          ...baseTimeline,
          createTimelineEntry('Staff message simulated', 'Dashboard simulation marked the staff clarification as sent.', 'ARKA Agent', createdAtLabel),
        ],
      },
    };
  }

  if (action === 'SIMULATE_STAFF_REPLY') {
    const staffResponse =
      run.auditEvent.triageOutcome === TriageOutcome.ESCALATE
        ? 'Joni says the extra whey was used after a large spill during prep and needs owner review.'
        : 'Joni says one shake was remade after texture complaints, causing the extra whey usage.';

    return {
      ownerAlertState: 'Staff reply simulated',
      actionLog: `${run.actionLog} | simulated_staff_reply_received`,
      caseNote: `${run.caseNote} Simulated staff reply received for owner review.`,
      simulatedAgent: {
        ...interaction,
        status: 'STAFF_RESPONSE_RECEIVED',
        headline: 'Staff reply ready for owner decision',
        staffResponse,
        availableActions: ['RECORD_FINAL_DECISION'],
        timeline: [
          ...baseTimeline,
          createTimelineEntry('Staff reply simulated', staffResponse, run.auditEvent.handlerName, createdAtLabel),
        ],
      },
    };
  }

  if (action === 'RECORD_FINAL_DECISION') {
    const finalDecision =
      run.auditEvent.triageOutcome === TriageOutcome.ESCALATE
        ? 'Owner marked the case for manual review after receiving the simulated explanation.'
        : 'Owner accepted the explanation for the MVP demo and kept the proof package local.';

    return {
      ownerAlertState: 'Final decision recorded',
      actionLog: `${run.actionLog} | final_decision_recorded`,
      caseNote: `${run.caseNote} ${finalDecision}`,
      simulatedAgent: {
        ...interaction,
        status: 'FINAL_DECISION_RECORDED',
        headline: 'Final decision recorded in dashboard simulation',
        finalDecision,
        availableActions: [],
        timeline: [
          ...baseTimeline,
          createTimelineEntry('Final decision recorded', finalDecision, 'Owner', createdAtLabel),
        ],
      },
    };
  }

  if (action === 'SILENT_LOG_CASE') {
    return {
      ownerAlertState: 'Silent log selected',
      actionLog: `${run.actionLog} | owner_selected_silent_log`,
      caseNote: `${run.caseNote} Owner selected silent log in the dashboard simulation.`,
      simulatedAgent: {
        ...interaction,
        status: 'SILENT_LOGGED',
        headline: 'Case kept as a silent log',
        finalDecision: 'Owner kept this case in dashboard history without sending a staff message.',
        availableActions: [],
        timeline: [
          ...baseTimeline,
          createTimelineEntry('Silent log selected', 'Owner chose not to send a staff message for this demo case.', 'Owner', createdAtLabel),
        ],
      },
    };
  }

  return {
    ownerAlertState: 'Owner reviewed alert',
    actionLog: `${run.actionLog} | owner_reviewed_alert`,
    caseNote: `${run.caseNote} Owner reviewed the simulated critical alert.`,
    simulatedAgent: {
      ...interaction,
      status: 'FINAL_DECISION_RECORDED',
      headline: 'Owner review recorded',
      finalDecision: 'Owner reviewed the critical case and kept it open for manual follow-up.',
      availableActions: [],
      timeline: [
        ...baseTimeline,
        createTimelineEntry('Owner reviewed alert', 'Owner acknowledged the simulated critical review alert.', 'Owner', createdAtLabel),
      ],
    },
  };
}

function createInitialSimulatedAgentInteraction(
  auditEvent: DashboardRun['auditEvent'],
  triageOutcome: TriageOutcome,
  evidenceWindowLabel: string,
): SimulatedAgentInteraction {
  const createdAtLabel = formatDateLabel(auditEvent.createdAt);

  if (triageOutcome === TriageOutcome.AUTO_CLEAR) {
    return {
      mode: 'DASHBOARD_SIMULATION',
      status: 'NO_ACTION_NEEDED',
      headline: 'Auto-clear simulated by dashboard agent',
      ownerMessage: 'Usage looks normal. No owner alert or staff message is needed.',
      staffMessage: null,
      staffResponse: null,
      finalDecision: 'Case auto-cleared locally and kept in dashboard history.',
      availableActions: [],
      timeline: [
        createTimelineEntry('AuditEvent triaged', 'Deterministic fallback selected AUTO_CLEAR.', 'ARKA Agent', createdAtLabel),
        createTimelineEntry('No alert needed', 'Case was added to history without contacting owner or staff.', 'ARKA Agent', createdAtLabel),
      ],
    };
  }

  if (triageOutcome === TriageOutcome.REQUEST_EXPLANATION) {
    return {
      mode: 'DASHBOARD_SIMULATION',
      status: 'OWNER_APPROVAL_PENDING',
      headline: 'Owner approval needed',
      ownerMessage: [
        'ARKA created a review case.',
        `Expected ${auditEvent.expectedUsageGrams}g whey for ${auditEvent.orderQuantity} ${auditEvent.productName}s.`,
        `Movement recorded ${auditEvent.actualMovementGrams}g OUT during ${evidenceWindowLabel}.`,
        `Recommended action: ask ${auditEvent.handlerName} for an explanation.`,
      ].join(' '),
      staffMessage: getStaffMessagePreview(auditEvent, TriageOutcome.REQUEST_EXPLANATION, evidenceWindowLabel),
      staffResponse: null,
      finalDecision: null,
      availableActions: ['APPROVE_EXPLANATION_REQUEST', 'SILENT_LOG_CASE'],
      timeline: [
        createTimelineEntry('AuditEvent triaged', 'Deterministic fallback selected REQUEST_EXPLANATION.', 'ARKA Agent', createdAtLabel),
        createTimelineEntry('Owner approval pending', 'Dashboard simulation is waiting before sending staff follow-up.', 'ARKA Agent', createdAtLabel),
      ],
    };
  }

  return {
    mode: 'DASHBOARD_SIMULATION',
    status: 'OWNER_REVIEW_PENDING',
    headline: 'Critical review alert preview',
    ownerMessage: [
      'Critical review case created.',
      `Expected ${auditEvent.expectedUsageGrams}g and recorded ${auditEvent.actualMovementGrams}g OUT.`,
      `Evidence window: ${evidenceWindowLabel}.`,
      'Recommended action: owner or auditor reviews immediately before any follow-up decision.',
    ].join(' '),
    staffMessage: getStaffMessagePreview(auditEvent, TriageOutcome.ESCALATE, evidenceWindowLabel),
    staffResponse: null,
    finalDecision: null,
    availableActions: ['APPROVE_EXPLANATION_REQUEST', 'MARK_OWNER_REVIEWED'],
    timeline: [
      createTimelineEntry('AuditEvent triaged', 'Deterministic fallback selected ESCALATE.', 'ARKA Agent', createdAtLabel),
      createTimelineEntry('Owner alert preview shown', 'Dashboard simulation shows the critical review alert; no Telegram message was sent.', 'ARKA Agent', createdAtLabel),
    ],
  };
}

function createTimelineEntry(
  label: string,
  detail: string,
  actor: string,
  createdAtLabel: string,
): SimulatedAgentTimelineEntry {
  return {
    id: `${label.toLowerCase().replaceAll(' ', '-')}-${createdAtLabel.replaceAll(/[^0-9]/g, '')}`,
    label,
    detail,
    actor,
    createdAtLabel,
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
