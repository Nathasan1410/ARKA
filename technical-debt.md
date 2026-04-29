# Technical Debt / Blockers / Human-Needed Actions

This file tracks skipped work, deferred decisions, blockers, accepted risks, and setup tasks that matter for implementation or demo reliability.

Use this format:

```txt
Date:
Area:
Status: BLOCKED / DEFERRED / RISK / NEEDS_HUMAN
What happened:
Why it matters:
Next action:
Owner: Human / Agent / Both
```

## Current Open Items

### 2026-04-29 - Verification Blocked By Local EPERM

```txt
Area: Verification / Tooling
Status: RESOLVED FOR GLOBAL GATE
What happened: A follow-up impact audit attempted `pnpm.cmd --filter @arka/shared test`, `pnpm.cmd --filter @arka/core test`, `pnpm.cmd --filter @arka/agent test`, and `pnpm.cmd run typecheck`. All failed in this session due EPERM open/spawn permission errors in the current PowerShell/Node environment. The failures occurred at test runner or process startup, not at project assertions.
Why it matters: Earlier worker reports claimed these checks passed, but the PM session initially could not independently confirm that state.
Resolution: The remediation global gate was re-run successfully from an escalated PowerShell command path on 2026-04-29. Shared/core/agent tests, DB typecheck/generate, web build, and root typecheck passed.
Next action: Keep this closed unless EPERM returns in later sessions.
Owner: Both
```

### 2026-04-29 - OpenClaw Impact Remediation

```txt
Area: OpenClaw / Dashboard / Package Boundaries
Status: RISK
What happened: The OpenClaw misunderstanding does not require a full project restart, but it exposed code-boundary cleanup that must happen before demo claims. `packages/agent` is only an adapter/fallback boundary, not a real OpenClaw runtime. The dashboard currently imports built `dist` paths through relative paths, and the UI does not expose `triageSource` clearly enough.
Why it matters: ARKA must not blur deterministic fallback, dashboard simulation, and real OpenClaw runtime behavior. Package-boundary shortcuts also make parallel work more fragile.
Next action: Replace internal/relative shared imports with workspace package imports, show triage source in the dashboard, keep OpenClaw runtime marked unverified, and run checks again after cleanup.
Owner: Both
```

### 2026-04-29 - Postgres Migration Application Verification

```txt
Area: Database / Postgres
Status: NEEDS_HUMAN
What happened: The first Drizzle schema package can typecheck and generate migrations locally, but no real Postgres instance or confirmed DATABASE_URL has been provided yet for applying migrations or verifying write/read behavior against a database.
Why it matters: ARKA should not claim real database persistence beyond schema definition and SQL generation until migrations run successfully against a real Postgres target.
Next action: Provide a Postgres DATABASE_URL, run the generated migration against that database, and verify the demo world can persist and read back an AuditEvent path.
Owner: Both
```

### 2026-04-29 - 0G Storage SDK Verification

```txt
Area: 0G Storage
Status: NEEDS_HUMAN
What happened: The project docs define 0G Storage as a P0 target, but implementation has not started and the exact SDK package, upload method, endpoint/indexer, and upload response shape are not verified yet.
Why it matters: ARKA must not claim real 0G Storage upload until a real upload path is implemented and verified.
Next action: Verify current official 0G Storage SDK docs, endpoint requirements, wallet/funding requirements, upload response shape, and any CLI fallback steps before implementation.
Owner: Both
```

### 2026-04-29 - 0G Chain Environment Verification

```txt
Area: 0G Chain
Status: NEEDS_HUMAN
What happened: The project docs define `AuditProofRegistry` as a P0 target, but the current 0G testnet RPC, chain ID, faucet/funding path, explorer format, and Hardhat version choice are not verified yet.
Why it matters: ARKA must not claim real chain anchoring until the contract can be deployed, called, and checked through a real transaction.
Next action: Verify current official 0G Chain deployment docs, choose Hardhat version from current examples, choose one transaction client (`viem` or `ethers`), and record env requirements in `.env.example` when implementation begins.
Owner: Both
```

### 2026-04-29 - Telegram P0 Mode Decision

```txt
Area: Telegram / OpenClaw conversation
Status: DEFERRED
What happened: The docs allow either real Telegram owner alert or dashboard-simulated conversation for P0. No implementation mode has been chosen yet.
Why it matters: Telegram should not block the core audit/proof demo, but the UI and route shape may differ depending on webhook, polling, or dashboard-only fallback.
Next action: Before Telegram implementation, decide P0 mode: dashboard simulation only, real owner alert, or real bot with dashboard fallback.
Owner: Human
```

### 2026-04-29 - OpenClaw Runtime Integration

```txt
Area: OpenClaw
Status: RISK
What happened: packages/agent currently contains deterministic A/C/D triage fallback only. The upstream OpenClaw repo was cloned for research outside ARKA-github at D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw and documented in docs/openclaw-research-and-integration-plan.md, but no OpenClaw source/runtime has been imported, modified, installed, or verified inside ARKA yet.
Why it matters: ARKA's product story says the agent is built on top of OpenClaw. OpenClaw is a full gateway/runtime/plugin system, not just a local adapter function. The deterministic fallback is useful for MVP resilience, but it must not be mistaken for a real OpenClaw-backed agent.
Next action: Run an OpenClaw smoke setup or create an ARKA OpenClaw workspace skill/plugin plan. Choose whether ARKA uses OpenClaw as a sidecar gateway plus plugin/skill, a fork/submodule, or a copied-source strategy. Do not claim real OpenClaw integration until the gateway/plugin path is implemented and verified.
Owner: Both
```

### 2026-04-29 - Dashboard Manual UI Verification

```txt
Area: Dashboard UI
Status: RISK
What happened: The dashboard shell was verified with `pnpm.cmd --filter @arka/web build`. A follow-up `pnpm.cmd --filter @arka/web dev` attempt timed out after 24044ms in this environment before manual browser interaction could be completed, so State A / State C / State D were not clicked in a browser during this session.
Why it matters: Static build success confirms compilation, not actual in-browser layout, button flow, triageSource visibility, or fallback/OpenClaw copy clarity for the A/C/D demo.
Next action: Run `pnpm.cmd --filter @arka/web dev` from an interactive terminal, open `/dashboard`, and manually verify State A, State C, and State D before claiming the dashboard flow is demo-ready.
Owner: Both
```
