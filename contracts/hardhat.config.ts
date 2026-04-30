import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load from project root .env
dotenv.config({ path: resolve(__dirname, "../.env") });
// Fallback to local .env if it exists
dotenv.config();

const privateKey = process.env.ZERO_G_REGISTRAR_PRIVATE_KEY || process.env.PRIVATE_KEY;
const accounts = privateKey ? [privateKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // 0G Galileo Testnet
    galileo: {
      url: process.env.ZERO_G_RPC_URL || "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: accounts,
    },
    // Local Hardhat Network for fast testing
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
