# ARKA 48-Hour Hackathon Survival Plan

**Context:** The OpenClaw AI agent integration failed during development. With only 48 hours left to submit the project and claim the staking refund (ETHGlobal requirement), this plan outlines a strict pivot.

## Core Strategy: The "Illusion of AI, Reality of Web3"

We are dropping the complex, failing AI runtime. We will rely 100% on the deterministic UI simulation we already built for the "Triage" phase.

To win a Web3 hackathon (or at least secure a valid submission), the **Web3 components must be real and verifiable on-chain**. Our entire effort for the next 48 hours will focus exclusively on **0G Storage** and **0G Chain**.

---

## 1. Day 1: 0G Chain Integration (Viem)
**Goal:** Prove that an ARKA `AuditEvent` is immutable and anchored on a public ledger.

1.  **Backend Integration:** Install `viem` in the Next.js API.
2.  **Smart Contract Interaction:** Create a service function that takes a `local_package_hash` and `storage_root_hash` and calls the `registerProof()` function on our already deployed `AuditProofRegistry.sol` contract on the 0G Galileo Testnet.
3.  **UI Feedback:** When a user runs a scenario (e.g., State C), the backend must trigger this Web3 transaction. The Dashboard UI must update from `LOCAL_ONLY` to `REGISTERED_ON_CHAIN` and display the real transaction hash.
4.  **Verification:** Click the transaction hash in the UI, which should open the 0G Chainscan explorer and show the successful contract call.

## 2. Day 2: 0G Storage SDK & Demo Recording
**Goal:** Prove that the bulky JSON data of an `AuditEvent` is stored decently before being anchored on-chain.

1.  **0G Storage Upload:** Install the official `@0gfoundation/0g-ts-sdk`.
2.  **Implementation:** Create a service to upload the `AuditEvent` JSON string to the `ZG_STORAGE_INDEXER_RPC`.
3.  **Fallback Strategy:** If the 0G Storage SDK fails repeatedly (e.g., testnet instability, complex setup), **IMMEDIATELY PIVOT TO IPFS (Pinata)**. We will document this fallback transparently: "Due to testnet instability, we gracefully fall back to IPFS for the decentralized storage demo, while keeping the 0G Chain anchoring active."
4.  **Demo Video Recording:**
    *   Record a 2-3 minute video.
    *   Show the problem (Discrepancy in inventory).
    *   Show the dashboard detecting it (Simulation Mode).
    *   **The Climax:** Show the dashboard generating the proof and opening the real 0G Testnet Block Explorer transaction.
5.  **Submission:** Clean up the README, link the GitHub repo, link the deployed contract address, and submit.
