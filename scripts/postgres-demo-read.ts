import { getDashboardInitialState } from '../apps/web/app/dashboard/demo-run-service';

async function main() {
  const response = await getDashboardInitialState();
  const latest = response.history[0]?.caseId ?? null;
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ latestCaseId: latest, persistenceMode: response.persistence.mode, historyCount: response.history.length }));
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

