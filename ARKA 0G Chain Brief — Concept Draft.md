**Subtitle : AuditProofRegistry Concept**

---

## 0. Positioning

0G Chain is not ARKA’s database.

0G Chain is ARKA’s **proof anchor registry**.

The main split:

```txt
Local DB = operational evidence
0G Storage = sealed proof packages
0G Chain = proof anchors
```

Local DB is where ARKA works in real time.

0G Storage is where ARKA stores selected proof packages that should be retrievable and verifiable later.

0G Chain is where ARKA registers compact anchors that prove selected packages were officially recorded.

Final positioning:

> **ARKA uses 0G Chain to register tamper-resistant proof anchors that point to sealed proof packages in 0G Storage.**

Current implementation status:

```txt
0G Chain registry: PLANNED / NOT IMPLEMENTED.
AuditProofRegistry contract deployment: NOT VERIFIED.
Real chain transaction / anchor: NOT VERIFIED.
OpenClaw proof behavior: OpenClaw may explain local ProofRecord status later, but backend/proof registrar owns chain transactions.
Do not claim REGISTERED_ON_CHAIN or ANCHOR_CONFIRMED until a real transaction succeeds and the anchor is read back or otherwise verified.
```

---

## 1. Core Chain Principle

Every on-chain record must answer:

```txt
Which ARKA case is this?
What proof package was anchored?
Where is the sealed package stored?
Who registered it?
When was it registered?
Does it correct or extend a previous proof?
```

ARKA should not put full audit data on-chain.

ARKA should put **proof anchors** on-chain.

Anti-bloat test:

```txt
Does this on-chain record help prove that a sealed ARKA proof package existed and was officially anchored?
```

If no, keep it local or in 0G Storage only.

Important clarification:

On-chain registration does not mean the case is fully resolved.

For `AUDIT_EVENT_CREATED`, chain registration means the reconciliation case file was anchored.

For `FINAL_RESOLUTION`, chain registration means the owner/auditor final decision package was anchored.

---

## 2. Chain Decision for MVP

For MVP, ARKA should deploy one simple smart contract on 0G Chain:

```txt
AuditProofRegistry
```

P0 decision:

```txt
Use one registry contract.
Register proof anchors only.
Do not store full AuditEvent data on-chain.
Do not store staff/private conversation on-chain.
Do not store raw POS, movement, or CCTV data on-chain.
Do not create multiple contracts for MVP.
Do not use staking, validator interfaces, DA precompiles, Wrapped0G, or indexing for P0.
```

This keeps the 0G Chain role simple and demo-safe.

---

## 3. Why 0G Chain Exists in ARKA

ARKA has proof packages stored in 0G Storage:

```txt
AuditEvent Proof Package
Final Resolution Package
Correction Package
Optional Staff Response Package
Optional Action Timeline Package
```

But storage alone is not the public anchoring layer.

0G Chain gives ARKA a public registry to say:

```txt
This proof package root/hash was officially registered.
This package belongs to this AuditEvent/case.
This package has this proof type.
This package was registered by this actor/wallet.
This package was recorded at this block/time.
This correction references the previous proof.
```

So if a case is challenged later, ARKA can show:

```txt
Local DB contains operational history.
0G Storage contains sealed package.
0G Chain contains public proof anchor.
```

---

## 3.1 What Chain Proof Means

0G Chain proof does not prove that a person is guilty.

0G Chain proof means:

```txt
This proof package hash/root was registered at this time.
This package was linked to this ARKA case.
This package was registered by an authorized ARKA registrar.
This package can later be compared with 0G Storage and local ProofRecord.
```

It does not mean:

```txt
The staff member is guilty.
The physical event is legally proven.
The AI judgment is automatically correct.
The case is resolved unless the proof type is FINAL_RESOLUTION.
```

Final rule:

Chain anchors evidence packages. It does not replace human review.

---

## 4. What AuditProofRegistry Does

