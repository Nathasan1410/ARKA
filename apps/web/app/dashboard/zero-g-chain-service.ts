import { createPublicClient, createWalletClient, defineChain, http, isAddress, type Address, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import type { ProofType } from '@arka/shared';

const auditProofRegistryAbi = [
  {
    type: 'function',
    name: 'registerProof',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_caseId', type: 'string' },
      { name: '_proofType', type: 'string' },
      { name: '_localPackageHash', type: 'string' },
      { name: '_storageRootHash', type: 'string' },
      { name: '_previousProofHash', type: 'string' },
    ],
    outputs: [],
  },
] as const;

export type ZeroGChainConfig = {
  rpcUrl: string;
  chainId: number;
  registrarPrivateKey: Hex;
  registryAddress: Address;
};

export type ZeroGChainRegistrationInput = {
  caseId: string;
  proofType: ProofType;
  localPackageHash: string;
  storageRootHash: string;
  previousProofHash?: string | null;
};

export type ZeroGChainRegistrationResult = {
  chainTxHash: string;
  storageRootHash: string;
  registrarAddress: string;
  blockNumber: bigint;
};

type ZeroGChainRegistrationExecutor = (
  config: ZeroGChainConfig,
  input: ZeroGChainRegistrationInput,
) => Promise<ZeroGChainRegistrationResult>;

function readRequiredEnv(name: string, env: NodeJS.ProcessEnv): string {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export function readZeroGChainConfig(env: NodeJS.ProcessEnv = process.env): ZeroGChainConfig {
  const rpcUrl = readRequiredEnv('ZG_CHAIN_RPC_URL', env);
  const chainIdText = readRequiredEnv('ZG_CHAIN_ID', env);
  const registrarPrivateKey = readRequiredEnv('ZG_REGISTRAR_PRIVATE_KEY', env);
  const registryAddress = readRequiredEnv('AUDIT_PROOF_REGISTRY_ADDRESS', env);

  const chainId = Number(chainIdText);

  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error(`Invalid ZG_CHAIN_ID: ${chainIdText}`);
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(registrarPrivateKey)) {
    throw new Error('ZG_REGISTRAR_PRIVATE_KEY must be a 32-byte hex string starting with 0x.');
  }

  if (!isAddress(registryAddress)) {
    throw new Error(`Invalid AUDIT_PROOF_REGISTRY_ADDRESS: ${registryAddress}`);
  }

  return {
    rpcUrl,
    chainId,
    registrarPrivateKey: registrarPrivateKey as Hex,
    registryAddress,
  };
}

export function resolveStorageRootHash(currentValue: string | null, manualValue: string | null): string {
  const current = currentValue?.trim();

  if (current) {
    return current;
  }

  const manual = manualValue?.trim();

  if (!manual) {
    throw new Error('A real 0G storage root hash is required before chain registration can run.');
  }

  return manual;
}

async function executeZeroGChainRegistration(
  config: ZeroGChainConfig,
  input: ZeroGChainRegistrationInput,
): Promise<ZeroGChainRegistrationResult> {
  const chain = defineChain({
    id: config.chainId,
    name: '0G Galileo Testnet',
    nativeCurrency: {
      name: '0G',
      symbol: '0G',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [config.rpcUrl] },
      public: { http: [config.rpcUrl] },
    },
  });

  const account = privateKeyToAccount(config.registrarPrivateKey);
  const transport = http(config.rpcUrl);
  const walletClient = createWalletClient({
    account,
    chain,
    transport,
  });
  const publicClient = createPublicClient({
    chain,
    transport,
  });

  const txHash = await walletClient.writeContract({
    address: config.registryAddress,
    abi: auditProofRegistryAbi,
    functionName: 'registerProof',
    args: [
      input.caseId,
      input.proofType,
      input.localPackageHash,
      input.storageRootHash,
      input.previousProofHash ?? '',
    ],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  return {
    chainTxHash: txHash,
    storageRootHash: input.storageRootHash,
    registrarAddress: account.address,
    blockNumber: receipt.blockNumber,
  };
}

export async function registerProofOnZeroGChain(
  input: ZeroGChainRegistrationInput,
  executor: ZeroGChainRegistrationExecutor = executeZeroGChainRegistration,
): Promise<ZeroGChainRegistrationResult> {
  if (!input.caseId.trim()) {
    throw new Error('caseId is required for chain registration.');
  }

  if (!input.localPackageHash.trim()) {
    throw new Error('localPackageHash is required for chain registration.');
  }

  if (!input.storageRootHash.trim()) {
    throw new Error('storageRootHash is required for chain registration.');
  }

  const config = readZeroGChainConfig();
  return executor(config, {
    ...input,
    caseId: input.caseId.trim(),
    localPackageHash: input.localPackageHash.trim(),
    storageRootHash: input.storageRootHash.trim(),
    previousProofHash: input.previousProofHash?.trim() || '',
  });
}
