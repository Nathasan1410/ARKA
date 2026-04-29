# ARKA Checklist (Planning -> Implementation Tracker)

Last updated: 2026-04-29

This file is a tracking checklist. It reflects what is currently described in repo docs and what is not implemented yet.

Current truthfulness status: planning-only. As of 2026-04-29, all features are still `PLANNED` in `docs/real-vs-simulated.md`.

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

Implementation status values used in this checklist:

```txt
NOT_IMPLEMENTED (docs-only so far)
PARTIAL (some implementation exists, but not enough to claim the full feature works)
```

## P0 Checklist (MVP)

Required scenario cards for P0: State A (CLEAR), State C (REQUEST_EXPLANATION), State D (ESCALATE). State B/E are optional and must not block MVP.

| # | Feature | Planning readiness | MVP interface coverage | Implementation status | Next needed (honest) | Evidence in repo docs |
|---:|---|---|---|---|---|---|
| 1 | Order Simulator | READY | P0 (Order panel + scenario-driven) | NOT_IMPLEMENTED | Define minimal Order shape + seed actors/products, and scenario-card generated order payloads (A/C/D). | `docs/mvp-demo-interaction-brief.md` (Order Simulator Panel, scenario flows), `Backend-Final.md` (Order-first lifecycle), `Database.md` (Order object). |
| 2 | Usage Rule / Recipe | READY | P0 (expected usage shown) | NOT_IMPLEMENTED | Define the canonical rule `Protein Shake = 30g Whey` in shared types + core calculation used by reconciliation. | `docs/mvp-demo-interaction-brief.md`, `ARKA Demo Scenario Brief — Draft.md`, `Backend-Final.md`, `Database.md` (UsageRule). |
| 3 | Inventory Movement Simulator | READY | P0 (Movement panel + scenario-driven) | NOT_IMPLEMENTED | Define Movement event payloads for A/C/D (90g, 99g, 160g OUT) and evidence window fields. | `docs/mvp-demo-interaction-brief.md` (Movement Simulator Panel), `ARKA Demo Scenario Brief — Draft.md`, `Backend-Final.md`, `Database.md` (InventoryMovement). |
| 4 | Usage Batch | NEEDS_DETAIL | P0 (backend-only), no UI required | NOT_IMPLEMENTED | Decide minimal data shape + when it is used; keep UI out of P0 unless it becomes necessary to prevent false alerts. | `Backend-Final.md` (Movement-first lifecycle), `Database.md` (UsageBatch). |
| 5 | Reconciliation Engine | READY | P0 (`Run Reconciliation`) | NOT_IMPLEMENTED | Implement expected vs actual comparison, variance, status, severity in core logic first (scenario-driven). | `docs/mvp-demo-interaction-brief.md` (Reconciliation Trigger), `Backend-Final.md`. |
| 6 | AuditEvent Generator | READY | P0 (list + detail) | NOT_IMPLEMENTED | Define `AuditEvent` shape + canonical enums; generate from reconciliation output; ensure append-only downstream actions do not rewrite facts. | `docs/mvp-demo-interaction-brief.md` (List/Detail + canonical enums), `Backend-Final.md`, `Database.md`. |
| 7 | OpenClaw Triage Layer | READY | P0 (OpenClaw panel + triageOutcome) | NOT_IMPLEMENTED | Implement deterministic policy first (no LLM dependency); enforce "OpenClaw does not mutate reconciliation facts". | `Arka - OpenClaw Agent.md`, `Database.md` (OpenClaw writes), `docs/mvp-demo-interaction-brief.md`. |
| 8 | Telegram Conversation Flow | NEEDS_DETAIL | P0 (real or simulated; staff reply optional) | NOT_IMPLEMENTED | Decide P0 delivery mode: dashboard-simulated owner flow vs real owner alert; keep staff reply + final resolution as better-if-time. | `docs/mvp-demo-interaction-brief.md` (Telegram rules + OpenClaw panel), `docs/technical-stack-brief.md` (Telegram notes). |
| 9 | Dashboard / Audit Arena | READY | P0 (single-page panels) | NOT_IMPLEMENTED | Implement the scenario runner + panels: Order, Movement, AuditEvent list/detail, OpenClaw panel, Proof panel. | `docs/mvp-demo-interaction-brief.md` (MVP Screens), `docs/technical-stack-brief.md` (Frontend stack). |
| 10 | 0G Storage Proof Package | NEEDS_DETAIL | P0 (Proof panel statuses) | NOT_IMPLEMENTED | Confirm 0G Storage SDK package/methods/endpoints; implement AuditEvent Proof Package builder + upload; show failure/retry states without deleting AuditEvent. | `0G Storage Brief.md`, `docs/mvp-demo-interaction-brief.md` (Proof Panel), `docs/technical-stack-brief.md` (open questions). |
| 11 | 0G Chain Proof Registry | NEEDS_DETAIL | P0 (Proof panel statuses) | NOT_IMPLEMENTED | Confirm 0G testnet RPC/chain ID/faucet; implement `AuditProofRegistry` + anchor registration; track `ANCHOR_CONFIRMED` vs failure states. | `docs/0g-chain-brief.md`, `docs/mvp-demo-interaction-brief.md`, `docs/technical-stack-brief.md` (open questions). |
| 12 | Demo Video + README | NEEDS_DETAIL | P0 (demo packaging) | NOT_IMPLEMENTED | Draft only after at least one A/C/D path works end-to-end; keep "real vs simulated" claims honest. | `AGENTS.md` (honesty rules), `docs/real-vs-simulated.md`, `docs/mvp-demo-interaction-brief.md` (DoD). |

### Current Implementation Status Notes

