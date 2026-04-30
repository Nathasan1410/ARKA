import { resolveSendableOutboundReplyParts } from "openclaw/plugin-sdk/reply-payload";
import { listAgentIds } from "../agents/agent-scope.js";
import { formatCliCommand } from "../cli/command-format.js";
import type { CliDeps } from "../cli/deps.types.js";
import { withProgress } from "../cli/progress.js";
import { getRuntimeConfig } from "../config/config.js";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import { callGateway, randomIdempotencyKey } from "../gateway/call.js";
import { GATEWAY_CLIENT_MODES, GATEWAY_CLIENT_NAMES } from "../gateway/protocol/client-info.js";
import { routeLogsToStderr } from "../logging/console.js";
import { normalizeAgentId } from "../routing/session-key.js";
import { type RuntimeEnv, writeRuntimeJson } from "../runtime.js";
import { normalizeOptionalString } from "../shared/string-coerce.js";
import { normalizeMessageChannel } from "../utils/message-channel.js";
import { agentCommand } from "./agent.js";
import { resolveSessionKeyForRequest } from "./agent/session.js";

type AgentGatewayResult = {
  payloads?: Array<{
    text?: string;
    mediaUrl?: string | null;
    mediaUrls?: string[];
  }>;
  meta?: unknown;
};

type GatewayAgentResponse = {
  runId?: string;
  status?: string;
  summary?: string;
  result?: AgentGatewayResult;
};

const NO_GATEWAY_TIMEOUT_MS = 2_147_000_000;
const EMBEDDED_FALLBACK_META = {
  transport: "embedded",
  fallbackFrom: "gateway",
} as const;

const arkaDiag = (message: string) => {
  if (process.env.OPENCLAW_ARKA_DIAG === "1") {
    console.error(`[arka-diag] ${new Date().toISOString()} ${message}`);
  }
};

export type AgentCliOpts = {
  message: string;
  agent?: string;
  model?: string;
  to?: string;
  sessionId?: string;
  thinking?: string;
  verbose?: string;
  json?: boolean;
  timeout?: string;
  deliver?: boolean;
  channel?: string;
  replyTo?: string;
  replyChannel?: string;
  replyAccount?: string;
  bestEffortDeliver?: boolean;
  lane?: string;
  runId?: string;
  extraSystemPrompt?: string;
  local?: boolean;
  runtimePluginIds?: string[];
  installBundledRuntimeDeps?: boolean;
  skipProviderRuntimeHooks?: boolean;
  disableTools?: boolean;
};

function protectJsonStdout(opts: Pick<AgentCliOpts, "json">): void {
  if (opts.json === true) {
    routeLogsToStderr();
  }
}

function parseTimeoutSeconds(opts: { cfg: OpenClawConfig; timeout?: string }) {
  const raw =
    opts.timeout !== undefined
      ? Number.parseInt(opts.timeout, 10)
      : (opts.cfg.agents?.defaults?.timeoutSeconds ?? 600);
  if (Number.isNaN(raw) || raw < 0) {
    throw new Error("--timeout must be a non-negative integer (seconds; 0 means no timeout)");
  }
  return raw;
}

function formatPayloadForLog(payload: {
  text?: string;
  mediaUrls?: string[];
  mediaUrl?: string | null;
}) {
  const parts = resolveSendableOutboundReplyParts({
    text: payload.text,
    mediaUrls: payload.mediaUrls,
    mediaUrl: typeof payload.mediaUrl === "string" ? payload.mediaUrl : undefined,
  });
  const lines: string[] = [];
  if (parts.text) {
    lines.push(parts.text.trimEnd());
  }
  for (const url of parts.mediaUrls) {
    lines.push(`MEDIA:${url}`);
  }
  return lines.join("\n").trimEnd();
}

function parseRuntimePluginIdsFromEnv(): string[] | undefined {
  const raw = process.env.OPENCLAW_AGENT_RUNTIME_PLUGIN_IDS?.trim();
  if (!raw) {
    return undefined;
  }
  const pluginIds = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return pluginIds.length > 0 ? [...new Set(pluginIds)] : undefined;
}

