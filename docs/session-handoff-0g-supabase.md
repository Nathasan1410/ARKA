# Session Handoff: UI Redesign, Supabase Pivot, & 0G Chain Deployment
**Date:** 2026-05-01
**Target Audience:** The next AI Agent / Developer taking over the ARKA project.

## 1. What Was Accomplished in This Session

This session focused on transforming the ARKA mock frontend into a functional Web2 MVP and laying the Web3 groundwork.

### A. Dashboard UI Redesign & Brand Guidelines
- **Action:** Transitioned the `apps/web` dashboard from a dark theme to a clean, modern **Light Theme** (Operator Console).
- **Why:** To make the application look like a serious B2B SaaS tool rather than a Web3 hackathon gimmick.
- **Key Changes:** 
  - Rewrote `apps/web/app/globals.css`.
  - Refactored `DashboardShell` to include a dropdown for Scenario selection, a scrollable Case History, and a persistent "Proof Snapshot".
  - Replaced accusatory terms (e.g., "Theft") with audit-safe language (e.g., "Critical Review").
- **Documentation:** Created `docs/ui-guidelines.md` and `docs/brand-guidelines.md`.

### B. Database Pivot: Supabase REST API
- **Action:** We abandoned direct PostgreSQL connections via Drizzle (`pg`) due to IPv4/IPv6 pooler resolution errors on Supabase.
- **Solution:** We pivoted to using the official **Supabase JS client (`@supabase/supabase-js`)** over HTTPS (REST API).
- **Implementation:**
  - Added Next.js SSR middleware in `apps/web/utils/supabase/`.
  - Rewrote `packages/db/src/dashboard-demo-run-store.ts` to use `.from('dashboard_demo_runs').upsert()`.
  - Provided `supabase-init.sql` for the user to manually create the table in the Supabase SQL editor.
- **Status:** The backend demo loop (State A/C/D) now successfully survives server restarts by saving to the live Supabase project.

### C. 0G Chain Smart Contract Deployment
- **Action:** Drafted, tested, and deployed the `AuditProofRegistry.sol` contract.
- **Optimizations:** Replaced all `require()` statements with **Custom Errors** (e.g., `revert UnauthorizedAdmin()`) to drastically reduce gas costs, which is a best practice for modern EVMs like 0G Chain.
- **Deployment:** Successfully deployed to the **0G Galileo Testnet** using Hardhat (`cancun` EVM target).
- **Contract Address:** `0xEA4a472F0123fC9889650be807A1FF5EF780029F` (Stored in `.env`).
- **Status:** The contract is live, but the backend Node.js code does not yet call it.

## 2. Current Project State & Truthfulness

- **Postgres Persistence:** REAL (for the dashboard demo runs via Supabase REST API).
- **0G Chain Anchoring:** PARTIAL (Contract deployed, backend API call missing).
- **0G Storage Upload:** NOT IMPLEMENTED (Currently returns a locally generated hash).
- **OpenClaw / Telegram:** SIMULATED (Dashboard UI only).

*Note: All project documentation (`technical-debt.md`, `checklist.md`, `docs/next-development-phase.md`, `docs/ai-attribution.md`) has been meticulously updated to reflect this exact state. DO NOT claim features are "real" if they are not listed as REAL above.*

## 3. Immediate Next Steps (Your Tasks)

You are stepping into **Phase 2 & Phase 3** of the `next-development-phase.md` plan.

### Task 1: 0G Storage SDK Integration (Phase 2)
1. **Research:** Look up the `@0gfoundation/0g-ts-sdk` for Node.js.
2. **Implementation:** When `/api/demo/run-scenario` creates an `AuditEvent`, package it as a JSON string/buffer.
3. **Action:** Use the SDK to upload this JSON to the `ZG_STORAGE_INDEXER_RPC` defined in `.env`.
4. **Outcome:** Retrieve the `storageRootHash`. Update the dashboard status from `LOCAL_ONLY` to `STORED_ON_0G`.

### Task 2: 0G Chain Backend Call (Phase 3)
1. **Tooling:** Install `viem` in `apps/web` or `packages/core`.
2. **Implementation:** Load the `ZG_REGISTRAR_PRIVATE_KEY` and the `AUDIT_PROOF_REGISTRY_ADDRESS` from `.env`.
3. **Action:** Immediately after the 0G Storage upload succeeds, use `viem` to construct and send a transaction calling `registerProof()` on the smart contract. Pass the `localPackageHash` and the new `storageRootHash`.
4. **Outcome:** Update the dashboard status to `REGISTERED_ON_CHAIN`.

### Task 3: Database Schema Tightening
If time permits, move `Order`, `InventoryMovement`, `AuditEvent`, and `ProofRecord` out of the raw JSONB `dashboard_demo_runs` table and into their own relational tables in Supabase using the REST API, ensuring idempotency so repeated dashboard clicks don't bloat the database.

## 4. Environment Variables Needed
The `.env` file should look like this:
```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ndwsxiijjhmdwdomyvlf.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://ndwsxiijjhmdwdomyvlf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_hwBFZqoPZBQl1JtwocpTUw_m3uE6bcp
ARKA_DEMO_REPOSITORY=postgres

# 0G
ZG_CHAIN_RPC_URL=https://evmrpc-testnet.0g.ai
ZG_CHAIN_ID=16602
ZG_REGISTRAR_PRIVATE_KEY=0x61e4833eaffaf5a604ba9e3af90e75850b0cf1f1e2b2d37948eae833ae10504f
AUDIT_PROOF_REGISTRY_ADDRESS=0xEA4a472F0123fC9889650be807A1FF5EF780029F
ZG_STORAGE_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai
```

Good luck! Proceed methodically and test the UI (`pnpm dev -p 3010`) after every major API change.