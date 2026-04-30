import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { createAuditEventFromScenario } from '../packages/core/src';
import { TriageSource, triageAuditEvent } from '../packages/agent/src';
import { demoScenarioSeeds, demoWorldSeed, TriageOutcome } from '../packages/shared/src';

const repoRoot = process.cwd();
const openClawRoot = join(repoRoot, 'openclaw');
const arkaWorkspaceRoot = join(openClawRoot, 'workspaces', 'arka');
const arkaSkillPath = join(arkaWorkspaceRoot, 'skills', 'arka-audit', 'SKILL.md');
const arkaPluginRoot = join(openClawRoot, 'extensions', 'arka-audit');
const arkaPluginManifestPath = join(arkaPluginRoot, 'openclaw.plugin.json');
const arkaPluginEntrypointPath = join(arkaPluginRoot, 'index.ts');
const arkaPluginGetAuditEventPath = join(arkaPluginRoot, 'src', 'get-audit-event.ts');

const expectedTriageByScenario = {
  STATE_A: TriageOutcome.AUTO_CLEAR,
  STATE_C: TriageOutcome.REQUEST_EXPLANATION,
  STATE_D: TriageOutcome.ESCALATE,
} as const;

function readText(path: string): string {
  return readFileSync(path, 'utf8');
}

function createDemoAuditEvent(scenarioKey: keyof typeof demoScenarioSeeds) {
  return createAuditEventFromScenario(demoScenarioSeeds[scenarioKey], {
    auditEventId: `verify-${scenarioKey.toLowerCase()}`,
    caseId: `case-${scenarioKey.toLowerCase()}`,
    productName: demoWorldSeed.productName,
    inventoryItemName: demoWorldSeed.inventoryItemName,
    containerId: demoWorldSeed.containerId,
    handlerName: demoWorldSeed.handler.name,
    cashierName: demoWorldSeed.cashier.name,
    ownerName: demoWorldSeed.owner.name,
    createdAt: '2026-04-30T00:00:00.000Z',
  });
}

