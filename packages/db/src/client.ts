import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __arkaPgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __arkaDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

export function getPool(): Pool {
  if (!globalThis.__arkaPgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required to initialize the Postgres pool.');
    }

    globalThis.__arkaPgPool = new Pool({ connectionString });
  }

  return globalThis.__arkaPgPool;
}

export function getDb() {
  if (!globalThis.__arkaDb) {
    globalThis.__arkaDb = drizzle(getPool(), { schema });
  }

  return globalThis.__arkaDb;
}

