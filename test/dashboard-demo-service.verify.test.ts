import { Buffer } from 'node:buffer';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

import { ScenarioKey } from '../packages/shared/src';

type DashboardDemoService = typeof import('../apps/web/app/dashboard/demo-run-service');
type AgentActionResult = Awaited<ReturnType<DashboardDemoService['runSimulatedAgentAction']>>;
type EsbuildPluginBuild = {
  onResolve(
    options: { filter: RegExp },
    callback: (args: { path: string }) => { path: string },
  ): void;
};
type EsbuildBuild = (options: {
  entryPoints: string[];
  bundle: boolean;
  format: 'esm';
  platform: 'node';
  write: boolean;
  sourcemap: 'inline';
  plugins: Array<{
    name: string;
    setup(build: EsbuildPluginBuild): void;
  }>;
}) => Promise<{ outputFiles?: Array<{ text: string }> }>;

const repoRoot = process.cwd();
const requireFromVitest = createRequire(createRequire(import.meta.url).resolve('vitest/package.json'));

let dashboardDemoService: DashboardDemoService;

beforeAll(async () => {
  const requireFromVite = createRequire(requireFromVitest.resolve('vite/package.json'));
  const { build } = (await import(pathToFileURL(requireFromVite.resolve('esbuild')).href)) as { build: EsbuildBuild };

  const bundled = await build({
    entryPoints: [resolve(repoRoot, 'apps/web/app/dashboard/demo-run-service.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    sourcemap: 'inline',
    plugins: [
      {
        name: 'arka-source-aliases',
        setup(build) {
          const aliases: Record<string, string> = {
            '@arka/shared': resolve(repoRoot, 'packages/shared/src/index.ts'),
            '@arka/core': resolve(repoRoot, 'packages/core/src/index.ts'),
            '@arka/agent': resolve(repoRoot, 'packages/agent/src/index.ts'),
            '@arka/db': resolve(repoRoot, 'packages/db/src/index.ts'),
          };

          build.onResolve({ filter: /^@arka\/(?:shared|core|agent|db)$/ }, (args) => ({
            path: aliases[args.path],
          }));
        },
      },
    ],
  });

  const serviceSource = bundled.outputFiles[0]?.text;
  if (!serviceSource) {
    throw new Error('Expected esbuild to return the bundled dashboard demo service.');
  }

  dashboardDemoService = (await import(
    `data:text/javascript;base64,${Buffer.from(serviceSource).toString('base64')}`
  )) as DashboardDemoService;
}, 20_000);

function expectAgentActionResponse(response: AgentActionResult): NonNullable<AgentActionResult> {
  expect(response).not.toBeNull();
  return response as NonNullable<AgentActionResult>;
}

describe('dashboard demo service behavior', () => {
  it('creates State A with no agent actions and local-only proof status', async () => {
    const response = await dashboardDemoService.runDashboardScenario(ScenarioKey.STATE_A);

    expect(response.run.scenario.scenarioKey).toBe(ScenarioKey.STATE_A);
    expect(response.run.simulatedAgent.status).toBe('NO_ACTION_NEEDED');
    expect(response.run.simulatedAgent.availableActions).toEqual([]);
    expect(response.run.simulatedAgent.finalDecision).toContain('auto-cleared locally');

    expect(response.run.proofRecord.auditProofStatus).toBe('LOCAL_ONLY');
    expect(response.run.proofRecord.storageStatus).toBe('NOT_STARTED');
    expect(response.run.proofRecord.chainStatus).toBe('NOT_REGISTERED');
    expect(response.run.proofRecord.localPackageHash).toEqual(expect.any(String));
    expect(response.run.proofRecord.storageRootHash).toBeNull();
    expect(response.run.proofRecord.storageTxHash).toBeNull();
    expect(response.run.proofRecord.chainTxHash).toBeNull();
  });

  it('progresses State C through the simulated staff explanation flow', async () => {
    const initial = await dashboardDemoService.runDashboardScenario(ScenarioKey.STATE_C);

    expect(initial.run.scenario.scenarioKey).toBe(ScenarioKey.STATE_C);
    expect(initial.run.simulatedAgent.status).toBe('OWNER_APPROVAL_PENDING');
    expect(initial.run.simulatedAgent.availableActions).toEqual([
      'APPROVE_EXPLANATION_REQUEST',
      'SILENT_LOG_CASE',
    ]);

    const approved = expectAgentActionResponse(
      await dashboardDemoService.runSimulatedAgentAction(initial.run.caseId, 'APPROVE_EXPLANATION_REQUEST'),
    );
    expect(approved.run.simulatedAgent.status).toBe('STAFF_MESSAGE_READY');
    expect(approved.run.simulatedAgent.availableActions).toEqual(['SEND_STAFF_MESSAGE', 'SILENT_LOG_CASE']);
    expect(approved.run.actionLog).toContain('owner_approved_explanation_request');

    const sent = expectAgentActionResponse(
      await dashboardDemoService.runSimulatedAgentAction(initial.run.caseId, 'SEND_STAFF_MESSAGE'),
    );
    expect(sent.run.simulatedAgent.status).toBe('STAFF_MESSAGE_SENT');
    expect(sent.run.simulatedAgent.availableActions).toEqual(['SIMULATE_STAFF_REPLY']);
    expect(sent.run.actionLog).toContain('simulated_staff_message_sent');

    const replied = expectAgentActionResponse(
      await dashboardDemoService.runSimulatedAgentAction(initial.run.caseId, 'SIMULATE_STAFF_REPLY'),
    );
    expect(replied.run.simulatedAgent.status).toBe('STAFF_RESPONSE_RECEIVED');
    expect(replied.run.simulatedAgent.availableActions).toEqual(['RECORD_FINAL_DECISION']);
    expect(replied.run.simulatedAgent.staffResponse).toContain('remade');

    const final = expectAgentActionResponse(
      await dashboardDemoService.runSimulatedAgentAction(initial.run.caseId, 'RECORD_FINAL_DECISION'),
    );
    expect(final.run.simulatedAgent.status).toBe('FINAL_DECISION_RECORDED');
    expect(final.run.simulatedAgent.availableActions).toEqual([]);
    expect(final.run.simulatedAgent.finalDecision).toContain('accepted the explanation');
    expect(final.run.actionLog).toContain('final_decision_recorded');
  });

  it('lets State D record owner review without staff follow-up', async () => {
    const initial = await dashboardDemoService.runDashboardScenario(ScenarioKey.STATE_D);

    expect(initial.run.scenario.scenarioKey).toBe(ScenarioKey.STATE_D);
    expect(initial.run.simulatedAgent.status).toBe('OWNER_REVIEW_PENDING');
    expect(initial.run.simulatedAgent.availableActions).toEqual([
      'APPROVE_EXPLANATION_REQUEST',
      'MARK_OWNER_REVIEWED',
    ]);

    const reviewed = expectAgentActionResponse(
      await dashboardDemoService.runSimulatedAgentAction(initial.run.caseId, 'MARK_OWNER_REVIEWED'),
    );

    expect(reviewed.run.ownerAlertState).toBe('Owner reviewed alert');
    expect(reviewed.run.simulatedAgent.status).toBe('FINAL_DECISION_RECORDED');
    expect(reviewed.run.simulatedAgent.availableActions).toEqual([]);
    expect(reviewed.run.simulatedAgent.finalDecision).toContain('manual follow-up');
    expect(reviewed.run.actionLog).toContain('owner_reviewed_alert');
  });

  it('returns null for invalid or unavailable simulated actions', async () => {
    const stateA = await dashboardDemoService.runDashboardScenario(ScenarioKey.STATE_A);

    expect(dashboardDemoService.parseSimulatedAgentAction('NOT_A_REAL_ACTION')).toBeNull();
    expect(await dashboardDemoService.runSimulatedAgentAction(stateA.run.caseId, 'SEND_STAFF_MESSAGE')).toBeNull();
    expect(await dashboardDemoService.runSimulatedAgentAction('CASE-NOT-FOUND', 'MARK_OWNER_REVIEWED')).toBeNull();
  });

  it('creates an AuditEvent from admin movement simulation input', async () => {
    const response = await dashboardDemoService.runAdminMovementSimulation({
      orderQuantity: 4,
      actualMovementGrams: 132,
    });

    expect(response.run.scenario.label).toBe('Admin Sim');
    expect(response.run.auditEvent.orderQuantity).toBe(4);
    expect(response.run.auditEvent.expectedUsageGrams).toBe(120);
    expect(response.run.auditEvent.actualMovementGrams).toBe(132);
    expect(response.run.auditEvent.status).toBe('OVER_EXPECTED_USAGE');
    expect(response.run.auditEvent.triageOutcome).toBe('REQUEST_EXPLANATION');
    expect(response.run.actionLog).toContain('admin_movement_simulation_saved');
    expect(response.run.proofRecord.auditProofStatus).toBe('LOCAL_ONLY');
    expect(response.run.proofRecord.localPackageHash).toEqual(expect.any(String));
  });
});
