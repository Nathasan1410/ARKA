import { runAgentHarnessAttemptWithFallback } from "../../harness/selection.js";
import type { EmbeddedRunAttemptParams, EmbeddedRunAttemptResult } from "./types.js";

const arkaDiag = (message: string) => {
  if (process.env.OPENCLAW_ARKA_DIAG === "1") {
    console.error(`[arka-diag] ${new Date().toISOString()} ${message}`);
  }
};

export async function runEmbeddedAttemptWithBackend(
  params: EmbeddedRunAttemptParams,
): Promise<EmbeddedRunAttemptResult> {
  arkaDiag("backend before runAgentHarnessAttemptWithFallback");
  const result = await runAgentHarnessAttemptWithFallback(params);
  arkaDiag("backend after runAgentHarnessAttemptWithFallback");
  return result;
}
