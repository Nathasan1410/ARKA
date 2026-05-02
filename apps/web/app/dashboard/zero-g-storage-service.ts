import { Indexer, MemData } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';
import { readEnvWithFallback } from './env-fallback';

export type ZeroGStorageConfig = {
  rpcUrl: string;
  indexerRpc: string;
  signerPrivateKey: string;
};

export type ZeroGStorageUploadResult = {
  storageRootHash: string;
  storageTxHash: string;
};

type ZeroGStorageUploadExecutor = (
  config: ZeroGStorageConfig,
  canonicalJson: string,
) => Promise<ZeroGStorageUploadResult>;

function readRequiredEnv(name: string, env: NodeJS.ProcessEnv): string {
  const value = readEnvWithFallback(name, env);

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export function readZeroGStorageConfig(env: NodeJS.ProcessEnv = process.env): ZeroGStorageConfig {
  const rpcUrl = readRequiredEnv('ZG_CHAIN_RPC_URL', env);
  const indexerRpc = readRequiredEnv('ZG_STORAGE_INDEXER_RPC', env);
  const signerPrivateKey = readRequiredEnv('ZG_REGISTRAR_PRIVATE_KEY', env);

  if (!/^0x[a-fA-F0-9]{64}$/.test(signerPrivateKey)) {
    throw new Error('ZG_REGISTRAR_PRIVATE_KEY must be a 32-byte hex string starting with 0x.');
  }

  return {
    rpcUrl,
    indexerRpc,
    signerPrivateKey,
  };
}

async function executeZeroGStorageUpload(
  config: ZeroGStorageConfig,
  canonicalJson: string,
): Promise<ZeroGStorageUploadResult> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const signer = new ethers.Wallet(config.signerPrivateKey, provider);
  const indexer = new Indexer(config.indexerRpc);
  const data = new TextEncoder().encode(canonicalJson);
  const memData = new MemData(data);

  const [tree, treeErr] = await memData.merkleTree();

  if (treeErr !== null) {
    throw new Error(`Merkle tree error: ${treeErr}`);
  }

  const [tx, uploadErr] = await indexer.upload(memData, config.rpcUrl, signer);

  if (uploadErr !== null) {
    throw new Error(`0G upload error: ${uploadErr}`);
  }

  if ('rootHash' in tx && 'txHash' in tx) {
    return {
      storageRootHash: tx.rootHash,
      storageTxHash: tx.txHash,
    };
  }

  if ('rootHashes' in tx && 'txHashes' in tx && tx.rootHashes.length > 0 && tx.txHashes.length > 0) {
    return {
      storageRootHash: tx.rootHashes[0],
      storageTxHash: tx.txHashes[0],
    };
  }

  const derivedRootHash = tree?.rootHash?.();

  if (typeof derivedRootHash === 'string' && Array.isArray((tx as { txHashes?: unknown }).txHashes)) {
    const txHashes = (tx as { txHashes: string[] }).txHashes;

    if (txHashes[0]) {
      return {
        storageRootHash: derivedRootHash,
        storageTxHash: txHashes[0],
      };
    }
  }

  throw new Error('0G upload returned an unsupported response shape.');
}

export async function storeCanonicalProofOnZeroG(
  canonicalJson: string,
  executor: ZeroGStorageUploadExecutor = executeZeroGStorageUpload,
): Promise<ZeroGStorageUploadResult> {
  if (!canonicalJson.trim()) {
    throw new Error('canonical proof JSON is required for 0G Storage upload.');
  }

  const config = readZeroGStorageConfig();
  return executor(config, canonicalJson);
}
