import { createPublicClient, createWalletClient, defineChain, http, isAddress, type Address, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import type { ProofType } from '@arka/shared';
import { readEnvWithFallback } from './env-fallback';

const auditProofRegistryAbi = [
  {
    type: 'error',
    name: 'UnauthorizedAdmin',
    inputs: [{ name: 'caller', type: 'address' }],
  },
  {
    type: 'error',
    name: 'UnauthorizedRegistrar',
    inputs: [{ name: 'caller', type: 'address' }],
  },
  {
    type: 'error',
    name: 'AlreadyRegistrar',
    inputs: [{ name: 'registrar', type: 'address' }],
  },
  {
    type: 'error',
    name: 'NotRegistrar',
    inputs: [{ name: 'registrar', type: 'address' }],
  },
  {
    type: 'error',
    name: 'CannotRemoveAdmin',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EmptyCaseId',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EmptyPackageHash',
    inputs: [],
  },
  {
    type: 'error',
    name: 'HashAlreadyRegistered',
    inputs: [{ name: 'packageHash', type: 'string' }],
  },
  {
    type: 'error',
    name: 'ProofNotFound',
    inputs: [{ name: 'packageHash', type: 'string' }],
  },
  {
    type: 'function',
    name: 'getProof',
    stateMutability: 'view',
    inputs: [{ name: '_localPackageHash', type: 'string' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'caseId', type: 'string' },
          { name: 'proofType', type: 'string' },
          { name: 'localPackageHash', type: 'string' },
          { name: 'storageRootHash', type: 'string' },
          { name: 'previousProofHash', type: 'string' },
          { name: 'registeredBy', type: 'address' },
          { name: 'registeredAt', type: 'uint256' },
        ],
      },
    ],
  },
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
  const value = readEnvWithFallback(name, env);

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

  try {
    await publicClient.readContract({
      address: config.registryAddress,
      abi: auditProofRegistryAbi,
      functionName: 'getProof',
      args: [input.localPackageHash],
    });

    throw new Error(
      `This proof hash is already registered on 0G Chain: ${input.localPackageHash}. Use a fresh case or avoid retrying the same proof after a successful anchor.`,
    );
  } catch (error) {
    if (getKnownContractErrorName(error) !== 'ProofNotFound') {
      if (error instanceof Error && error.message.includes('already registered on 0G Chain')) {
        throw error;
      }

      throw new Error(formatZeroGChainError(error));
    }
  }

  let txHash: Hex;

  try {
    txHash = await walletClient.writeContract({
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
  } catch (error) {
    throw new Error(formatZeroGChainError(error));
  }

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

function getKnownContractErrorName(error: unknown): string | null {
  const queue: unknown[] = [error];
  const seen = new Set<unknown>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seen.has(current) || typeof current !== 'object') {
      continue;
    }

    seen.add(current);

    if ('data' in current && current.data && typeof current.data === 'object') {
      const data = current.data as { errorName?: unknown };
      if (typeof data.errorName === 'string') {
        return data.errorName;
      }
    }

    if ('errorName' in current && typeof (current as { errorName?: unknown }).errorName === 'string') {
      return (current as { errorName: string }).errorName;
    }

    if ('walk' in current && typeof (current as { walk?: unknown }).walk === 'function') {
      try {
        let found: string | null = null;
        (current as { walk: (fn: (err: unknown) => boolean | void) => void }).walk((nested) => {
          const nestedName = getKnownContractErrorName(nested);
          if (nestedName) {
            found = nestedName;
            return true;
          }

          return false;
        });
        if (found) {
          return found;
        }
      } catch {
        // Ignore walk errors and continue with generic traversal.
      }
    }

    if ('cause' in current) {
      queue.push((current as { cause?: unknown }).cause);
    }
  }

  return null;
}

export function formatZeroGChainError(error: unknown): string {
  const errorName = getKnownContractErrorName(error);

  if (errorName === 'UnauthorizedRegistrar') {
    return 'The configured registrar wallet is not authorized in AuditProofRegistry. Add this wallet as a registrar on the deployed contract first.';
  }

  if (errorName === 'HashAlreadyRegistered') {
    return 'This proof hash was already registered on 0G Chain. Avoid retrying the same proof after a successful anchor, or generate a fresh case.';
  }

  if (errorName === 'EmptyCaseId') {
    return '0G Chain registration failed because caseId was empty.';
  }

  if (errorName === 'EmptyPackageHash') {
    return '0G Chain registration failed because localPackageHash was empty.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '0G Chain registration failed.';
}