function parseInstallBundledRuntimeDepsFromEnv(): boolean | undefined {
  const raw = process.env.OPENCLAW_AGENT_INSTALL_BUNDLED_RUNTIME_DEPS?.trim().toLowerCase();
  if (!raw) {
    return undefined;
  }
  if (["0", "false", "no", "off"].includes(raw)) {
    return false;
  }
  if (["1", "true", "yes", "on"].includes(raw)) {
    return true;
  }
  return undefined;
}

function parseSkipProviderRuntimeHooksFromEnv(): boolean | undefined {
  const raw = process.env.OPENCLAW_AGENT_SKIP_PROVIDER_RUNTIME_HOOKS?.trim().toLowerCase();
  if (!raw) {
    return undefined;
  }
  if (["0", "false", "no", "off"].includes(raw)) {
    return false;
  }
  if (["1", "true", "yes", "on"].includes(raw)) {
    return true;
  }
  return undefined;
}

function parseDisableToolsFromEnv(): boolean | undefined {
  const raw = process.env.OPENCLAW_AGENT_DISABLE_TOOLS?.trim().toLowerCase();
  if (!raw) {
    return undefined;
  }
  if (["0", "false", "no", "off"].includes(raw)) {
    return false;
  }
  if (["1", "true", "yes", "on"].includes(raw)) {
    return true;
  }
  return undefined;
}

export async function agentViaGatewayCommand(opts: AgentCliOpts, runtime: RuntimeEnv) {
  protectJsonStdout(opts);
  const body = (opts.message ?? "").trim();
  if (!body) {
    throw new Error("Message (--message) is required");
  }
  if (!opts.to && !opts.sessionId && !opts.agent) {
    throw new Error("Pass --to <E.164>, --session-id, or --agent to choose a session");
  }

  const cfg = getRuntimeConfig();
  const agentIdRaw = opts.agent?.trim();
  const agentId = agentIdRaw ? normalizeAgentId(agentIdRaw) : undefined;
  if (agentId) {
    const knownAgents = listAgentIds(cfg);
    if (!knownAgents.includes(agentId)) {
      throw new Error(
        `Unknown agent id "${agentIdRaw}". Use "${formatCliCommand("openclaw agents list")}" to see configured agents.`,
      );
    }
  }
  const timeoutSeconds = parseTimeoutSeconds({ cfg, timeout: opts.timeout });
  // Gateway "agent" is intentionally two-phase:
  // 1) immediate ack with { status: "accepted", runId }
  // 2) later terminal response written to gateway dedupe (and optionally emitted as a second res frame)
  //
  // A single long-lived expectFinal RPC is fragile because `callGateway()` itself has a wrapper timeout,
  // and server-side abort enforcement is sweep-based (see gateway maintenance). Instead, do:
  // start (no expectFinal) -> agent.wait -> fetch cached terminal payload (agent + same idempotencyKey).
  const overallWaitMs =
    timeoutSeconds === 0
      ? NO_GATEWAY_TIMEOUT_MS // no timeout (timer-safe max)
      : Math.max(10_000, (timeoutSeconds + 120) * 1000);
  const connectTimeoutMs = 15_000;

  const sessionKey = resolveSessionKeyForRequest({
    cfg,
    agentId,
    to: opts.to,
    sessionId: opts.sessionId,
  }).sessionKey;

  const channel = normalizeMessageChannel(opts.channel);
  const idempotencyKey = normalizeOptionalString(opts.runId) || randomIdempotencyKey();

  const response: GatewayAgentResponse = await withProgress(
    {
      label: "Waiting for agent reply…",
      indeterminate: true,
      enabled: opts.json !== true,
    },
    async () => {
      const agentParams = {
        message: body,
        agentId,
        model: opts.model,
        to: opts.to,
        replyTo: opts.replyTo,
        sessionId: opts.sessionId,
        sessionKey,
        thinking: opts.thinking,
        deliver: Boolean(opts.deliver),
        channel,
        replyChannel: opts.replyChannel,
        replyAccountId: opts.replyAccount,
        bestEffortDeliver: opts.bestEffortDeliver,
        timeout: timeoutSeconds,
        lane: opts.lane,
        extraSystemPrompt: opts.extraSystemPrompt,
        idempotencyKey,
      };

      // Phase 1: start (or read cached terminal result).
      const started: GatewayAgentResponse = await callGateway({
        method: "agent",
        params: agentParams,
        expectFinal: false,
        timeoutMs: connectTimeoutMs,
        clientName: GATEWAY_CLIENT_NAMES.CLI,
        mode: GATEWAY_CLIENT_MODES.CLI,
      });
      if (started?.status !== "accepted") {
        return started;
      }

      const runId = normalizeOptionalString(started.runId) ?? idempotencyKey;
      const deadlineMs = Date.now() + overallWaitMs;

      // Phase 2: wait (poll). `agent.wait` returns status only; terminal payload is fetched via cached agent dedupe.
      while (Date.now() < deadlineMs) {
        const remainingMs = Math.max(0, deadlineMs - Date.now());
        const waitSliceMs = Math.min(30_000, remainingMs);
        const waitRes = (await callGateway({
          method: "agent.wait",
          params: {
            runId,
            timeoutMs: waitSliceMs,
          },
          expectFinal: false,
          timeoutMs: waitSliceMs + connectTimeoutMs,
          clientName: GATEWAY_CLIENT_NAMES.CLI,
          mode: GATEWAY_CLIENT_MODES.CLI,
        })) as { status?: string } | undefined;
        if (waitRes?.status && waitRes.status !== "timeout") {
          break;
        }
        if (waitSliceMs <= 0) {
          break;
        }
      }

      // Phase 3: fetch cached terminal payload (or a cached accepted if still in-flight).
      return await callGateway({
        method: "agent",
        params: agentParams,
        expectFinal: false,
        timeoutMs: connectTimeoutMs,
        clientName: GATEWAY_CLIENT_NAMES.CLI,
        mode: GATEWAY_CLIENT_MODES.CLI,
      });
    },
  );

  if (opts.json) {
    writeRuntimeJson(runtime, response);
    return response;
  }

  const result = response?.result;
  const payloads = result?.payloads ?? [];

  if (payloads.length === 0) {
    runtime.log(response?.summary ? response.summary : "No reply from agent.");
    return response;
  }

  for (const payload of payloads) {
    const out = formatPayloadForLog(payload);
    if (out) {
      runtime.log(out);
    }
  }

  return response;
}

