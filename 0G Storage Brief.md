# ARKA 0G Storage Brief — Concept Draft

## 0. Positioning

0G Storage is not ARKA’s primary database.

0G Storage is ARKA’s **sealed proof package storage**.

The main split:

```txt
Local DB = operational evidence
0G Storage = sealed proof packages
0G Chain = proof anchor registry
```

Local DB is where ARKA works in real time.

0G Storage is where ARKA stores selected proof packages that should be verifiable later.

0G Chain is where ARKA registers compact proof anchors for important packages.

Final positioning:

> **ARKA uses 0G Storage to store sealed Audit Proof Packages, not to run daily operational queries.**

Current implementation status:

```txt
Local proof package creation: PARTIAL (packages/core can build deterministic AuditEvent proof package JSON and local SHA-256 hash).
0G Storage upload: PLANNED / NOT IMPLEMENTED.
0G Storage SDK/CLI upload verification: NOT VERIFIED.
OpenClaw proof behavior: OpenClaw may explain or recommend proof actions later, but backend/proof layer owns upload.
Do not claim STORED_ON_0G until a real upload succeeds and ProofRecord is updated with returned storage metadata.
```

---

## 1. Core Storage Principle

Every object stored on 0G Storage must help answer:

```txt
What happened?
What evidence supports it?
Who made the next decision?
Can this case be verified later?
```

ARKA should not upload everything to 0G Storage.

ARKA should upload **selected proof packages**.

Anti-bloat test:

```txt
Does this package help prove an AuditEvent or final case decision?
```

If no, keep it local or move it to future.

---

## 2. Storage Decision for MVP

For MVP, ARKA should store proof packages as JSON files on 0G Storage after the upload path is implemented and verified.

P0 decision:

```txt
Use 0G Storage SDK to upload JSON proof packages.
Use 0G Storage CLI as fallback/dev tool.
Do not use 0G KV as primary storage.
Do not upload raw CCTV/video.
Do not use 0G Storage as operational database.
```

This keeps the role of 0G Storage simple and demo-safe.

---

## 3. Why 0G Storage Exists in ARKA

ARKA has local operational data:

```txt
orders
usage rules
inventory movements
usage batches
AuditEvents
CaseNotes
ActionLogs
StaffClarificationRequests
ProofRecords
```

But local data alone can be silently changed.

0G Storage gives ARKA a place to store sealed packages:

```txt
AuditEvent proof package
Final resolution package
Correction package
Optional staff response package
Optional action timeline package
```

So if a case is challenged later, ARKA can say:

```txt
This case package existed at this root hash.
This was the evidence snapshot.
This was the final decision package.
This correction was appended later, not silently rewritten.
```

---

## 4. Tools We Use

### 4.1 P0 — 0G Storage SDK

The primary integration path should be 0G Storage SDK.

Recommended direction:

```txt
Backend creates JSON proof package
↓
Backend uploads package to 0G Storage
↓
0G Storage returns root hash / storage reference
↓
Backend saves it in local ProofRecord
↓
0G Chain later registers proof anchor
```

For ARKA, the SDK is used by backend/proof layer, not by OpenClaw directly.

OpenClaw should request proof actions through backend tools.

Important rule:

OpenClaw does not upload directly to 0G Storage.

OpenClaw can request proof actions through backend tools, but backend/proof layer owns:

```txt
- package creation
- canonical hash
- upload
- ProofRecord update
- chain registration handoff
```

---

### 4.2 P0 Fallback / Dev — 0G Storage CLI

0G Storage CLI is useful for:

```txt
testing uploads
debugging downloads
demo fallback
manual proof package upload
verification testing
```

Fallback flow:

```txt
If SDK integration is unstable:
- generate proof package JSON locally
- upload using CLI
- copy root hash into ProofRecord / demo state
```

This is a hackathon risk-management path, not the final product path.

---

### 4.3 Not P0 — 0G KV

0G KV can be useful later, but it is not required for MVP.

Possible future uses:

```txt
case_id → latest proof root
handler_id → latest summary root
branch_id → daily report root
```

For MVP:

```txt
Local DB already indexes cases.
0G Storage stores sealed proof package files.
```

