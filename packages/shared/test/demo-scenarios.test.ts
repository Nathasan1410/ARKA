import { describe, expect, it } from 'vitest';

import {
  AuditProofStatus,
  AuditEventStatus,
  CaseType,
  ChainStatus,
  demoScenarioSeeds,
  demoWorldSeed,
  ScenarioKey,
  Severity,
  StorageStatus,
  TriageOutcome,
} from '../src';

describe('canonical enums', () => {
  it('match the MVP demo interaction brief values', () => {
    expect(Object.values(AuditEventStatus)).toEqual([
      'CLEAR',
      'REVIEW_NEEDED',
      'UNMATCHED_MOVEMENT',
      'OVER_EXPECTED_USAGE',
      'UNDER_EXPECTED_USAGE',
      'MISSING_MOVEMENT',
      'APPROVED_EXCEPTION',
    ]);

    expect(Object.values(Severity)).toEqual([
      'NORMAL',
      'MINOR_VARIANCE',
      'MODERATE_VARIANCE',
      'SIGNIFICANT_VARIANCE',
      'CRITICAL_REVIEW',
    ]);

    expect(Object.values(TriageOutcome)).toEqual([
      'AUTO_CLEAR',
      'SILENT_LOG',
      'REQUEST_EXPLANATION',
      'ESCALATE',
    ]);

    expect(Object.values(AuditProofStatus)).toEqual([
      'LOCAL_ONLY',
      'STORED_ON_0G',
      'REGISTERED_ON_CHAIN',
      'VERIFIED',
    ]);

    expect(Object.values(StorageStatus)).toEqual([
      'NOT_STARTED',
      'PENDING_UPLOAD',
      'STORED',
      'FAILED_TO_STORE',
      'RETRY_PENDING',
    ]);

    expect(Object.values(ChainStatus)).toEqual([
      'NOT_REGISTERED',
      'PENDING_REGISTRATION',
      'REGISTERED',
      'FAILED_TO_REGISTER',
      'ANCHOR_CONFIRMED',
    ]);

    expect(Object.values(CaseType)).toEqual(['ORDER_LINKED_AUDIT', 'MOVEMENT_ONLY_AUDIT']);
    expect(Object.values(ScenarioKey)).toEqual(['STATE_A', 'STATE_C', 'STATE_D']);
  });
});

describe('demoWorldSeed', () => {
  it('uses the canonical protein bar demo facts', () => {
    expect(demoWorldSeed.owner.name).toBe('Arka Owner');
    expect(demoWorldSeed.cashier.name).toBe('Nina');
    expect(demoWorldSeed.handler.name).toBe('Joni');
    expect(demoWorldSeed.productName).toBe('Protein Shake');
    expect(demoWorldSeed.inventoryItemName).toBe('Whey Protein');
    expect(demoWorldSeed.usageRule.gramsPerUnit).toBe(30);
  });
});

describe('demoScenarioSeeds', () => {
  it('pins the canonical A/C/D scenario outputs', () => {
    expect(demoScenarioSeeds.STATE_A).toMatchObject({
      scenarioKey: ScenarioKey.STATE_A,
      caseType: CaseType.ORDER_LINKED_AUDIT,
      orderQuantity: 3,
      expectedUsageGrams: 90,
      actualMovementGrams: 90,
      status: AuditEventStatus.CLEAR,
      severity: Severity.NORMAL,
      triageOutcome: TriageOutcome.AUTO_CLEAR,
    });

    expect(demoScenarioSeeds.STATE_C).toMatchObject({
      scenarioKey: ScenarioKey.STATE_C,
      caseType: CaseType.ORDER_LINKED_AUDIT,
      orderQuantity: 3,
      expectedUsageGrams: 90,
      actualMovementGrams: 99,
      variancePercent: 10,
      status: AuditEventStatus.OVER_EXPECTED_USAGE,
      severity: Severity.MODERATE_VARIANCE,
      triageOutcome: TriageOutcome.REQUEST_EXPLANATION,
    });

    expect(demoScenarioSeeds.STATE_D).toMatchObject({
      scenarioKey: ScenarioKey.STATE_D,
      caseType: CaseType.ORDER_LINKED_AUDIT,
      orderQuantity: 3,
      expectedUsageGrams: 90,
      actualMovementGrams: 160,
      status: AuditEventStatus.OVER_EXPECTED_USAGE,
      severity: Severity.CRITICAL_REVIEW,
      triageOutcome: TriageOutcome.ESCALATE,
    });
  });

  it('keeps ScenarioKey distinct from CaseType', () => {
    expect(ScenarioKey.STATE_A).toBe('STATE_A');
    expect(CaseType.ORDER_LINKED_AUDIT).toBe('ORDER_LINKED_AUDIT');
    expect(ScenarioKey.STATE_A).not.toBe(CaseType.ORDER_LINKED_AUDIT);

    for (const scenario of Object.values(demoScenarioSeeds)) {
      expect(Object.values(ScenarioKey)).toContain(scenario.scenarioKey);
      expect(Object.values(CaseType)).toContain(scenario.caseType);
      expect(scenario.scenarioKey).not.toBe(scenario.caseType);
    }
  });
});
