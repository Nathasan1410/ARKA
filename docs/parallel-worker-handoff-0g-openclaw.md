# Parallel Worker Handoff - 2 Session Plan

Use this handoff from the fast working copy:

```txt
C:\Dev\ARKA-github
```

Do not work from the old HDD repo unless explicitly using it as historical reference:

```txt
D:\Projekan\Macam2Hackathon\ARKA\ARKA-github
```

Current baseline:

```txt
a61bb033 docs: add parallel worker handoff
```

Local OpenClaw smoke config and MiniMax keys were moved outside the repo to:

```txt
C:\Dev\_openclaw-smoke\.env.local
C:\Dev\_openclaw-smoke\openclaw.json
C:\Dev\_openclaw-smoke\run-arka-openclaw-gateway.ps1
```

Do not print, commit, or copy secret values into repo files.

## Shared Startup

Every session starts with:

```powershell
cd C:\Dev\ARKA-github
git status --short
git pull origin main
pnpm.cmd install
```

Read before editing:

```txt
AGENTS.md
docs/project-brief.md
docs/real-vs-simulated.md
docs/implementation-plan.md
docs/code-map.md
checklist.md
```

If touching OpenClaw, also read:

```txt
Arka - OpenClaw Agent.md
docs/openclaw-impact-assessment.md
docs/openclaw-local-fork-plan.md
docs/openclaw-plugin-skeleton-plan.md
docs/openclaw-research-and-integration-plan.md
```

## Shared Project Invariant

```txt
Backend/core creates AuditEvent.
Database stores operational evidence + proof metadata.
OpenClaw reads AuditEvent for Layer-1 triage.
Dashboard is Layer-2 visual investigation.
0G Storage stores sealed proof packages.
0G Chain anchors proof references.
```

OpenClaw must not:

```txt
overwrite AuditEvent.status
overwrite expected quantity
overwrite actual quantity
overwrite variance
overwrite severity
overwrite evidence references
upload to 0G Storage
register 0G Chain anchors
send Telegram before channel policy is verified
accuse staff of theft/fraud/guilt
```

Truthfulness rules:

```txt
Do not claim real OpenClaw-backed ARKA triage until model-backed response + gateway/plugin/client path + app call are verified.
Do not claim Telegram works until a real bot/channel flow is verified.
Do not claim 0G Storage upload works until real upload is implemented and verified.
Do not claim 0G Chain registry works until real deploy/tx/anchor is implemented and verified.
Keep deterministic triage labeled as deterministic fallback.
```

Documentation rules:

```txt
Update CHANGELOG.md for meaningful work.
Update docs/ai-attribution.md for material AI-assisted code/spec/docs.
Update docs/real-vs-simulated.md only when truthfulness changes.
Update docs/reused-libraries.md only when adding dependency/template/starter/copied public example.
Update technical-debt.md when something is skipped, blocked, or needs human setup.
Do not commit unless explicitly asked.
```

## Subagent Usage Rule

Each main session may use subagents, but only for bounded side work.

Use subagents for:

```txt
read-only codebase exploration
researching current SDK/framework/API facts
checking a narrow set of files for alignment
reviewing a patch before final verification
```

Do not use subagents for:

```txt
the immediate blocking task
large overlapping edits
duplicate work
unbounded repo-wide rewrites
commits or pushes
```

When delegating:

```txt
Give each subagent a 32k-64k context-sized task.
Give exact owned paths.
Tell them not to edit unless explicitly assigned as worker.
Tell them to report files read, findings, commands run, and residual risks.
Keep one main session responsible for final integration and verification.
```

## Session A - OpenClaw Agent Track

Mission:

```txt
Make the OpenClaw side real enough to test without breaking ARKA boundaries.
```

Primary focus:

```txt
OpenClaw gateway discovery/load of openclaw/extensions/arka-audit
one bounded model-backed ARKA skill turn
future packages/agent gateway client shape only after the gateway path is proven
```

Owned paths:

```txt
openclaw/extensions/arka-audit/**
openclaw/workspaces/arka/**
packages/agent/** only if adding a narrow client boundary
test/arka-openclaw.verify.test.ts
docs/openclaw-local-fork-plan.md
docs/openclaw-impact-assessment.md
docs/openclaw-plugin-skeleton-plan.md
docs/real-vs-simulated.md
technical-debt.md
CHANGELOG.md
docs/ai-attribution.md
```

Suggested subagents:

```txt
Subagent A1 - OpenClaw CLI/Gateway Explorer:
Read OpenClaw CLI/gateway docs and source around plugin discovery/load. Find the exact local command to prove arka-audit is discovered by gateway. Do not edit.

Subagent A2 - Skill/Prompt Boundary Reviewer:
Read openclaw/workspaces/arka and Arka - OpenClaw Agent.md. Check whether skill wording preserves AuditEvent-first and no-accusation/no-mutation boundaries. Do not edit unless assigned a surgical docs patch.

Subagent A3 - packages/agent Boundary Reviewer:
Read packages/agent/src. Confirm deterministic fallback remains safe and identify the smallest future gateway-client seam. Do not implement unless explicitly assigned.
```

