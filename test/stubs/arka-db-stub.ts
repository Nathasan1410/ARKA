// Test-only stub for `@arka/db`.
//
// The dashboard demo-service unit test bundles `apps/web/app/dashboard/demo-run-service.ts`
// into an ESM data URL. If we alias `@arka/db` to the real package source, it pulls in
// `pg` which uses dynamic `require()` internally and breaks in that bundling mode.
//
// This stub keeps the dashboard demo-service test focused on the in-memory repository path.

export async function checkDashboardDemoRunStoreHealth(): Promise<void> {
  throw new Error('Postgres demo store is not available in this test stub.');
}

export async function listDashboardDemoRuns(): Promise<Array<{ caseId: string; runPayload: unknown }>> {
  return [];
}

export async function getDashboardDemoRun(): Promise<unknown | null> {
  return null;
}

export async function upsertDashboardDemoRun(): Promise<void> {
  // no-op for in-memory mode
}

export async function persistDemoOperationalEvidence(): Promise<void> {
  // no-op for in-memory mode
}

