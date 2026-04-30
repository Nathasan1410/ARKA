import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("AuditProofRegistry", function () {
  let registry: any;
  let admin: HardhatEthersSigner;
  let registrar1: HardhatEthersSigner;
  let unauthorizedUser: HardhatEthersSigner;

  beforeEach(async function () {
    [admin, registrar1, unauthorizedUser] = await ethers.getSigners();

    const RegistryFactory = await ethers.getContractFactory("AuditProofRegistry");
    registry = await RegistryFactory.deploy();
    await registry.waitForDeployment();
  });

  describe("Access Control", function () {
    it("Should set the deployer as admin and registrar", async function () {
      expect(await registry.admin()).to.equal(admin.address);
      expect(await registry.isRegistrar(admin.address)).to.be.true;
    });

    it("Should allow admin to add a new registrar", async function () {
      await registry.addRegistrar(registrar1.address);
      expect(await registry.isRegistrar(registrar1.address)).to.be.true;
    });

    it("Should prevent non-admin from adding a registrar", async function () {
      await expect(
        registry.connect(unauthorizedUser).addRegistrar(registrar1.address)
      ).to.be.revertedWithCustomError(registry, "UnauthorizedAdmin").withArgs(unauthorizedUser.address);
    });

    it("Should prevent adding an already existing registrar", async function () {
      await registry.addRegistrar(registrar1.address);
      await expect(
        registry.addRegistrar(registrar1.address)
      ).to.be.revertedWithCustomError(registry, "AlreadyRegistrar").withArgs(registrar1.address);
    });
  });

  describe("Proof Registration", function () {
    beforeEach(async function () {
      await registry.addRegistrar(registrar1.address);
    });

    it("Should allow an authorized registrar to register a proof", async function () {
      const caseId = "CASE-123";
      const proofType = "AUDIT_EVENT_CREATED";
      const packageHash = "0xhash123456789";
      const rootHash = "0xroot987654321";

      await expect(
        registry.connect(registrar1).registerProof(caseId, proofType, packageHash, rootHash, "")
      )
        .to.emit(registry, "ProofRegistered")
        .withArgs(caseId, packageHash, proofType, registrar1.address);

      const proof = await registry.getProof(packageHash);
      expect(proof.caseId).to.equal(caseId);
      expect(proof.proofType).to.equal(proofType);
      expect(proof.localPackageHash).to.equal(packageHash);
      expect(proof.storageRootHash).to.equal(rootHash);
      expect(proof.previousProofHash).to.equal("");
      expect(proof.registeredBy).to.equal(registrar1.address);
      expect(proof.registeredAt).to.be.greaterThan(0);
    });

    it("Should prevent unauthorized users from registering a proof", async function () {
      await expect(
        registry.connect(unauthorizedUser).registerProof(
          "CASE-123",
          "AUDIT_EVENT_CREATED",
          "0xhash",
          "0xroot",
          ""
        )
      ).to.be.revertedWithCustomError(registry, "UnauthorizedRegistrar").withArgs(unauthorizedUser.address);
    });

    it("Should prevent exact duplicate localPackageHash registration", async function () {
      const packageHash = "0xhash-duplicate";

      await registry.connect(registrar1).registerProof("CASE-1", "AUDIT_EVENT_CREATED", packageHash, "0xroot", "");

      await expect(
        registry.connect(registrar1).registerProof("CASE-1", "AUDIT_EVENT_CREATED", packageHash, "0xroot", "")
      ).to.be.revertedWithCustomError(registry, "HashAlreadyRegistered").withArgs(packageHash);
    });

    it("Should revert on empty case ID", async function () {
      await expect(
        registry.connect(registrar1).registerProof("", "TYPE", "0xhash", "0xroot", "")
      ).to.be.revertedWithCustomError(registry, "EmptyCaseId");
    });

    it("Should allow correction registration with a new package hash pointing to the old one", async function () {
      const originalHash = "0xoriginal";
      const correctionHash = "0xcorrection";

      await registry.connect(registrar1).registerProof("CASE-1", "FINAL_RESOLUTION", originalHash, "0xroot1", "");
      
      await expect(
        registry.connect(registrar1).registerProof("CASE-1", "CORRECTION_APPENDED", correctionHash, "0xroot2", originalHash)
      ).to.not.be.reverted;

      const correctionProof = await registry.getProof(correctionHash);
      expect(correctionProof.previousProofHash).to.equal(originalHash);
    });

    it("Should revert when getting a non-existent proof", async function () {
      await expect(
        registry.getProof("non-existent-hash")
      ).to.be.revertedWithCustomError(registry, "ProofNotFound").withArgs("non-existent-hash");
    });
  });
});
