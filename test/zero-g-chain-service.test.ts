import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  formatZeroGChainError,
  readZeroGChainConfig,
  registerProofOnZeroGChain,
  resolveStorageRootHash,
  type ZeroGChainConfig,
  type ZeroGChainRegistrationInput,
} from '../apps/web/app/dashboard/zero-g-chain-service';

const ORIGINAL_ENV = process.env;

afterEach(() => {
  process.env = ORIGINAL_ENV;
  vi.restoreAllMocks();
});

describe('zero-g-chain-service', () => {
  it('reads valid 0G chain env configuration', () => {
    const config = readZeroGChainConfig({
      ZG_CHAIN_RPC_URL: 'https://evmrpc-testnet.0g.ai',
      ZG_CHAIN_ID: '16602',
      ZG_REGISTRAR_PRIVATE_KEY: '0x1111111111111111111111111111111111111111111111111111111111111111',
      AUDIT_PROOF_REGISTRY_ADDRESS: '0x1111111111111111111111111111111111111111',
    });

    expect(config).toEqual({
      rpcUrl: 'https://evmrpc-testnet.0g.ai',
      chainId: 16602,
      registrarPrivateKey: '0x1111111111111111111111111111111111111111111111111111111111111111',
      registryAddress: '0x1111111111111111111111111111111111111111',
    });
  });

  it('resolves a storage root hash from the existing proof record first', () => {
    expect(resolveStorageRootHash('0xexisting-root', '0xmanual-root')).toBe('0xexisting-root');
    expect(resolveStorageRootHash(null, ' 0xmanual-root  ')).toBe('0xmanual-root');
  });

  it('rejects registration when no storage root hash is available', () => {
    expect(() => resolveStorageRootHash(null, null)).toThrow(
      'A real 0G storage root hash is required before chain registration can run.',
    );
  });

  it('uses the injected executor for chain registration', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      ZG_CHAIN_RPC_URL: 'https://evmrpc-testnet.0g.ai',
      ZG_CHAIN_ID: '16602',
      ZG_REGISTRAR_PRIVATE_KEY: '0x1111111111111111111111111111111111111111111111111111111111111111',
      AUDIT_PROOF_REGISTRY_ADDRESS: '0x1111111111111111111111111111111111111111',
    };

    const executor = vi.fn<
      (config: ZeroGChainConfig, input: ZeroGChainRegistrationInput) => Promise<{
        chainTxHash: string;
        storageRootHash: string;
        registrarAddress: string;
        blockNumber: bigint;
      }>
    >().mockResolvedValue({
      chainTxHash: '0xtx',
      storageRootHash: '0xroot',
      registrarAddress: '0x1111111111111111111111111111111111111111',
      blockNumber: 12n,
    });

    const result = await registerProofOnZeroGChain(
      {
        caseId: 'CASE-001',
        proofType: 'AUDIT_EVENT_CREATED',
        localPackageHash: '0xlocal-hash',
        storageRootHash: '0xroot',
      },
      executor,
    );

    expect(result.chainTxHash).toBe('0xtx');
    expect(executor).toHaveBeenCalledWith(
      expect.objectContaining({ chainId: 16602 }),
      expect.objectContaining({
        caseId: 'CASE-001',
        localPackageHash: '0xlocal-hash',
        storageRootHash: '0xroot',
      }),
    );
  });

  it('formats known contract errors into operator-friendly messages', () => {
    expect(
      formatZeroGChainError({
        data: {
          errorName: 'UnauthorizedRegistrar',
        },
      }),
    ).toContain('not authorized');

    expect(
      formatZeroGChainError({
        data: {
          errorName: 'HashAlreadyRegistered',
        },
      }),
    ).toContain('already registered');
  });
});
