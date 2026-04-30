import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Repo-root verification tests import package sources (packages/*/src).
// Those sources import workspace packages like "@arka/shared", but the packages
// are not built to dist/ in this flow. Alias them to source entrypoints.
export default defineConfig({
  resolve: {
    alias: {
      '@arka/shared': resolve(__dirname, 'packages/shared/src/index.ts'),
      '@arka/core': resolve(__dirname, 'packages/core/src/index.ts'),
      '@arka/agent': resolve(__dirname, 'packages/agent/src/index.ts'),
      '@arka/db': resolve(__dirname, 'packages/db/src/index.ts'),
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
  },
});

