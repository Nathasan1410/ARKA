import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { registerGetAuditEventTool } from "./src/get-audit-event.js";

export default definePluginEntry({
  id: "arka-audit",
  name: "ARKA Audit",
  description: "Read-only AuditEvent triage tools for ARKA",
  register(api) {
    registerGetAuditEventTool(api);
  },
});
