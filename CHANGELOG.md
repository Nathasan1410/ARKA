# Changelog

All meaningful ARKA changes should be recorded here in human-readable language.

## 2026-04-29

### Added
- Added `docs/technical-stack-brief.md` with the recommended MVP stack for ARKA.
- Documented the intended monorepo shape, frontend/backend/database choices, proof-layer tooling, Telegram flow, testing plan, deployment approach, and open verification questions.
- Added `docs/mvp-demo-interaction-brief.md` as the canonical MVP demo interaction spec (scenario-card driven dashboard flow).
- Clarified proof status separation (audit proof lifecycle vs storage ops vs chain ops), proof sequencing (proof package creation must not depend on OpenClaw), and canonical enum names for MVP planning.
- Added `checklist.md` as a feature-scope tracker across P0/P1/P2 (docs-only, implementation not started).
- Updated `AGENTS.md` with planning-to-implementation workflow rules and required `technical-debt.md` tracking for skipped work, blockers, and human-needed actions.
- Added `technical-debt.md` with current open implementation blockers for 0G Storage, 0G Chain, Telegram, and OpenClaw runtime verification.
- Added `docs/project-brief.md` as the canonical full-vision and roadmap brief for ARKA.
- Added `docs/implementation-plan.md` with the detailed P0 execution order, module targets, verification gates, and integration fallback rules.
- Added the first workspace scaffold (`apps/web`, `packages/shared`, `packages/core`, `packages/agent`, `contracts`) and pure TypeScript A/C/D domain logic.
- Added `docs/code-map.md` and `docs/database-structure-plan.md` to document implementation ownership and the planned P0 database boundary.
- Updated `docs/real-vs-simulated.md`, `docs/reused-libraries.md`, and `technical-debt.md` to reflect partial core implementation and incomplete dependency installation.

### Why
- Establishes a practical 1-week hackathon implementation direction before coding begins.
- Keeps the stack aligned with the AuditEvent-first architecture and the 0G Storage / 0G Chain split.

### Verification
- Documentation and scaffold changes.
- Retried Context7 MCP for Next.js, Drizzle ORM, and Hardhat documentation earlier in planning.
- Ran direct TypeScript checks with global `tsc.cmd` for `packages/shared`, `packages/core`, and `packages/agent`.
- `pnpm.cmd install` timed out before producing `pnpm-lock.yaml`; recorded in `technical-debt.md`.

### Added - Initial Planning Docs
- Added initial ARKA planning documents for Backend, Database, OpenClaw, and 0G Storage.
- Added `AGENTS.md` with trigger-based documentation and compliance guardrails.
- Added starter docs: `docs/ai-attribution.md`, `docs/real-vs-simulated.md`, `docs/reused-libraries.md`.

### Why
- Establishes the project boundary, MVP logic, and proof model before implementation.

### Verification
- Documentation-only change.
- No code executed.
