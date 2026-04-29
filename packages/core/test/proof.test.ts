import { describe, expect, it } from 'vitest';

import { ActorRole, demoScenarioSeeds, demoWorldSeed, MovementDirection, TriageOutcome } from '@arka/shared';

import {
  buildAuditEventProofPackage,
  canonicalizeProofPackage,
  createAuditEventFromScenario,
  createAuditEventProofPackageArtifact,
  hashProofPackage,
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

function buildSupportingSummaries() {
  return {
    orderSummary: {
      productName: demoWorldSeed.productName,
      orderId: 'order-001',
      orderQuantity: 3,
    },
    movementSummary: {
      movementId: 'movement-001',
      movementDirection: MovementDirection.OUT,
      containerId: demoWorldSeed.containerId,
      actualMovementGrams: 99,
      inventoryItemName: demoWorldSeed.inventoryItemName,
      netMovementGrams: 99,
    },
    usageRuleSummary: {
      expectedUsageGrams: 90,
      gramsPerUnit: demoWorldSeed.usageRule.gramsPerUnit,
      inventoryItemName: demoWorldSeed.inventoryItemName,
      productName: demoWorldSeed.productName,
      ruleId: 'rule-001',
    },
    actorContext: {
      handler: {
        name: demoWorldSeed.handler.name,
        role: ActorRole.HANDLER,
        actorId: 'handler-001',
      },
      cashier: {
        name: demoWorldSeed.cashier.name,
        role: ActorRole.CASHIER,
        actorId: 'cashier-001',
      },
      owner: {
        name: demoWorldSeed.owner.name,
        role: ActorRole.OWNER,
        actorId: 'owner-001',
      },
    },
    evidenceWindow: {
      startedAt: '2026-04-29T00:00:00.000Z',
      endedAt: '2026-04-29T00:05:00.000Z',
      summary: 'POS order and stock movement collected from the same audit window.',
      sourceRef: 'proof-window-001',
    },
    evidenceCompleteness: 'ORDER_AND_MOVEMENT_PRESENT',
    backendRecommendedAction: 'Request explanation for movement above expected range.',
  };
}

describe('AuditEvent proof packages', () => {
  it('builds an AuditEvent proof package without requiring OpenClaw triage output', async () => {
    const auditEvent = createAuditEventFromScenario(demoScenarioSeeds.STATE_C, baseContext);

    expect(auditEvent.triageOutcome).toBeNull();

    const proofPackage = buildAuditEventProofPackage({
      auditEvent,
      supportingSummaries: buildSupportingSummaries(),
    });

    expect(proofPackage.status).toBe(auditEvent.status);
    expect(proofPackage.severity).toBe(auditEvent.severity);
    expect(proofPackage.variancePercent).toBe(auditEvent.variancePercent);
    expect(proofPackage).not.toHaveProperty('triageOutcome');
    expect(proofPackage).not.toHaveProperty('triageSource');
    await expect(hashProofPackage(proofPackage)).resolves.toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('produces identical canonical JSON and local package hash for semantically identical packages', async () => {
    const auditEvent = createAuditEventFromScenario(demoScenarioSeeds.STATE_C, baseContext);
    const artifact = await createAuditEventProofPackageArtifact({
      auditEvent,
      supportingSummaries: buildSupportingSummaries(),
    });

    const samePackageDifferentPropertyOrder = {
      variancePercent: artifact.proofPackage.variancePercent,
      usageRuleSummary: {
        ruleId: 'rule-001',
        expectedUsageGrams: 90,
        productName: demoWorldSeed.productName,
        inventoryItemName: demoWorldSeed.inventoryItemName,
        gramsPerUnit: demoWorldSeed.usageRule.gramsPerUnit,
      },
      status: artifact.proofPackage.status,
      severity: artifact.proofPackage.severity,
      scenarioKey: artifact.proofPackage.scenarioKey,
      proofType: artifact.proofPackage.proofType,
      packageVersion: artifact.proofPackage.packageVersion,
      packageType: artifact.proofPackage.packageType,
      orderSummary: {
        orderQuantity: 3,
        productName: demoWorldSeed.productName,
        orderId: 'order-001',
      },
      netMovementGrams: artifact.proofPackage.netMovementGrams,
      movementSummary: {
        netMovementGrams: 99,
        inventoryItemName: demoWorldSeed.inventoryItemName,
        movementId: 'movement-001',
        movementDirection: MovementDirection.OUT,
        containerId: demoWorldSeed.containerId,
        actualMovementGrams: 99,
      },
      evidenceWindow: {
        summary: 'POS order and stock movement collected from the same audit window.',
        sourceRef: 'proof-window-001',
        startedAt: '2026-04-29T00:00:00.000Z',
        endedAt: '2026-04-29T00:05:00.000Z',
      },
      evidenceCompleteness: artifact.proofPackage.evidenceCompleteness,
      expectedUsageGrams: artifact.proofPackage.expectedUsageGrams,
      createdAt: artifact.proofPackage.createdAt,
      caseType: artifact.proofPackage.caseType,
      caseId: artifact.proofPackage.caseId,
      backendRecommendedAction: artifact.proofPackage.backendRecommendedAction,
      auditEventId: artifact.proofPackage.auditEventId,
      actorContext: {
        owner: {
          role: ActorRole.OWNER,
          actorId: 'owner-001',
          name: demoWorldSeed.owner.name,
        },
        handler: {
          role: ActorRole.HANDLER,
          actorId: 'handler-001',
          name: demoWorldSeed.handler.name,
        },
        cashier: {
          role: ActorRole.CASHIER,
          actorId: 'cashier-001',
          name: demoWorldSeed.cashier.name,
        },
      },
      actualMovementGrams: artifact.proofPackage.actualMovementGrams,
    };

    await expect(hashProofPackage(samePackageDifferentPropertyOrder)).resolves.toBe(artifact.localPackageHash);
    await expect(hashProofPackage(artifact.canonicalJson)).resolves.toBe(artifact.localPackageHash);
    expect(canonicalizeProofPackage(samePackageDifferentPropertyOrder)).toBe(artifact.canonicalJson);
  });

  it('keeps the initial AuditEvent proof package independent from later OpenClaw triage output', async () => {
    const auditEventBeforeTriage = createAuditEventFromScenario(demoScenarioSeeds.STATE_D, baseContext);
    const auditEventAfterTriage = {
      ...auditEventBeforeTriage,
      triageOutcome: TriageOutcome.ESCALATE,
    };

    const proofPackageBeforeTriage = buildAuditEventProofPackage({
      auditEvent: auditEventBeforeTriage,
      supportingSummaries: {
        ...buildSupportingSummaries(),
        backendRecommendedAction: 'Escalate case for owner review due to critical over-usage.',
      },
    });
    const proofPackageAfterTriage = buildAuditEventProofPackage({
      auditEvent: auditEventAfterTriage,
      supportingSummaries: {
        ...buildSupportingSummaries(),
        backendRecommendedAction: 'Escalate case for owner review due to critical over-usage.',
      },
    });

    expect(proofPackageAfterTriage).toEqual(proofPackageBeforeTriage);
    await expect(hashProofPackage(proofPackageAfterTriage)).resolves.toBe(
      await hashProofPackage(proofPackageBeforeTriage),
    );
    expect(proofPackageAfterTriage.backendRecommendedAction).toBe(
      'Escalate case for owner review due to critical over-usage.',
    );
    expect(proofPackageAfterTriage).not.toHaveProperty('openClawRecommendation');
  });

  it.each([
    {
      scenario: demoScenarioSeeds.STATE_C,
      expectedAction: 'Request explanation for movement above expected range.',
    },
    {
      scenario: demoScenarioSeeds.STATE_D,
      expectedAction: 'Escalate case for owner review due to critical over-usage.',
    },
  ])('builds a proof package for $scenario.label', async ({ scenario, expectedAction }) => {
    const auditEvent = createAuditEventFromScenario(scenario, baseContext);
    const proofPackage = buildAuditEventProofPackage({
      auditEvent,
      supportingSummaries: {
        ...buildSupportingSummaries(),
        movementSummary: {
          movementId: `${scenario.scenarioKey.toLowerCase()}-movement`,
          movementDirection: scenario.movementDirection,
          containerId: demoWorldSeed.containerId,
          actualMovementGrams: scenario.actualMovementGrams,
          inventoryItemName: demoWorldSeed.inventoryItemName,
          netMovementGrams: scenario.actualMovementGrams,
        },
        evidenceWindow: {
          startedAt: '2026-04-29T00:00:00.000Z',
          endedAt: '2026-04-29T00:05:00.000Z',
          summary: `${scenario.label} proof window for order and movement evidence.`,
          sourceRef: `${scenario.scenarioKey.toLowerCase()}-window`,
        },
        backendRecommendedAction: expectedAction,
      },
    });

    expect(proofPackage.auditEventId).toBe(auditEvent.auditEventId);
    expect(proofPackage.caseType).toBe(auditEvent.caseType);
    expect(proofPackage.status).toBe(auditEvent.status);
    expect(proofPackage.severity).toBe(auditEvent.severity);
    expect(proofPackage.backendRecommendedAction).toBe(expectedAction);
    expect(proofPackage.orderSummary.orderQuantity).toBe(3);
    expect(proofPackage.usageRuleSummary.expectedUsageGrams).toBe(90);
    expect(proofPackage.movementSummary.actualMovementGrams).toBe(scenario.actualMovementGrams);
    expect(proofPackage.evidenceWindow.sourceRef).toBe(`${scenario.scenarioKey.toLowerCase()}-window`);
    await expect(hashProofPackage(proofPackage)).resolves.toMatch(/^0x[a-f0-9]{64}$/);
  });
});
