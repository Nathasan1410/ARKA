import {
  ActorRole,
  AuditEvent,
  CaseType,
  MovementDirection,
  ProofType,
  ScenarioKey,
  Severity,
} from '@arka/shared';

export const AUDIT_EVENT_PROOF_PACKAGE_TYPE = 'AUDIT_EVENT_PROOF_PACKAGE' as const;
export const AUDIT_EVENT_PROOF_PACKAGE_VERSION = '1.0.0' as const;

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type AuditEventProofEvidenceWindow = {
  startedAt: string;
  endedAt: string;
  sourceRef: string | null;
  summary: string | null;
};

export type AuditEventProofOrderSummary = {
  orderId: string | null;
  productName: string;
  orderQuantity: number;
};

export type AuditEventProofMovementSummary = {
  movementId: string | null;
  inventoryItemName: string;
  containerId: string;
  movementDirection: typeof MovementDirection[keyof typeof MovementDirection];
  actualMovementGrams: number;
  netMovementGrams: number;
};

export type AuditEventProofUsageRuleSummary = {
  ruleId: string | null;
  productName: string;
  inventoryItemName: string;
  gramsPerUnit: number;
  expectedUsageGrams: number;
};

export type AuditEventProofActorSummary = {
  actorId: string | null;
  name: string;
  role: typeof ActorRole[keyof typeof ActorRole];
};

export type AuditEventProofActorContext = {
  handler: AuditEventProofActorSummary;
  cashier: AuditEventProofActorSummary;
  owner: AuditEventProofActorSummary;
};

export type AuditEventProofPackage = {
  packageType: typeof AUDIT_EVENT_PROOF_PACKAGE_TYPE;
  packageVersion: typeof AUDIT_EVENT_PROOF_PACKAGE_VERSION;
  proofType: typeof ProofType[keyof typeof ProofType];
  auditEventId: string;
  caseId: string;
  scenarioKey: typeof ScenarioKey[keyof typeof ScenarioKey];
  caseType: typeof CaseType[keyof typeof CaseType];
  status: AuditEvent['status'];
  severity: Severity;
  expectedUsageGrams: number;
  actualMovementGrams: number;
  netMovementGrams: number;
  variancePercent: number;
  orderSummary: AuditEventProofOrderSummary;
  movementSummary: AuditEventProofMovementSummary;
  usageRuleSummary: AuditEventProofUsageRuleSummary;
  actorContext: AuditEventProofActorContext;
  evidenceWindow: AuditEventProofEvidenceWindow;
  evidenceCompleteness: string | null;
  backendRecommendedAction: string;
  createdAt: string;
};

type AuditEventProofActorSummaryInput = Partial<AuditEventProofActorSummary> &
  Pick<AuditEventProofActorSummary, 'role'>;

export type BuildAuditEventProofPackageInput = {
  auditEvent: AuditEvent;
  supportingSummaries: {
    orderSummary?: Partial<AuditEventProofOrderSummary>;
    movementSummary?: Partial<AuditEventProofMovementSummary>;
    usageRuleSummary?: Partial<AuditEventProofUsageRuleSummary>;
    actorContext?: {
      handler?: AuditEventProofActorSummaryInput;
      cashier?: AuditEventProofActorSummaryInput;
      owner?: AuditEventProofActorSummaryInput;
    };
    evidenceWindow: {
      startedAt: string;
      endedAt: string;
      sourceRef?: string | null;
      summary?: string | null;
    };
    evidenceCompleteness?: string | null;
    backendRecommendedAction: string;
  };
};

export type AuditEventProofPackageArtifact = {
  proofPackage: AuditEventProofPackage;
  canonicalJson: string;
  localPackageHash: string;
};

function withNullableString(value: string | null | undefined): string | null {
  return value ?? null;
}

function canonicalizeJsonValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalizeJsonValue(entry));
  }

  if (value !== null && typeof value === 'object') {
    const sortedEntries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));

    const canonicalObject: { [key: string]: JsonValue } = {};

    for (const [key, entryValue] of sortedEntries) {
      canonicalObject[key] = canonicalizeJsonValue(entryValue);
    }

    return canonicalObject;
  }

  return value;
}

