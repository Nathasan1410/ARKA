import { spawn } from 'node:child_process';

function run(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    const spawnCmd = isWin ? 'cmd.exe' : cmd;
    const spawnArgs = isWin ? ['/c', cmd, ...args] : args;

    const child = spawn(spawnCmd, spawnArgs, {
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += String(chunk)));
    child.stderr.on('data', (chunk) => (stderr += String(chunk)));

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Command failed: ${cmd} ${args.join(' ')}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

function safeParseJson(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for Postgres verification.');
  }

  const pnpmBin = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

  const baseEnv = {
    DATABASE_URL: databaseUrl,
    ARKA_DEMO_REPOSITORY: 'postgres',
  };

  // 1) Apply migrations (idempotent).
  await run(pnpmBin, ['--filter', '@arka/db', 'run', 'migrate'], baseEnv);

  // 2) Write a run in a fresh process.
  const writeOut = await run(pnpmBin, ['exec', 'tsx', '--tsconfig', 'apps/web/tsconfig.json', 'scripts/postgres-demo-write.ts'], baseEnv);
  const writeJson = safeParseJson(writeOut);
  if (!writeJson?.caseId) {
    throw new Error(`Expected write step to return JSON with caseId, got: ${writeOut}`);
  }

  // 3) Read latest history in a new process (restart simulation).
  const readOut = await run(pnpmBin, ['exec', 'tsx', '--tsconfig', 'apps/web/tsconfig.json', 'scripts/postgres-demo-read.ts'], baseEnv);
  const readJson = safeParseJson(readOut);
  if (!readJson?.latestCaseId) {
    throw new Error(`Expected read step to return JSON with latestCaseId, got: ${readOut}`);
  }

  if (readJson.latestCaseId !== writeJson.caseId) {
    throw new Error(`Expected latestCaseId=${writeJson.caseId}, got ${readJson.latestCaseId}`);
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      ok: true,
      caseId: writeJson.caseId,
      writePersistenceMode: writeJson.persistenceMode,
      readPersistenceMode: readJson.persistenceMode,
      historyCount: readJson.historyCount,
    }),
  );
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
