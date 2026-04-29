# Real vs Simulated

This file tracks which ARKA features are real, simulated, mocked, partial, or planned.

## Current Status (2026-04-29)

```txt
AuditEvent generation: PARTIAL (pure core A/C/D only; no DB/API/UI yet)
Local proof package creation: PARTIAL (deterministic AuditEvent proof package JSON + canonical SHA-256 hash exist in packages/core only; no dashboard/proof-record/upload wiring yet)
Order simulator: PARTIAL (fixture-driven order panel in local dashboard shell; no DB/API persistence)
Inventory movement simulator: PARTIAL (fixture-driven movement panel in local dashboard shell; no DB/API persistence)
Usage batch logic: PLANNED
Reconciliation Engine: PARTIAL (pure core A/C/D only; no DB/API/UI yet)
OpenClaw triage: PARTIAL (OpenClaw researched and cloned outside repo; ARKA runtime is still packages/agent boundary plus deterministic fallback only; no OpenClaw gateway/plugin/skill integration verified yet)
Dashboard UI: PARTIAL (Next.js `/dashboard` shell with local A/C/D fixtures, AuditEvent detail, deterministic triage panel, and honest proof placeholders)
0G Storage upload: PLANNED
0G Chain registry: PLANNED
Hardware input: PLANNED (optional)
CCTV clip: PLANNED (metadata only for MVP)
YOLO: FUTURE / PLACEHOLDER
0G Compute: FUTURE / PLACEHOLDER
```
