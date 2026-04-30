import fs from "node:fs";
import { describe, expect, it } from "vitest";
import plugin from "./index.js";

function readJson(relativePath: string): Record<string, any> {
  return JSON.parse(fs.readFileSync(new URL(relativePath, import.meta.url), "utf8"));
}

describe("arka-audit extension manifest", () => {
  it("declares a startup-only read-only ARKA plugin", () => {
    const manifest = readJson("./openclaw.plugin.json");

    expect(manifest.id).toBe("arka-audit");
    expect(manifest.name).toBe("ARKA Audit");
    expect(manifest.activation).toEqual({ onStartup: true });
    expect(manifest.configSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      properties: {},
    });
  });
});

describe("arka-audit get_audit_event tool", () => {
  function registerTools() {
    const registrations: Array<{ tool: any; options: any }> = [];

    plugin.register({
      registerTool(tool: any, options: any) {
        registrations.push({ tool, options });
      },
    } as any);

    return registrations;
  }

  it("registers exactly one unavailable read-only AuditEvent tool", async () => {
    const registrations = registerTools();

    expect(plugin.id).toBe("arka-audit");
    expect(registrations).toHaveLength(1);
    expect(registrations[0].tool.name).toBe("get_audit_event");
    expect(registrations[0].options).toEqual({ name: "get_audit_event" });

    const result = await registrations[0].tool.execute("tool-call-1", {
      audit_event_id: "AE-SMOKE-001",
    });

    expect(result.details).toMatchObject({
      status: "unavailable",
      audit_event_id: "AE-SMOKE-001",
      source: "arka-audit-openclaw-plugin-skeleton",
    });
    expect(result.details.message).toContain("No AuditEvent facts were read or mutated");
    expect(result.details.immutable_fact_policy.must_never_mutate).toEqual(
      expect.arrayContaining([
        "AuditEvent.status",
        "expected quantity",
        "actual quantity",
        "variance",
        "severity",
        "evidence references",
        "proof history",
      ]),
    );
    expect(result.details.allowed_future_outputs).toEqual(
      expect.arrayContaining([
        "triageOutcome",
        "CaseNote",
        "ActionLog",
        "StaffClarificationRequest draft",
        "owner recommendation",
      ]),
    );
    expect(result.details.non_goals).toEqual(
      expect.arrayContaining([
        "database writes",
        "Telegram delivery",
        "0G Storage upload",
        "0G Chain registration",
        "fact recalculation",
      ]),
    );
  });

  it("rejects missing AuditEvent ids instead of fabricating facts", async () => {
    const [{ tool }] = registerTools();

    await expect(tool.execute("tool-call-2", {})).rejects.toThrow("audit_event_id required");
    await expect(tool.execute("tool-call-3", { audit_event_id: "   " })).rejects.toThrow(
      "audit_event_id required",
    );
  });
});
