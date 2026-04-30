import { DashboardShell } from './dashboard-shell';
import { getDashboardInitialState } from './demo-run-service';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const initialState = await getDashboardInitialState();

  return <DashboardShell initialState={initialState} />;
}
