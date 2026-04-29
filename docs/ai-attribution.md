# AI Attribution

This document tracks material AI-assisted work in ARKA.

## 2026-04-29 - Technical Stack Brief

### AI Tool Used
- OpenAI Codex CLI (GPT-5.5)
- Context7 MCP for current documentation checks

### What AI Helped With
- Drafted the ARKA technical stack recommendation for a 1-week hackathon MVP.
- Compared Next.js route handlers, standalone API options, Postgres/Drizzle, 0G Storage, 0G Chain, OpenClaw integration posture, Telegram bot choices, testing, and deployment.
- Used Context7 for current Next.js, Drizzle ORM, and Hardhat documentation checks.
- Used official docs for 0G, Telegram, viem, Vercel, Vitest, Playwright, shadcn/ui, and OpenClaw.

### Files / Areas Affected
- `docs/technical-stack-brief.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only change.
- No code executed.

## 2026-04-29 - MVP Demo Interaction Brief (Canonicalization + Precision Fixes)

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Copied the MVP demo interaction brief into the repo as the canonical reference doc.
- Split proof display statuses into: `auditProofStatus`, `storage_status`, and `chain_status` (to avoid conflating lifecycle and operational failures).
- Updated the reconciliation trigger sequencing so proof package creation does not depend on OpenClaw already running.
- Added a docs-only canonical enum list for MVP planning, including `ANCHOR_CONFIRMED` (and avoiding `VERIFIED_ON_CHAIN` naming drift).
- Added a one-line reminder in the technical stack brief to keep the MVP UI scenario-card driven first.
- Created `checklist.md` as a feature-scope and implementation tracking checklist derived from the current planning docs.
- Updated `AGENTS.md` with planning-to-implementation workflow rules and `technical-debt.md` tracking expectations.
- Created `technical-debt.md` with current known blockers and deferred decisions for implementation readiness.
- Added `docs/project-brief.md` as the canonical full-vision and roadmap brief based on the human-provided project brief.
- Drafted `docs/implementation-plan.md` with the detailed P0 execution sequence, module boundaries, verification gates, and fallback rules.

### Files / Areas Affected
- `docs/mvp-demo-interaction-brief.md`
- `docs/technical-stack-brief.md`
- `checklist.md`
- `AGENTS.md`
- `technical-debt.md`
- `docs/project-brief.md`
- `docs/implementation-plan.md`
- `CHANGELOG.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only change.
- No code executed.

## 2026-04-29 - Initial Workspace Scaffold and Core A/C/D Logic

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)
- GPT-5.4 Mini worker subagents for bounded scaffold/core/docs tasks

### What AI Helped With
- Created the initial pnpm workspace scaffold for `apps/web`, `packages/shared`, `packages/core`, `packages/agent`, and `contracts`.
- Added shared domain enums, demo seeds, pure reconciliation functions, AuditEvent creation, and deterministic triage for State A/C/D.
- Added `docs/code-map.md` and `docs/database-structure-plan.md`.
- Reviewed and corrected the first implementation boundary by separating `ScenarioKey` from `CaseType`.
- Updated truthfulness, reused-libraries, changelog, and technical-debt docs after implementation.

### Files / Areas Affected
- `.env.example`
- `.gitignore`
- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `apps/web/package.json`
- `contracts/package.json`
- `packages/shared/*`
- `packages/core/*`
- `packages/agent/*`
- `docs/code-map.md`
- `docs/database-structure-plan.md`
- `docs/real-vs-simulated.md`
- `docs/reused-libraries.md`
- `technical-debt.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Direct TypeScript checks passed with global `tsc.cmd` for `packages/shared`, `packages/core`, and `packages/agent`.
- `pnpm.cmd install` timed out before producing `pnpm-lock.yaml`; dependency install remains a tracked risk in `technical-debt.md`.

### Status
- Planning / documentation.

## 2026-04-29 — Planning Docs Consistency + Guardrails

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Edited planning documents for consistency (Backend/OpenClaw/Database/0G Storage).
- Clarified boundaries: `AuditEvent.status` vs `OpenClaw.triageOutcome` vs `caseResolutionStatus`.
- Cleaned up naming and policy wording to avoid mutating reconciliation facts.
- Wrote a lean trigger-based `AGENTS.md`.

### Files / Areas Affected
- `AGENTS.md`
- `Backend-Final.md`
- `Database.md`
- `Arka - OpenClaw Agent.md`
- `0G Storage Brief.md`
- `CHANGELOG.md`
- `docs/*` (this directory)

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only change.
- No code executed.
