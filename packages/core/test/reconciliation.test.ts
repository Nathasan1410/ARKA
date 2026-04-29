import { describe, expect, it } from 'vitest';

import {
  AuditProofStatus,
  ChainStatus,
  demoScenarioSeeds,
  demoWorldSeed,
  MovementDirection,
  Severity,
  StorageStatus,
} from '@arka/shared';

import {
  calculateExpectedUsage,
  calculateNetMovement,
  calculateVariance,
  createAuditEvent,
  createAuditEventFromScenario,
  determineSeverity,
} from '../src';

const baseContext = {
  auditEventId: 'audit-evt-001',
  caseId: 'case-001',
  productName: demoWorldSeed.productName,
  inventoryItemName: demoWorldSeed.inventoryItemName,
  containerId: demoWorldSeed.containerId,
  handlerName: demoWorldSeed.handler.name,
  cashierName: demoWorldSeed.cashier.name,
  ownerName: demoWorldSeed.owner.name,
  createdAt: '2026-04-29T00:00:00.000Z',
} as const;

describe('reconciliation scenarios', () => {
  it('classifies State A as CLEAR / NORMAL for 90g expected and 90g actual', () => {
    const event = createAuditEventFromScenario(demoScenarioSeeds.STATE_A, baseContext);

    expect(calculateExpectedUsage(3, demoWorldSeed.usageRule.gramsPerUnit)).toBe(90);
    expect(event.expectedUsageGrams).toBe(90);
    expect(event.actualMovementGrams).toBe(90);
    expect(event.netMovementGrams).toBe(90);
    expect(event.variancePercent).toBe(0);
    expect(event.status).toBe(demoScenarioSeeds.STATE_A.status);
    expect(event.severity).toBe(demoScenarioSeeds.STATE_A.severity);
  });

  it('classifies State C as 10% variance and MODERATE_VARIANCE for 90g expected and 99g actual', () => {
    const event = createAuditEventFromScenario(demoScenarioSeeds.STATE_C, baseContext);

    expect(calculateVariance(90, 99)).toBe(10);
    expect(event.expectedUsageGrams).toBe(90);
    expect(event.actualMovementGrams).toBe(99);
    expect(event.netMovementGrams).toBe(99);
    expect(event.variancePercent).toBe(10);
    expect(event.status).toBe(demoScenarioSeeds.STATE_C.status);
    expect(event.severity).toBe(demoScenarioSeeds.STATE_C.severity);
  });

  it('classifies State D as CRITICAL_REVIEW for 90g expected and 160g actual', () => {
    const event = createAuditEventFromScenario(demoScenarioSeeds.STATE_D, baseContext);

    expect(event.expectedUsageGrams).toBe(90);
    expect(event.actualMovementGrams).toBe(160);
    expect(event.netMovementGrams).toBe(160);
    expect(event.variancePercent).toBeCloseTo(77.77777777777777);
    expect(event.status).toBe(demoScenarioSeeds.STATE_D.status);
    expect(event.severity).toBe(demoScenarioSeeds.STATE_D.severity);
  });

  it('creates AuditEvent with null triageOutcome before agent triage', () => {
    const event = createAuditEvent({
      ...baseContext,
      scenarioKey: demoScenarioSeeds.STATE_C.scenarioKey,
      caseType: demoScenarioSeeds.STATE_C.caseType,
      orderQuantity: demoScenarioSeeds.STATE_C.orderQuantity,
      usageRuleGramsPerUnit: demoWorldSeed.usageRule.gramsPerUnit,
      actualMovementGrams: demoScenarioSeeds.STATE_C.actualMovementGrams,
      movementDirection: demoScenarioSeeds.STATE_C.movementDirection,
    });

    expect(event.triageOutcome).toBeNull();
    expect(event.auditProofStatus).toBe(AuditProofStatus.LOCAL_ONLY);
    expect(event.storageStatus).toBe(StorageStatus.NOT_STARTED);
    expect(event.chainStatus).toBe(ChainStatus.NOT_REGISTERED);
  });
});

describe('threshold boundaries', () => {
  it.each([
    { variance: 5, expected: Severity.NORMAL },
    { variance: 5.0001, expected: Severity.MINOR_VARIANCE },
    { variance: 7, expected: Severity.MINOR_VARIANCE },
    { variance: 7.0001, expected: Severity.MODERATE_VARIANCE },
    { variance: 10, expected: Severity.MODERATE_VARIANCE },
    { variance: 10.0001, expected: Severity.SIGNIFICANT_VARIANCE },
    { variance: 20, expected: Severity.SIGNIFICANT_VARIANCE },
    { variance: 20.0001, expected: Severity.CRITICAL_REVIEW },
  ])('maps $variance% to $expected', ({ variance, expected }) => {
    expect(determineSeverity(variance)).toBe(expected);
  });
});

describe('movement math', () => {
  it('treats RETURN as negative net movement', () => {
    expect(
      calculateNetMovement([
        { amountGrams: 160, direction: MovementDirection.OUT },
        { amountGrams: 70, direction: MovementDirection.RETURN },
      ]),
    ).toBe(90);
  });
});
