# Real vs Simulated

This file tracks which ARKA features are real, simulated, mocked, partial, or planned.

## Current Status (2026-04-30)

```txt
AuditEvent generation: PARTIAL (pure core A/C/D only; no DB/API/UI yet)
Local proof package creation: PARTIAL (deterministic AuditEvent proof package JSON + canonical SHA-256 hash exist in packages/core only; no dashboard/proof-record/upload wiring yet)
Order simulator: PARTIAL (fixture-driven order panel in local dashboard shell; no DB/API persistence)
Inventory movement simulator: PARTIAL (fixture-driven movement panel in local dashboard shell; no DB/API persistence)
Usage batch logic: PLANNED
Reconciliation Engine: PARTIAL (pure core A/C/D only; no DB/API/UI yet)
OpenClaw triage: PARTIAL (OpenClaw public source is copied as a repo-local fork under openclaw/; local install, earlier strict-smoke build, direct CLI help/version/gateway-help, local dev gateway connectivity, ARKA workspace/skill loading, MiniMax model discovery, and a static-smoked plus extension-tested read-only `arka-audit` plugin skeleton are verified; model-backed ARKA triage response, OpenClaw gateway plugin discovery/load, packages/agent gateway calls, and OpenClaw Telegram are not verified; ARKA app runtime is still packages/agent boundary plus deterministic fallback only)
Dashboard UI: PARTIAL (Next.js `/dashboard` shell with local A/C/D fixtures, AuditEvent detail, deterministic triage panel, and honest proof placeholders)
0G Storage upload: PLANNED
0G Chain registry: PLANNED
Hardware input: PLANNED (optional)
CCTV clip: PLANNED (metadata only for MVP)
YOLO: FUTURE / PLACEHOLDER
0G Compute: FUTURE / PLACEHOLDER
```
