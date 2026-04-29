# ARKA Technical Stack Brief - Draft

This is a planning/spec brief only. It does not implement code, contracts, API routes, database schema, package installation, or deployment.

## 0. Documentation Basis

This brief follows the current ARKA planning docs:

```txt
Backend = creates AuditEvent
Database = stores operational evidence + proof metadata
OpenClaw = operates on AuditEvent as Layer-1 conversational triage
Dashboard = Layer-2 visual investigation
0G Storage = sealed proof packages
0G Chain = proof anchors
```

ARKA remains an AuditEvent generator with an OpenClaw triage layer and 0G proof layer. It is not ERP, warehouse management, full POS, full CCTV AI, HR punishment software, or a cashierless checkout clone.

Context7 MCP was retried and used for current documentation checks on Next.js, Drizzle ORM, and Hardhat. Official docs were used for 0G, Telegram, viem, Vercel, Vitest, Playwright, shadcn/ui, and OpenClaw.

## 1. Recommended Monorepo Structure

Recommended choice:

```txt
apps/web              Next.js app: dashboard, simulator UI, API route handlers
contracts             AuditProofRegistry.sol and deployment scripts
packages/core         pure audit/reconciliation/proof logic
packages/shared       shared types, enums, validation schemas
packages/agent        OpenClaw/LLM orchestration wrapper if needed
docs                  briefs, attribution, real-vs-simulated, reused libraries
hardware              optional P1 only
```

For MVP, `apps/api` should not exist separately unless Next.js route handlers become a real blocker. Keeping backend endpoints inside `apps/web` reduces deployment and coordination overhead.

Alternatives considered:

```txt
Standalone Node API
Hono
Fastify
NestJS
Turborepo-first monorepo
```

Why not now:

```txt
Standalone API adds deployment overhead.
Hono/Fastify are good, but not necessary before the core loop works.
NestJS is too heavy for a 1-week MVP.
Turborepo can be added later if workspace scripts become painful.
```

## 2. Frontend Stack

Recommended choice:

```txt
Next.js App Router
React
Tailwind CSS
shadcn/ui
simple tables and lightweight charts only if needed
```

Use this for:

```txt
Dashboard / Audit Arena
Order Simulator UI
Inventory Movement Simulator UI
Proof status view
Optional landing page
```

The MVP UI should be scenario-card driven first; do not build a fully free-form POS/inventory editor before State A/C/D work end-to-end.

Why:

```txt
Next.js gives UI and backend route handlers in one deployable app.
React is the default path for Next.js and shadcn/ui.
Tailwind keeps visual iteration fast.
shadcn/ui gives practical components without locking ARKA into a heavy design system.
```

Context7 confirmed that Next.js App Router route handlers support standard HTTP methods through `route.ts` / `route.js`, which fits lightweight MVP endpoints.

Alternatives considered:

```txt
Vite
custom component system
heavy dashboard/table framework
```

Why not now:

```txt
Vite would require a separate backend earlier.
Custom components slow down dashboard delivery.
Heavy dashboard frameworks add complexity before the demo flow is stable.
```

Needs verification:

```txt
Exact Next.js version after project scaffold.
Whether any selected shadcn/ui component has React version constraints.
```

## 3. Backend Stack

Recommended choice:

```txt
Next.js Route Handlers inside apps/web
```

Use route handlers for:

```txt
AuditEvent API
Order simulator API
Inventory movement simulator API
Usage Batch handling
Reconciliation trigger
ProofRecord handling
0G Storage upload trigger
0G Chain registration trigger
Telegram webhook endpoint
```

Why:

```txt
One app is faster to deploy and reason about.
The backend workload is request/response oriented for MVP.
OpenClaw, Dashboard, Telegram, and proof services can consume the same local model.
Do not make Telegram webhooks wait on slow 0G Storage upload or 0G Chain registration.
For MVP, proof work can be triggered separately, retried manually, or handled after the immediate Telegram response.
```

