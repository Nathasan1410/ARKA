# OpenClaw Impact Assessment

Last updated: 2026-04-29

## Verdict

Severity:

```txt
HIGH for OpenClaw integration direction and demo truthfulness.
NOT a full project restart.
```

The issue is real: ARKA initially treated `packages/agent` too much like the OpenClaw agent itself. After upstream research, that is incorrect. OpenClaw is a gateway/runtime/plugin/skills system, and ARKA still has only an app-facing adapter boundary plus deterministic fallback.

The issue does not invalidate the whole AuditEvent-first architecture.

The following remain aligned:

```txt
Backend creates AuditEvent.
Database stores operational evidence and proof metadata.
OpenClaw reads AuditEvent first and appends triage/action outputs.
Dashboard shows visual investigation and status.
0G Storage stores sealed proof packages.
0G Chain anchors proof references.
```

The correction required is:

```txt
Treat OpenClaw as sidecar gateway/runtime + ARKA skill/plugin.
Treat packages/agent as ARKA client boundary + deterministic fallback.
Label fallback honestly until OpenClaw runtime is verified.
```

## Does ARKA Need To Restart?

No.

Restarting from zero would destroy valid work that is independent from the OpenClaw misunderstanding:

```txt
shared enums and A/C/D fixtures
core reconciliation logic
local AuditEvent generation
local proof package hashing
Drizzle schema direction
dashboard shell direction
0G Storage / 0G Chain proof ownership
```

What ARKA needs is a controlled remediation pass before claiming OpenClaw integration:

```txt
1. Keep current shared/core/proof/db/dashboard work.
2. Fix code boundaries that make local fallback look like real OpenClaw.
3. Add OpenClaw smoke setup or ARKA OpenClaw skill/plugin work as a separate slice.
4. Update dashboard/README/real-vs-simulated copy to expose fallback vs OpenClaw-backed output.
5. Re-run checks in a clean shell because current verification is blocked by EPERM.
```

## Impact Matrix

| Area | Impact | Current assessment | Required action |
| --- | --- | --- | --- |
| `packages/shared` | Low | Canonical enums and scenario seeds remain valid. | Keep. Add only future source/run enums if implementation needs them. |
| `packages/core` reconciliation | Low | AuditEvent generation does not depend on OpenClaw and remains aligned. | Keep. Minor cleanup later for unused movement-direction parameter if desired. |
| `packages/core` proof | Low | Local proof package creation correctly does not depend on OpenClaw. | Keep. Continue to 0G upload later. |
| `packages/agent` | High | Now framed as adapter/fallback, but not a real OpenClaw runtime. | Keep as boundary, but do not claim real OpenClaw. Add real sidecar/plugin path later. |
| `apps/web` dashboard | Medium | Useful local demo shell, but imports built `dist` paths and should display triage source more explicitly. | Fix package imports and show fallback vs OpenClaw-backed status before demo. |
| `packages/db` | Medium | Schema preserves AuditEvent ownership and stores triage outcome, but lacks OpenClaw source/run metadata and StaffClarificationRequest table. | Keep. Add metadata/table only when persistence flow needs it. |
| Backend/API routes | Medium | No backend API routes yet, so no broken integration exists. | When added, expose AuditEvent context safely and reject OpenClaw fact mutation. |
| Telegram | Medium | Still unimplemented; OpenClaw has Telegram support, but ARKA P0 may use dashboard simulation or ARKA-owned grammY. | Decide explicitly before implementation; do not mix paths silently. |
| 0G Storage | Low | OpenClaw finding does not affect proof package ownership. | Continue independent proof path. |
| 0G Chain | Low | OpenClaw finding does not affect anchor registry design. | Continue independent contract path. |
| Docs/truthfulness | High | Docs needed correction because fallback must not be called real OpenClaw integration. | Updated, but README later must also say this clearly. |

## Code Findings

### Valid And Aligned

`packages/shared`:

```txt
Canonical enums exist and match current docs.
ScenarioKey currently covers required P0 A/C/D.
State A/C/D facts match the demo brief.
```

`packages/core`:

```txt
Reconciliation is pure and OpenClaw-independent.
AuditEvent starts with triageOutcome = null.
Proof statuses start LOCAL_ONLY / NOT_STARTED / NOT_REGISTERED.
```

`packages/core/src/proof.ts`:

```txt
Local proof package builder is independent from OpenClaw.
Canonical hash work remains useful for 0G Storage and Chain.
```

`packages/db`:

```txt
Schema is mostly aligned with ARKA-owned persistence.
OpenClaw does not become the source of truth.
CaseNote and ActionLog exist for appended agent outputs.
```

### Needs Remediation

`packages/agent`:

```txt
Current implementation is deterministic fallback plus adapter boundary only.
It is not an OpenClaw runtime, plugin, skill, gateway, or Telegram channel.
Imports should use workspace package imports instead of reaching into ../../shared/src.
Fallback currently defaults unknown cases to AUTO_CLEAR, which is acceptable only for current A/C/D tests but should be hardened before broader states.
```

