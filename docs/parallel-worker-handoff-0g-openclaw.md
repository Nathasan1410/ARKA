# Parallel Worker Handoff - 0G And OpenClaw

Use this handoff after baseline commit:

```txt
23d50f3d feat: add local OpenClaw fork and audit plugin baseline
```

Before doing anything:

```txt
1. git pull origin main
2. Read AGENTS.md
3. Read docs/project-brief.md
4. Read docs/real-vs-simulated.md
5. Read docs/implementation-plan.md
6. Read docs/openclaw-impact-assessment.md if your task touches OpenClaw
7. Do not commit unless explicitly asked
```

Project invariant:

```txt
Backend/core creates AuditEvent.
Database stores operational evidence + proof metadata.
OpenClaw reads AuditEvent for Layer-1 triage.
Dashboard is Layer-2 visual investigation.
0G Storage stores sealed proof packages.
0G Chain anchors proof references.
```

Never claim unverified integrations work.

If skipped or blocked, update `technical-debt.md`.

If you materially change code/docs/specs, update `CHANGELOG.md` and `docs/ai-attribution.md`.

## S2 - 0G Storage Research And Smoke

Task: Verify the current 0G Storage integration path for ARKA without wiring app code yet.

Owned paths:

```txt
docs/0g-storage-integration-plan.md if new doc is needed
docs/technical-stack-brief.md only if SDK facts change
docs/real-vs-simulated.md only if truthfulness changes
technical-debt.md
CHANGELOG.md
docs/ai-attribution.md
```

Goals:

```txt
1. Confirm current official 0G Storage SDK/CLI package, install method, upload API, endpoint/config requirements, auth requirements, and response shape.
2. Determine what ARKA must store for AuditEvent Proof Package: localPackageHash, storage root/hash/ref, upload timestamp, status.
3. Produce a minimal smoke plan or script proposal, but do not wire dashboard/backend yet unless explicitly asked.
4. Confirm whether CLI fallback is viable.
```

Constraints:

```txt
Use official 0G docs/source/examples only.
Do not upload real proof unless explicitly approved and environment is provided.
Do not put secrets in repo.
Do not make OpenClaw upload to 0G.
Do not change AuditEvent facts.
```

Verification:

```txt
Run only safe local checks.
If network/API smoke cannot run, record exact blocker in technical-debt.md.
```

Report:

```txt
Files changed.
Facts verified.
Remaining unknowns.
Exact next integration step.
```

## S3 - 0G Chain Contract

Task: Implement or prepare the first `AuditProofRegistry` contract path.

Owned paths:

```txt
contracts/**
docs/0g-chain-brief.md
docs/real-vs-simulated.md only if truthfulness changes
technical-debt.md
CHANGELOG.md
docs/ai-attribution.md
```

Goals:

```txt
1. Implement Solidity AuditProofRegistry if not already implemented.
2. Support registering proof anchors for AUDIT_EVENT_CREATED first.
3. Include authorized registrar control.
4. Store/emit auditEventId, proofType, localPackageHash, storageRoot/ref, registeredBy, registeredAt.
5. Add local Hardhat tests for successful registration, duplicate guard, unauthorized caller, and event emission.
```

Constraints:

```txt
Local Hardhat only unless 0G RPC/faucet/deploy info is confirmed.
Do not claim 0G Chain testnet works unless a real deploy/tx is verified.
Do not store full AuditEvent JSON on-chain.
Do not store staff messages or OpenClaw transcripts on-chain.
```

Verification:

```txt
pnpm install if needed.
Hardhat compile/test.
Root typecheck if package scripts touch root.
```

Report:

```txt
Files changed.
Tests run.
Contract API summary.
What remains for testnet deploy.
```

## S4 - Proof Pipeline Boundary

Task: Build the backend/core boundary for proof workflow without real 0G calls unless S2 has verified SDK details.

Owned paths:

