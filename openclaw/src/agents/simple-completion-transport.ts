import { getApiProvider, type Api, type Model } from "@mariozechner/pi-ai";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import { createAnthropicMessagesTransportStreamFn } from "./anthropic-transport-stream.js";
import { createAnthropicVertexStreamFnForModel } from "./anthropic-vertex-stream.js";
import { ensureCustomApiRegistered } from "./custom-api-registry.js";
import { registerProviderStreamForModel } from "./provider-stream.js";
import {
  buildTransportAwareSimpleStreamFn,
  prepareTransportAwareSimpleModel,
} from "./provider-transport-stream.js";

function resolveAnthropicVertexSimpleApi(baseUrl?: string): Api {
  const suffix = baseUrl?.trim() ? encodeURIComponent(baseUrl.trim()) : "default";
  return `openclaw-anthropic-vertex-simple:${suffix}`;
}

export function prepareModelForSimpleCompletion<TApi extends Api>(params: {
  model: Model<TApi>;
  cfg?: OpenClawConfig;
}): Model<Api> {
  const { model, cfg } = params;

  // MiniMax uses an Anthropic-compatible API but may terminate streams with
  // `data: [DONE]` without promptly closing the socket. The upstream pi-ai
  // Anthropic SSE reader may wait forever in that case, so route MiniMax
  // models through OpenClaw's transport stream implementation.
  if (
    model.api === "anthropic-messages" &&
    (model.provider === "minimax" || model.provider === "minimax-portal")
  ) {
    const api: Api = "openclaw-anthropic-messages-transport";
    ensureCustomApiRegistered(api, createAnthropicMessagesTransportStreamFn());
    return { ...model, api };
  }

  // Only provider-owned custom APIs need runtime stream registration here.
  if (!getApiProvider(model.api) && registerProviderStreamForModel({ model, cfg })) {
    return model;
  }

  const transportAwareModel = prepareTransportAwareSimpleModel(model, { cfg });
  if (transportAwareModel !== model) {
    const streamFn = buildTransportAwareSimpleStreamFn(model, { cfg });
    if (streamFn) {
      ensureCustomApiRegistered(transportAwareModel.api, streamFn);
      return transportAwareModel;
    }
  }

  if (model.provider === "anthropic-vertex") {
    const api = resolveAnthropicVertexSimpleApi(model.baseUrl);
    ensureCustomApiRegistered(api, createAnthropicVertexStreamFnForModel(model));
    return { ...model, api };
  }

  return model;
}
