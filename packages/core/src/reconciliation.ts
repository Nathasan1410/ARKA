import {
  AuditEvent,
  AuditEventStatus,
  AuditProofStatus,
  ChainStatus,
  CaseType,
  demoWorldSeed,
  DemoScenarioSeed,
  MovementDirection,
  ProofType,
  Severity,
  StorageStatus,
} from '@arka/shared';

export type MovementEntry = {
  amountGrams: number;
  direction: typeof MovementDirection[keyof typeof MovementDirection];
};

export type CreateAuditEventInput = {
  auditEventId: string;
  caseId: string;
  scenarioKey: DemoScenarioSeed['scenarioKey'];
  caseType: CaseType;
  orderQuantity: number;
  usageRuleGramsPerUnit: number;
  actualMovementGrams: number;
  movementDirection: typeof MovementDirection[keyof typeof MovementDirection];
  productName: string;
  inventoryItemName: string;
  containerId: string;
  handlerName: string;
  cashierName: string;
  ownerName: string;
  createdAt?: string;
};

export function calculateExpectedUsage(orderQuantity: number, usageRuleGramsPerUnit: number): number {
  return orderQuantity * usageRuleGramsPerUnit;
}

export function calculateNetMovement(movements: readonly MovementEntry[]): number {
  return movements.reduce((total, movement) => {
    return total + (movement.direction === MovementDirection.RETURN ? -movement.amountGrams : movement.amountGrams);
  }, 0);
}

export function calculateVariance(expectedGrams: number, actualGrams: number): number {
  if (expectedGrams === 0) {
    return actualGrams === 0 ? 0 : 100;
  }

  return (Math.abs(actualGrams - expectedGrams) / expectedGrams) * 100;
}

export function determineAuditStatus(
  expectedGrams: number,
  actualGrams: number,
  movementDirection: CreateAuditEventInput['movementDirection'],
): AuditEvent['status'] {
  if (expectedGrams === actualGrams) {
    return AuditEventStatus.CLEAR;
  }

  if (actualGrams > expectedGrams) {
    return AuditEventStatus.OVER_EXPECTED_USAGE;
  }

  if (actualGrams < expectedGrams) {
    return AuditEventStatus.UNDER_EXPECTED_USAGE;
  }

  return AuditEventStatus.REVIEW_NEEDED;
}

export function determineSeverity(variancePercent: number): Severity {
  const variance = Math.abs(variancePercent);

  if (variance <= 5) {
    return Severity.NORMAL;
  }

  if (variance <= 7) {
    return Severity.MINOR_VARIANCE;
  }

  if (variance <= 10) {
    return Severity.MODERATE_VARIANCE;
  }

  if (variance <= 20) {
    return Severity.SIGNIFICANT_VARIANCE;
  }

  return Severity.CRITICAL_REVIEW;
}

export function createAuditEvent(input: CreateAuditEventInput): AuditEvent {
  const expectedUsageGrams = calculateExpectedUsage(input.orderQuantity, input.usageRuleGramsPerUnit);
  const variancePercent = calculateVariance(expectedUsageGrams, input.actualMovementGrams);
  const status = determineAuditStatus(expectedUsageGrams, input.actualMovementGrams, input.movementDirection);
  const severity = determineSeverity(variancePercent);

  return {
    auditEventId: input.auditEventId,
    caseId: input.caseId,
    scenarioKey: input.scenarioKey,
    caseType: input.caseType,
    productName: input.productName,
    inventoryItemName: input.inventoryItemName,
    containerId: input.containerId,
    orderQuantity: input.orderQuantity,
    usageRuleGramsPerUnit: input.usageRuleGramsPerUnit,
    expectedUsageGrams,
    actualMovementGrams: input.actualMovementGrams,
    netMovementGrams: input.movementDirection === MovementDirection.RETURN ? -input.actualMovementGrams : input.actualMovementGrams,
    variancePercent,
    status,
    severity,
    triageOutcome: null,
    proofType: ProofType.AUDIT_EVENT_CREATED,
    auditProofStatus: AuditProofStatus.LOCAL_ONLY,
    storageStatus: StorageStatus.NOT_STARTED,
    chainStatus: ChainStatus.NOT_REGISTERED,
    handlerName: input.handlerName,
    cashierName: input.cashierName,
    ownerName: input.ownerName,
    createdAt: input.createdAt ?? new Date(0).toISOString(),
  };
}

export function createAuditEventFromScenario(
  scenario: DemoScenarioSeed,
  context: Omit<
    CreateAuditEventInput,
    'orderQuantity' | 'usageRuleGramsPerUnit' | 'actualMovementGrams' | 'movementDirection' | 'caseType' | 'scenarioKey'
  >,
): AuditEvent {
  return createAuditEvent({
    ...context,
    scenarioKey: scenario.scenarioKey,
    caseType: scenario.caseType,
    orderQuantity: scenario.orderQuantity,
    usageRuleGramsPerUnit: demoWorldSeed.usageRule.gramsPerUnit,
    actualMovementGrams: scenario.actualMovementGrams,
    movementDirection: scenario.movementDirection,
  });
}