export async function agentCliCommand(opts: AgentCliOpts, runtime: RuntimeEnv, deps?: CliDeps) {
  arkaDiag(`agentCliCommand local=${opts.local === true}`);
  protectJsonStdout(opts);
  const localOpts = {
    ...opts,
    agentId: opts.agent,
    replyAccountId: opts.replyAccount,
    runtimePluginIds: opts.runtimePluginIds ?? parseRuntimePluginIdsFromEnv(),
    installBundledRuntimeDeps:
      opts.installBundledRuntimeDeps ?? parseInstallBundledRuntimeDepsFromEnv(),
    skipProviderRuntimeHooks: opts.skipProviderRuntimeHooks ?? parseSkipProviderRuntimeHooksFromEnv(),
    disableTools: opts.disableTools ?? parseDisableToolsFromEnv(),
    cleanupBundleMcpOnRunEnd: true,
    cleanupCliLiveSessionOnRunEnd: true,
  };
  arkaDiag(
    `agentCliCommand runtimePluginIds=${localOpts.runtimePluginIds?.join(",") ?? "none"} installBundledRuntimeDeps=${String(localOpts.installBundledRuntimeDeps)} skipProviderRuntimeHooks=${String(localOpts.skipProviderRuntimeHooks)} disableTools=${String(localOpts.disableTools)}`,
  );
  if (opts.local === true) {
    arkaDiag("agentCliCommand before local agentCommand");
    return await agentCommand(localOpts, runtime, deps);
  }

  try {
    return await agentViaGatewayCommand(opts, runtime);
  } catch (err) {
    runtime.error?.(
      `EMBEDDED FALLBACK: Gateway agent failed; running embedded agent: ${String(err)}`,
    );
    return await agentCommand(
      {
        ...localOpts,
        resultMetaOverrides: EMBEDDED_FALLBACK_META,
      },
      runtime,
      deps,
    );
  }
}