function listTrackedEnvFiles(repoDir: string): string[] {
  // This test intentionally checks *tracked* files only.
  // We keep secrets outside the repo (e.g. in C:\\Dev\\_openclaw-smoke),
  // but we don't want local ignored/untracked files to make verification slow/flaky.
  const stdout = execFileSync('git', ['ls-files', '-z'], {
    cwd: repoDir,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  const paths = stdout
    .toString('utf8')
    .split('\0')
    .map((p) => p.trim())
    .filter(Boolean);

  return paths.filter((p) => {
    if (p.endsWith('.env.example')) return false;
    return p === '.env' || p.startsWith('.env.') || p.includes('/.env') || p.includes('\\.env');
  });
}

function listOpenClawEnvFiles(): string[] {
  const candidateRoots = [openClawRoot, arkaWorkspaceRoot];
  const matches: string[] = [];

  for (const candidateRoot of candidateRoots) {
    for (const envName of ['.env', '.env.local', '.env.development', '.env.production']) {
      const candidatePath = join(candidateRoot, envName);

      if (existsSync(candidatePath)) {
        matches.push(candidatePath);
      }
    }
  }

  return matches;
}

describe('OpenClaw local fork coverage', () => {
  it('keeps OpenClaw as an attributed local source fork', () => {
    const packageJson = JSON.parse(readText(join(openClawRoot, 'package.json'))) as {
      name: string;
      license: string;
      version: string;
    };
    const license = readText(join(openClawRoot, 'LICENSE'));

    expect(packageJson.name).toBe('openclaw');
    expect(packageJson.version).toBe('2026.4.27');
    expect(packageJson.license).toBe('MIT');
    expect(license).toContain('MIT License');
    expect(statSync(join(openClawRoot, 'pnpm-lock.yaml')).isFile()).toBe(true);
  });

  it('keeps local OpenClaw secrets out of the repo tree', () => {
    const envFiles = [...listTrackedEnvFiles(repoRoot), ...listOpenClawEnvFiles()];

    expect(envFiles).toEqual([]);
  }, 30_000);
});

describe('ARKA OpenClaw workspace coverage', () => {
  it('defines the ARKA workspace files expected by OpenClaw', () => {
    expect(statSync(join(arkaWorkspaceRoot, 'AGENTS.md')).isFile()).toBe(true);
    expect(statSync(join(arkaWorkspaceRoot, 'SOUL.md')).isFile()).toBe(true);
    expect(statSync(join(arkaWorkspaceRoot, 'TOOLS.md')).isFile()).toBe(true);
    expect(statSync(arkaSkillPath).isFile()).toBe(true);
  });

  it('documents immutable AuditEvent facts and safe ARKA outputs', () => {
    const skill = readText(arkaSkillPath);

    expect(skill).toContain('Read or fetch the `AuditEvent` first');
    expect(skill).toContain('Do not recalculate or overwrite expected quantity');
    expect(skill).toContain('triageOutcome');
    expect(skill).toContain('CaseNote');
    expect(skill).toContain('ActionLog');
    expect(skill).toContain('StaffClarificationRequest draft');
    expect(skill).toContain('Do not');
    expect(skill).toContain('upload to 0G Storage');
    expect(skill).toContain('register on 0G Chain');
    expect(skill).toContain('accuse staff of theft or fraud');
  });
});

describe('ARKA OpenClaw plugin skeleton coverage', () => {
  it('declares a read-only arka-audit bundled extension', () => {
    const packageJson = JSON.parse(readText(join(arkaPluginRoot, 'package.json'))) as {
      name: string;
      private: boolean;
      openclaw: { extensions: string[] };
    };
    const manifest = JSON.parse(readText(arkaPluginManifestPath)) as {
      id: string;
      activation: { onStartup: boolean };
      configSchema: { additionalProperties: boolean };
    };

    expect(packageJson.name).toBe('@openclaw/arka-audit');
    expect(packageJson.private).toBe(true);
    expect(packageJson.openclaw.extensions).toEqual(['./index.ts']);
    expect(manifest.id).toBe('arka-audit');
    expect(manifest.activation.onStartup).toBe(true);
    expect(manifest.configSchema.additionalProperties).toBe(false);
  });

  it('keeps the first plugin tool read-only and unavailable until backend wiring exists', () => {
    const entrypoint = readText(arkaPluginEntrypointPath);
    const getAuditEventTool = readText(arkaPluginGetAuditEventPath);

    expect(entrypoint).toContain('definePluginEntry');
    expect(entrypoint).toContain('registerGetAuditEventTool');
    expect(getAuditEventTool).toContain('get_audit_event');
    expect(getAuditEventTool).toContain('status: "unavailable"');
    expect(getAuditEventTool).toContain('No AuditEvent facts were read or mutated');
    expect(getAuditEventTool).toContain('"database writes"');
    expect(getAuditEventTool).toContain('"Telegram delivery"');
    expect(getAuditEventTool).toContain('"0G Storage upload"');
    expect(getAuditEventTool).toContain('"0G Chain registration"');
  });
});

describe('Backend/core AuditEvent coverage for OpenClaw handoff', () => {
  for (const scenarioKey of Object.keys(demoScenarioSeeds) as Array<keyof typeof demoScenarioSeeds>) {
    it(`creates canonical immutable facts for ${scenarioKey}`, () => {
      const scenario = demoScenarioSeeds[scenarioKey];
      const auditEvent = createDemoAuditEvent(scenarioKey);

      expect(auditEvent.scenarioKey).toBe(scenario.scenarioKey);
      expect(auditEvent.caseType).toBe(scenario.caseType);
      expect(auditEvent.expectedUsageGrams).toBe(scenario.expectedUsageGrams);
      expect(auditEvent.actualMovementGrams).toBe(scenario.actualMovementGrams);
      expect(auditEvent.variancePercent).toBeCloseTo(scenario.variancePercent);
      expect(auditEvent.status).toBe(scenario.status);
      expect(auditEvent.severity).toBe(scenario.severity);
      expect(auditEvent.triageOutcome).toBeNull();
      expect(auditEvent.auditProofStatus).toBe('LOCAL_ONLY');
      expect(auditEvent.storageStatus).toBe('NOT_STARTED');
      expect(auditEvent.chainStatus).toBe('NOT_REGISTERED');
    });
  }
});

describe('Agent fallback coverage before real OpenClaw plugin integration', () => {
  for (const scenarioKey of Object.keys(demoScenarioSeeds) as Array<keyof typeof demoScenarioSeeds>) {
    it(`triages ${scenarioKey} through deterministic fallback without mutating facts`, () => {
      const auditEvent = createDemoAuditEvent(scenarioKey);
      const before = structuredClone(auditEvent);

      const triaged = triageAuditEvent(auditEvent);

      expect(auditEvent).toEqual(before);
      expect(triaged).not.toBe(auditEvent);
      expect(triaged.expectedUsageGrams).toBe(before.expectedUsageGrams);
      expect(triaged.actualMovementGrams).toBe(before.actualMovementGrams);
      expect(triaged.variancePercent).toBe(before.variancePercent);
      expect(triaged.status).toBe(before.status);
      expect(triaged.severity).toBe(before.severity);
      expect(triaged.triageOutcome).toBe(expectedTriageByScenario[scenarioKey]);
      expect(triaged.triageSource).toBe(TriageSource.DETERMINISTIC_FALLBACK);
    });
  }

  it('falls back when no OpenClaw runtime adapter is available', () => {
    const auditEvent = createDemoAuditEvent('STATE_D');
    let runtimeCalled = false;

    const triaged = triageAuditEvent(auditEvent, {
      openClawRuntime: {
        isAvailable: () => false,
        triageAuditEvent: () => {
          runtimeCalled = true;
          return TriageOutcome.AUTO_CLEAR;
        },
      },
    });

    expect(runtimeCalled).toBe(false);
    expect(triaged.triageOutcome).toBe(TriageOutcome.ESCALATE);
    expect(triaged.triageSource).toBe(TriageSource.DETERMINISTIC_FALLBACK);
  });
});
