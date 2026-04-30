import {
  ActorRole,
  AuditEventStatus,
  AuditProofStatus,
  CaseType,
  ChainStatus,
  ProofType,
  ScenarioKey,
  Severity,
  StorageStatus,
  TriageOutcome,
} from '@arka/shared';
import {
  AnyPgColumn,
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core';

function enumValues<const T extends Record<string, string>>(valueMap: T): [T[keyof T], ...T[keyof T][]] {
  return Object.values(valueMap) as [T[keyof T], ...T[keyof T][]];
}

export const actorRoleEnum = pgEnum('actor_role', enumValues(ActorRole));
export const auditEventStatusEnum = pgEnum('audit_event_status', enumValues(AuditEventStatus));
export const severityEnum = pgEnum('severity', enumValues(Severity));
export const triageOutcomeEnum = pgEnum('triage_outcome', enumValues(TriageOutcome));
export const triageSourceEnum = pgEnum('triage_source', ['DETERMINISTIC_FALLBACK', 'OPENCLAW_RUNTIME']);
export const auditProofStatusEnum = pgEnum('audit_proof_status', enumValues(AuditProofStatus));
export const storageStatusEnum = pgEnum('storage_status', enumValues(StorageStatus));
export const chainStatusEnum = pgEnum('chain_status', enumValues(ChainStatus));
export const caseTypeEnum = pgEnum('case_type', enumValues(CaseType));
export const scenarioKeyEnum = pgEnum('scenario_key', enumValues(ScenarioKey));
export const proofTypeEnum = pgEnum('proof_type', enumValues(ProofType));

export const inventoryUnitEnum = pgEnum('inventory_unit', ['g', 'ml', 'pcs']);
export const trackingModeEnum = pgEnum('tracking_mode', ['CONSUMABLE', 'COUNTABLE']);
export const valueCategoryEnum = pgEnum('value_category', ['LOW_VALUE', 'HIGH_VALUE']);
export const orderStatusEnum = pgEnum('order_status', ['CREATED', 'COMPLETED']);
export const fulfillmentModeEnum = pgEnum('fulfillment_mode', ['DIRECT_OUT', 'SERVICE_WINDOW']);
export const movementTypeEnum = pgEnum('movement_type', ['OUT', 'RETURN', 'WASTE', 'ADJUSTMENT']);
export const caseNoteTypeEnum = pgEnum('case_note_type', [
  'OPENCLAW_NOTE',
  'STAFF_EXPLANATION',
  'OWNER_NOTE',
  'SYSTEM_NOTE',
]);
export const actionTypeEnum = pgEnum('action_type', [
  'AUDIT_EVENT_CREATED',
  'TRIAGE_RECORDED',
  'EXPLANATION_REQUESTED',
  'OWNER_REVIEWED',
  'PROOF_STATUS_UPDATED',
]);
export const staffClarificationRequestStatusEnum = pgEnum('staff_clarification_request_status', [
  'REQUESTED',
  'REMINDED',
  'RESPONDED',
  'TIMEOUT',
  'ESCALATED',
]);

export const actors = pgTable(
  'actors',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    role: actorRoleEnum('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    roleIdx: index('actors_role_idx').on(table.role),
  }),
);

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex('products_name_unique').on(table.name),
  }),
);

export const inventoryItems = pgTable(
  'inventory_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    unit: inventoryUnitEnum('unit').notNull(),
    trackingMode: trackingModeEnum('tracking_mode').notNull(),
    valueCategory: valueCategoryEnum('value_category').notNull().default('LOW_VALUE'),
    currentStockQuantity: integer('current_stock_quantity'),
    containerId: text('container_id'),
    sensorId: text('sensor_id'),
    unitWeightGrams: integer('unit_weight_grams'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex('inventory_items_name_unique').on(table.name),
    containerIdx: index('inventory_items_container_idx').on(table.containerId),
  }),
);