When to add `apps/api`:

```txt
Telegram polling needs a persistent process.
Proof retries need a separate worker.
Vercel route limits block the demo path.
The API becomes independently deployed from the dashboard.
```

Alternatives considered:

```txt
Standalone Node server
Hono
Fastify
NestJS
```

Recommendation: do not add them until there is a concrete deployment/runtime reason.

## 4. Database Stack

Recommended choice:

```txt
Postgres
Drizzle ORM
seed data for demo fixtures
```

Why:

```txt
ARKA data is relational enough for Postgres.
Drizzle is lightweight and TypeScript-first.
Hosted Postgres is safer than local SQLite for a deployed demo.
Seed data can drive demo scenarios without pretending to be a full POS/ERP.
```

Context7 confirmed Drizzle supports PostgreSQL, MySQL, and SQLite, and is positioned as lightweight and serverless-ready.

Alternatives considered:

```txt
SQLite
Prisma
local JSON only
```

Why not now:

```txt
SQLite is fast locally but risky for hosted persistence.
Prisma is mature but heavier for a small hackathon schema.
JSON-only is acceptable for fixtures, not for operational evidence and ProofRecord state.
```

Boundary:

```txt
Database = operational evidence layer, not ERP.
Start with P0 tables only.
Do not model ERP, warehouse management, full POS, complex auth, or complex permissions.
```

## 5. Core Logic Package

Recommended choice:

```txt
packages/core
```

This package should contain pure TypeScript logic for:

```txt
Usage Rule calculation
Usage Batch logic
Reconciliation Engine
AuditEvent generation
Status/severity calculation
Proof package builder
Canonical hash helper
```

Rule:

```txt
packages/core must not import UI, database, Telegram, OpenClaw runtime, 0G SDK, or chain tooling.
```

Why:

```txt
The core audit logic becomes testable without deployment.
The demo can recover if UI/proof integrations slip.
AuditEvent behavior stays deterministic.
```

## 6. 0G Storage Integration

Recommended choice:

```txt
0G TypeScript SDK through backend/proof layer
0G Storage CLI as fallback/dev tool
```

Official 0G Storage docs currently describe a TypeScript SDK package, file/root hash flow, indexer interaction, upload, download, and proof verification examples. Use official 0G docs as the source of truth before implementation.

ARKA flow:

```txt
Backend builds redacted proof package JSON.
Backend computes canonical local_package_hash.
Backend uploads package to 0G Storage.
0G Storage returns root hash / storage reference.
Backend updates ProofRecord with auditProofStatus = STORED_ON_0G.
ProofRecord becomes ready for 0G Chain registration.
```

Use for:

```txt
AuditEvent Proof Package upload
Final Resolution Package upload
local_package_hash creation
0g_root_hash storage
ProofRecord update
verification / retrieval if available
```

Boundary:

```txt
0G Storage = sealed proof package storage
not primary database
not raw CCTV upload
not KV for P0
```

Needs verification:

```txt
Exact 0G Storage SDK package version.
Upload response shape.
Whether upload returns storage tx hash consistently.
Current indexer endpoint.
Current faucet/funding requirement.
Whether JSON can be uploaded directly or should be written as a temp file first.
```

## 7. 0G Chain Integration

Recommended choice:

```txt
Solidity AuditProofRegistry.sol
Hardhat for compile/test/deploy
viem or ethers for backend transaction calls
```

Context7 confirmed Hardhat is used to write, test, compile, and deploy Solidity contracts. Official 0G docs describe 0G Chain as EVM-compatible and show Hardhat/Foundry/Remix-style deployment direction.

Before coding, choose the Hardhat version based on current 0G examples. For the first pass, avoid mixing viem and ethers; choose one transaction client and keep the integration consistent.

MVP contract responsibilities:

```txt
authorized registrar check
registerProof
ProofRegistered event
compact proof metadata only
duplicate guard if simple
public read access
```