```txt
packages/core/**
packages/shared/**
packages/db/** only if persistence shape needs narrow update
docs/database-structure-plan.md
docs/real-vs-simulated.md
technical-debt.md
CHANGELOG.md
docs/ai-attribution.md
```

Goals:

```txt
1. Keep existing AuditEvent Proof Package builder independent from OpenClaw.
2. Add service/interface shape for proof lifecycle:
   LOCAL_ONLY -> PENDING_UPLOAD -> STORED_ON_0G -> PENDING_REGISTRATION -> REGISTERED_ON_CHAIN -> VERIFIED.
3. Add failure states:
   FAILED_TO_STORE, RETRY_PENDING, FAILED_TO_REGISTER.
4. Ensure failed proof attempts never delete or invalidate AuditEvent.
5. Add unit tests for State C/D proof attempt state transitions if implemented.
```

Constraints:

```txt
Do not call real 0G Storage/Chain unless S2/S3 gives verified details.
Do not add API routes unless explicitly assigned.
Do not let OpenClaw own proof creation.
Do not mutate AuditEvent reconciliation facts.
```

Verification:

```txt
pnpm.cmd --filter @arka/core test
pnpm.cmd --filter @arka/shared test if shared changed
pnpm.cmd run typecheck
```

Report:

```txt
Files changed.
State machine/boundary summary.
Tests run.
Blockers.
```

## S5 - Dashboard Proof UX

Task: Improve dashboard proof panel and local demo UX without claiming real 0G.

Owned paths:

```txt
apps/web/**
docs/real-vs-simulated.md
technical-debt.md
CHANGELOG.md
docs/ai-attribution.md
```

Goals:

```txt
1. Show proof lifecycle clearly:
   Audit Proof Status, Storage Status, Chain Status.
2. Show localPackageHash if available.
3. Show storage/chain as NOT_STARTED or simulated until real integration exists.
4. Make State C/D proof attempt visible in the UI even if status is failure/not started.
5. Keep triageSource visible and label deterministic fallback honestly.
```

Constraints:

```txt
Do not wire real 0G.
Do not claim Telegram/OpenClaw runtime works.
Do not build full admin dashboard.
Keep scenario-card A/C/D first.
```

Verification:

```txt
pnpm.cmd --filter @arka/web build
If build fails due stale .next lock, record exact blocker in technical-debt.md.
Manual browser check if possible.
```

Report:

```txt
Files changed.
UI states added.
Build/manual verification.
Blockers.
```

## S6 - OpenClaw Gateway Load

Task: Continue real OpenClaw integration by proving the existing `arka-audit` plugin can be loaded by OpenClaw gateway.

Owned paths:

```txt
openclaw/extensions/arka-audit/**
openclaw/workspaces/arka/**
packages/agent/** only if adding a narrow client boundary
docs/openclaw-local-fork-plan.md
docs/openclaw-impact-assessment.md
docs/real-vs-simulated.md
technical-debt.md
CHANGELOG.md
docs/ai-attribution.md
```

Goals:

```txt
1. Verify OpenClaw gateway discovery/load of openclaw/extensions/arka-audit.
2. Run one bounded model-backed ARKA skill turn using the correct selector/session flags.
3. Keep get_audit_event read-only until a real ARKA backend/API read path exists.
4. If adding packages/agent gateway client, preserve deterministic fallback on timeout/error/unavailable runtime.
```

Constraints:

```txt
Do not add DB writes.
Do not send Telegram.
Do not upload 0G or register chain.
Do not mutate AuditEvent facts.
Do not store secrets.
Do not claim full ARKA OpenClaw integration until model-backed response + plugin/client path + app call are all verified.
```

Verification:

```txt
pnpm.cmd --dir openclaw run test:extension arka-audit
pnpm.cmd run verify:arka-openclaw
Exact gateway/plugin command used
Exact model-backed command used, if successful
```

Report:

```txt
Files changed.
Gateway load yes/no.
Model turn yes/no.
Logs summary.
Blockers.
```
