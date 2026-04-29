import { createAuditEventFromScenario } from '@arka/core';
import {
  demoScenarioSeeds,
  demoWorldSeed,
  ScenarioKey,
  TriageOutcome,
  type DemoScenarioSeed,
} from '@arka/shared';
import {
  createActionLogForTriage,
  createCaseNoteForTriage,
  formatOwnerRecommendation,
  triageAuditEvent,
} from '@arka/agent';

const SCENARIO_SEQUENCE = [ScenarioKey.STATE_A, ScenarioKey.STATE_C, ScenarioKey.STATE_D] as const;

export type ScenarioCard = {
  key: (typeof SCENARIO_SEQUENCE)[number];
  title: string;
  expectedOutcome: string;
  intent: string;
  proofPath: string;
  triagePath: string;
};

export type DashboardRun = {
  scenario: DemoScenarioSeed;
  caseId: string;
  orderId: string;
  movementId: string;
  createdAtLabel: string;
  movementTimestampLabel: string;
  evidenceWindowLabel: string;
  ownerAlertState: string;
  ownerAlertCopy: string;
  staffMessagePreview: string | null;
  ownerRecommendation: string;
  actionLog: string;
  caseNote: string;
  proofSummary: string;
  triageRuntimeSummary: string;
  auditEvent: ReturnType<typeof triageAuditEvent>;
};

const SCENARIO_CARD_CONTENT: Record<(typeof SCENARIO_SEQUENCE)[number], Omit<ScenarioCard, 'key'>> = {
  STATE_A: {
    title: 'State A - Clear',
    expectedOutcome: 'CLEAR / NORMAL',
    intent: 'Order-linked movement matches expected whey usage.',
    proofPath: 'Local-only audit record',
    triagePath: 'AUTO_CLEAR / no owner alert',
  },
  STATE_C: {
    title: 'State C - Request Explanation',
    expectedOutcome: 'OVER_EXPECTED_USAGE / MODERATE_VARIANCE',
    intent: 'Usage sits 10% above expected range and needs clarification.',
    proofPath: 'Show proof statuses without 0G upload',
    triagePath: 'REQUEST_EXPLANATION / owner approval needed',
  },
  STATE_D: {
    title: 'State D - Escalate',
    expectedOutcome: 'OVER_EXPECTED_USAGE / CRITICAL_REVIEW',
    intent: 'Usage is materially above expected range and needs immediate review.',
    proofPath: 'Show proof statuses without chain registration',
    triagePath: 'ESCALATE / owner alert pending',
  },
};

export const scenarioCards: readonly ScenarioCard[] = SCENARIO_SEQUENCE.map((key) => ({
  key,
  ...SCENARIO_CARD_CONTENT[key],
}));

const WINDOW_START_HOUR = 15;
const WINDOW_START_MINUTE = 54;
const WINDOW_SPACING_MINUTES = 7;
const WINDOW_DURATION_MINUTES = 5;

export function createDashboardRun(scenarioKey: (typeof SCENARIO_SEQUENCE)[number], runNumber: number): DashboardRun {
  const scenario = demoScenarioSeeds[scenarioKey];
  const createdAt = createScenarioTimestamp(runNumber);
  const caseId = `CASE-${String(runNumber).padStart(3, '0')}`;
  const auditEventId = `AE-${String(runNumber).padStart(3, '0')}`;
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

  return {
    scenario,
    caseId,
    orderId: `ORD-${String(runNumber).padStart(3, '0')}`,
    movementId: `MOV-${String(runNumber).padStart(3, '0')}`,
    createdAtLabel: formatDateLabel(createdAt),
    movementTimestampLabel: evidenceWindowLabel.split(' - ')[0],
    evidenceWindowLabel,
    ownerAlertState: getOwnerAlertState(triageOutcome),
    ownerAlertCopy: getOwnerAlertCopy(auditEvent, triageOutcome, evidenceWindowLabel),
    staffMessagePreview: getStaffMessagePreview(auditEvent, triageOutcome, evidenceWindowLabel),
    ownerRecommendation: formatOwnerRecommendation(auditEvent, triageOutcome),
    actionLog: createActionLogForTriage(auditEvent, triageOutcome),
    caseNote: createCaseNoteForTriage(auditEvent, triageOutcome),
    proofSummary:
      'Local dashboard preview only. Proof package builder, 0G Storage upload, and 0G Chain registration are not started.',
    triageRuntimeSummary:
      'Deterministic fallback is active. Real OpenClaw gateway, skill, plugin, and Telegram runtime are not connected in this dashboard shell.',
    auditEvent,
  };
}

function createScenarioTimestamp(runNumber: number): string {
  const start = new Date(Date.UTC(2026, 3, 29, 8, WINDOW_START_MINUTE + (runNumber - 1) * WINDOW_SPACING_MINUTES, 0));
  return start.toISOString();
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
    return 'Owner approval needed';
  }

  return 'Owner alert pending';
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
