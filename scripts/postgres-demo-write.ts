import { ScenarioKey } from '../packages/shared/src';
import { runDashboardScenario } from '../apps/web/app/dashboard/demo-run-service';

async function main() {
  const response = await runDashboardScenario(ScenarioKey.STATE_C);
  // Output a tiny stable payload so wrapper scripts can parse it.
  // Avoid printing any env vars or connection strings.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ caseId: response.run.caseId, persistenceMode: response.persistence.mode }));
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

