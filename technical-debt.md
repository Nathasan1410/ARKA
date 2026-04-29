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
Status: DEFERRED
What happened: The MVP is allowed to use deterministic triage first. Full OpenClaw runtime / LLM integration has not been verified or implemented.
Why it matters: ARKA should still demo correctly if agent runtime integration slips, but docs and README must be honest about whether OpenClaw is deterministic, partial, or real.
Next action: Implement deterministic triage behind an interface first; verify OpenClaw runtime only after local A/C/D flow works.
Owner: Agent
```