Backend/proof layer responsibilities:

```txt
submit registration tx
store chain tx hash
update ProofRecord.chain_status
set auditProofStatus = REGISTERED_ON_CHAIN after successful registration
verify anchor later if needed
```

Boundary:

```txt
0G Chain = proof anchor registry
not audit database
not chat log
not legal contract
not HR/punishment system
```

Needs verification:

```txt
Current 0G testnet RPC URL and chain ID.
Current faucet/token availability.
Whether Hardhat 3 or Hardhat 2 is lower risk with 0G docs/examples.
Current ChainScan verification flow.
Whether viem or ethers integrates better with the selected Hardhat setup.
```

## 8. OpenClaw / Agent Layer

Recommended choice:

```txt
packages/agent as a thin ARKA-specific wrapper
```

MVP behavior:

```txt
OpenClaw starts from AuditEvent.
OpenClaw does not reconstruct raw truth from DB.
OpenClaw does not overwrite reconciliation facts.
OpenClaw writes triage/resolution state, notes, action logs, clarification requests, and recommendations.
```

Implementation posture:

```txt
Start with deterministic policy/scripted triage for the core demo.
Add LLM/OpenClaw runtime only behind the same interface.
Use the public OpenClaw framework only if setup is fast enough and properly attributed.
Deterministic triage must work even if OpenClaw runtime or LLM integration slips.
The MVP should not depend on the agent runtime being fully integrated.
Do not build multi-agent swarm for MVP.
```

Reason:

```txt
The product promise is AuditEvent triage, not agent framework complexity.
The interface matters more than the runtime in week one.
```

Needs verification:

```txt
OpenClaw runtime setup.
License/attribution expectations.
Whether Telegram integration from OpenClaw is useful or whether ARKA should own Telegram directly.
```

## 9. Telegram Flow

Recommended choice:

```txt
grammY
```

Why:

```txt
Official grammY docs support both long polling and webhooks.
Polling works for local development.
Webhook works for deployed demo if hosting supports it.
The API surface is small enough for MVP.
```

MVP flow:

```txt
owner alert
owner approval before staff message
staff reply
OpenClaw summary/recommendation
final owner decision
```

Alternatives considered:

```txt
Telegraf
direct Telegram Bot API
```

Why not now:

```txt
Telegraf is valid, but grammY is a clean TypeScript-first choice.
Direct Bot API avoids dependency but slows down conversation handling.
```

Real vs simulated:

```txt
Telegram delivery should be REAL if time allows.
OpenClaw reasoning can be PARTIAL or scripted if LLM/runtime setup is not stable.
Staff/owner accounts can be demo Telegram accounts.
```

## 10. Testing / Verification

Recommended minimum:

```txt
Vitest unit tests for UsageRule calculation
Vitest unit tests for UsageBatch
Vitest unit tests for Reconciliation Engine
Vitest unit tests for AuditEvent generation
Vitest unit tests for canonical proof package hash
Hardhat contract compile/test
API smoke test
manual dashboard flow
0G Storage upload verification
0G Chain registration verification
```

Hackathon priority:

```txt
1. Core logic unit tests
2. Contract compile/test
3. One happy-path manual demo
4. One real 0G Storage upload
5. One real 0G Chain registration
```

Playwright is optional if time remains. Do not let E2E polish block the P0 audit/proof loop.

## 11. Environment Variables

Expected categories:

```txt
DATABASE_URL
0G Chain RPC URL
0G Chain ID
0G private key for backend/proof registrar
0G Storage endpoint / indexer
0G Storage mode or SDK config if required
Telegram bot token
Telegram webhook secret or public webhook URL
LLM/OpenClaw provider key if used
AuditProofRegistry contract address
App base URL
```

Rules:

```txt
Create .env.example.
Never commit .env.
Never commit private keys, seed phrases, API keys, Telegram tokens, or 0G keys.
Do not invent final env var names until the actual libraries are selected.
```

