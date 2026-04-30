# ARKA Checklist (Planning -> Implementation Tracker)

Last updated: 2026-05-01

This file tracks the current implementation status. `docs/real-vs-simulated.md` remains the source of truth for feature-claim wording.

Core architecture to preserve:

```txt
Backend = creates AuditEvent
Database = stores operational evidence + proof metadata
OpenClaw = operates on AuditEvent as Layer-1 conversational triage
Dashboard = Layer-2 visual investigation
0G Storage = sealed proof packages
0G Chain = proof anchors
```

## Legend

Planning readiness:

```txt
READY        Planned enough / ready for implementation planning
NEEDS_DETAIL Discussed, but needs implementation details or external verification
EARLY        Mentioned, but not planned enough yet
LATER        Intentionally later / future
```

Implementation status values:

```txt
NOT_IMPLEMENTED (docs-only so far)
PARTIAL (some implementation exists, but not enough to claim the full feature works)
```

## P0 Checklist

Required scenario cards for P0: State A (CLEAR), State C (REQUEST_EXPLANATION), State D (ESCALATE). State B/E are optional and must not block MVP.

| # | Feature | Planning readiness | MVP interface coverage | Implementation status | Next needed (honest) | Evidence |
|---:|---|---|---|---|---|---|
| 1 | Order Simulator | READY | P0 order panel + scenario cards | PARTIAL | Local demo API routes create fixture-driven order data and admin-entered order quantity for dashboard; no real DB persistence yet. | `docs/mvp-demo-interaction-brief.md`, `Backend-Final.md`, `Database.md` |
| 2 | Usage Rule / Recipe | READY | P0 expected usage shown | PARTIAL | Canonical Protein Shake = 30g Whey exists in shared/core and dashboard shell; no DB/API persistence yet. | `docs/mvp-demo-interaction-brief.md`, `ARKA Demo Scenario Brief — Draft.md`, `Backend-Final.md`, `Database.md` |
| 3 | Inventory Movement Simulator | READY | P0 movement panel + scenario cards | PARTIAL | Local demo API routes create fixture-driven movement data and admin-entered movement grams with before/after quantities; no real DB persistence yet. | `docs/mvp-demo-interaction-brief.md`, `ARKA Demo Scenario Brief — Draft.md`, `Backend-Final.md`, `Database.md` |
| 4 | Usage Batch | NEEDS_DETAIL | P0 backend-only if needed | NOT_IMPLEMENTED | Keep UI out of P0 unless required to prevent false alerts. | `Backend-Final.md`, `Database.md` |
| 5 | Reconciliation Engine | READY | P0 Run Reconciliation | PARTIAL | Pure A/C/D core reconciliation is verified and consumed by the local demo API route; no DB-backed workflow yet. | `docs/mvp-demo-interaction-brief.md`, `Backend-Final.md` |
| 6 | AuditEvent Generator | READY | P0 list + detail | PARTIAL | Local demo API route creates A/C/D AuditEvents and dashboard consumes returned results; no real DB persistence yet. | `docs/mvp-demo-interaction-brief.md`, `Backend-Final.md`, `Database.md` |
| 7 | OpenClaw Triage Layer | NEEDS_DETAIL | P0 OpenClaw panel + triageOutcome | PARTIAL | Deterministic fallback and dashboard-only simulated agent interaction are verified; local OpenClaw source/install/strict-smoke/gateway/skill/MiniMax discovery and one local model-backed ARKA State C inference response are verified; full OpenClaw agent session, plugin gateway load, packages/agent gateway calls, and OpenClaw Telegram are not verified. | `Arka - OpenClaw Agent.md`, `docs/openclaw-local-fork-plan.md`, `docs/openclaw-impact-assessment.md` |
| 8 | Telegram Conversation Flow | NEEDS_DETAIL | P0 real or simulated; staff reply optional | PARTIAL | Dashboard simulation covers owner approval, simulated staff send/reply, and final decision. Real Telegram bot/channel flow is not implemented or verified. Do not store tokens in repo. | `docs/mvp-demo-interaction-brief.md`, `docs/technical-stack-brief.md` |
| 9 | Dashboard / Audit Arena | READY | P0 single-page panels | PARTIAL | Local `/dashboard` case console now keeps scenario runner, admin movement simulation, case summary, AuditEvent loop, simulated triage, and proof status connected; manual browser verification remains needed. | `docs/mvp-demo-interaction-brief.md`, `docs/technical-stack-brief.md` |
| 10 | 0G Storage Proof Package | NEEDS_DETAIL | P0 proof panel statuses | PARTIAL | Local demo API route returns proof-record-shaped metadata and local package hash; real 0G Storage upload is not implemented or verified. | `0G Storage Brief.md`, `docs/mvp-demo-interaction-brief.md`, `docs/technical-stack-brief.md` |
| 11 | 0G Chain Proof Registry | NEEDS_DETAIL | P0 proof panel statuses | NOT_IMPLEMENTED | Confirm 0G testnet RPC/chain ID/faucet; implement and verify real AuditProofRegistry deploy/call before claiming chain anchoring. | `docs/0g-chain-brief.md`, `ARKA 0G Chain Brief — Concept Draft.md` |
| 12 | Demo Video + README | NEEDS_DETAIL | P0 demo packaging | NOT_IMPLEMENTED | Draft after at least one A/C/D path works end-to-end; keep real-vs-simulated claims honest. | `AGENTS.md`, `docs/real-vs-simulated.md`, `docs/mvp-demo-interaction-brief.md` |