`AuditProofRegistry` records compact proof anchors.

It should support:

```txt
registering an AuditEvent proof anchor
registering a Final Resolution proof anchor
registering a Correction proof anchor
optionally registering a Staff Response proof anchor
emitting events for Dashboard/local sync
linking correction proofs to previous proof hashes
reading registered proof metadata
```

The contract should be append-only.

Once a proof anchor is registered, it should not be silently edited.

Corrections should be registered as new proof entries that reference previous proof hashes.

## 4.1 Authorized Registrar Rule

For MVP, only an authorized ARKA registrar should be able to register proof anchors.

Recommended model:

```txt
contract owner / deployer = admin
authorized registrar = backend/proof service wallet
public users = read only
```

Reason:

```txt
prevents fake proof entries
prevents random users from registering anchors under ARKA case IDs
keeps the registry tied to ARKA backend/proof layer
```

OpenClaw should not register proofs directly.

Owner/staff actions can be represented inside proof packages, but the on-chain transaction should be submitted by the backend/proof layer or an authorized registrar.

Future:

```txt
multiple branch registrars
owner wallet registration
manager registrar
role-based access control
```

For MVP, keep it simple.

---

## 5. What AuditProofRegistry Does NOT Do

The contract should not:

```txt
store full AuditEvent JSON
store raw inventory movement
store raw POS/order data
store staff private chat
store owner private notes in full
store CCTV/video
store HR/punishment decisions
decide whether staff is guilty
run reconciliation
run OpenClaw reasoning
store every Telegram message
act as a legal employment contract
replace the local database
replace 0G Storage
```

Important phrasing:

> **AuditProofRegistry is a proof registry, not a courtroom, not HR software, and not the operational database.**

---

## 6. Proof Types

ARKA should use typed proof anchors.

Do not register vague “proof.”

Recommended proof types for MVP:

```txt
AUDIT_EVENT_CREATED
FINAL_RESOLUTION
CORRECTION_APPENDED
```

Optional if demo includes staff dispute/clarification:

```txt
STAFF_RESPONSE_SUBMITTED
```

Future proof types:

```txt
OWNER_DECISION_FINALIZED
ACTION_TIMELINE_SNAPSHOT
DAILY_REPORT_SEALED
PATTERN_SUMMARY_SEALED
MANAGER_APPROVAL_RECORDED
```

MVP rule:

```txt
Keep proof types minimal.
Prioritize AuditEvent proof and Final Resolution proof.
Do not turn the contract into a chat/action log.
```

### MVP Proof Type Mapping

For MVP, `FINAL_RESOLUTION` can cover both:

```txt
OWNER_DECISION_FINALIZED
CASE_RESOLVED
```

Reason:

We do not need separate on-chain proof types for owner decision and case closed during MVP.
The Final Resolution Package can include both the final decision and the case closure summary.

Future split:

```txt
OWNER_DECISION_FINALIZED
CASE_RESOLVED
```

---

## 7. Recommended MVP Proof Type Meanings

### 7.1 AUDIT_EVENT_CREATED

Used when an AuditEvent Proof Package has been created and stored to 0G Storage.

Meaning:

```txt
This AuditEvent case file existed.
This is the sealed proof package root/hash.
This package represents the reconciliation result at creation time.
```

Typical package:

```txt
AuditEvent Proof Package
```

---

### 7.2 FINAL_RESOLUTION

Used when owner/auditor makes the final decision through OpenClaw or Dashboard.

Meaning:

```txt
This case reached a final owner/auditor decision.
This is the sealed final resolution package.
This package may include the final decision and lightweight timeline summary.
```

Typical package:

```txt
Final Resolution Package
```

---

### 7.3 CORRECTION_APPENDED

Used when something changes after being sent, finalized, or sealed.

Meaning:

```txt
A previous sealed/final proof was not overwritten.
A correction was appended.
This correction references the previous proof hash.
```

