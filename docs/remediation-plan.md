# ARKA Remediation Plan

Last updated: 2026-04-29

## Purpose

This plan coordinates the remediation pass after the OpenClaw integration misunderstanding.

The goal is not to restart ARKA. The goal is to keep valid work, fix misleading boundaries, and make the codebase safe for continued parallel implementation.

## Current Verdict

```txt
Severity: HIGH for OpenClaw integration direction and demo truthfulness.
Restart needed: NO.
Remediation needed: YES, before demo claims or next major commit.
```

Valid work to preserve:

```txt
packages/shared enums and A/C/D fixtures
packages/core reconciliation and AuditEvent generation
packages/core local proof package hashing
packages/db first Drizzle schema direction
apps/web dashboard shell direction
packages/agent adapter/fallback split
```

Core correction:

```txt
OpenClaw is a gateway/runtime/plugin/skills system.
packages/agent is only ARKA's app-facing OpenClaw boundary plus deterministic fallback.
Do not claim real OpenClaw integration until the gateway/plugin path is implemented and verified.
```

Primary references:

```txt
docs/openclaw-research-and-integration-plan.md
docs/openclaw-impact-assessment.md
docs/real-vs-simulated.md
technical-debt.md
docs/code-map.md
docs/implementation-plan.md
```

## Non-Negotiable Rules

```txt
Do not rewrite the project from zero.
Do not delete other workers' changes.
Do not implement speculative P1/P2 features.
Do not claim OpenClaw, Telegram, 0G Storage, or 0G Chain works unless verified.
Do not make OpenClaw the reconciliation source of truth.
Do not let OpenClaw mutate AuditEvent facts.
```

OpenClaw may only append or recommend:

```txt
triageOutcome
triageSource
CaseNote
ActionLog
StaffClarificationRequest
caseResolutionStatus / recommendation
```

OpenClaw must not overwrite:

```txt
AuditEvent.status
expected quantity
actual quantity
variance
severity
evidence references
proof history
```

## Remediation Workstreams

### S1 - Shared/Core Contract Guardrails

Owner scope:

```txt
packages/shared
packages/core tests
shared/core docs only if needed
```

Goal:

```txt
Ensure canonical shared/core behavior remains stable after OpenClaw boundary correction.
```

Tasks:

```txt
1. Verify canonical enums still match docs/mvp-demo-interaction-brief.md.
2. Confirm ScenarioKey and CaseType remain separate concepts.
3. Confirm State A/C/D fixtures remain unchanged.
4. Confirm core AuditEvent creation still sets triageOutcome = null before agent triage.
5. Add or adjust tests only if the current tests do not explicitly protect these boundaries.
6. Do not add real OpenClaw logic to shared/core.
```

Expected output:

```txt
shared/core tests pass or blocker recorded
no architecture expansion
short report on whether shared/core remains aligned
```

### S2 - Agent / OpenClaw Boundary Remediation

Owner scope:

```txt
packages/agent
docs/openclaw-research-and-integration-plan.md only if facts need correction
technical-debt.md if blocked
```

Goal:

```txt
Make packages/agent an honest ARKA OpenClaw boundary and deterministic fallback, not a fake OpenClaw runtime.
```

Tasks:

```txt
1. Replace internal shared source imports with workspace package imports where feasible.
2. Keep deterministic fallback isolated in policy.ts.
3. Keep openclaw-adapter.ts as a runtime boundary, not an implementation of OpenClaw itself.
4. Ensure triageAuditEvent returns triageOutcome and triageSource.
5. Add tests proving fallback is used when no OpenClaw runtime is available.
6. Add tests proving reconciliation facts are not mutated by triage.
7. Harden fallback behavior for unknown future states if doing so is small and safe; otherwise record in technical-debt.md.
8. Do not clone, vendor, or implement OpenClaw runtime in this remediation slice unless explicitly assigned.
```

Expected output:

```txt
@arka/agent test/typecheck pass or blocker recorded
agent boundary remains honest
no Telegram, DB write, proof, or chain work added
```

