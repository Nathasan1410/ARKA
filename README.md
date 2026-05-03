# ARKA

**Immutable Auditing for the Physical World**

ARKA reconciles physical reality with business intent. By comparing point-of-sale orders with physical inventory movements, ARKA automatically generates immutable audit proofs of operational truth.

For this ETHGlobal hackathon submission, we focus on providing unshakeable trust for physical operations using the 0G Network.

## Web3 Proof & Infrastructure

ARKA leverages the high-throughput 0G Network to ensure that every physical audit event is tamper-proof and verifiable:

*   **0G Storage:** We compile the physical evidence (order data, usage rules, movement logs, and triage outcomes) into a canonical JSON blob. This blob is uploaded to 0G Storage, generating a cryptographic storage root hash.
*   **0G Chain:** The storage root hash and local package hash are then anchored on the 0G Galileo Testnet via our smart contract, permanently linking the physical event to a decentralized ledger.

### Deployed Contract
**0G Galileo Testnet Contract Address:** `0xEA4a472F0123fC9889650be807A1FF5EF780029F`

## MVP Architecture & Honesty Statement

Our original vision included integrating a complex AI Agent framework (OpenClaw) for dynamic incident triage. However, to guarantee a stable and cohesive experience for the hackathon judges, we made a strategic pivot:

1.  **Fully Functional Web3 Evidence Anchoring:** The entire Web3 flow—compiling evidence, uploading to 0G Storage, and registering the proof on the 0G Chain—is live and functional.
2.  **Deterministic AI Triage (UI Fallback):** For this MVP submission, the AI Triage component is running via a deterministic UI fallback. The dashboard provides a robust simulation of the agent's behavior, ensuring demo stability while demonstrating the exact intended user experience.

## The Problem Solved

In physical operations (like a cafe or retail store), inventory disappears due to spills, theft, or untracked mistakes. Traditional systems only know what was sold, not what was actually used.

ARKA bridges this gap:
1.  **Ingest:** Connects Point-of-Sale (expected usage) with smart scales or IoT (actual usage).
2.  **Reconcile:** Automatically detects variances (e.g., 90g expected vs. 150g used).
3.  **Secure:** Anchors the evidence on the 0G Network, creating an undeniable, immutable record of the discrepancy for owners and auditors.
