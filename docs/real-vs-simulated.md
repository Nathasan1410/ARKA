# Real vs Simulated

This file tracks which ARKA features are real, simulated, mocked, partial, or planned.

## Current Status (2026-04-30)

```txt
AuditEvent generation: PARTIAL (local Next.js demo API route creates A/C/D AuditEvents through packages/core and displays them in dashboard; no real Postgres persistence yet)
Local proof package creation: PARTIAL (local demo API route creates deterministic AuditEvent proof package JSON + canonical SHA-256 hash through packages/core and returns a local proof-record-shaped response; no real ProofRecord DB persistence or 0G upload wiring yet)
Order simulator: PARTIAL (fixture-driven order data is created by local demo API route; no real DB persistence)
Inventory movement simulator: PARTIAL (fixture-driven movement data is created by local demo API route; no real DB persistence)
Usage batch logic: PLANNED
Reconciliation Engine: PARTIAL (pure core A/C/D used by local demo API route and dashboard; no DB-backed workflow yet)
OpenClaw triage: PARTIAL (OpenClaw public source is copied as a repo-local fork under openclaw/; local install, earlier strict-smoke build, direct CLI help/version/gateway-help, local dev gateway connectivity, ARKA workspace/skill loading, MiniMax model discovery, and a static-smoked plus extension-tested read-only `arka-audit` plugin skeleton are verified; model-backed ARKA triage response, OpenClaw gateway plugin discovery/load, packages/agent gateway calls, and OpenClaw Telegram are not verified; ARKA app runtime is still packages/agent boundary plus deterministic fallback only)
Dashboard UI: PARTIAL (Next.js `/dashboard` shell consumes local demo API route results for A/C/D, Order + Movement + AuditEvent detail, deterministic triage panel, local proof record/hash display, in-memory demo repository label, and honest 0G/Telegram/OpenClaw runtime placeholders)
0G Storage upload: PLANNED
0G Chain registry: PLANNED
Hardware input: PLANNED (optional)
CCTV clip: PLANNED (metadata only for MVP)
YOLO: FUTURE / PLACEHOLDER
0G Compute: FUTURE / PLACEHOLDER
```
