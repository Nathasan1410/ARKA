import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment of AuditProofRegistry...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);
  
  // Log the balance to ensure there are enough funds
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "0G");

  // Get the contract factory
  const RegistryFactory = await ethers.getContractFactory("AuditProofRegistry");
  
  // Deploy the contract
  console.log("Deploying...");
  const registry = await RegistryFactory.deploy();

  // Wait for the deployment to be mined
  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("-----------------------------------------");
  console.log("✅ AuditProofRegistry deployed successfully!");
  console.log("📍 Contract Address:", address);
  console.log("-----------------------------------------");
  console.log("Please update your .env file with:");
  console.log(`AUDIT_PROOF_REGISTRY_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
