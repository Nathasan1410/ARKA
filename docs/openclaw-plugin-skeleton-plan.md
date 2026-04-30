# OpenClaw Plugin Skeleton Plan

Date: 2026-04-30

Status:

```txt
Docs-only plan: YES
Plugin code: IMPLEMENTED AS READ-ONLY SKELETON
Plugin skeleton location: openclaw/extensions/arka-audit/
Plugin discovery/load through full OpenClaw gateway: NOT VERIFIED
```

## Goal

Create the smallest honest ARKA plugin skeleton inside the local OpenClaw fork, then verify the plugin can be discovered and loaded before any read/write expansion.

This plan stays read-only and keeps the existing ARKA workspace skill separate from the plugin package.

## Sources Inspected

Local fork docs and examples:

```txt
openclaw/docs/plugins/building-plugins.md
openclaw/docs/plugins/sdk-setup.md
openclaw/docs/snippets/plugin-publish/minimal-package.json
openclaw/docs/snippets/plugin-publish/minimal-openclaw.plugin.json
openclaw/packages/plugin-sdk/src/plugin-entry.ts
openclaw/packages/plugin-package-contract/src/index.ts
openclaw/extensions/browser/index.ts
openclaw/extensions/browser/openclaw.plugin.json
openclaw/extensions/diffs/index.ts
openclaw/extensions/diffs/openclaw.plugin.json
openclaw/extensions/qa-lab/index.ts
openclaw/extensions/skill-workshop/index.ts
openclaw/extensions/skill-workshop/openclaw.plugin.json
openclaw/extensions/tokenjuice/index.ts
openclaw/extensions/tokenjuice/openclaw.plugin.json
openclaw/extensions/active-memory/openclaw.plugin.json
```

Key structure findings:

```txt
definePluginEntry(...) is the canonical non-channel plugin entry helper.
In-repo plugins typically live under openclaw/extensions/<plugin-id>/.
Bundled plugin package.json uses openclaw.extensions: ["./index.ts"].
The manifest only needs id, name, description, activation, and configSchema for a minimal tool plugin.
External publish metadata (compat/build) is only required when publishing outside the repo.
```

## Recommended Skeleton

Implemented as a bundled plugin-style extension under:

```txt
openclaw/extensions/arka-audit/
```

Recommended file set:

```txt
openclaw/extensions/arka-audit/package.json
openclaw/extensions/arka-audit/openclaw.plugin.json
openclaw/extensions/arka-audit/index.ts
openclaw/extensions/arka-audit/src/get-audit-event.ts
openclaw/extensions/arka-audit/index.test.ts
```

Optional later files, only if the first pass needs them:

```txt
openclaw/extensions/arka-audit/src/types.ts
openclaw/extensions/arka-audit/tsconfig.json
```

## Package Metadata

Mirror the bundled extension pattern used by `browser`, `diffs`, and `skill-workshop`.

Recommended `package.json` shape:

```json
{
  "name": "@openclaw/arka-audit",
  "version": "2026.4.27",
  "private": true,
  "type": "module",
  "dependencies": {
    "typebox": "1.1.33"
  },
  "devDependencies": {
    "@openclaw/plugin-sdk": "workspace:*"
  },
  "openclaw": {
    "extensions": ["./index.ts"]
  }
}
```

If the plugin is ever published outside the repo, add the ClawHub compatibility fields from the docs snippet:

```txt
openclaw.compat.pluginApi
openclaw.compat.minGatewayVersion
openclaw.build.openclawVersion
openclaw.build.pluginSdkVersion
```

## Manifest Shape

Keep the first manifest minimal and read-only.

Recommended `openclaw.plugin.json` shape:

```json
{
  "id": "arka-audit",
  "name": "ARKA Audit",
  "description": "Read-only AuditEvent triage tools for ARKA",
  "activation": {
    "onStartup": true
  },
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

Do not add channels, providers, command aliases, gateway methods, or HTTP routes in the first skeleton.

## Entrypoint

Use the standard plugin SDK entry helper:

```ts
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "typebox";
```

Recommended `index.ts` shape:

```ts
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { registerGetAuditEventTool } from "./src/get-audit-event.ts";

