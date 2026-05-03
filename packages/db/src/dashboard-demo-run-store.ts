import { desc, eq, sql } from 'drizzle-orm';
import type { ScenarioKey } from '@arka/shared';

import { getDb } from './client';
import { dashboardDemoRuns } from './schema';

export type DashboardDemoRunRow = {
  caseId: string;
  runPayload: unknown;
};

export async function checkDashboardDemoRunStoreHealth(): Promise<void> {
  const db = getDb();
  // Ensure the DB is reachable *and* the expected MVP table exists.
  // If migrations are not applied, this should throw so callers can fall back
  // to the in-memory demo store without over-claiming persistence.
  await db.execute(sql`select 1`);
  await db.select({ caseId: dashboardDemoRuns.caseId }).from(dashboardDemoRuns).limit(1);
}

export async function listDashboardDemoRuns(limit: number): Promise<DashboardDemoRunRow[]> {
  const db = getDb();

  const rows = await db
    .select({ caseId: dashboardDemoRuns.caseId, runPayload: dashboardDemoRuns.runPayload })
    .from(dashboardDemoRuns)
    .orderBy(desc(dashboardDemoRuns.createdAt))
    .limit(limit);

  return rows;
}

export async function getDashboardDemoRun(caseId: string): Promise<unknown | null> {
  const db = getDb();

  const rows = await db
    .select({ runPayload: dashboardDemoRuns.runPayload })
    .from(dashboardDemoRuns)
    .where(eq(dashboardDemoRuns.caseId, caseId))
    .limit(1);

  return (rows[0]?.runPayload as unknown) ?? null;
}

export async function clearDashboardDemoRuns(): Promise<void> {
  const db = getDb();
  await db.delete(dashboardDemoRuns);
}

export async function upsertDashboardDemoRun(args: {
  caseId: string;
  scenarioKey: ScenarioKey;
  runPayload: unknown;
}): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db
    .insert(dashboardDemoRuns)
    .values({
      caseId: args.caseId,
      scenarioKey: args.scenarioKey,
      runPayload: args.runPayload,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: dashboardDemoRuns.caseId,
      set: {
        scenarioKey: args.scenarioKey,
        runPayload: args.runPayload,
        updatedAt: now,
      },
    });
}