Do not make KV part of the core MVP unless the main proof loop is already working.

---

## 5. Package Types

ARKA should not store vague “proof.”

ARKA should store typed proof packages.

---

### 5.1 P0 Package — AuditEvent Proof Package

Created when an AuditEvent is generated.

Purpose:

> Seal the reconciliation case file.

Contains snapshot of:

```txt
audit_event_id
case_type
status
severity
expected quantity
actual quantity
variance / slippage
related order summary
related inventory movement summary
usage rule summary
usage batch summary if any
handler / cashier context
evidence window
evidence completeness
backend recommended action
OpenClaw initial recommendation if already available
created_at
```

This is the main ARKA proof package.

Note:

AuditEvent Proof Package should not depend on OpenClaw already running.

The package can include backend recommended action immediately.
OpenClaw recommendation can be added later in Final Resolution Package or action timeline package.

---

### 5.2 P0 Package — Final Resolution Package

Created when owner/auditor makes the final decision through OpenClaw or Dashboard.

Purpose:

> Seal the final case outcome.

Contains snapshot of:

```txt
audit_event_id
caseResolutionStatus
final decision
owner/auditor note
triageOutcome
timeline summary
related proof roots
resolved_at
resolved_by
```

This package closes the case.

---

### 5.3 P1 Package — Staff Response Package

Created when staff replies to a clarification request.

Purpose:

> Seal the staff explanation if the demo or case requires dispute/accountability flow.

Contains snapshot of:

```txt
audit_event_id
clarification_request_id
staff_id / handler_id
staff_response
submitted_at
related evidence summary shown to staff
OpenClaw summary if available
```

For MVP, this is optional.

Use it if the demo includes owner ↔ staff conversation.

---

### 5.4 P1 Package — Correction Package

Created when something changes after being sent, finalized, or sealed.

Purpose:

> Preserve append-only accountability.

Contains snapshot of:

```txt
audit_event_id
previous_proof_hash
correction_type
corrected_field_or_statement
correction_reason
actor
created_at
```

Rule:

> Never rewrite sealed history. Append a correction package.

Priority clarification:

Correction Package is not required for the normal happy-path P0 demo.

But if a sent/final/sealed package needs correction, Correction Package becomes mandatory.

Do not silently edit sealed packages.

---

### 5.5 Future Packages

Future package types:

```txt
Daily Report Package
Pattern Summary Package
CCTV Clip Metadata Package
Manager Approval Package
Branch Summary Package
```

These are not required for MVP.

---

### 5.6 MVP Package Mapping

For MVP, ARKA does not need a separate package for every action type.

Mapping:

```txt
AuditEvent Proof Package
= seals the reconciliation case file.

Final Resolution Package
= seals owner/auditor final decision.
= can include owner decision snapshot.
= can include lightweight action timeline summary.

Staff Response Package
= optional P1, used only if the demo includes owner ↔ staff clarification.

Correction Package
= conditional package.
= not part of the normal happy-path P0,
  but required if something changes after being sent/finalized/sealed.

Action Timeline Package
= not separate in MVP.
= represented as timeline summary inside Final Resolution Package.

MVP rule:

Do not create too many proof package types.
For demo, prioritize:
1. AuditEvent Proof Package
2. Final Resolution Package
3. Staff Response Package only if needed
4. Correction Package only if correction happens
```

---

## 6. Package Lifecycle

### 6.1 AuditEvent Proof Package Lifecycle

```txt
AuditEvent generated
↓
Backend builds AuditEvent Proof Package JSON
↓
Backend computes local package hash
↓
Backend uploads package to 0G Storage
↓
Backend receives 0G root hash / storage reference
↓
ProofRecord is updated with auditProofStatus = STORED_ON_0G
↓
0G Chain can later register proof anchor
```

---

### 6.2 Final Resolution Package Lifecycle

```txt
Owner/auditor makes final decision
↓
Backend builds Final Resolution Package JSON
↓
Backend includes related proof roots
↓
Backend uploads package to 0G Storage
↓
ProofRecord is updated with auditProofStatus = STORED_ON_0G
↓
0G Chain registers final resolution anchor
```

---

### 6.3 Staff Response Package Lifecycle