### S3 - Dashboard Truthfulness / Package Boundary Cleanup

Owner scope:

```txt
apps/web
dashboard UI files
docs/real-vs-simulated.md if truthfulness changes
technical-debt.md if manual UI verification is skipped
```

Goal:

```txt
Keep the dashboard shell, but make fallback/OpenClaw state explicit and remove fragile package import shortcuts if feasible.
```

Tasks:

```txt
1. Show triageSource in the OpenClaw / Telegram panel.
2. Make copy explicit: deterministic fallback is active; real OpenClaw runtime is not connected.
3. Replace relative dist imports with package imports such as @arka/shared, @arka/core, and @arka/agent if Next config supports it.
4. If package imports need config work, do the smallest correct config change. If blocked, document it in technical-debt.md.
5. Keep dashboard scenario-card driven around State A/C/D.
6. Do not add real Telegram, DB persistence, 0G upload, or chain calls in this remediation slice.
```

Expected output:

```txt
@arka/web build pass or blocker recorded
dashboard accurately labels fallback vs real OpenClaw
manual browser verification performed or technical-debt.md updated
```

### S4 - Database Alignment / OpenClaw Persistence Gap Review

Owner scope:

```txt
packages/db
docs/database-structure-plan.md
technical-debt.md if persistence verification remains blocked
```

Goal:

```txt
Confirm DB schema remains aligned with corrected OpenClaw boundary and identify only necessary persistence gaps.
```

Tasks:

```txt
1. Verify AuditEvent facts remain owned by backend/core, not OpenClaw.
2. Confirm triageOutcome can be stored without mutating reconciliation facts.
3. Review whether triageSource should be added now or deferred.
4. Review StaffClarificationRequest gap against docs.
5. Do not add broad auth, permissions, manager workflow, or ERP-style tables.
6. If adding DB fields/tables, keep them minimal and justified by current P0/P1 needs.
7. Keep live Postgres migration verification in technical-debt.md unless a DATABASE_URL is provided and tested.
```

Expected output:

```txt
@arka/db typecheck/generate pass or blocker recorded
clear decision: add minimal fields now vs defer
no database scope expansion
```

### S5 - Proof Independence / OpenClaw Separation

Owner scope:

```txt
packages/core/src/proof.ts
packages/core proof tests
docs/real-vs-simulated.md if truthfulness changes
technical-debt.md if verification blocked
```

Goal:

```txt
Confirm proof package creation remains independent from OpenClaw runtime and stays ready for 0G Storage / 0G Chain work.
```

Tasks:

```txt
1. Verify AuditEvent Proof Package does not require OpenClaw triage to exist.
2. Confirm proof package includes reconciliation facts and backend recommendation only as appropriate.
3. Confirm OpenClaw outputs can be added later through final resolution/action timeline packages, not required for initial AuditEvent Proof Package.
4. Add tests if current tests do not protect proof independence from OpenClaw.
5. Do not implement 0G upload or chain registration in this remediation slice.
```

Expected output:

```txt
@arka/core proof tests pass or blocker recorded
proof package remains OpenClaw-independent
docs remain honest: local proof package only, no real 0G claim
```

## Global Verification Gate

After S1-S5 remediation, run:

```txt
pnpm.cmd --filter @arka/shared test
pnpm.cmd --filter @arka/core test
pnpm.cmd --filter @arka/agent test
pnpm.cmd --filter @arka/db run typecheck
pnpm.cmd --filter @arka/db run generate
pnpm.cmd --filter @arka/web build
pnpm.cmd run typecheck
```

If Windows PowerShell blocks checks with EPERM:

```txt
1. Record exact command and error in technical-debt.md.
2. Retry from clean PowerShell.
3. If still blocked, retry from WSL2 or a fresh terminal.
4. Do not mark checks as passed unless they actually pass.
```

## Completion Report Format For Every Worker

Each worker must report:

```txt
1. Files changed
2. Sections/functions changed
3. Alignment verdict
4. Verification performed
5. Docs updated yes/no and why
6. technical-debt.md updated yes/no and why
7. Anything skipped and why
8. Any risk for other workers
```

