import type { AuditEvent, AuditProofStatus, ChainStatus, StorageStatus, TriageOutcome } from '@arka/shared';
import { and, desc, eq } from 'drizzle-orm';

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

const AUDIT_PROOF_STATUS_RANK: Record<AuditProofStatus, number> = {
  LOCAL_ONLY: 0,
  STORED_ON_0G: 1,
  REGISTERED_ON_CHAIN: 2,
  VERIFIED: 3,
};

const STORAGE_STATUS_RANK: Record<StorageStatus, number> = {
  NOT_STARTED: 0,
  PENDING_UPLOAD: 1,
  FAILED_TO_STORE: 2,
  RETRY_PENDING: 3,
  STORED: 4,
};

const CHAIN_STATUS_RANK: Record<ChainStatus, number> = {
  NOT_REGISTERED: 0,
  PENDING_REGISTRATION: 1,
  FAILED_TO_REGISTER: 2,
  REGISTERED: 3,
  ANCHOR_CONFIRMED: 4,
};

function mergeRankedStatus<T extends string>(existing: T, incoming: T, rank: Record<T, number>): T {
  return rank[incoming] > rank[existing] ? incoming : existing;
}

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

  const [latestProofRecord] = await db
    .select({
      id: proofRecords.id,
      proofType: proofRecords.proofType,
      auditProofStatus: proofRecords.auditProofStatus,
      storageStatus: proofRecords.storageStatus,
      chainStatus: proofRecords.chainStatus,
      proofHash: proofRecords.proofHash,
      storageUri: proofRecords.storageUri,
      chainTransactionHash: proofRecords.chainTransactionHash,
      lastErrorMessage: proofRecords.lastErrorMessage,
    })
    .from(proofRecords)
    .where(eq(proofRecords.auditEventId, auditEventRow.id))
    .orderBy(desc(proofRecords.createdAt))
    .limit(1);

  const incomingProof = {
    auditEventId: auditEventRow.id,
    proofType: auditEvent.proofType,
    auditProofStatus: auditEvent.auditProofStatus,
    storageStatus: auditEvent.storageStatus,
    chainStatus: auditEvent.chainStatus,
    proofHash: input.proofHash,
    storageUri: input.storageUri,
    chainTransactionHash: input.chainTransactionHash,
    lastErrorMessage: input.lastErrorMessage,
  } as const;

  if (!latestProofRecord) {
    await db.insert(proofRecords).values(incomingProof);
    return;
  }

  const proofTypeChanged = latestProofRecord.proofType !== incomingProof.proofType;
  const proofHashChanged =
    latestProofRecord.proofHash && incomingProof.proofHash && latestProofRecord.proofHash !== incomingProof.proofHash;
  const storageUriChanged =
    latestProofRecord.storageUri &&
    incomingProof.storageUri &&
    latestProofRecord.storageUri !== incomingProof.storageUri;
  const chainTxChanged =
    latestProofRecord.chainTransactionHash &&
    incomingProof.chainTransactionHash &&
    latestProofRecord.chainTransactionHash !== incomingProof.chainTransactionHash;

  // If the incoming proof metadata disagrees with an already-known proof artifact,
  // treat it as a new proof record and keep history append-only.
  const shouldAppendNewProofRecord = proofTypeChanged || proofHashChanged || storageUriChanged || chainTxChanged;

  if (shouldAppendNewProofRecord) {
    await db.insert(proofRecords).values({
      ...incomingProof,
      previousProofRecordId: latestProofRecord.id,
    });
    return;
  }

  const mergedAuditProofStatus = mergeRankedStatus(
    latestProofRecord.auditProofStatus,
    incomingProof.auditProofStatus,
    AUDIT_PROOF_STATUS_RANK,
  );
  const mergedStorageStatus = mergeRankedStatus(
    latestProofRecord.storageStatus,
    incomingProof.storageStatus,
    STORAGE_STATUS_RANK,
  );
  const mergedChainStatus = mergeRankedStatus(latestProofRecord.chainStatus, incomingProof.chainStatus, CHAIN_STATUS_RANK);

  // Never clear previously-known proof metadata on repeat dashboard saves.
  const mergedProofHash = latestProofRecord.proofHash ?? incomingProof.proofHash;
  const mergedStorageUri = latestProofRecord.storageUri ?? incomingProof.storageUri;
  const mergedChainTx = latestProofRecord.chainTransactionHash ?? incomingProof.chainTransactionHash;
  const mergedLastErrorMessage = incomingProof.lastErrorMessage ?? latestProofRecord.lastErrorMessage;

  const needsUpdate =
    mergedAuditProofStatus !== latestProofRecord.auditProofStatus ||
    mergedStorageStatus !== latestProofRecord.storageStatus ||
    mergedChainStatus !== latestProofRecord.chainStatus ||
    mergedProofHash !== latestProofRecord.proofHash ||
    mergedStorageUri !== latestProofRecord.storageUri ||
    mergedChainTx !== latestProofRecord.chainTransactionHash ||
    mergedLastErrorMessage !== latestProofRecord.lastErrorMessage;

  if (!needsUpdate) {
    return;
  }

  await db
    .update(proofRecords)
    .set({
      auditProofStatus: mergedAuditProofStatus,
      storageStatus: mergedStorageStatus,
      chainStatus: mergedChainStatus,
      proofHash: mergedProofHash,
      storageUri: mergedStorageUri,
      chainTransactionHash: mergedChainTx,
      lastErrorMessage: mergedLastErrorMessage,
    })
    .where(eq(proofRecords.id, latestProofRecord.id));
}
