# Real vs Simulated

This file tracks which ARKA features are real, simulated, mocked, partial, or planned.

## Current Status (2026-05-01)

```txt
AuditEvent generation: PARTIAL (local Next.js demo API routes create A/C/D fixture AuditEvents and admin-entered movement simulation AuditEvents through packages/core and display them in dashboard. Optional Postgres demo persistence is verified when enabled, but the demo loop is still fixture-driven and not a full DB-backed workflow.)
Local proof package creation: PARTIAL (local demo API route creates deterministic AuditEvent proof package JSON + canonical SHA-256 hash through packages/core and returns a local proof-record-shaped response. Optional Postgres demo mode best-effort persists proof metadata, but proof package artifacts are not persisted as a canonical byte-for-byte payload, and 0G upload/anchor are still planned.)
Order simulator: PARTIAL (fixture-driven order data and dashboard-entered admin order quantity are handled by local demo API routes. Optional Postgres demo mode best-effort persists order rows, but the UI is still scenario-driven.)
Inventory movement simulator: PARTIAL (fixture-driven movement data and dashboard-entered movement grams are handled by local demo API routes. Optional Postgres demo mode best-effort persists movement rows, but the UI is still scenario-driven.)
Usage batch logic: PLANNED
Reconciliation Engine: PARTIAL (pure core A/C/D used by local demo API route and dashboard; DB persistence exists as an optional demo mode, but reconciliation does not yet read from DB as its workflow source of truth.)
OpenClaw triage: PARTIAL (repo-local OpenClaw fork under `openclaw/`; Codespaces path is `/workspaces/ARKA`. Verified: local install, strict-smoke build with `OPENCLAW_A2UI_SKIP_MISSING=1`, direct CLI help/version, dev gateway connectivity, ARKA workspace/skill loading, MiniMax model discovery, one model-backed `infer model run --local` ARKA State C response, read-only `arka-audit` extension tests, and gateway discovery/load of `arka-audit` when enabled in an isolated profile. Unverified/blocked: a full OpenClaw `agent --agent main --message ...` session turn returning a final assistant response via the gateway (current runs time out waiting for a final response even when provider auth works for `infer`), any ARKA `packages/agent` gateway client seam, and any Telegram integration.)
Dashboard UI: PARTIAL (Next.js `/dashboard` shell consumes local demo API route results for A/C/D and admin movement simulation, Order + Movement + AuditEvent detail, deterministic triage panel, dashboard-only simulated owner/staff/final-decision interaction, and local proof record/hash display. Demo history defaults to in-memory; optional Postgres demo persistence is available and verified when enabled.)
0G Storage upload: PLANNED
0G Chain registry: PLANNED
Hardware input: PLANNED (optional)
CCTV clip: PLANNED (metadata only for MVP)
YOLO: FUTURE / PLACEHOLDER
0G Compute: FUTURE / PLACEHOLDER
```
