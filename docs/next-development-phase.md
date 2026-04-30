# Next Development Phase: Building the Real Backend

Now that the UI redesign is complete, the `AuditProofRegistry.sol` contract is written and locally tested, and the "Operator Console" frontend is polished, the project must shift from a simulated frontend into a real, functional backend system.

Here is the concrete plan to eliminate the technical debt and fulfill the ARKA MVP vision:

## Phase 1: Database Setup & Persistence (Postgres + Drizzle)
**Goal:** Replace `memoryRuns` with a real database.
1.  **Configure Environment:** Set up a live PostgreSQL database (e.g., Neon, Supabase) or local Docker Postgres and populate the `DATABASE_URL` in `.env`.
2.  **Drizzle Migration:** Ensure `packages/db` contains the schemas for `Order`, `InventoryMovement`, `AuditEvent`, and `ProofRecord`. Run `drizzle-kit push` or `drizzle-kit migrate` to establish the tables.
3.  **Refactor `demo-run-service.ts`:** Rewrite the `inMemoryDemoRunRepository` to interact with Drizzle ORM.
    *   `saveRun` should insert rows into the database.
    *   `getHistory` should fetch the latest 12 cases.
4.  **Verify:** Run the UI again. The persistence pill should read `DB - POSTGRES` instead of `IN_MEMORY_DEMO`.

## Phase 2: 0G Storage & Proof Packaging
**Goal:** Create verifiable sealed proof packages.
1.  **Integrate 0G SDK:** In the backend route handler (`/api/demo/run-scenario`), when an `AuditEvent` is created, assemble a JSON Proof Package containing the event details.
2.  **Canonical Hashing:** Compute the SHA-256 hash of this JSON package (`local_package_hash`).
3.  **Upload to 0G:** Use the 0G Storage SDK to upload the JSON payload.
4.  **Update Database:** Retrieve the `storageRootHash` (or URI) from 0G and update the `ProofRecord` row in Postgres. Change the dashboard status to `STORED_ON_0G`.

## Phase 3: 0G Chain Anchoring
**Goal:** Register the proof package on the Galileo Testnet.
1.  **Deploy Smart Contract:** Request faucet funds to the deployment wallet. Use Hardhat to deploy `AuditProofRegistry.sol` to the 0G Galileo Testnet. Save the contract address to `.env`.
2.  **Backend Web3 Client:** Install `viem` in the backend.
3.  **Submit Transaction:** Immediately after the 0G Storage upload, the backend calls `registerProof()` on the deployed contract, providing the `local_package_hash` and `storageRootHash`.
4.  **Confirm Anchor:** Retrieve the transaction hash, update the `ProofRecord`, and switch the UI status to `REGISTERED_ON_CHAIN`.

## Phase 4: OpenClaw / Telegram AI Triage
**Goal:** Replace the simulated state machine with real AI calls.
1.  **OpenClaw Gateway:** Ensure the OpenClaw gateway is running locally.
2.  **Backend Integration:** In `/api/demo/agent-action`, forward the `AuditEvent` context to the OpenClaw agent endpoint rather than returning hardcoded strings.
3.  **Telegram Bot:** Configure a real Telegram Bot token. When a case hits `CRITICAL_REVIEW`, the backend (or OpenClaw) must send an actual Telegram message to the Owner.
4.  **Webhooks:** Handle the Owner's reply (Approve/Reject) via a Telegram Webhook returning to the Next.js API, updating the `AuditEvent` state and resolving the case.

**Rule:** Development must proceed sequentially (Phase 1 -> 2 -> 3 -> 4) to ensure the data foundation is solid before adding the AI triage layer.
