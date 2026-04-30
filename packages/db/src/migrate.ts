import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDb, getPool } from './client';

async function main() {
  const db = getDb();

  const here = dirname(fileURLToPath(import.meta.url));
  const migrationsFolder = join(here, '..', 'drizzle');

  await migrate(db, { migrationsFolder });
  await getPool().end();
}

main().catch((error) => {
  // Avoid leaking connection strings or secrets. The underlying error message
  // should be enough for local debugging.
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