export const usageRules = pgTable(
  'usage_rules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    inventoryItemId: uuid('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id),
    expectedUsageQuantity: integer('expected_usage_quantity').notNull(),
    usageUnit: inventoryUnitEnum('usage_unit').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    productItemUnique: uniqueIndex('usage_rules_product_item_unique').on(table.productId, table.inventoryItemId),
  }),
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    externalOrderId: text('external_order_id'),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    quantity: integer('quantity').notNull(),
    cashierActorId: uuid('cashier_actor_id')
      .notNull()
      .references(() => actors.id),
    status: orderStatusEnum('status').notNull().default('CREATED'),
    fulfillmentMode: fulfillmentModeEnum('fulfillment_mode').notNull().default('DIRECT_OUT'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    externalOrderIdUnique: uniqueIndex('orders_external_order_id_unique').on(table.externalOrderId),
    productIdx: index('orders_product_idx').on(table.productId),
  }),
);

export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').references(() => orders.id),
    inventoryItemId: uuid('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id),
    handlerActorId: uuid('handler_actor_id')
      .notNull()
      .references(() => actors.id),
    movementType: movementTypeEnum('movement_type').notNull(),
    quantityBefore: integer('quantity_before'),
    quantityAfter: integer('quantity_after'),
    movementQuantity: integer('movement_quantity').notNull(),
    containerId: text('container_id'),
    sensorId: text('sensor_id'),
    evidenceWindowStartAt: timestamp('evidence_window_start_at', { withTimezone: true }),
    evidenceWindowEndAt: timestamp('evidence_window_end_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    itemIdx: index('inventory_movements_item_idx').on(table.inventoryItemId),
    orderIdx: index('inventory_movements_order_idx').on(table.orderId),
  }),
);

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auditEventKey: text('audit_event_key').notNull(),
    caseId: text('case_id').notNull(),
    scenarioKey: scenarioKeyEnum('scenario_key').notNull(),
    caseType: caseTypeEnum('case_type').notNull(),
    orderId: uuid('order_id').references(() => orders.id),
    inventoryMovementId: uuid('inventory_movement_id').references(() => inventoryMovements.id),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    inventoryItemId: uuid('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id),
    usageRuleId: uuid('usage_rule_id').references(() => usageRules.id),
    handlerActorId: uuid('handler_actor_id')
      .notNull()
      .references(() => actors.id),
    cashierActorId: uuid('cashier_actor_id')
      .notNull()
      .references(() => actors.id),
    ownerActorId: uuid('owner_actor_id')
      .notNull()
      .references(() => actors.id),
    containerId: text('container_id'),
    orderQuantity: integer('order_quantity').notNull(),
    usageRuleQuantityPerUnit: integer('usage_rule_quantity_per_unit').notNull(),
    expectedUsageQuantity: integer('expected_usage_quantity').notNull(),
    actualMovementQuantity: integer('actual_movement_quantity').notNull(),
    netMovementQuantity: integer('net_movement_quantity').notNull(),
    variancePercent: numeric('variance_percent', { precision: 7, scale: 2 }).notNull(),
    status: auditEventStatusEnum('status').notNull(),
    severity: severityEnum('severity').notNull(),
    triageOutcome: triageOutcomeEnum('triage_outcome'),
    triageSource: triageSourceEnum('triage_source'),
    proofType: proofTypeEnum('proof_type').notNull().default('AUDIT_EVENT_CREATED'),
    auditProofStatus: auditProofStatusEnum('audit_proof_status').notNull().default('LOCAL_ONLY'),
    storageStatus: storageStatusEnum('storage_status').notNull().default('NOT_STARTED'),
    chainStatus: chainStatusEnum('chain_status').notNull().default('NOT_REGISTERED'),
    evidenceWindowStartAt: timestamp('evidence_window_start_at', { withTimezone: true }),
    evidenceWindowEndAt: timestamp('evidence_window_end_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    auditEventKeyUnique: uniqueIndex('audit_events_audit_event_key_unique').on(table.auditEventKey),
    caseIdUnique: uniqueIndex('audit_events_case_id_unique').on(table.caseId),
    statusIdx: index('audit_events_status_idx').on(table.status),
    scenarioIdx: index('audit_events_scenario_idx').on(table.scenarioKey),
    triageSourceIdx: index('audit_events_triage_source_idx').on(table.triageSource),
  }),
);

