import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const repoRoot = resolve(__dirname, '..');

export default defineConfig({
  resolve: {
    alias: {
      '@arka/agent': resolve(repoRoot, 'packages/agent/src/index.ts'),
      '@arka/core': resolve(repoRoot, 'packages/core/src/index.ts'),
      '@arka/shared': resolve(repoRoot, 'packages/shared/src/index.ts'),
    },
  },
  test: {
    include: ['test/dashboard-demo-service.verify.test.ts'],
  },
});