Typical package:

```txt
Correction Package
```

---

### 7.4 STAFF_RESPONSE_SUBMITTED — Optional

Used only if the demo includes staff clarification/dispute flow and we want to anchor staff response on-chain.

Meaning:

```txt
A staff response package was submitted and sealed.
```

MVP caution:

```txt
Staff response can be stored on 0G Storage only.
It does not need to be anchored on-chain unless the demo requires it.
```

---

## 8. On-Chain Fields

A proof anchor should store compact metadata only.

Conceptual fields:

```txt
proof_id
case_id / audit_event_id
proof_type
local_package_hash
0g_root_hash / storage_root
storage_uri or storage_reference if short enough
previous_proof_hash if correction
registered_by_wallet
business_actor_role if needed
business_actor_hash if needed
registered_at / block timestamp
```

Storage reference rule:

```txt
Prefer storing 0g_root_hash / storage_root on-chain.

Only store storage_uri if it is short and safe.

If the URI/reference is long, store it in local ProofRecord and/or inside the proof package metadata, and anchor its hash on-chain.
```

Clarification:

`registered_by_wallet` is the wallet that submits the on-chain transaction.

`business_actor_role` represents the human/system role related to the proof package, such as OWNER, STAFF, HANDLER, or SYSTEM.

For MVP, the backend/proof service wallet can be the only on-chain registrar, while human actor details stay inside the redacted 0G Storage package or local DB.

Optional fields:

```txt
case_resolution_status hash or enum
branch_id hash
package_version
metadata_hash
```

Do not store:

```txt
full AuditEvent JSON
full Staff Response text
full Owner Note text
raw CCTV/video
raw POS/order data
raw inventory movement data
private HR text
```

---

## 9. Hash and Root Meaning

ARKA should distinguish local package hash and 0G Storage root.

```txt
local_package_hash
= ARKA’s canonical hash of the JSON proof package.

0g_root_hash / storage_root
= 0G Storage root/reference returned after upload.

chain anchor
= on-chain registration that links case ID + proof type + package hash + storage root.
```

Why keep both:

```txt
local_package_hash proves the exact JSON package content ARKA generated.
0g_root_hash proves where that package is stored on 0G Storage.
Chain registration proves ARKA officially anchored that package at a public time/block.
```

---

## 10. Registration Lifecycle

### 10.1 AuditEvent Proof Registration

```txt
AuditEvent generated
↓
AuditEvent Proof Package created
↓
Package uploaded to 0G Storage
↓
ProofRecord is updated with auditProofStatus = STORED_ON_0G
↓
Backend calls AuditProofRegistry.registerProof(...)
↓
Contract stores proof anchor
↓
Contract emits ProofRegistered event
↓
Backend saves chain tx hash / proof id locally
↓
ProofRecord is updated with auditProofStatus = REGISTERED_ON_CHAIN
```

---

### 10.2 Final Resolution Registration

```txt
Owner/auditor finalizes case through OpenClaw or Dashboard
↓
Final Resolution Package created
↓
Package uploaded to 0G Storage
↓
Backend calls AuditProofRegistry.registerProof(...)
↓
Contract stores final resolution proof anchor
↓
ProofRecord updates chain status
↓
Dashboard/OpenClaw shows case as chain-anchored final resolution
```

---

### 10.3 Staff Response Registration — Optional

```txt
Staff submits response
↓
Staff Response Package created if demo requires it
↓
Package uploaded to 0G Storage
↓
Optional: register proof anchor on-chain
```

Default MVP:

```txt
Staff response package can stay Local + 0G only.
Do not register every staff message on-chain.
```

### 10.4 Duplicate Registration Rule

ARKA should avoid registering the same proof package multiple times.

Recommended conceptual rule:

```txt
same case_id
same proof_type
same local_package_hash
same 0g_root_hash
= duplicate registration
```

For MVP:

```txt
backend should check local ProofRecord before submitting registration
contract can reject exact duplicate proof hashes if simple to implement
```

Important:

```txt
new correction = new proof entry
same package repeated = duplicate
```

This keeps append-only accountability without creating noisy duplicate anchors.

---

## 11. Correction Lifecycle

Corrections must be append-only.

```txt
A sealed/sent/final package needs correction
↓
Backend creates Correction Package
↓
Correction Package references previous_proof_hash
↓
Package uploaded to 0G Storage
↓
Backend registers CORRECTION_APPENDED proof anchor on-chain (see rule below)
↓
Contract stores correction anchor
↓
Original proof remains unchanged
```

Chain anchoring rule:

```txt
If the original proof was REGISTERED_ON_CHAIN,
the correction should also be registered on-chain.

If the original proof was only STORED_ON_0G,
the correction can stay Local + 0G unless the case is important/final.

Never silently edit the original proof package or proof anchor.
```

Rule:

> **Never edit or delete old proof anchors. Append correction anchors.**

This preserves the accountability story:

```txt
Original proof remains visible.
Correction is visible.
Timeline remains auditable.
```

---

## 12. Chain Status and ProofRecord Sync

Local ProofRecord should track chain lifecycle separately from storage lifecycle.

Recommended local chain statuses:

```txt
NOT_REGISTERED
PENDING_REGISTRATION
REGISTERED
FAILED_TO_REGISTER
ANCHOR_CONFIRMED
```

Relationship to auditProofStatus:

```txt
LOCAL_ONLY
= no successful 0G Storage upload yet.

STORED_ON_0G
= package exists in 0G Storage.

REGISTERED_ON_CHAIN
= package hash/root was registered in AuditProofRegistry.

VERIFIED
= package and chain anchor were checked successfully.
```

Important:

```txt
auditProofStatus is the human-friendly lifecycle.
storage_status tracks storage operational state.
chain_status tracks chain operational state.
verification_status tracks verification result.
```

Clarification:

`ANCHOR_CONFIRMED` means the backend successfully read the proof anchor from AuditProofRegistry.

It does not mean the full package has been verified against 0G Storage.

Full verification belongs to `verification_status` and auditProofStatus `VERIFIED`.

## 12.1 Registration Failure Rule

0G Chain registration failure must not delete or invalidate the AuditEvent.

If registration fails:

```txt
AuditEvent remains local.
Proof package remains on 0G Storage if upload succeeded.
ProofRecord.chain_status = FAILED_TO_REGISTER.
auditProofStatus remains STORED_ON_0G.
Backend can retry registration later.
Dashboard/OpenClaw should show: stored on 0G, not registered on-chain yet.
```

Proof failure is a proof-layer issue, not a reason to lose the audit case.

---

## 13. Verification Flow

Verification should not run on every OpenClaw query.

Default:

```txt
OpenClaw / Dashboard reads local ProofRecord.
```

When owner asks to verify:

```txt
Backend reads ProofRecord
↓
Backend fetches on-chain proof anchor from AuditProofRegistry
↓
Backend downloads package from 0G Storage if needed
↓
Backend recomputes local package hash
↓
Backend compares package hash + storage root + chain anchor
↓
ProofRecord updates last_verified_at and verification_status
```

OpenClaw can say:

```txt
This case proof is registered on 0G Chain and points to a 0G Storage package.
Last verified: ...
```

or:

```txt
This case is stored on 0G Storage but has not been registered on-chain yet.
```

---

## 14. Dashboard / OpenClaw Display Rule

Dashboard should show:

```txt
proof type
case ID / audit event ID
0G Storage root/reference
local package hash
chain registration status
chain tx hash
registered by
registered at
verify action
```

OpenClaw should be able to say this only after backend/proof layer has verified local ProofRecord chain metadata:

```txt
This AuditEvent proof package has been registered on 0G Chain.
```

or:

```txt
This case is sealed on 0G Storage but not yet anchored on-chain.
```

