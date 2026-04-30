# 0G Chain Implementation Plan

## 1. Goal
Implement the Web3 proof anchoring layer for ARKA on the **0G Chain Galileo Testnet**. This involves deploying the `AuditProofRegistry` smart contract to store immutable hashes of ARKA proof packages, and preparing the backend to write to this registry.

## 2. Technical Specifications (Galileo Testnet)

Based on official 0G Chain documentation, the EVM-compatible Galileo Testnet configuration is:

*   **Network Name:** 0G-Galileo-Testnet
*   **RPC URL:** `https://evmrpc-testnet.0g.ai`
*   **Chain ID:** `16602`
*   **Currency Symbol:** `0G`
*   **Block Explorer:** `https://chainscan-galileo.0g.ai`
*   **Faucet:** `https://faucet.0g.ai`
*   **Compiler Requirement:** EVM Version **MUST** be set to `cancun`.

## 3. Smart Contract: `AuditProofRegistry.sol`

The contract will be written in Solidity (^0.8.20) using Hardhat. 

**Features:**
1.  **Access Control:** Uses OpenZeppelin `Ownable` or a custom modifier. The deployer is the Admin. The Admin can add/remove "Registrars" (backend wallets). Only Registrars can call `registerProof`.
2.  **Append-Only:** No updates or deletes. Corrections are registered as new entries referencing a previous hash.
3.  **Data Structure:**
    ```solidity
    struct ProofAnchor {
        string caseId;
        string proofType; // "AUDIT_EVENT_CREATED", "FINAL_RESOLUTION", "CORRECTION_APPENDED"
        string localPackageHash; // SHA-256 hash of the JSON
        string storageRootHash;  // 0G Storage root reference
        string previousProofHash; // For corrections
        address registeredBy;
        uint256 registeredAt;
    }
    ```
4.  **Events:** Emits `ProofRegistered(string caseId, string localPackageHash)` for indexing.

## 4. Implementation Steps

### Phase 1: Contract Setup & Deployment (Current Phase)
1.  **Initialize Hardhat Workspace:** Inside the `/contracts` directory.
2.  **Write Contract:** Implement `AuditProofRegistry.sol`.
3.  **Write Tests:** Basic Hardhat tests (Chai/Mocha) to verify registrar access control and append-only logic.
4.  **Configure Hardhat:** Add the Galileo testnet RPC, Chain ID (16602), and `evmVersion: "cancun"`.
5.  **Deploy:** Request faucet funds to a test wallet. Run deployment scripts and save the contract address to `.env`.

### Phase 2: Backend Integration (Next Phase)
1.  **Add `viem`:** Install `viem` in `@arka/web` or `@arka/core` to interact with the EVM contract.
2.  **Implement Registry Service:** Create a backend service that calls `registerProof` using the authorized Registrar private key.
3.  **Connect to API:** In `POST /api/demo/run-scenario`, trigger the registration (or queue it) after the 0G Storage upload is simulated or completed.
4.  **Update Dashboard:** Ensure the Dashboard UI pulls the `chainTxHash` and displays `REGISTERED_ON_CHAIN`.

## 5. Security & Environment Rules
*   **NO PRIVATE KEYS IN REPO.** The deployment private key and registrar private key must only exist in `.env.local`.
*   `.env.example` must be updated to include placeholders:
    *   `ZERO_G_RPC_URL=https://evmrpc-testnet.0g.ai`
    *   `ZERO_G_CHAIN_ID=16602`
    *   `ZERO_G_REGISTRAR_PRIVATE_KEY=`
    *   `NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS=`