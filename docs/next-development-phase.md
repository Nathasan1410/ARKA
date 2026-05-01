# Next Development Phase (DB-First Web2 MVP)

This document is an execution plan for the *next* ARKA development phase.

It intentionally prioritizes **Web2 MVP reliability** (scenario cards -> AuditEvent -> dashboard) before any Web3 (0G) or OpenClaw runtime integration.

## 0. Current Reality (2026-05-01)

- The dashboard is functional for State A/C/D and Admin Simulation, including deterministic triage fallback and local proof package hash display.
- Postgres persistence exists as an **optional** demo mode behind `ARKA_DEMO_REPOSITORY=postgres`.
- Postgres must not be described as REAL until migrations are applied to a real DB and the run history survives a server restart.
- 0G Storage, 0G Chain anchoring, Telegram, and full OpenClaw gateway/plugin runtime are still not implemented/verified for ARKA.

## 1. Phase 1 (P0): Make Postgres Persistence REAL for the Demo Loop (Supabase REST API)

Goal: the A/C/D + Admin Simulation loop survives server restarts and is clearly labeled as Postgres-backed.

1.  **Configure Environment:** The `DATABASE_URL` and Supabase keys are populated in `.env`.
2.  **Supabase Initialization:** The `dashboard_demo_runs` table was created manually via the Supabase SQL editor using `supabase-init.sql`.
3.  **Refactor `demo-run-service.ts`:** The `postgresDemoRunRepository` was rewritten to interact with the Supabase REST API (`@supabase/supabase-js`) via `dashboard-demo-run-store.ts`. (COMPLETED)
4.  **Verify:** The UI correctly persists case history across node server restarts. (COMPLETED)

Truthfulness rule:
- `docs/real-vs-simulated.md` can now be updated to reflect REAL persistence for the demo loop via Supabase.

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
- **0G Chain Anchoring:** The `AuditProofRegistry.sol` contract is already deployed to the 0G Galileo Testnet at `0xEA4a472F0123fC9889650be807A1FF5EF780029F`. (COMPLETED). The backend `viem` call remains to be implemented.
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