or:

```txt
This correction was appended after the original proof and references the previous proof hash.
```

Do not make OpenClaw read chain first for every response.

OpenClaw should read local ProofRecord first and trigger verification only when needed.

---

## 15. Access and Privacy Rule

0G Chain records are public.

Therefore, on-chain data must be minimal and non-sensitive.

On-chain fields should use:

```txt
case_id / audit_event_id
hashes
storage roots
actor wallet / role
proof type
timestamp
previous proof hash
```

Avoid on-chain:

```txt
real staff names
private staff messages
owner private notes
raw evidence text
customer details
HR or punishment language
raw CCTV/video
```

If identity is needed:

```txt
use actor_id / role / wallet
keep detailed identity mapping local
```

---

## 16. Deployment Notes

0G Chain is EVM-compatible.

For MVP, ARKA can use familiar tools:

```txt
Hardhat
Foundry
Remix
ethers / viem
```

Recommended MVP path:

```txt
Hardhat or Foundry
single Solidity contract
0G testnet deployment
contract address saved in README / .env.example
transaction hashes shown in demo
```

0G Chain configuration notes for implementation:

```txt
Use evmVersion = cancun.
Use 0G testnet RPC for demo.
Use 0G ChainScan to verify deployment if time allows.
```

Do not make deployment verification block the core demo.

Important:

```txt
Never commit private keys.
Use .env and .env.example.
```

---

## 17. What Not To Use in P0

Do not use these for P0 unless everything else works:

```txt
staking interfaces
validator contract functions
DA precompiles
Wrapped0G / W0G DeFi flows
Goldsky indexing
multi-contract access control registry
legal contract workflow
on-chain chat logs
on-chain CCTV references with sensitive data
```

Why:

```txt
ARKA only needs proof anchors for MVP.
These tools solve different problems.
```

Future possible:

```txt
Goldsky indexing for large chain event history.
Access registry if public/staff/manager permission system becomes real.
Additional contracts if case workflows become more complex.
```

---

## 18. P0 Demo Flow

Minimum demo flow:

```txt
1. AuditEvent is created.
2. AuditEvent Proof Package is uploaded to 0G Storage.
3. Backend receives 0G root hash.
4. Backend registers proof anchor on AuditProofRegistry.
5. Contract emits ProofRegistered event.
6. Backend stores chain tx hash in ProofRecord.
7. Dashboard/OpenClaw shows REGISTERED_ON_CHAIN.
```

Better demo flow if time:

```txt
1. AuditEvent Proof Package registered on-chain.
2. Owner asks staff for explanation.
3. Staff response stored on 0G Storage.
4. Owner finalizes decision.
5. Final Resolution Package uploaded to 0G Storage.
6. Final Resolution proof anchor registered on-chain.
7. Dashboard shows full proof timeline.
```

---

## 19. Implementation Resources Needed Later

Before coding, ARKA needs:

```txt
confirmed 0G testnet RPC endpoint
confirmed chain ID
wallet/private key setup
faucet/testnet token setup
Hardhat or Foundry config
contract verification config if used
ChainScan explorer link format
expected event structure
frontend/backend method to call registerProof
local ProofRecord sync behavior
```

These are implementation details, not concept blockers.

---

## 20. Final Anchor

```txt
Local DB = operational evidence
0G Storage = sealed proof packages
0G Chain = proof anchors
```

ARKA uses 0G Chain to publicly anchor selected proof packages.

It does not use 0G Chain as the database.

It does not put private evidence on-chain.

It does not register every chat or draft.

It anchors important proof moments:

```txt
AuditEvent created
Final resolution
Correction appended
Optional staff response if demo requires it
```

Final phrasing:

> **0G Chain is ARKA’s public proof registry: it anchors hashes and storage roots for sealed proof packages, making important AuditEvents and final decisions tamper-resistant without putting private audit data on-chain.**
