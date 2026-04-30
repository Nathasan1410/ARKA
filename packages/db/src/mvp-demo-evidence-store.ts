import type { AuditEvent, TriageOutcome } from '@arka/shared';
import { and, eq } from 'drizzle-orm';

import { getDb } from './client';
import {
  actors,
  auditEvents,
  inventoryItems,
  inventoryMovements,
  orders,
  products,
  proofRecords,
  usageRules,
} from './schema';

export const PersistedTriageSource = {
  DETERMINISTIC_FALLBACK: 'DETERMINISTIC_FALLBACK',
  OPENCLAW_RUNTIME: 'OPENCLAW_RUNTIME',
} as const;

export type PersistedTriageSource = (typeof PersistedTriageSource)[keyof typeof PersistedTriageSource];

export type PersistedTriageAuditEvent = AuditEvent & {
  triageOutcome: TriageOutcome;
  triageSource: PersistedTriageSource;
};

export type PersistDemoOperationalEvidenceInput = {
  auditEvent: PersistedTriageAuditEvent;
  externalOrderId: string;
  movementType: 'OUT' | 'RETURN' | 'WASTE' | 'ADJUSTMENT';
  movementBeforeQuantity: number | null;
  movementAfterQuantity: number | null;
  evidenceWindowStartAt: string | null;
  evidenceWindowEndAt: string | null;
  proofHash: string | null;
  chainTransactionHash: string | null;
  storageUri: string | null;
  lastErrorMessage: string | null;
};

type ActorRole = 'OWNER' | 'CASHIER' | 'HANDLER';

async function ensureActor(args: { name: string; role: ActorRole }): Promise<string> {
  const db = getDb();

  const existing = await db
    .select({ id: actors.id })
    .from(actors)
    .where(and(eq(actors.name, args.name), eq(actors.role, args.role)))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const inserted = await db.insert(actors).values({ name: args.name, role: args.role }).returning({ id: actors.id });
  return inserted[0].id;
}

