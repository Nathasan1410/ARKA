import { getAgentRuntimeCommandSecretTargetIds } from "../cli/command-secret-targets.js";
import { getRuntimeConfig, readConfigFileSnapshotForWrite } from "../config/io.js";
import { setRuntimeConfigSnapshot } from "../config/runtime-snapshot.js";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import { isSecretRef } from "../config/types.secrets.js";
import type { RuntimeEnv } from "../runtime.js";

const arkaDiag = (message: string) => {
  if (process.env.OPENCLAW_ARKA_DIAG === "1") {
    console.error(`[arka-diag] ${new Date().toISOString()} ${message}`);
  }
};

const SOURCE_CONFIG_SNAPSHOT_TIMEOUT_MS = 5_000;

async function readConfigFileSnapshotForWriteBestEffort() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      readConfigFileSnapshotForWrite(),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), SOURCE_CONFIG_SNAPSHOT_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export async function resolveAgentRuntimeConfig(
  runtime: RuntimeEnv,
  params?: { runtimeTargetsChannelSecrets?: boolean },
): Promise<{
  loadedRaw: OpenClawConfig;
  sourceConfig: OpenClawConfig;
  cfg: OpenClawConfig;
}> {
  arkaDiag("runtime-config before getRuntimeConfig");
  const loadedRaw = getRuntimeConfig();
  arkaDiag("runtime-config after getRuntimeConfig");
  const sourceConfig = await (async () => {
    try {
      arkaDiag("runtime-config before readConfigFileSnapshotForWrite");
      const result = await readConfigFileSnapshotForWriteBestEffort();
      arkaDiag("runtime-config after readConfigFileSnapshotForWrite");
      if (!result) {
        return loadedRaw;
      }
      const { snapshot } = result;
      if (snapshot.valid) {
        return snapshot.resolved;
      }
    } catch {
      // Fall back to runtime-loaded config when source snapshot is unavailable.
    }
    return loadedRaw;
  })();
  const includeChannelTargets = params?.runtimeTargetsChannelSecrets === true;
  arkaDiag("runtime-config before hasAgentRuntimeSecretRefs");
  const needsSecretResolution = hasAgentRuntimeSecretRefs({
    config: loadedRaw,
    includeChannelTargets,
  });
  arkaDiag(`runtime-config after hasAgentRuntimeSecretRefs needs=${needsSecretResolution}`);
  const cfg = needsSecretResolution
    ? (
        await (async () => {
          arkaDiag("runtime-config before import command-config-resolution");
          const runtimeModule = await import("../cli/command-config-resolution.runtime.js");
          arkaDiag("runtime-config after import command-config-resolution");
          arkaDiag("runtime-config before resolveCommandConfigWithSecrets");
          const resolved = await runtimeModule.resolveCommandConfigWithSecrets({
            config: loadedRaw,
            commandName: "agent",
            targetIds: getAgentRuntimeCommandSecretTargetIds({
              includeChannelTargets,
            }),
            runtime,
          });
          arkaDiag("runtime-config after resolveCommandConfigWithSecrets");
          return resolved;
        })()
      ).resolvedConfig
    : loadedRaw;
  arkaDiag("runtime-config before setRuntimeConfigSnapshot");
  setRuntimeConfigSnapshot(cfg, sourceConfig);
  arkaDiag("runtime-config after setRuntimeConfigSnapshot");
  return { loadedRaw, sourceConfig, cfg };
}

function hasNestedSecretRef(value: unknown): boolean {
  if (isSecretRef(value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some((entry) => hasNestedSecretRef(entry));
  }
  if (!value || typeof value !== "object") {
    return false;
  }
  return Object.values(value).some((entry) => hasNestedSecretRef(entry));
}

function hasAgentRuntimeSecretRefs(params: {
  config: OpenClawConfig;
  includeChannelTargets: boolean;
}): boolean {
  const { config } = params;
  if (hasNestedSecretRef(config.models?.providers)) {
    return true;
  }
  if (hasNestedSecretRef(config.agents?.defaults?.memorySearch?.remote?.apiKey)) {
    return true;
  }
  if (
    Array.isArray(config.agents?.list) &&
    config.agents.list.some((agent) => hasNestedSecretRef(agent?.memorySearch?.remote?.apiKey))
  ) {
    return true;
  }
  if (hasNestedSecretRef(config.messages?.tts?.providers)) {
    return true;
  }
  if (hasNestedSecretRef(config.skills?.entries)) {
    return true;
  }
  if (hasNestedSecretRef(config.tools?.web?.search)) {
    return true;
  }
  if (
    config.plugins?.entries &&
    Object.values(config.plugins.entries).some((entry) =>
      hasNestedSecretRef({
        webSearch: entry?.config?.webSearch,
        webFetch: entry?.config?.webFetch,
      }),
    )
  ) {
    return true;
  }
  return params.includeChannelTargets ? hasNestedSecretRef(config.channels) : false;
}