```txt
Staff submits explanation
↓
OpenClaw summarizes response
↓
Backend creates Staff Response Package if needed
↓
Package is uploaded to 0G Storage
↓
Owner can verify staff response package later
```

This is optional for MVP.

---

### 6.4 Correction Package Lifecycle

```txt
Sent/final/sealed data needs correction
↓
Backend creates Correction Package
↓
Correction references previous proof hash
↓
Correction is uploaded to 0G Storage
↓
Correction can be anchored on-chain if important/final
```

---

## 7. Canonical Hash Rule

Before upload, ARKA should create a predictable package hash.

Conceptual rule:

```txt
1. Backend builds JSON package.
2. Backend canonicalizes JSON.
3. Backend computes local_package_hash.
4. Backend uploads JSON package to 0G Storage.
5. Backend saves 0g_root_hash / storage reference.
6. Backend later registers local_package_hash + 0g_root_hash on-chain.
```

Why this matters:

```txt
local_package_hash = ARKA’s hash of the case package
0g_root_hash = storage network root/reference
chain anchor = public proof that the hash/reference was registered
```

This makes the proof flow easier to explain.

---

## 8. ProofRecord Update Rule

Every package uploaded to 0G Storage should create or update a local ProofRecord.

ProofRecord should track conceptually:

```txt
proof_record_id
related_audit_event_id
proof_type
local_package_hash
0g_root_hash
0g_storage_uri if available
storage_upload_tx_hash if available
chain_tx_hash later from 0G Chain registration
storage_status
chain_status
stored_at
registered_at
last_verified_at
verification_status
previous_proof_hash if correction
```

Relevant statuses:

```txt
Canonical auditProofStatus:

LOCAL_ONLY
STORED_ON_0G
REGISTERED_ON_CHAIN
VERIFIED

Storage/verification operational statuses:

FAILED_TO_STORE
FAILED_TO_VERIFY
RETRY_PENDING
```

Rule:

auditProofStatus explains the main proof lifecycle.
storage_status / verification_status can track operational failure states.

This lets OpenClaw and Dashboard explain proof state without reading 0G/Chain on every request.

---

## 9. Verification Flow

Verification should be explicit, not automatic for every query.

Default read:

```txt
OpenClaw / Dashboard reads local ProofRecord
```

Verification request:

```txt
Owner asks to verify case
↓
Backend downloads package from 0G Storage using root hash
↓
Backend verifies download proof if available
↓
Backend recomputes package hash
↓
Backend compares with local_package_hash and chain anchor if registered
↓
ProofRecord updates last_verified_at and verification_status
```

OpenClaw can then say:

```txt
This case proof was verified from 0G Storage.
Root hash: 0x...
Last verified: ...
```

or:

```txt
This case is stored locally but has not been sealed to 0G yet.
```

---

## 10. Privacy and Redaction Rule

0G Storage packages should contain audit-relevant evidence, not unnecessary private data.

For MVP:

```txt
include handler_id / role
include cashier_id / role if relevant
include evidence summary
include timestamp / evidence window
include staff response summary if needed
do not include raw CCTV video
do not include unnecessary private HR text
do not include punitive instruction as final automated action
```

Raw CCTV/video:

```txt
raw video stays Web2/local
0G package may include timestamp or clip reference metadata
```

Future:

```txt
encrypt sensitive proof packages before upload
controlled access for staff/manager/public views
```

For MVP, keep access simple:

```txt
owner can see full proof package
staff can see case summary involving them
public access is future only
```

Access Control Clarification:

- For MVP, uploaded 0G Storage packages should be treated as potentially inspectable unless encryption/access control is implemented.
- Therefore proof packages must be redacted by default.
- Product-level access policy such as Owner full case / Staff summary / Manager branch case / Public future is ARKA UI/API policy, not something we should claim 0G Storage enforces until encryption/access control exists.

---

## Demo vs Production Proofing Rule

For demo:

```txt
All demo AuditEvents can be eligible for 0G Storage once the upload path is implemented and verified.

Reason:

Demo volume is small.
0G visibility matters.
Judges need to see real 0G usage.
```

For production:

```txt
All AuditEvents are stored locally.
Review-needed / important AuditEvents are stored to 0G.
Final decisions are stored to 0G.
Critical corrections are stored to 0G.

This avoids uploading unnecessary low-value operational noise while preserving accountability.
```

---

## 11. Failure and Retry Rule

0G upload failure must not block AuditEvent creation.

If upload fails:

```txt
AuditEvent still exists locally
auditProofStatus = LOCAL_ONLY
storage_status = FAILED_TO_STORE
OpenClaw/Dashboard shows proof not sealed yet
Backend can retry upload later
```

Important:

> Proof failure is a proof-layer issue, not a reason to lose the audit case.

This protects demo and production reliability.

---

## 12. Relationship with 0G Chain

0G Storage stores the package.

0G Chain registers the anchor.

Conceptual flow:

```txt
Audit Proof Package JSON
↓ stored on
0G Storage
↓ returns
root hash / storage reference
↓ registered on
0G Chain AuditProofRegistry
```

0G Chain should not store full package content.

0G Chain should store compact anchor fields later:

```txt
audit_event_id
proof_type
local_package_hash
0g_root_hash / storage_uri
actor role
timestamp
previous_proof_hash if correction
```

0G Storage must be defined first because the chain anchor points to the storage package.

Storage Proof vs Chain Proof:

- STORED_ON_0G means the package exists in 0G Storage and can be retrieved by root/reference.
- REGISTERED_ON_CHAIN means ARKA publicly anchored that package hash/reference as an official proof entry.
- 0G Storage makes package retrieval/verification possible.
- 0G Chain makes selected package roots part of the public proof registry.

---

## 13. Dashboard / OpenClaw Display Rule

After a package is really stored on 0G Storage, Dashboard should show:

```txt
proof status
proof type
0G root hash / storage reference
stored_at
chain registration status if available
verify button / verify action
```

OpenClaw should be able to say this only after backend/proof layer has verified the stored package metadata:

```txt
This case has been sealed on 0G Storage.
Root hash: 0x...
```

If not stored:

```txt
This case is local only. Proof package has not been sealed to 0G yet.
```

If verified:

```txt
This proof package was verified from 0G Storage.
```

---

## 14. P0 Demo Flow

Minimum demo flow:

```txt
1. AuditEvent created
2. Backend creates AuditEvent Proof Package JSON
3. Backend computes local package hash
4. Backend uploads JSON to 0G Storage
5. Backend receives 0G root hash
6. ProofRecord is updated with auditProofStatus = STORED_ON_0G
7. Dashboard/OpenClaw shows root hash
8. ProofRecord is ready for 0G Chain registration
```

0G Chain registration is defined in the separate 0G Chain / AuditProofRegistry brief.

Better demo flow if time:

```txt
1. AuditEvent Proof Package stored on 0G
2. Owner requests explanation
3. Staff response package stored on 0G
4. Owner final decision package stored on 0G
5. Final resolution registered on 0G Chain
```

---

## 15. What Not To Use in P0

Do not use these in P0 unless everything else works:

```txt
0G KV as operational database
raw CCTV/video upload
full directory upload
custom storage node
gateway service
complex access control
encryption/decryption pipeline
proof package for every chat message
```

These can be future improvements.

---

## 16. Implementation Resources Needed Later

For implementation planning, ARKA needs:

```txt
current 0G network RPC endpoint
current 0G storage indexer endpoint
wallet/private key setup
faucet/funding setup
TypeScript SDK starter kit details
upload response shape from TypeScript SDK
download/verification example
StorageScan behavior / explorer link format
whether upload needs transaction or can use fast/skip mode for demo
```

These are not needed for concept finalization, but will be needed before coding.

---

## 17. Final Anchor

```txt
Local DB = operational evidence
0G Storage = sealed proof packages
0G Chain = proof anchors
```

ARKA uses 0G Storage to make AuditEvents and final decisions verifiable later.

It does not use 0G Storage as the main database.

It does not upload everything.

It uploads selected proof packages that matter.

Final phrasing:

> **0G Storage is ARKA’s sealed evidence vault: it stores Audit Proof Packages and final case packages so important AuditEvents can be verified, challenged, and anchored later on-chain.**