export async function persistDemoOperationalEvidence(input: PersistDemoOperationalEvidenceInput): Promise<void> {
  const db = getDb();
  const { auditEvent } = input;

  const ownerActorId = await ensureActor({ name: auditEvent.ownerName, role: 'OWNER' });
  const cashierActorId = await ensureActor({ name: auditEvent.cashierName, role: 'CASHIER' });
  const handlerActorId = await ensureActor({ name: auditEvent.handlerName, role: 'HANDLER' });

  const [productRow] = await db
    .insert(products)
    .values({ name: auditEvent.productName })
    .onConflictDoUpdate({ target: products.name, set: { name: auditEvent.productName } })
    .returning({ id: products.id });

  const [inventoryItemRow] = await db
    .insert(inventoryItems)
    .values({
      name: auditEvent.inventoryItemName,
      unit: 'g',
      trackingMode: 'CONSUMABLE',
      valueCategory: 'LOW_VALUE',
      containerId: auditEvent.containerId,
    })
    .onConflictDoUpdate({
      target: inventoryItems.name,
      set: {
        containerId: auditEvent.containerId,
        updatedAt: new Date(),
      },
    })
    .returning({ id: inventoryItems.id });

  const [usageRuleRow] = await db
    .insert(usageRules)
    .values({
      productId: productRow.id,
      inventoryItemId: inventoryItemRow.id,
      expectedUsageQuantity: auditEvent.usageRuleGramsPerUnit,
      usageUnit: 'g',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: [usageRules.productId, usageRules.inventoryItemId],
      set: {
        expectedUsageQuantity: auditEvent.usageRuleGramsPerUnit,
        usageUnit: 'g',
        isActive: true,
        updatedAt: new Date(),
      },
    })
    .returning({ id: usageRules.id });

  const [orderRow] = await db
    .insert(orders)
    .values({
      externalOrderId: input.externalOrderId,
      productId: productRow.id,
      quantity: auditEvent.orderQuantity,
      cashierActorId,
      status: 'COMPLETED',
      completedAt: new Date(auditEvent.createdAt),
    })
    .onConflictDoUpdate({
      target: orders.externalOrderId,
      set: {
        productId: productRow.id,
        quantity: auditEvent.orderQuantity,
        cashierActorId,
        status: 'COMPLETED',
        completedAt: new Date(auditEvent.createdAt),
      },
    })
    .returning({ id: orders.id });

  const movementCreatedAt = new Date(auditEvent.createdAt);
  const movementWindowStartAt = input.evidenceWindowStartAt ? new Date(input.evidenceWindowStartAt) : null;
  const movementWindowEndAt = input.evidenceWindowEndAt ? new Date(input.evidenceWindowEndAt) : null;

  const existingMovement = await db
    .select({ id: inventoryMovements.id })
    .from(inventoryMovements)
    .where(
      and(
        eq(inventoryMovements.orderId, orderRow.id),
        eq(inventoryMovements.inventoryItemId, inventoryItemRow.id),
        eq(inventoryMovements.handlerActorId, handlerActorId),
        eq(inventoryMovements.movementType, input.movementType),
        eq(inventoryMovements.movementQuantity, auditEvent.actualMovementGrams),
        eq(inventoryMovements.createdAt, movementCreatedAt),
      ),
    )
    .limit(1);

  const movementRow = existingMovement[0]
    ? existingMovement[0]
    : (
        await db
          .insert(inventoryMovements)
          .values({
            orderId: orderRow.id,
            inventoryItemId: inventoryItemRow.id,
            handlerActorId,
            movementType: input.movementType,
            quantityBefore: input.movementBeforeQuantity,
            quantityAfter: input.movementAfterQuantity,
            movementQuantity: auditEvent.actualMovementGrams,
            containerId: auditEvent.containerId,
            evidenceWindowStartAt: movementWindowStartAt,
            evidenceWindowEndAt: movementWindowEndAt,
            createdAt: movementCreatedAt,
          })
          .returning({ id: inventoryMovements.id })
      )[0];

  const [auditEventRow] = await db
    .insert(auditEvents)
    .values({
      auditEventKey: auditEvent.auditEventId,
      caseId: auditEvent.caseId,
      scenarioKey: auditEvent.scenarioKey,
      caseType: auditEvent.caseType,
      orderId: orderRow.id,
      inventoryMovementId: movementRow.id,
      productId: productRow.id,
      inventoryItemId: inventoryItemRow.id,
      usageRuleId: usageRuleRow.id,
      handlerActorId,
      cashierActorId,
      ownerActorId,
      containerId: auditEvent.containerId,
      orderQuantity: auditEvent.orderQuantity,
      usageRuleQuantityPerUnit: auditEvent.usageRuleGramsPerUnit,
      expectedUsageQuantity: auditEvent.expectedUsageGrams,
      actualMovementQuantity: auditEvent.actualMovementGrams,
      netMovementQuantity: auditEvent.netMovementGrams,
      variancePercent: auditEvent.variancePercent.toFixed(2),
      status: auditEvent.status,
      severity: auditEvent.severity,
      triageOutcome: auditEvent.triageOutcome,
      triageSource: auditEvent.triageSource,
      proofType: auditEvent.proofType,
      auditProofStatus: auditEvent.auditProofStatus,
      storageStatus: auditEvent.storageStatus,
      chainStatus: auditEvent.chainStatus,
      evidenceWindowStartAt: input.evidenceWindowStartAt ? new Date(input.evidenceWindowStartAt) : null,
      evidenceWindowEndAt: input.evidenceWindowEndAt ? new Date(input.evidenceWindowEndAt) : null,
      createdAt: new Date(auditEvent.createdAt),
    })
    .onConflictDoUpdate({
      target: auditEvents.caseId,
      set: {
        auditEventKey: auditEvent.auditEventId,
        scenarioKey: auditEvent.scenarioKey,
        caseType: auditEvent.caseType,
        orderId: orderRow.id,
        inventoryMovementId: movementRow.id,
        productId: productRow.id,
        inventoryItemId: inventoryItemRow.id,
        usageRuleId: usageRuleRow.id,
        handlerActorId,
        cashierActorId,
        ownerActorId,
        containerId: auditEvent.containerId,
        orderQuantity: auditEvent.orderQuantity,
        usageRuleQuantityPerUnit: auditEvent.usageRuleGramsPerUnit,
        expectedUsageQuantity: auditEvent.expectedUsageGrams,
        actualMovementQuantity: auditEvent.actualMovementGrams,
        netMovementQuantity: auditEvent.netMovementGrams,
        variancePercent: auditEvent.variancePercent.toFixed(2),
        status: auditEvent.status,
        severity: auditEvent.severity,
        triageOutcome: auditEvent.triageOutcome,
        triageSource: auditEvent.triageSource,
        proofType: auditEvent.proofType,
        auditProofStatus: auditEvent.auditProofStatus,
        storageStatus: auditEvent.storageStatus,
        chainStatus: auditEvent.chainStatus,
        evidenceWindowStartAt: input.evidenceWindowStartAt ? new Date(input.evidenceWindowStartAt) : null,
        evidenceWindowEndAt: input.evidenceWindowEndAt ? new Date(input.evidenceWindowEndAt) : null,
        createdAt: new Date(auditEvent.createdAt),
      },
    })
    .returning({ id: auditEvents.id });

  await db.insert(proofRecords).values({
    auditEventId: auditEventRow.id,
    proofType: auditEvent.proofType,
    auditProofStatus: auditEvent.auditProofStatus,
    storageStatus: auditEvent.storageStatus,
    chainStatus: auditEvent.chainStatus,
    proofHash: input.proofHash,
    storageUri: input.storageUri,
    chainTransactionHash: input.chainTransactionHash,
    lastErrorMessage: input.lastErrorMessage,
  });
}
