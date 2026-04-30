import { Type } from "typebox";
import { jsonResult, type AnyAgentTool, type OpenClawPluginApi } from "openclaw/plugin-sdk/core";

type GetAuditEventParams = {
  audit_event_id?: string;
};

function readAuditEventId(params: Record<string, unknown>): string {
  const raw = params.audit_event_id;

  if (typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error("audit_event_id required");
  }

  return raw.trim();
}

function createGetAuditEventTool(): AnyAgentTool {
  return {
    name: "get_audit_event",
    label: "Get ARKA AuditEvent",
    description:
      "Read one ARKA AuditEvent and return immutable triage context. This skeleton is read-only and reports unavailable until an ARKA backend read path is wired.",
    parameters: Type.Object({
      audit_event_id: Type.String({
        minLength: 1,
        description: "ARKA AuditEvent identifier to fetch through the future ARKA backend/API read path.",
      }),
    }),
    async execute(_toolCallId: string, params: GetAuditEventParams) {
      const auditEventId = readAuditEventId(params as Record<string, unknown>);

      return jsonResult({
        status: "unavailable",
        audit_event_id: auditEventId,
        source: "arka-audit-openclaw-plugin-skeleton",
        message:
          "ARKA backend/API read path is not connected yet. No AuditEvent facts were read or mutated.",
        immutable_fact_policy: {
          may_read: [
            "AuditEvent.status",
            "expected quantity",
            "actual quantity",
            "variance",
            "severity",
            "evidence references",
            "proof history",
          ],
          must_never_mutate: [
            "AuditEvent.status",
            "expected quantity",
            "actual quantity",
            "variance",
            "severity",
            "evidence references",
            "proof history",
          ],
        },
        allowed_future_outputs: [
          "triageOutcome",
          "CaseNote",
          "ActionLog",
          "StaffClarificationRequest draft",
          "owner recommendation",
        ],
        non_goals: [
          "database writes",
          "Telegram delivery",
          "0G Storage upload",
          "0G Chain registration",
          "fact recalculation",
        ],
      });
    },
  };
}

export function registerGetAuditEventTool(api: OpenClawPluginApi) {
  api.registerTool(createGetAuditEventTool(), {
    name: "get_audit_event",
  });
}