## PM Integration Checklist

Before committing:

```txt
1. Review S1-S5 diffs for overlap/conflicts.
2. Confirm no worker reverted another worker's changes.
3. Confirm docs/real-vs-simulated.md does not overclaim OpenClaw, Telegram, 0G Storage, or 0G Chain.
4. Confirm dashboard labels deterministic fallback clearly.
5. Confirm technical-debt.md contains all skipped verification.
6. Run global verification gate or record blocker.
```

## Next After Remediation

Only after this remediation pass:

```txt
S2B: OpenClaw smoke setup / ARKA workspace skill / plugin plan
S6: AuditProofRegistry contract can proceed independently
Proof worker: 0G Storage upload verification
Dashboard worker: DB-backed scenario run if DB persistence is verified
Telegram worker: choose ARKA-owned grammY vs OpenClaw Telegram channel explicitly
```

## S1-S5 Remediation Completion Summary

Last updated: 2026-04-29

### Overall Verdict

```txt
Remediation status: SUBSTANTIALLY COMPLETE
Restart needed: NO
OpenClaw runtime integrated: NO
Deterministic fallback preserved: YES
Core AuditEvent architecture still aligned: YES
```

The S1-S5 remediation pass confirms that the OpenClaw misunderstanding affected the agent/runtime claim and several boundary labels, but it did not invalidate the shared/core/db/proof/dashboard foundation.

Current honest claim:

```txt
ARKA has a deterministic OpenClaw-facing fallback boundary.
ARKA has not yet integrated a real OpenClaw gateway/plugin/runtime.
Dashboard now labels the fallback path explicitly.
Database can persist triageSource, but no real OpenClaw run/session/message refs exist yet.
Proof packages remain independent from OpenClaw.
```

### S1 - Shared/Core Guardrails

Status:

```txt
DONE
```

Result:

```txt
Canonical enum tests were strengthened.
ScenarioKey and CaseType separation is protected.
State A/C/D fixtures remain unchanged and aligned.
createAuditEvent still initializes triageOutcome = null.
Initial proof lifecycle defaults are protected: LOCAL_ONLY / NOT_STARTED / NOT_REGISTERED.
```

Verification reported:

```txt
pnpm.cmd --filter @arka/shared test
pnpm.cmd --filter @arka/core test
pnpm.cmd --filter @arka/shared run typecheck
pnpm.cmd --filter @arka/core run typecheck
```

All passed according to S1.

Impact:

```txt
Low risk.
Useful guardrail for future workers.
```

### S2 - Agent / OpenClaw Boundary

Status:

```txt
DONE
```

Result:

```txt
packages/agent now uses workspace package imports for shared types.
openclaw-adapter.ts remains a runtime boundary only.
policy.ts remains deterministic fallback only.
triageAuditEvent still returns triageOutcome and triageSource.
Unknown/default future review states now fall back to REQUEST_EXPLANATION instead of AUTO_CLEAR.
Tests cover A/C/D behavior, immutability, runtime-unavailable fallback, and unknown-state safety.
```

Verification reported:

```txt
pnpm.cmd --filter @arka/agent test
pnpm.cmd --filter @arka/agent run typecheck
```

Both passed according to S2.

Impact:

```txt
Aligned.
The safer default may affect any worker that assumed unknown cases auto-clear.
No real OpenClaw runtime/plugin/gateway work was added.
```

### S3 - Dashboard Truthfulness / Package Boundary

Status:

```txt
DONE WITH MANUAL UI VERIFICATION DEBT
```

Result:

```txt
Dashboard now shows explicit fallback state.
OpenClaw runtime is labeled as not connected.
triageSource is visible in the UI.
Dashboard data carries triageRuntimeSummary.
apps/web uses path aliases for @arka/shared, @arka/core, and @arka/agent instead of fragile relative dist imports.
No DB, Telegram, 0G Storage, or chain calls were added.
```

Verification reported:

```txt
pnpm.cmd --filter @arka/web build
```

Passed according to S3.

Skipped:

```txt
Manual browser click-through for State A/C/D.
pnpm.cmd --filter @arka/web dev timed out after 24044ms.
technical-debt.md records this.
```

Impact:

```txt
Aligned.
Low-to-medium coordination risk because apps/web now depends on local path aliases into package source.
```

### S4 - Database Alignment

Status:

```txt
DONE WITH LIVE POSTGRES DEBT
```

Result:

```txt
Added triageSource enum and nullable audit_events.triage_source.
Added minimal staffClarificationRequests table.
Updated docs/database-structure-plan.md.
Deferred openclaw_run_id, openclaw_session_id, and message refs until real OpenClaw sidecar/plugin integration exists.
Did not add broad auth, manager workflow, ERP tables, or speculative OpenClaw metadata.
```

Verification reported:

```txt
pnpm.cmd --filter @arka/db run typecheck
pnpm.cmd --filter @arka/db run generate
pnpm.cmd run typecheck
```

All passed according to S4.

Skipped:

```txt
No live Postgres migration application or read/write persistence verification because no real DATABASE_URL was provided.
Existing technical-debt.md entry still covers this.
```

Impact:

```txt
Aligned.
Migration coordination risk exists: future DB work must rebase on packages/db/drizzle/0001_omniscient_shard.sql.
If S2 changes triageSource labels, DB enum must stay in sync.
```

### S5 - Proof Independence

Status:

```txt
DONE
```

Result:

```txt
Added proof regression tests.
AuditEvent Proof Package does not require OpenClaw triage output.
Initial AUDIT_EVENT_CREATED package does not serialize triageOutcome, triageSource, or OpenClaw runtime outputs.
OpenClaw outputs remain reserved for later final-resolution or action-timeline packages.
No production proof code changes were needed.
```

Verification reported:

```txt
pnpm.cmd --filter @arka/core test
pnpm.cmd --filter @arka/core run typecheck
pnpm.cmd run typecheck
```

All passed according to S5.

Impact:

```txt
Aligned.
Low risk.
```

## Remaining Post-Remediation Risks

### Real OpenClaw Integration Still Missing

```txt
Status: OPEN
Owner: S2B / PM
```

Next required work:

```txt
Run OpenClaw smoke setup.
Create ARKA OpenClaw workspace skill.
Create or plan ARKA OpenClaw plugin tools.
Decide whether to use OpenClaw Telegram channel or ARKA-owned grammY for P0/P1.
```

Do not claim:

```txt
working OpenClaw runtime
modified OpenClaw
OpenClaw Telegram
OpenClaw-backed reasoning
```

until verified.

### Manual Dashboard Verification Still Missing

```txt
Status: OPEN
Owner: S3 / PM
```

Next required work:

```txt
Run the web app in a browser.
Click State A, State C, and State D.
Confirm triageSource, fallback label, proof placeholders, and AuditEvent facts render correctly.
```

### Live Database Verification Still Missing

```txt
Status: OPEN
Owner: S4 / PM
```

Next required work:

```txt
Provide DATABASE_URL.
Apply migrations to real Postgres.
Verify write/read path for demo world and AuditEvent.
```

### Global Verification Gate

```txt
Status: DONE
Owner: PM
```

Run after integrating all worker diffs:

```txt
pnpm.cmd --filter @arka/shared test
pnpm.cmd --filter @arka/core test
pnpm.cmd --filter @arka/agent test
pnpm.cmd --filter @arka/db run typecheck
pnpm.cmd --filter @arka/db run generate
pnpm.cmd --filter @arka/web build
pnpm.cmd run typecheck
```

Result:

```txt
All passed on 2026-04-29.
```

## Updated Next Step Recommendation

Do this next:

```txt
1. Commit the remediation batch.
2. Start S2B OpenClaw smoke setup / ARKA skill-plugin work.
3. In parallel, S6 can start AuditProofRegistry contract because proof/chain path is independent from OpenClaw.
```