export const caseNotes = pgTable(
  'case_notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auditEventId: uuid('audit_event_id')
      .notNull()
      .references(() => auditEvents.id),
    authorActorId: uuid('author_actor_id')
      .notNull()
      .references(() => actors.id),
    noteType: caseNoteTypeEnum('note_type').notNull(),
    noteBody: text('note_body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    auditEventIdx: index('case_notes_audit_event_idx').on(table.auditEventId),
  }),
);

export const actionLogs = pgTable(
  'action_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auditEventId: uuid('audit_event_id')
      .notNull()
      .references(() => auditEvents.id),
    actorId: uuid('actor_id').references(() => actors.id),
    actionType: actionTypeEnum('action_type').notNull(),
    summary: text('summary').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    auditEventIdx: index('action_logs_audit_event_idx').on(table.auditEventId),
  }),
);

export const staffClarificationRequests = pgTable(
  'staff_clarification_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auditEventId: uuid('audit_event_id')
      .notNull()
      .references(() => auditEvents.id),
    targetActorId: uuid('target_actor_id')
      .notNull()
      .references(() => actors.id),
    requestedByActorId: uuid('requested_by_actor_id').references(() => actors.id),
    approvedByActorId: uuid('approved_by_actor_id').references(() => actors.id),
    status: staffClarificationRequestStatusEnum('status').notNull().default('REQUESTED'),
    requestMessage: text('request_message'),
    requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
    dueAt: timestamp('due_at', { withTimezone: true }),
    respondedAt: timestamp('responded_at', { withTimezone: true }),
    responseNote: text('response_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    auditEventIdx: index('staff_clarification_requests_audit_event_idx').on(table.auditEventId),
    statusIdx: index('staff_clarification_requests_status_idx').on(table.status),
    targetActorIdx: index('staff_clarification_requests_target_actor_idx').on(table.targetActorId),
  }),
);

export const proofRecords = pgTable(
  'proof_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auditEventId: uuid('audit_event_id')
      .notNull()
      .references(() => auditEvents.id),
    actorId: uuid('actor_id').references(() => actors.id),
    previousProofRecordId: uuid('previous_proof_record_id').references((): AnyPgColumn => proofRecords.id),
    proofType: proofTypeEnum('proof_type').notNull(),
    auditProofStatus: auditProofStatusEnum('audit_proof_status').notNull().default('LOCAL_ONLY'),
    storageStatus: storageStatusEnum('storage_status').notNull().default('NOT_STARTED'),
    chainStatus: chainStatusEnum('chain_status').notNull().default('NOT_REGISTERED'),
    proofHash: text('proof_hash'),
    storageUri: text('storage_uri'),
    chainTransactionHash: text('chain_transaction_hash'),
    anchoredAt: timestamp('anchored_at', { withTimezone: true }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    lastErrorMessage: text('last_error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    auditEventIdx: index('proof_records_audit_event_idx').on(table.auditEventId),
  }),
);

export const ownerPolicies = pgTable(
  'owner_policies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    policyKey: text('policy_key').notNull().default('default-owner-policy'),
    ownerActorId: uuid('owner_actor_id').references(() => actors.id),
    requireOwnerApprovalBeforeStaffMessage: boolean('require_owner_approval_before_staff_message')
      .notNull()
      .default(true),
    autoClearEnabled: boolean('auto_clear_enabled').notNull().default(true),
    moderateVarianceTriageOutcome: triageOutcomeEnum('moderate_variance_triage_outcome')
      .notNull()
      .default('REQUEST_EXPLANATION'),
    criticalVarianceTriageOutcome: triageOutcomeEnum('critical_variance_triage_outcome')
      .notNull()
      .default('ESCALATE'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    policyKeyUnique: uniqueIndex('owner_policies_policy_key_unique').on(table.policyKey),
  }),
);

export const dashboardDemoRuns = pgTable(
  'dashboard_demo_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    caseId: text('case_id').notNull(),
    scenarioKey: scenarioKeyEnum('scenario_key').notNull(),
    runPayload: jsonb('run_payload').notNull().$type<unknown>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    caseIdUnique: uniqueIndex('dashboard_demo_runs_case_id_unique').on(table.caseId),
    scenarioIdx: index('dashboard_demo_runs_scenario_idx').on(table.scenarioKey),
  }),
);
