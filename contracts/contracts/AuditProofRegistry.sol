// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuditProofRegistry
 * @dev Append-only registry for anchoring ARKA proof packages on 0G Chain.
 * Optimized for EVM compatibility (cancun) and Gas efficiency using Custom Errors.
 */
contract AuditProofRegistry {
    address public admin;

    mapping(address => bool) public isRegistrar;

    struct ProofAnchor {
        string caseId;
        string proofType; // e.g., "AUDIT_EVENT_CREATED", "FINAL_RESOLUTION"
        string localPackageHash; // SHA-256 hash of the generated JSON package
        string storageRootHash; // 0G Storage root reference
        string previousProofHash; // For corrections to point back to the original proof
        address registeredBy;
        uint256 registeredAt;
    }

    // Maps localPackageHash to its ProofAnchor
    mapping(string => ProofAnchor) private proofs;
    // Track if a localPackageHash has been registered to prevent exact duplicates
    mapping(string => bool) private hasBeenRegistered;

    // --- Custom Errors (Gas Optimization) ---
    error UnauthorizedAdmin(address caller);
    error UnauthorizedRegistrar(address caller);
    error AlreadyRegistrar(address registrar);
    error NotRegistrar(address registrar);
    error CannotRemoveAdmin();
    error EmptyCaseId();
    error EmptyPackageHash();
    error HashAlreadyRegistered(string packageHash);
    error ProofNotFound(string packageHash);

    // --- Events ---
    event RegistrarAdded(address indexed registrar);
    event RegistrarRemoved(address indexed registrar);
    event ProofRegistered(
        string indexed caseId,
        string indexed localPackageHash,
        string proofType,
        address registeredBy
    );

    // --- Modifiers ---
    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert UnauthorizedAdmin(msg.sender);
        }
        _;
    }

    modifier onlyRegistrar() {
        if (!isRegistrar[msg.sender]) {
            revert UnauthorizedRegistrar(msg.sender);
        }
        _;
    }

    constructor() {
        admin = msg.sender;
        // The deployer is automatically a registrar for convenience
        isRegistrar[msg.sender] = true;
        emit RegistrarAdded(msg.sender);
    }

    /**
     * @dev Adds a new registrar who can anchor proofs.
     */
    function addRegistrar(address registrar) external onlyAdmin {
        if (isRegistrar[registrar]) {
            revert AlreadyRegistrar(registrar);
        }
        isRegistrar[registrar] = true;
        emit RegistrarAdded(registrar);
    }

    /**
     * @dev Removes an existing registrar.
     */
    function removeRegistrar(address registrar) external onlyAdmin {
        if (!isRegistrar[registrar]) {
            revert NotRegistrar(registrar);
        }
        if (registrar == admin) {
            revert CannotRemoveAdmin();
        }
        isRegistrar[registrar] = false;
        emit RegistrarRemoved(registrar);
    }

    /**
     * @dev Registers a new proof anchor. Append-only.
     */
    function registerProof(
        string calldata _caseId,
        string calldata _proofType,
        string calldata _localPackageHash,
        string calldata _storageRootHash,
        string calldata _previousProofHash
    ) external onlyRegistrar {
        if (bytes(_caseId).length == 0) {
            revert EmptyCaseId();
        }
        if (bytes(_localPackageHash).length == 0) {
            revert EmptyPackageHash();
        }
        if (hasBeenRegistered[_localPackageHash]) {
            revert HashAlreadyRegistered(_localPackageHash);
        }

        ProofAnchor memory newProof = ProofAnchor({
            caseId: _caseId,
            proofType: _proofType,
            localPackageHash: _localPackageHash,
            storageRootHash: _storageRootHash,
            previousProofHash: _previousProofHash,
            registeredBy: msg.sender,
            registeredAt: block.timestamp
        });

        proofs[_localPackageHash] = newProof;
        hasBeenRegistered[_localPackageHash] = true;

        emit ProofRegistered(_caseId, _localPackageHash, _proofType, msg.sender);
    }

    /**
     * @dev Retrieves a proof anchor by its local package hash.
     */
    function getProof(string calldata _localPackageHash) external view returns (ProofAnchor memory) {
        if (!hasBeenRegistered[_localPackageHash]) {
            revert ProofNotFound(_localPackageHash);
        }
        return proofs[_localPackageHash];
    }
}