## Current Implementation Notes

```txt
Usage Rule / Recipe: PARTIAL (shared seed + core calculation + dashboard display)
Inventory Movement Simulator: PARTIAL (scenario payload values + admin-entered movement grams + dashboard display)
Reconciliation Engine: PARTIAL (pure core A/C/D only)
AuditEvent Generator: PARTIAL (pure core A/C/D AuditEvent creation only)
OpenClaw Triage Layer: PARTIAL (fallback verified; dashboard-only simulated interaction verified; local OpenClaw setup and one model-backed inference response verified; full agent session and app integration not verified)
Dashboard UI: PARTIAL (task-focused case console builds; admin movement simulation is wired to a local API route; scenario cards preview outcome/triage/proof; history shows severity/proof; demo-service coverage passes; manual browser verification remains open)
Local proof package creation: PARTIAL (core package builder/hash verified and exposed through local demo API route; no 0G upload)
```

These are not complete P0 features until they are wired into API/UI, persisted or displayed where required, and verified through the dashboard demo flow.

## P1 Checklist

| # | Feature | Planning readiness | Implementation status | Notes |
|---:|---|---|---|---|
| 13 | Real hardware input | EARLY | NOT_IMPLEMENTED | Optional credibility layer; keep behind simulator and do not block P0. |
| 14 | CCTV evidence window / clip reference | NEEDS_DETAIL | NOT_IMPLEMENTED | MVP remains metadata-only; no raw CCTV upload to 0G. |
| 15 | Landing page | EARLY | NOT_IMPLEMENTED | Only after dashboard works. |
| 16 | Pattern summary lite | NEEDS_DETAIL | NOT_IMPLEMENTED | Simple counts only; not a full pattern analyzer. |
| 17 | OpenClaw Telegram channel | NEEDS_DETAIL | NOT_IMPLEMENTED | P1 unless P0 proof/demo path is already stable. |
| 18 | ARKA OpenClaw plugin tools | NEEDS_DETAIL | NOT_IMPLEMENTED | Start read-only with `get_audit_event`, then append-only tools. |

## P2 / Out Of Scope

| # | Feature | Status | Notes |
|---:|---|---|---|
| 19 | YOLO / vision summary | FUTURE / PLACEHOLDER | Do not claim implemented. |
| 20 | 0G Compute | FUTURE / PLACEHOLDER | Do not claim implemented. |
| 21 | iNFT | FUTURE / PLACEHOLDER | Not needed for MVP. |
| 22 | Multi-agent swarm | FUTURE / PLACEHOLDER | Explicitly out of MVP scope. |
| 23 | Full CCTV auto-clip system | FUTURE / PLACEHOLDER | Metadata-only for MVP. |
