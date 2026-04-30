# Next Development Phase (DB-First Web2 MVP)

This document is an execution plan for the *next* ARKA development phase.

It intentionally prioritizes **Web2 MVP reliability** (scenario cards -> AuditEvent -> dashboard) before any Web3 (0G) or OpenClaw runtime integration.

## 0. Current Reality (2026-05-01)

- The dashboard is functional for State A/C/D and Admin Simulation, including deterministic triage fallback and local proof package hash display.
- Postgres persistence exists as an **optional** demo mode behind `ARKA_DEMO_REPOSITORY=postgres`.
- Postgres must not be described as REAL until migrations are applied to a real DB and the run history survives a server restart.
- 0G Storage, 0G Chain anchoring, Telegram, and full OpenClaw gateway/plugin runtime are still not implemented/verified for ARKA.

## 1. Phase 1 (P0): Make Postgres Persistence REAL for the Demo Loop

Goal: the A/C/D + Admin Simulation loop survives server restarts and is clearly labeled as Postgres-backed.

1. Provide a real `DATABASE_URL` (local or hosted Postgres).
2. Apply migrations: `pnpm.cmd --filter @arka/db run migrate`
3. Enable Postgres demo repository: set `ARKA_DEMO_REPOSITORY=postgres`
4. Restart `@arka/web` and verify in the dashboard:
   - Run State A, State C, State D, and one Admin Simulation run.
   - Restart the server again.
   - Confirm the history persists and the persistence status indicates Postgres is active.

Truthfulness rule:

- Only after this passes should `docs/real-vs-simulated.md` be updated to reflect REAL Postgres persistence for the demo loop.

## 2. Phase 2 (P0): Tighten Evidence Persistence Semantics

Goal: Postgres holds operational evidence and proof metadata in a way that matches the ARKA architecture boundaries.

Work items:

- Decide what is *source-of-truth persisted* vs *UI-derived*:
  - Persisted: `orders`, `inventory_movements`, `audit_events`, `proof_records` (plus append-only logs/notes later).
  - Derived: strings/copy/timelines that are purely dashboard presentation.
- Add minimal uniqueness / idempotency:
  - Avoid unbounded duplicate `inventory_movements` and `proof_records` writes during simulated agent actions.
  - Keep proof history append-only when it represents a new proof package, not every UI action.
- Add a DB read-path for the dashboard history:
  - Option A (fast): keep `dashboard_demo_runs` JSONB as the UI history source.
  - Option B (more honest): reconstruct dashboard history from `audit_events` + `proof_records` as the primary data.

## 3. Phase 3 (P1): Proof Execution (0G Storage + 0G Chain)

Goal: one real State C or D case uploads a proof package to 0G Storage and anchors a reference on-chain.

Rules:

- Do not claim 0G Storage upload works until a real upload is implemented and verified.
- Do not claim 0G Chain anchoring works until a real deploy/tx/anchor is implemented and verified.
- Proof failures must not delete or invalidate an AuditEvent.

## 4. Phase 4 (P1): OpenClaw Runtime + Telegram

Goal: replace dashboard-only simulated conversation with a verified OpenClaw-backed triage interaction path.

Rules:

- Do not claim real OpenClaw-backed ARKA triage until the gateway/plugin/client path is verified end-to-end.
- Do not claim Telegram works until a real bot/channel flow is verified.

## 5. Definition of Done for This Phase

This phase is done when:

- Postgres migrations are applied to a real DB.
- Dashboard runs persist across a server restart with `ARKA_DEMO_REPOSITORY=postgres`.
- Docs remain honest: no “REAL” labels without verification.