Implementation order:

```txt
1. Confirm local C path config works with C:\Dev\_openclaw-smoke.
2. Verify openclaw/extensions/arka-audit extension-local tests.
3. Verify OpenClaw gateway discovery/load of arka-audit.
4. Run one bounded model-backed ARKA turn using the correct selector/session flags.
5. Only after 3-4 succeed, consider a narrow packages/agent client seam.
```

Allowed work:

```txt
fix plugin manifest/entrypoint if gateway cannot discover it
fix workspace config/path references
add narrow verification tests
document exact commands and statuses
```

Forbidden work:

```txt
no DB writes from OpenClaw tools
no Telegram sends
no 0G Storage upload
no 0G Chain registration
no mutation of AuditEvent facts
no secret commits
no broad OpenClaw source refactors
```

Verification:

```powershell
pnpm.cmd --dir openclaw run test:extension arka-audit
pnpm.cmd run verify:arka-openclaw
```

If gateway/model checks succeed, report exact commands used.

Completion report:

```txt
Files changed
Gateway plugin load: yes/no
Model-backed ARKA turn: yes/no
packages/agent gateway call: yes/no
Verification performed
technical-debt.md updated yes/no and why
Truthfulness docs updated yes/no and why
Residual risks
```

## Session B - Web2 MVP App Track

Mission:

```txt
Make the Web2 MVP app path solid before Web3 integration.
```

Primary focus:

```txt
scenario-card dashboard
Order + Movement + AuditEvent display
deterministic OpenClaw fallback display
proof panel with local proof package/statuses
database/core boundaries
manual/local demo reliability
```

Owned paths:

```txt
apps/web/**
packages/shared/**
packages/core/**
packages/db/**
packages/agent/** only for display-safe type alignment, not OpenClaw runtime work
docs/real-vs-simulated.md
docs/code-map.md
docs/implementation-plan.md
docs/database-structure-plan.md
technical-debt.md
CHANGELOG.md
docs/ai-attribution.md
```

Suggested subagents:

```txt
Subagent B1 - Dashboard Explorer:
Read apps/web/app/dashboard and identify what is missing for A/C/D demo clarity. Do not edit unless assigned a specific UI patch.

Subagent B2 - Core/Proof Explorer:
Read packages/shared and packages/core. Confirm A/C/D fixtures, reconciliation, AuditEvent creation, and local proof package behavior. Do not edit unless assigned tests or types.

Subagent B3 - DB Boundary Explorer:
Read packages/db schema and docs/database-structure-plan.md. Confirm schema aligns with Web2 MVP and does not overclaim live DB persistence. Do not edit unless assigned a narrow schema/docs patch.
```

Implementation order:

```txt
1. Verify C:\Dev build environment:
   pnpm.cmd install
   pnpm.cmd --filter @arka/web build
   pnpm.cmd run verify:arka-openclaw

2. Fix web build/dev blockers first.

3. Improve dashboard proof panel:
   Audit Proof Status
   Storage Status
   Chain Status
   localPackageHash
   failure/retry placeholders

4. Ensure State A/C/D are demo-clear:
   expected vs actual
   variance
   severity
   AuditEvent detail
   triageOutcome
   triageSource

5. Keep 0G and Telegram labeled planned/simulated until real integration exists.
```

Allowed work:

```txt
dashboard UI improvements
local proof package display
scenario A/C/D reliability
tests for shared/core/web-safe behavior
docs truthfulness updates
```

Forbidden work:

```txt
no real 0G Storage integration
no real 0G Chain deploy/tx
no OpenClaw gateway implementation
no Telegram implementation
no full POS/editor/admin dashboard
no ERP/warehouse/HR scope
```

Verification:

```powershell
pnpm.cmd --filter @arka/shared test
pnpm.cmd --filter @arka/core test
pnpm.cmd --filter @arka/agent test
pnpm.cmd --filter @arka/db run typecheck
pnpm.cmd --filter @arka/db run generate
pnpm.cmd --filter @arka/web build
pnpm.cmd run verify:arka-openclaw
```

Manual check if possible:

```txt
Run dashboard locally.
Click State A, State C, State D.
Confirm proof panel labels local/simulated/not-started correctly.
Confirm OpenClaw panel says deterministic fallback unless Session A has proven runtime path.
```

Completion report:

```txt
Files changed
Web2 MVP behavior improved
Scenarios verified
Build/tests run
Manual browser verification yes/no
technical-debt.md updated yes/no and why
Truthfulness docs updated yes/no and why
Residual risks
```

## After Session A And B

Only after both tracks are stable:

```txt
Start Web3 phase.
First: 0G Storage SDK/CLI smoke.
Second: AuditProofRegistry local Hardhat tests.
Third: connect local proof package -> storage upload -> chain anchor.
Fourth: dashboard proof status from real results.
```

Do not start Web3 integration while:

```txt
dashboard build is broken
A/C/D local demo is unclear
OpenClaw truthfulness labels are misleading
proof package local hash is not visible/testable
```
