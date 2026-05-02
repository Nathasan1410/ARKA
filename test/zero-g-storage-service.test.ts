import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  readZeroGStorageConfig,
  storeCanonicalProofOnZeroG,
  type ZeroGStorageConfig,
} from '../apps/web/app/dashboard/zero-g-storage-service';

const ORIGINAL_ENV = process.env;

afterEach(() => {
  process.env = ORIGINAL_ENV;
  vi.restoreAllMocks();
});

describe('zero-g-storage-service', () => {
  it('reads valid 0G storage env configuration', () => {
    const config = readZeroGStorageConfig({
      ZG_CHAIN_RPC_URL: 'https://evmrpc-testnet.0g.ai',
      ZG_STORAGE_INDEXER_RPC: 'https://indexer-storage-testnet-turbo.0g.ai',
      ZG_REGISTRAR_PRIVATE_KEY: '0x1111111111111111111111111111111111111111111111111111111111111111',
    });

    expect(config).toEqual({
      rpcUrl: 'https://evmrpc-testnet.0g.ai',
      indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
      signerPrivateKey: '0x1111111111111111111111111111111111111111111111111111111111111111',
    });
  });

  it('rejects empty canonical proof json', async () => {
    await expect(storeCanonicalProofOnZeroG('   ')).rejects.toThrow(
      'canonical proof JSON is required for 0G Storage upload.',
    );
  });

  it('uses the injected executor for uploads', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      ZG_CHAIN_RPC_URL: 'https://evmrpc-testnet.0g.ai',
      ZG_STORAGE_INDEXER_RPC: 'https://indexer-storage-testnet-turbo.0g.ai',
      ZG_REGISTRAR_PRIVATE_KEY: '0x1111111111111111111111111111111111111111111111111111111111111111',
    };

    const executor = vi.fn<
      (config: ZeroGStorageConfig, canonicalJson: string) => Promise<{ storageRootHash: string; storageTxHash: string }>
    >().mockResolvedValue({
      storageRootHash: '0xroot',
      storageTxHash: '0xtx',
    });

    const result = await storeCanonicalProofOnZeroG('{"ok":true}', executor);

    expect(result).toEqual({
      storageRootHash: '0xroot',
      storageTxHash: '0xtx',
    });
    expect(executor).toHaveBeenCalledWith(
      expect.objectContaining({
        rpcUrl: 'https://evmrpc-testnet.0g.ai',
        indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
      }),
      '{"ok":true}',
    );
  });
});
