export type ValueOf<T> = T[keyof T];

export const AuditEventStatus = {
  CLEAR: 'CLEAR',
  REVIEW_NEEDED: 'REVIEW_NEEDED',
  UNMATCHED_MOVEMENT: 'UNMATCHED_MOVEMENT',
  OVER_EXPECTED_USAGE: 'OVER_EXPECTED_USAGE',
  UNDER_EXPECTED_USAGE: 'UNDER_EXPECTED_USAGE',
  MISSING_MOVEMENT: 'MISSING_MOVEMENT',
  APPROVED_EXCEPTION: 'APPROVED_EXCEPTION',
} as const;

export type AuditEventStatus = ValueOf<typeof AuditEventStatus>;

export const Severity = {
  NORMAL: 'NORMAL',
  MINOR_VARIANCE: 'MINOR_VARIANCE',
  MODERATE_VARIANCE: 'MODERATE_VARIANCE',
  SIGNIFICANT_VARIANCE: 'SIGNIFICANT_VARIANCE',
  CRITICAL_REVIEW: 'CRITICAL_REVIEW',
} as const;

export type Severity = ValueOf<typeof Severity>;

export const TriageOutcome = {
  AUTO_CLEAR: 'AUTO_CLEAR',
  SILENT_LOG: 'SILENT_LOG',
  REQUEST_EXPLANATION: 'REQUEST_EXPLANATION',
  ESCALATE: 'ESCALATE',
} as const;

export type TriageOutcome = ValueOf<typeof TriageOutcome>;

export const AuditProofStatus = {
  LOCAL_ONLY: 'LOCAL_ONLY',
  STORED_ON_0G: 'STORED_ON_0G',
  REGISTERED_ON_CHAIN: 'REGISTERED_ON_CHAIN',
  VERIFIED: 'VERIFIED',
} as const;

export type AuditProofStatus = ValueOf<typeof AuditProofStatus>;

export const StorageStatus = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING_UPLOAD: 'PENDING_UPLOAD',
  STORED: 'STORED',
  FAILED_TO_STORE: 'FAILED_TO_STORE',
  RETRY_PENDING: 'RETRY_PENDING',
} as const;

export type StorageStatus = ValueOf<typeof StorageStatus>;

export const ChainStatus = {
  NOT_REGISTERED: 'NOT_REGISTERED',
  PENDING_REGISTRATION: 'PENDING_REGISTRATION',
  REGISTERED: 'REGISTERED',
  FAILED_TO_REGISTER: 'FAILED_TO_REGISTER',
  ANCHOR_CONFIRMED: 'ANCHOR_CONFIRMED',
} as const;

export type ChainStatus = ValueOf<typeof ChainStatus>;

export const CaseType = {
  ORDER_LINKED_AUDIT: 'ORDER_LINKED_AUDIT',
  MOVEMENT_ONLY_AUDIT: 'MOVEMENT_ONLY_AUDIT',
} as const;

export type CaseType = ValueOf<typeof CaseType>;

export const ScenarioKey = {
  STATE_A: 'STATE_A',
  STATE_C: 'STATE_C',
  STATE_D: 'STATE_D',
} as const;

export type ScenarioKey = ValueOf<typeof ScenarioKey>;

export const ProofType = {
  AUDIT_EVENT_CREATED: 'AUDIT_EVENT_CREATED',
  FINAL_RESOLUTION: 'FINAL_RESOLUTION',
  CORRECTION_APPENDED: 'CORRECTION_APPENDED',
  STAFF_RESPONSE_SUBMITTED: 'STAFF_RESPONSE_SUBMITTED',
} as const;

export type ProofType = ValueOf<typeof ProofType>;

export const ActorRole = {
  OWNER: 'OWNER',
  CASHIER: 'CASHIER',
  STAFF: 'STAFF',
  HANDLER: 'HANDLER',
  MANAGER: 'MANAGER',
  OPENCLAW_AGENT: 'OPENCLAW_AGENT',
  SYSTEM: 'SYSTEM',
} as const;

export type ActorRole = ValueOf<typeof ActorRole>;

export const MovementDirection = {
  OUT: 'OUT',
  RETURN: 'RETURN',
} as const;

export type MovementDirection = ValueOf<typeof MovementDirection>;

export type DemoActor = {
  name: string;
  role: ActorRole;
};

export type UsageRule = {
  productName: string;
  inventoryItemName: string;
  gramsPerUnit: number;
};

export type DemoWorldSeed = {
  owner: DemoActor;
  cashier: DemoActor;
  handler: DemoActor;
  systemAgent: DemoActor;
  productName: string;
  inventoryItemName: string;
  containerId: string;
  usageRule: UsageRule;
};

export type DemoScenarioSeed = {
  scenarioKey: ScenarioKey;
  caseType: CaseType;
  label: string;
  orderQuantity: number;
  actualMovementGrams: number;
  movementDirection: MovementDirection;
  expectedUsageGrams: number;
  variancePercent: number;
  status: AuditEventStatus;
  severity: Severity;
  triageOutcome: TriageOutcome;
  auditProofStatus: AuditProofStatus;
  storageStatus: StorageStatus;
  chainStatus: ChainStatus;
  proofType: ProofType;
};

export type AuditEvent = {
  auditEventId: string;
  caseId: string;
  scenarioKey: ScenarioKey;
  caseType: CaseType;
  productName: string;
  inventoryItemName: string;
  containerId: string;
  orderQuantity: number;
  usageRuleGramsPerUnit: number;
  expectedUsageGrams: number;
  actualMovementGrams: number;
  netMovementGrams: number;
  variancePercent: number;
  status: AuditEventStatus;
  severity: Severity;
  triageOutcome: TriageOutcome | null;
  proofType: ProofType;
  auditProofStatus: AuditProofStatus;
  storageStatus: StorageStatus;
  chainStatus: ChainStatus;
  handlerName: string;
  cashierName: string;
  ownerName: string;
  createdAt: string;
};