The P0 table above still tracks the full user-facing feature status. As of the first scaffold pass:

```txt
Usage Rule / Recipe: PARTIAL (shared seed + core calculation only)
Inventory Movement Simulator: PARTIAL (scenario payload values only, no simulator UI/API)
Reconciliation Engine: PARTIAL (pure core A/C/D only)
AuditEvent Generator: PARTIAL (pure core A/C/D AuditEvent creation only)
OpenClaw Triage Layer: PARTIAL (deterministic adapter only)
```

These are not complete P0 features until they are wired into API/UI, persisted or displayed where required, and verified through the dashboard demo flow.

## P1 Checklist (Demo Polish + Expansion)

| # | Feature | Planning readiness | MVP interface coverage | Implementation status | Notes / next needed | Evidence in repo docs |
|---:|---|---|---|---|---|---|
| 13 | Real hardware input | EARLY | Optional | NOT_IMPLEMENTED | Optional credibility layer; keep behind the simulator and do not block P0. | `AGENTS.md` (optional), `docs/real-vs-simulated.md` (planned optional). |
| 14 | CCTV evidence window / clip reference | NEEDS_DETAIL | Evidence window is P0; clip reference is P1 | NOT_IMPLEMENTED | MVP should stay metadata-only (timestamps/clip reference), no raw upload to 0G. | `Backend-Final.md` (evidence window), `0G Storage Brief.md` (no raw CCTV), `Database.md` (access/privacy). |
| 15 | Landing page | EARLY | P1 | NOT_IMPLEMENTED | Only after the dashboard works; keep scope small (positioning + architecture + demo instructions). | `docs/mvp-demo-interaction-brief.md` (optional route), `docs/technical-stack-brief.md` (optional landing page). |
| 16 | Pattern summary (lite) | NEEDS_DETAIL | P1 (dashboard expansion) | NOT_IMPLEMENTED | Simple queries/counts over recent AuditEvents; do not build a full Pattern Analyzer for P1. | `Backend-Final.md` (later priorities), `docs/mvp-demo-interaction-brief.md` (expansion path). |

## P2 Checklist (Future / Out of Scope for MVP)

| # | Feature | Planning readiness | MVP interface coverage | Implementation status | Notes | Evidence in repo docs |
|---:|---|---|---|---|---|---|
| 17 | YOLO / vision summary | LATER | None | NOT_IMPLEMENTED | Keep as FUTURE/PLACEHOLDER. | `AGENTS.md` (do not claim), `docs/real-vs-simulated.md`. |
| 18 | 0G Compute | LATER | None | NOT_IMPLEMENTED | Keep as FUTURE/PLACEHOLDER. | `AGENTS.md` (do not claim), `docs/real-vs-simulated.md`, `docs/technical-stack-brief.md` (avoid for MVP). |
| 19 | iNFT | LATER | None | NOT_IMPLEMENTED | Not needed for hackathon MVP. | `docs/technical-stack-brief.md` (avoid for MVP). |
| 20 | Multi-agent swarm | LATER | None | NOT_IMPLEMENTED | Explicitly out of MVP scope. | `AGENTS.md` + `docs/technical-stack-brief.md` (avoid for MVP). |
| 21 | CCTV auto-clip system | LATER | None | NOT_IMPLEMENTED | Future only; MVP remains metadata-only. | `Backend-Final.md` (metadata-only), `0G Storage Brief.md` (no raw CCTV). |

## Related Concepts (Planned in Briefs, Not Required in P0 UI)

These exist in the backend/database/OpenClaw/proof model but are not required as fully surfaced P0 UI features:

```txt
CaseNote / ActionLog timeline (P0 hooks, richer UI later)
StaffClarificationRequest lifecycle (staff reply optional in P0)
Timeout/reminder/warning flows (later)
Owner final resolution workflow + Final Resolution Package (better-if-time)
Correction / append-only correction UI (later)
Daily report / summary (later)
OwnerPolicy settings UI (later; defaults hardcoded in MVP)
Role-based judge Telegram mode (P1 polish; not specified in repo docs yet)
Proof verification action (better-if-time)
```

## Non-Goals (Do Not Build for MVP)

Do not expand ARKA into:

```txt
ERP / warehouse management / full POS production system
cashierless checkout clone
full CCTV AI system
HR punishment system
YOLO / 0G Compute / iNFT / multi-agent swarm for P0
```

## External Dependencies / Open Questions (Blockers Before Coding)

These are not "implemented tasks"; they are verification items that unblock implementation:

```txt
Confirm 0G Storage SDK package + upload method + response shape
Confirm 0G testnet RPC + chain ID + faucet + explorer link format
Choose Hardhat version based on current 0G examples
Decide viem vs ethers (pick one for MVP)
Confirm OpenClaw runtime posture (deterministic-first regardless)
Confirm Telegram webhook vs polling for deployment target
Confirm package manager/workspace setup before scaffolding (pnpm likely, but confirm)
```

## Implementation Setup (Prereqs, From Current Planning Docs)

These are not "features", but they are necessary to start implementing P0 cleanly:

```txt
Choose package manager/workspace (pnpm likely, but confirm) and scaffold monorepo structure
Create apps/web (Next.js App Router) and wire basic route handlers skeleton
Set up Postgres connection + Drizzle baseline
Add seed fixtures for the protein-bar demo world (actors/items/usage rule)
Set up 0G Storage SDK integration surface (blocked on SDK verification)
Set up contracts/ (Hardhat + AuditProofRegistry) (blocked on RPC/chain ID/faucet verification)
Create .env.example categories (never commit secrets)
Define a minimal manual demo verification checklist (A/C/D demo spine)
```
