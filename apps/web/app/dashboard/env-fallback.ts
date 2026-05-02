import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

let cachedEnvFileValues: Record<string, string> | null = null;

function parseDotEnv(contents: string): Record<string, string> {
  const values: Record<string, string> = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function discoverEnvFiles(): string[] {
  const cwd = process.cwd();
  const roots = [
    cwd,
    resolve(cwd, '..'),
    resolve(cwd, '..', '..'),
    resolve(cwd, '..', '..', '..'),
  ];

  const files: string[] = [];

  for (const root of roots) {
    files.push(join(root, '.env.local'));
    files.push(join(root, '.env'));
  }

  return files;
}

function loadEnvFileValues(): Record<string, string> {
  if (cachedEnvFileValues) {
    return cachedEnvFileValues;
  }

  const merged: Record<string, string> = {};

  for (const filePath of discoverEnvFiles()) {
    if (!existsSync(filePath)) {
      continue;
    }

    Object.assign(merged, parseDotEnv(readFileSync(filePath, 'utf8')));
  }

  cachedEnvFileValues = merged;
  return merged;
}

export function readEnvWithFallback(name: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const direct = env[name]?.trim();

  if (direct) {
    return direct;
  }

  const fallback = loadEnvFileValues()[name]?.trim();
  return fallback || undefined;
}

export function clearEnvFallbackCacheForTests() {
  cachedEnvFileValues = null;
}