## 12. Deployment / Hosting

Recommended choice:

```txt
Vercel for apps/web
Hosted Postgres through Neon or Supabase
0G testnet for AuditProofRegistry
Telegram webhook to a Next.js route handler
Polling as local fallback
```

Why:

```txt
One deployed web app keeps the demo manageable.
Hosted Postgres avoids local persistence problems.
Telegram webhook fits a deployed route handler if request timing is sufficient.
0G testnet provides visible proof-layer credibility.
```

Needs verification:

```txt
Whether Telegram webhook fits the selected Vercel route limits.
Whether proof uploads or chain registration need background retry behavior.
Whether a small worker is needed after P0.
```

## 13. What To Avoid

Avoid for MVP:

```txt
full ERP modules
complex auth
complex permissions
real payment
YOLO
0G Compute
iNFT
multi-agent swarm
Goldsky indexing
0G DA
staking/validator interfaces
raw CCTV upload
every chat message on-chain
access control/encryption claims unless implemented
```

## 14. Final Recommended Stack Summary

```txt
Frontend: Next.js App Router + React + Tailwind + shadcn/ui
Backend: Next.js Route Handlers inside apps/web
Database: Postgres
ORM / query layer: Drizzle ORM
Core logic: pure TypeScript in packages/core
Contracts: Solidity AuditProofRegistry
0G Storage: 0G TypeScript SDK, CLI fallback
0G Chain: Hardhat deploy/test, viem or ethers for backend calls
Telegram: grammY
OpenClaw / LLM: packages/agent wrapper, deterministic policy first, LLM/OpenClaw adapter later
Testing: Vitest + Hardhat tests + manual demo verification
Deployment: Vercel + hosted Postgres + 0G testnet + Telegram webhook
```

## 15. Open Questions

Must verify before coding:

```txt
Exact 0G Storage SDK package and methods.
Whether 0G Storage upload returns tx hash.
Current 0G Storage indexer endpoint.
Current 0G testnet RPC, chain ID, faucet, and token availability.
Hardhat 3 vs Hardhat 2 compatibility with current 0G examples.
OpenClaw runtime setup and attribution requirements.
Telegram webhook vs polling for selected deployment.
Whether separate API server or worker is necessary.
Whether viem or ethers is better for the selected contract tooling.
Choose package manager/workspace setup before scaffolding.
pnpm workspaces is the likely default, but confirm before implementation.
```

## 16. Sources Consulted

Context7 used for:

```txt
Next.js Route Handlers
Drizzle ORM PostgreSQL / serverless suitability
Hardhat Solidity compile/test/deploy role
```

Official docs used for:

```txt
Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
shadcn/ui Next.js install: https://ui.shadcn.com/docs/installation/next
Drizzle PostgreSQL: https://orm.drizzle.team/docs/get-started-postgresql
0G Storage SDK: https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk
0G Chain deployment: https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts
Hardhat docs: https://hardhat.org/docs
viem writeContract: https://viem.sh/docs/contract/writeContract
grammY deployment modes: https://grammy.dev/guide/deployment-types.html
Vitest guide: https://vitest.dev/guide/
Playwright intro: https://playwright.dev/docs/intro
Vercel Next.js hosting: https://vercel.com/docs/frameworks/full-stack/nextjs
OpenClaw repository: https://github.com/openclaw/openclaw
```

Assumptions:

```txt
The team can deploy a Next.js app during the hackathon.
Hosted Postgres is available.
0G testnet access is available.
The first demo values a reliable audit/proof loop more than infrastructure separation.
```

Recommended stack summary:

```txt
Next.js + Postgres + Drizzle + packages/core + Hardhat + 0G SDK + grammY.
```

Remaining open questions:

```txt
Mostly 0G SDK/runtime details, OpenClaw runtime setup, and deployment constraints.
```