`apps/web`:

```txt
Dashboard imports built dist paths through relative paths.
This is fragile and should be replaced with package imports such as @arka/shared, @arka/core, and @arka/agent once Next workspace transpilation is configured.
Dashboard copy says deterministic triage, which is good.
Dashboard should also show triageSource explicitly.
```

`packages/db`:

```txt
OpenClaw source/run/session metadata is not stored yet.
StaffClarificationRequest is documented but not yet represented as a table.
This is not a restart blocker, but it is a gap before full conversation persistence.
```

## Corrected Architecture Mapping

```txt
Scenario runner / API route
  -> packages/core creates AuditEvent
  -> database persists AuditEvent and evidence refs
  -> proof layer can build AuditEvent Proof Package immediately
  -> packages/agent asks OpenClaw boundary for triage
     -> if OpenClaw gateway/plugin is available: OpenClaw-backed triage
     -> if unavailable: deterministic fallback
  -> database appends triageOutcome, CaseNote, ActionLog, StaffClarificationRequest as allowed
  -> dashboard shows triageSource and proof status honestly
```

Forbidden mapping:

```txt
OpenClaw must not calculate expected vs actual as the source of truth.
OpenClaw must not mutate AuditEvent.status, severity, variance, quantities, or evidence refs.
OpenClaw must not directly own 0G Storage upload or 0G Chain registration.
Dashboard must not label deterministic fallback as real OpenClaw runtime.
```

## Parallel Session Impact

S1 shared/core tests:

```txt
Keep.
OpenClaw correction does not invalidate A/C/D reconciliation tests.
```

S2 agent:

```txt
Needs correction path, not deletion.
Current adapter/fallback split is a useful boundary.
Next S2 work should research/run OpenClaw smoke setup and design/create ARKA skill/plugin instead of only editing local fallback.
```

S3 dashboard:

```txt
Keep as local UI shell.
Required cleanup: package imports, triageSource display, and explicit "OpenClaw runtime not connected" status until verified.
```

S4 database:

```txt
Keep.
Potential later additions: triage_source, openclaw_run_id, openclaw_session_id, openclaw_message_ref, StaffClarificationRequest.
Do not add these blindly until API/write flow needs them.
```

S5 proof:

```txt
Keep.
Proof path is correctly independent from OpenClaw.
```

S6 contracts:

```txt
Can proceed.
OpenClaw correction does not affect AuditProofRegistry except that final/action timeline packages may later include OpenClaw outputs.
```

## Verification Performed In This Session

Inspected:

```txt
docs/openclaw-research-and-integration-plan.md
docs/code-map.md
docs/implementation-plan.md
packages/agent/src/openclaw-adapter.ts
packages/agent/src/policy.ts
packages/agent/src/triage.ts
packages/shared/src/types.ts
packages/core/src/reconciliation.ts
packages/core/src/proof.ts
packages/db/src/schema.ts
apps/web/app/dashboard/dashboard-data.ts
apps/web/app/dashboard/dashboard-shell.tsx
```

Attempted checks:

```txt
pnpm.cmd --filter @arka/shared test
pnpm.cmd --filter @arka/core test
pnpm.cmd --filter @arka/agent test
pnpm.cmd run typecheck
```

Result:

```txt
Not verified in this session.
The commands failed due EPERM filesystem/process permission errors in the current PowerShell/Node environment.
The observed failures were startup/spawn/open permission failures, not test assertion failures.
Earlier worker reports claimed these checks passed, but this session cannot independently confirm them.
```

## Required Remediation Before Next Commit Or Demo Claim

P0 remediation:

```txt
1. Keep docs truthfulness: OpenClaw = researched, not integrated.
2. Show triageSource in dashboard.
3. Replace dashboard relative dist imports with package imports or document why that is temporarily blocked.
4. Replace packages/agent internal shared source imports with @arka/shared.
5. Re-run shared/core/agent/db typecheck and tests in a clean shell.
```

P1 remediation:

```txt
1. Run OpenClaw smoke setup.
2. Create ARKA OpenClaw workspace skill.
3. Create or plan ARKA OpenClaw plugin tools.
4. Add optional DB fields for OpenClaw source/run/session references once integration shape is confirmed.
5. Decide whether Telegram P0 is ARKA-owned grammY, OpenClaw channel, or dashboard-only simulation.
```

## Honest Current Claim

Correct:

```txt
ARKA has an AuditEvent-first core direction.
ARKA has deterministic A/C/D fallback triage.
ARKA has researched upstream OpenClaw and documented the intended sidecar/plugin path.
ARKA does not yet have real OpenClaw runtime integration.
```

Incorrect:

```txt
ARKA has a working OpenClaw agent.
ARKA has modified OpenClaw.
ARKA has OpenClaw Telegram running.
ARKA has verified OpenClaw gateway/plugin integration.
```