export default definePluginEntry({
  id: "arka-audit",
  name: "ARKA Audit",
  description: "Read-only AuditEvent triage tools for ARKA",
  register(api) {
    registerGetAuditEventTool(api);
  },
});
```

Recommended `src/get-audit-event.ts` shape:

```ts
import { Type } from "typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";

export function registerGetAuditEventTool(api: OpenClawPluginApi) {
  api.registerTool({
    name: "get_audit_event",
    description: "Read one AuditEvent and return immutable triage context",
    parameters: Type.Object({
      audit_event_id: Type.String({ minLength: 1 }),
    }),
    async execute(_toolCallId, params) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "unavailable",
                audit_event_id: params.audit_event_id,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  });
}
```

## First Tool

Tool name:

```txt
get_audit_event
```

Tool contract:

```txt
Input: audit_event_id
Output: read-only AuditEvent summary
Side effects: none
```

Recommended return payload:

```txt
status
audit_event_id
scenarioKey
caseType
severity
expectedUsageQuantity
actualMovementQuantity
variancePercent
triageOutcome
triageSource
proofStatus
evidenceRefs
warnings
```

Rules:

```txt
Read only.
Do not mutate reconciliation facts.
Do not create ActionLog, CaseNote, StaffClarificationRequest, or proof records in the first pass.
Do not call Telegram.
Do not upload to 0G Storage or anchor to 0G Chain.
Do not infer missing values as facts; return unavailable or not_found instead.
```

Implementation note:

```txt
The first working version should read through the ARKA backend/API boundary when that read path exists.
If a real read path is not ready yet, keep the tool honest with an unavailable status rather than a fake data writeback.
```

## Verification Commands

Run these in order once the skeleton exists:

```powershell
pnpm.cmd --dir openclaw run build:strict-smoke
pnpm.cmd --dir openclaw run test:contracts:plugins
pnpm.cmd --dir openclaw run test:extension arka-audit
node openclaw\openclaw.mjs plugins inspect arka-audit --json
node openclaw\openclaw.mjs plugins list
```

If the plugin is installed into a running local gateway, add:

```powershell
node openclaw\openclaw.mjs --dev gateway status
pnpm.cmd --dir openclaw run test:plugins:gateway-gauntlet -- --plugin arka-audit --skip-qa --skip-slash-help
```

Current verification note:

```txt
pnpm.cmd --dir openclaw run test:extension arka-audit passed with 1 extension-local test file and 3 tests.
Static tsx smoke checks verified the entrypoint imports, exposes id/register, registers one get_audit_event tool, and returns an unavailable read-only response.
pnpm.cmd run test:arka-openclaw passed after adding plugin skeleton coverage.
pnpm.cmd run verify:arka-openclaw passed after adding plugin skeleton coverage.
pnpm.cmd --dir openclaw run build:strict-smoke timed out after 20 minutes in the HDD environment.
pnpm.cmd --dir openclaw run test:contracts:plugins timed out after 5 minutes in the HDD environment.
pnpm.cmd --dir openclaw install --lockfile-only --ignore-scripts --offline timed out after 5 minutes in the HDD environment.
```

## Non-Goals

Do not include these in the first skeleton:

```txt
packages/agent integration
apps/web integration
database writes
contract changes
0G Storage
0G Chain
Telegram delivery
channel plugins
provider plugins
command aliases
gateway RPC methods
HTTP routes
background services
mutable triage actions
plugin-local skill duplication
```

## Honest Status

```txt
ARKA has a verified local OpenClaw fork and ARKA workspace skill loading.
ARKA has an implemented read-only ARKA OpenClaw plugin skeleton.
The plugin skeleton registers get_audit_event and returns status=unavailable until a real ARKA backend/API read path exists.
The plugin entrypoint and tool registration were statically smoke-tested with tsx and covered by extension-local tests.
OpenClaw gateway discovery/load of the plugin is not verified yet because broad OpenClaw strict-smoke and plugin-contract checks timed out in this HDD environment.
```