export function buildAuditEventProofPackage({
  auditEvent,
  supportingSummaries,
}: BuildAuditEventProofPackageInput): AuditEventProofPackage {
  const orderSummary = supportingSummaries.orderSummary ?? {};
  const movementSummary = supportingSummaries.movementSummary ?? {};
  const usageRuleSummary = supportingSummaries.usageRuleSummary ?? {};
  const actorContext = supportingSummaries.actorContext ?? {};

  return {
    packageType: AUDIT_EVENT_PROOF_PACKAGE_TYPE,
    packageVersion: AUDIT_EVENT_PROOF_PACKAGE_VERSION,
    proofType: auditEvent.proofType,
    auditEventId: auditEvent.auditEventId,
    caseId: auditEvent.caseId,
    scenarioKey: auditEvent.scenarioKey,
    caseType: auditEvent.caseType,
    status: auditEvent.status,
    severity: auditEvent.severity,
    expectedUsageGrams: auditEvent.expectedUsageGrams,
    actualMovementGrams: auditEvent.actualMovementGrams,
    netMovementGrams: auditEvent.netMovementGrams,
    variancePercent: auditEvent.variancePercent,
    orderSummary: {
      orderId: withNullableString(orderSummary.orderId),
      productName: orderSummary.productName ?? auditEvent.productName,
      orderQuantity: orderSummary.orderQuantity ?? auditEvent.orderQuantity,
    },
    movementSummary: {
      movementId: withNullableString(movementSummary.movementId),
      inventoryItemName: movementSummary.inventoryItemName ?? auditEvent.inventoryItemName,
      containerId: movementSummary.containerId ?? auditEvent.containerId,
      movementDirection: movementSummary.movementDirection ?? MovementDirection.OUT,
      actualMovementGrams: movementSummary.actualMovementGrams ?? auditEvent.actualMovementGrams,
      netMovementGrams: movementSummary.netMovementGrams ?? auditEvent.netMovementGrams,
    },
    usageRuleSummary: {
      ruleId: withNullableString(usageRuleSummary.ruleId),
      productName: usageRuleSummary.productName ?? auditEvent.productName,
      inventoryItemName: usageRuleSummary.inventoryItemName ?? auditEvent.inventoryItemName,
      gramsPerUnit: usageRuleSummary.gramsPerUnit ?? auditEvent.usageRuleGramsPerUnit,
      expectedUsageGrams: usageRuleSummary.expectedUsageGrams ?? auditEvent.expectedUsageGrams,
    },
    actorContext: {
      handler: {
        actorId: withNullableString(actorContext.handler?.actorId),
        name: actorContext.handler?.name ?? auditEvent.handlerName,
        role: actorContext.handler?.role ?? ActorRole.HANDLER,
      },
      cashier: {
        actorId: withNullableString(actorContext.cashier?.actorId),
        name: actorContext.cashier?.name ?? auditEvent.cashierName,
        role: actorContext.cashier?.role ?? ActorRole.CASHIER,
      },
      owner: {
        actorId: withNullableString(actorContext.owner?.actorId),
        name: actorContext.owner?.name ?? auditEvent.ownerName,
        role: actorContext.owner?.role ?? ActorRole.OWNER,
      },
    },
    evidenceWindow: {
      startedAt: supportingSummaries.evidenceWindow.startedAt,
      endedAt: supportingSummaries.evidenceWindow.endedAt,
      sourceRef: withNullableString(supportingSummaries.evidenceWindow.sourceRef),
      summary: withNullableString(supportingSummaries.evidenceWindow.summary),
    },
    evidenceCompleteness: withNullableString(supportingSummaries.evidenceCompleteness),
    backendRecommendedAction: supportingSummaries.backendRecommendedAction,
    createdAt: auditEvent.createdAt,
  };
}

export function canonicalizeProofPackage(proofPackage: AuditEventProofPackage): string {
  return JSON.stringify(canonicalizeJsonValue(proofPackage));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashProofPackage(proofPackageOrCanonicalJson: AuditEventProofPackage | string): Promise<string> {
  const canonicalJson =
    typeof proofPackageOrCanonicalJson === 'string'
      ? proofPackageOrCanonicalJson
      : canonicalizeProofPackage(proofPackageOrCanonicalJson);
  const encoded = new TextEncoder().encode(canonicalJson);
  const digest = await crypto.subtle.digest('SHA-256', encoded);

  return `0x${toHex(new Uint8Array(digest))}`;
}

export async function createAuditEventProofPackageArtifact(
  input: BuildAuditEventProofPackageInput,
): Promise<AuditEventProofPackageArtifact> {
  const proofPackage = buildAuditEventProofPackage(input);
  const canonicalJson = canonicalizeProofPackage(proofPackage);

  return {
    proofPackage,
    canonicalJson,
    localPackageHash: await hashProofPackage(canonicalJson),
  };
}
