import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as triageModule from './index.ts';

const determineTriageOutcome =
  triageModule.determineTriageOutcome ?? triageModule.default?.determineTriageOutcome;
const triageAuditEvent = triageModule.triageAuditEvent ?? triageModule.default?.triageAuditEvent;
const TriageSource = triageModule.TriageSource ?? triageModule.default?.TriageSource;

const sharedAuditFields = {
  caseType: 'ORDER_LINKED_AUDIT',
  productName: 'Protein Shake',
  inventoryItemName: 'Whey Protein',
  containerId: 'RACK-WHEY-01',
  orderQuantity: 3,
  usageRuleGramsPerUnit: 30,
  expectedUsageGrams: 90,
  proofType: 'AUDIT_EVENT_CREATED',
  auditProofStatus: 'LOCAL_ONLY',
  storageStatus: 'NOT_STARTED',
  chainStatus: 'NOT_REGISTERED',
  handlerName: 'Joni',
  cashierName: 'Nina',
  ownerName: 'Arka Owner',
  createdAt: '2026-04-29T00:00:00.000Z',
};

const scenarioFixtures = {
  STATE_A: {
    scenarioKey: 'STATE_A',
    actualMovementGrams: 90,
    netMovementGrams: 90,
    variancePercent: 0,
    status: 'CLEAR',
    severity: 'NORMAL',
    expectedTriageOutcome: 'AUTO_CLEAR',
  },
  STATE_C: {
    scenarioKey: 'STATE_C',
    actualMovementGrams: 99,
    netMovementGrams: 99,
    variancePercent: 10,
    status: 'OVER_EXPECTED_USAGE',
    severity: 'MODERATE_VARIANCE',
    expectedTriageOutcome: 'REQUEST_EXPLANATION',
  },
  STATE_D: {
    scenarioKey: 'STATE_D',
    actualMovementGrams: 160,
    netMovementGrams: 160,
    variancePercent: 77.77777777777777,
    status: 'OVER_EXPECTED_USAGE',
    severity: 'CRITICAL_REVIEW',
    expectedTriageOutcome: 'ESCALATE',
  },
};

function buildScenarioAuditEvent(scenarioKey) {
  const scenario = scenarioFixtures[scenarioKey];

  return {
    ...sharedAuditFields,
    ...scenario,
    auditEventId: `audit-${scenario.scenarioKey.toLowerCase()}`,
    caseId: `case-${scenario.scenarioKey.toLowerCase()}`,
    triageOutcome: null,
  };
}

describe('triageAuditEvent', () => {
  it('maps State A to AUTO_CLEAR', () => {
    const auditEvent = buildScenarioAuditEvent('STATE_A');

    assert.equal(determineTriageOutcome(auditEvent), scenarioFixtures.STATE_A.expectedTriageOutcome);
    assert.equal(triageAuditEvent(auditEvent).triageOutcome, scenarioFixtures.STATE_A.expectedTriageOutcome);
    assert.equal(triageAuditEvent(auditEvent).triageSource, TriageSource.DETERMINISTIC_FALLBACK);
  });

  it('maps State C to REQUEST_EXPLANATION', () => {
    const auditEvent = buildScenarioAuditEvent('STATE_C');

    assert.equal(determineTriageOutcome(auditEvent), scenarioFixtures.STATE_C.expectedTriageOutcome);
    assert.equal(triageAuditEvent(auditEvent).triageOutcome, scenarioFixtures.STATE_C.expectedTriageOutcome);
    assert.equal(triageAuditEvent(auditEvent).triageSource, TriageSource.DETERMINISTIC_FALLBACK);
  });

  it('maps State D to ESCALATE', () => {
    const auditEvent = buildScenarioAuditEvent('STATE_D');

    assert.equal(determineTriageOutcome(auditEvent), scenarioFixtures.STATE_D.expectedTriageOutcome);
    assert.equal(triageAuditEvent(auditEvent).triageOutcome, scenarioFixtures.STATE_D.expectedTriageOutcome);
    assert.equal(triageAuditEvent(auditEvent).triageSource, TriageSource.DETERMINISTIC_FALLBACK);
  });

  it('does not mutate reconciliation facts', () => {
    const auditEvent = buildScenarioAuditEvent('STATE_C');
    const originalSnapshot = structuredClone(auditEvent);

    Object.freeze(auditEvent);

    const triagedAuditEvent = triageAuditEvent(auditEvent);

    assert.deepEqual(auditEvent, originalSnapshot);
    assert.notEqual(triagedAuditEvent, auditEvent);
    assert.equal(auditEvent.triageOutcome, null);
    assert.equal(triagedAuditEvent.expectedUsageGrams, originalSnapshot.expectedUsageGrams);
    assert.equal(triagedAuditEvent.actualMovementGrams, originalSnapshot.actualMovementGrams);
    assert.equal(triagedAuditEvent.variancePercent, originalSnapshot.variancePercent);
    assert.equal(triagedAuditEvent.status, originalSnapshot.status);
    assert.equal(triagedAuditEvent.severity, originalSnapshot.severity);
    assert.equal(triagedAuditEvent.triageOutcome, scenarioFixtures.STATE_C.expectedTriageOutcome);
    assert.equal(triagedAuditEvent.triageSource, TriageSource.DETERMINISTIC_FALLBACK);
  });

  it('keeps deterministic fallback available when OpenClaw runtime is unavailable', () => {
    const auditEvent = buildScenarioAuditEvent('STATE_D');
    let runtimeWasCalled = false;

    const triagedAuditEvent = triageAuditEvent(auditEvent, {
      openClawRuntime: {
        isAvailable: () => false,
        triageAuditEvent: () => {
          runtimeWasCalled = true;
          return 'AUTO_CLEAR';
        },
      },
    });

    assert.equal(runtimeWasCalled, false);
    assert.equal(triagedAuditEvent.triageOutcome, scenarioFixtures.STATE_D.expectedTriageOutcome);
    assert.equal(triagedAuditEvent.triageSource, TriageSource.DETERMINISTIC_FALLBACK);
  });

  it('uses request-explanation fallback for unknown future review states', () => {
    const auditEvent = buildScenarioAuditEvent('STATE_C');
    auditEvent.status = 'REVIEW_NEEDED';
    auditEvent.severity = 'SIGNIFICANT_VARIANCE';

    const triagedAuditEvent = triageAuditEvent(auditEvent);

    assert.equal(triagedAuditEvent.triageOutcome, 'REQUEST_EXPLANATION');
    assert.equal(triagedAuditEvent.triageSource, TriageSource.DETERMINISTIC_FALLBACK);
  });
});
