# Technical Debt / Blockers / Human-Needed Actions

This file tracks skipped work, deferred decisions, blockers, accepted risks, and setup tasks that matter for implementation or demo reliability.

Use this format:

```txt
Date:
Area:
Status: BLOCKED / DEFERRED / RISK / NEEDS_HUMAN
What happened:
Why it matters:
Next action:
Owner: Human / Agent / Both
```

## Current Open Items

### 2026-04-30 - Postgres Demo Persistence Not Yet Verified End-to-End

```txt
Area: Database / Demo Persistence
Status: NEEDS_HUMAN
What happened: The repo now includes an optional Postgres-backed dashboard demo-run store (`dashboard_demo_runs` JSONB) and a migration runner (`pnpm --filter @arka/db run migrate`), but Postgres persistence should not be claimed as REAL until a real database has migrations applied and the dashboard demo routes write + read back successfully.
Why it matters: Reviewers and judges will assume "Postgres is real" means the demo history and/or operational evidence survives a server restart. The current dashboard still defaults to the in-memory repository unless explicitly enabled and verified.
Next action: Provide a real `DATABASE_URL`, run `pnpm --filter @arka/db run migrate`, set `ARKA_DEMO_REPOSITORY=postgres`, restart `@arka/web`, then confirm `/dashboard` history persists across restarts and the persistence badge reads Postgres-active.
Owner: Human
```

### 2026-04-30 - Dashboard Visual Click-Through Needs Human Browser Pass

```txt
Area: Dashboard / Manual Demo Verification
Status: NEEDS_HUMAN
What happened: The `/dashboard` UI was refactored into a clearer case-console flow and verified through build, typecheck, focused demo-service tests, and local HTTP/API smoke checks. This environment does not have a browser automation dependency installed, so visual click-through verification for State A/C/D layout, wrapping, and operator intuition still needs a human pass in a real browser.
Why it matters: The MVP depends on being understandable during a live demo. HTTP/build checks prove routes and behavior, but they cannot fully prove the dashboard feels intuitive or that every viewport looks right.
Next action: Open `http://127.0.0.1:3010/dashboard`, click State A, State C, and State D, then verify Evidence / OpenClaw-Triage / Proof views remain readable and all simulated/local/not-started labels are clear.
Owner: Human
```

### 2026-04-30 - OpenClaw Plugin Skeleton Broad Verification Timeout

```txt
Area: OpenClaw / Plugin Verification
Status: RISK
What happened: The read-only `arka-audit` plugin skeleton exists under `openclaw/extensions/arka-audit/`. Extension-local tests pass (`pnpm --dir openclaw run test:extension arka-audit`). OpenClaw gateway discovery/load of the plugin is now verified (gateway run shows `arka-audit` loaded when enabled in config). However, broader OpenClaw build/test coverage for plugin-contract compatibility is still not verified.
Why it matters: ARKA can now honestly claim the gateway can discover/load the read-only plugin, but should not claim broader OpenClaw plugin-contract compatibility or any app-level gateway client integration until those checks exist and pass.
Next action: If needed for confidence beyond the demo: run broader OpenClaw plugin-contract checks in a stable environment. In parallel, focus on proving one full OpenClaw agent session response (not just `infer model run`) before touching `packages/agent`.
Owner: Both
```

### 2026-04-30 - OpenClaw Strict-Smoke Build Needs A2UI Skip Flag In This Fork

```txt
Area: OpenClaw / Build
Status: RISK
What happened: `pnpm --dir openclaw run build:strict-smoke` fails unless `OPENCLAW_A2UI_SKIP_MISSING=1` (A2UI bundle inputs under openclaw/vendor/a2ui are missing in this repo-local fork copy).
Why it matters: Strict-smoke build is part of the OpenClaw verification story; requiring a skip flag is a footgun and can confuse reviewers/operators.
Next action: Decide whether to (1) restore the missing OpenClaw A2UI vendor inputs into the fork, or (2) keep the skip flag documented as a known limitation for hackathon scope.
Owner: Both
```

### 2026-04-30 - OpenClaw Model-Turn Invocation Requires Session Selector

```txt
Area: OpenClaw / CLI smoke
Status: NEEDS_HUMAN
What happened: The local smoke invocation `node openclaw/openclaw.mjs --dev agent --message "Reply with OK only."` does not form a valid agent request because the `agent` command requires one of `--to`, `--session-id`, or `--agent`.
Why it matters: Reviewers can mistake the long startup/wait time for a broken model path. The command must be made explicit before model-backed behavior can be judged.
Next action: Retry with a concrete selector and a short timeout, for example `node openclaw/openclaw.mjs --dev agent --agent main --message "Reply with OK only." --timeout 15`, then confirm whether the gateway returns a response or a bounded failure.
Owner: Human / Agent
```

### 2026-04-30 - Full OpenClaw Agent Session Still Not Verified (Gateway-Backed `agent` Turn Not Yet Reproduced)

```txt
Area: OpenClaw / Agent session
Status: NEEDS_HUMAN
What happened: OpenClaw gateway startup and `arka-audit` plugin load are verified, and the CLI gateway `agent` flow was fixed to handle the two-phase gateway RPC (accepted ack -> agent.wait -> fetch cached terminal payload). A successful end-to-end gateway-backed agent turn (final assistant payloads returned) still needs to be reproduced on the target demo machine with the intended provider credentials configured for the gateway profile.
Why it matters: Until one real gateway-backed agent turn completes and returns a final assistant response, ARKA must not claim "real OpenClaw agent sessions" and should not add a `packages/agent` gateway seam that could silently fall back or be flaky.
Next action: Start the gateway and run one bounded turn while tailing gateway logs, e.g. `node openclaw/openclaw.mjs --dev gateway run` then `node openclaw/openclaw.mjs --dev agent --agent main --session-id smoke --message "Reply with OK only." --timeout 60`. Record whether payloads are returned and whether the provider/model path is correct.
Owner: Human (credentials + run) / Agent (debug if still failing)
```

### 2026-04-30 - OpenClaw Model-Backed Infer Turn Verified; Full Agent Session Still Unverified

```txt
Area: OpenClaw / Model turn / MiniMax
Status: RISK
 What happened: A bounded OpenClaw local inference command completed successfully with MiniMax M2.7:
 `node openclaw/openclaw.mjs --dev infer model run --local --model minimax/MiniMax-M2.7 --prompt <ARKA State C audit prompt> --json`
 The response returned `ok: true`, provider `minimax`, model `MiniMax-M2.7`, and JSON text with `triageOutcome: REQUEST_EXPLANATION`. Full gateway-backed `agent` session turns are still not verified (see the gateway agent session item above).
Why it matters: ARKA may now claim one model-backed OpenClaw-side inference response and verified gateway plugin discovery/load, but must not claim a full OpenClaw agent session response, packages/agent gateway integration, or Telegram.
Next action: Keep `infer` as the minimal provider-auth smoke, then verify the full gateway agent turn (see the gateway agent session item above) before touching `packages/agent`.
Owner: Both
```

### 2026-04-30 - Vitest Fork Pool SSR Fetch Timeout (verify:arka-openclaw)

```txt
Area: Tooling / Verification
Status: RISK
What happened: `vitest run test/arka-openclaw.verify.test.ts` intermittently failed before collecting tests with: `Timeout calling "fetch" ... ["...verify.test.ts","ssr"]`. Forcing Vitest to use the threads pool in a single thread avoided this on Node 24:
- `vitest ... --pool=threads --poolOptions.threads.singleThread`
Why it matters: `pnpm run verify:arka-openclaw` is the cross-layer regression gate. If it flakes, teams lose confidence and waste time.
Next action: Keep the threads/singleThread setting for this verification test until the underlying Vitest/Node 24 fork-pool/SSR fetch issue is understood. Revisit once the environment is stable (or pin Node/Vitest).
Owner: Agent
```

### 2026-04-30 - Telegram Bot Token Handling

```txt
Area: Telegram / Secrets
Status: NEEDS_HUMAN
What happened: A Telegram bot token was provided in chat for ARKA/OpenClaw work. It was not written to the repository, docs, or committed env files.
Why it matters: Bot tokens must not be committed or repeated in project history. If the chat/log is shared or exposed, the token should be considered compromised.
Next action: Store the token only in a local `.env` or external smoke config when Telegram work begins. Rotate it through BotFather before any public demo or repo sharing if exposure is possible.
Owner: Human
```

### 2026-04-29 - Verification Blocked By Local EPERM

```txt
Area: Verification / Tooling
Status: RESOLVED FOR GLOBAL GATE
What happened: A follow-up impact audit attempted `pnpm --filter @arka/shared test`, `pnpm --filter @arka/core test`, `pnpm --filter @arka/agent test`, and `pnpm run typecheck`. All failed in this session due EPERM open/spawn permission errors in the current PowerShell/Node environment. The failures occurred at test runner or process startup, not at project assertions.
Why it matters: Earlier worker reports claimed these checks passed, but the PM session initially could not independently confirm that state.
Resolution: The remediation global gate was re-run successfully from an escalated PowerShell command path on 2026-04-29. Shared/core/agent tests, DB typecheck/generate, web build, and root typecheck passed.
Next action: Keep this closed unless EPERM returns in later sessions.
Owner: Both
```

### 2026-04-29 - OpenClaw Impact Remediation

```txt
Area: OpenClaw / Dashboard / Package Boundaries
Status: RESOLVED FOR REMEDIATION
What happened: The OpenClaw misunderstanding does not require a full project restart, but it exposed code-boundary cleanup that must happen before demo claims. `packages/agent` is only an adapter/fallback boundary, not a real OpenClaw runtime. The dashboard currently imports built `dist` paths through relative paths, and the UI does not expose `triageSource` clearly enough.
Why it matters: ARKA must not blur deterministic fallback, dashboard simulation, and real OpenClaw runtime behavior. Package-boundary shortcuts also make parallel work more fragile.
Resolution: The remediation batch replaced internal/relative package imports, made dashboard fallback/triageSource explicit, and kept OpenClaw runtime truthfulness separate from deterministic fallback. The remaining OpenClaw work is now tracked by the local fork/plugin/model-turn entries below.
Next action: Keep this closed unless package-boundary shortcuts return.
Owner: Both
```

### 2026-04-29 - Postgres Migration Application Verification

```txt
Area: Database / Postgres
Status: NEEDS_HUMAN
What happened: The first Drizzle schema package can typecheck and generate migrations locally, but no real Postgres instance or confirmed DATABASE_URL has been provided yet for applying migrations or verifying write/read behavior against a database. The Web2 MVP demo route now has a repository boundary, but it intentionally uses an in-memory server-process repository and labels that mode in the dashboard.
Why it matters: ARKA should not claim real database persistence beyond schema definition, SQL generation, and the in-memory demo boundary until migrations run successfully against a real Postgres target and the demo route writes/reads Order, Movement, AuditEvent, and ProofRecord rows.
Next action: Provide a Postgres DATABASE_URL, run the generated migration against that database, implement the verified Postgres repository behind the existing demo-run repository interface, and verify the demo world can persist and read back an AuditEvent path.
Owner: Both
```

### 2026-04-29 - 0G Storage SDK Verification

```txt
Area: 0G Storage
Status: NEEDS_HUMAN
What happened: The project docs define 0G Storage as a P0 target, but implementation has not started and the exact SDK package, upload method, endpoint/indexer, and upload response shape are not verified yet.
Why it matters: ARKA must not claim real 0G Storage upload until a real upload path is implemented and verified.
Next action: Verify current official 0G Storage SDK docs, endpoint requirements, wallet/funding requirements, upload response shape, and any CLI fallback steps before implementation.
Owner: Both
```

### 2026-04-29 - 0G Chain Environment Verification

```txt
Area: 0G Chain
Status: PARTIAL (Contract Implemented, Deployment Pending)
What happened: The project docs now record the intended 0G Galileo testnet direction, including RPC/chain ID/explorer/faucet guidance. The `AuditProofRegistry.sol` smart contract has been drafted and tested locally in the `/contracts` workspace using Hardhat.
Why it matters: ARKA must not claim real chain anchoring until the contract can be deployed, called, and checked through a real transaction on the live testnet.
Next action: Provide a test wallet with faucet funds, configure the `ZERO_G_REGISTRAR_PRIVATE_KEY` in `.env`, run the deployment script to Galileo testnet, and integrate `viem` in the backend to call `registerProof`.
Owner: Both
```

### 2026-04-29 - Telegram P0 Mode Decision

```txt
Area: Telegram / OpenClaw conversation
Status: DEFERRED
What happened: The docs allow either real Telegram owner alert or dashboard-simulated conversation for P0. No implementation mode has been chosen yet.
Why it matters: Telegram should not block the core audit/proof demo, but the UI and route shape may differ depending on webhook, polling, or dashboard-only fallback.
Next action: Before Telegram implementation, decide P0 mode: dashboard simulation only, real owner alert, or real bot with dashboard fallback.
Owner: Human
```

### 2026-04-29 - OpenClaw Runtime Integration

```txt
Area: OpenClaw
Status: RISK
What happened: packages/agent currently contains deterministic A/C/D triage fallback only. OpenClaw is present as a repo-local source fork under `openclaw/`, and the ARKA workspace exists under `openclaw/workspaces/arka/`. Verified: local install, strict-smoke build (with the current A2UI skip flag), direct CLI smoke, local dev gateway connectivity, ARKA skill loading, MiniMax model discovery, one model-backed `infer model run --local` State C response, and gateway discovery/load of the read-only `arka-audit` extension when enabled in an isolated profile. Unverified: a full gateway-backed `agent` session turn returning a final response, and any ARKA app-level gateway/plugin client calls. Note: the CLI gateway path was updated to use a start/wait/cache flow instead of relying on a single long-lived `expectFinal` gateway RPC, to avoid premature client timeouts during longer agent turns.
Why it matters: ARKA's product story says the agent is built on top of OpenClaw. OpenClaw is a full gateway/runtime/plugin system, not just a local adapter function. The deterministic fallback is useful for MVP resilience, but it must not be mistaken for a real OpenClaw-backed agent.
Next action: Debug a successful full OpenClaw agent session turn, then implement and verify the ARKA plugin/tool path. Keep `pnpm run verify:arka-openclaw` passing as the cross-layer regression gate. Do not claim packages/agent integration until ARKA actually calls the OpenClaw gateway/plugin.
Owner: Both
```

### 2026-04-29 - OpenClaw Smoke Setup Not Verified

```txt
Area: OpenClaw / Gateway Setup
Status: RISK
What happened: S2B inspected the local OpenClaw research clone and produced docs/openclaw-s2b-handoff.md. S2C copied OpenClaw source into openclaw/ as a local fork and intentionally avoided global install. Manual local install completed with pnpm 10.33.0, and `pnpm --dir openclaw run build:strict-smoke` passed. Direct local source CLI help/version/gateway-help passed through `node openclaw/openclaw.mjs`. After `ui:build`, the dev gateway started on 127.0.0.1:19001 and `node openclaw/openclaw.mjs --dev gateway status` reported `Connectivity probe: ok`, `Capability: connected-no-operator-scope`, and `Listening: 127.0.0.1:19001`.
Why it matters: ARKA can claim gateway connectivity + plugin discovery/load + one model-backed `infer` response, but still cannot claim a full OpenClaw ARKA agent session response, Telegram, or packages/agent OpenClaw integration until those paths are verified.
Next action: Debug the gateway-backed agent path with an explicit selector (e.g. `node openclaw/openclaw.mjs --dev agent --agent main --message "Reply with OK only." --timeout 60`) and resolve the "final response" timeout described in the 2026-04-30 Codespaces blocker above.
Owner: Both
```

### 2026-04-29 - OpenClaw Full Build Deferred

```txt
Area: OpenClaw / Local Source Fork
Status: DEFERRED
What happened: OpenClaw local install and targeted strict-smoke build are verified, but the full `pnpm --dir openclaw run build` did not complete during manual testing. It reached `runtime-postbuild` and appeared to take too long on the HDD/laptop environment, so it was stopped. Build stamps were later produced by `build:strict-smoke`.
Why it matters: The local fork can pass a targeted smoke build and CLI checks, but ARKA should not claim the full OpenClaw production build is verified until the full build command exits successfully.
Next action: Only if full production build verification is required, rerun `pnpm --dir openclaw run build` from an interactive terminal with enough time and disk headroom. Otherwise proceed to gateway/UI-asset smoke using the verified strict-smoke build.
Owner: Both
```

### 2026-04-29 - Dashboard Manual UI Verification

```txt
Area: Dashboard UI
Status: RISK
What happened: The dashboard shell was verified with `pnpm --filter @arka/web build`. On 2026-04-30, a package-local Next dev server was started with `pnpm --filter @arka/web exec next dev --hostname 127.0.0.1 --port 3010`, and `http://127.0.0.1:3010/dashboard` returned HTTP 200 with dashboard and proof-panel content. No browser automation exists in the repo, so State A / State C / State D were not clicked in a real browser during this session.
Additional verification: After the dashboard was refactored to call `POST /api/demo/run-scenario`, direct HTTP POST checks for State A, State C, and State D returned the expected status, severity, deterministic fallback triage source, `LOCAL_ONLY`, `NOT_STARTED`, `NOT_REGISTERED`, and local package hashes.
Agent simulation verification: Direct HTTP checks for `POST /api/demo/agent-action` completed the State C dashboard-only sequence from owner approval to simulated staff send, simulated staff reply, and final owner decision. State D completed the owner-reviewed final decision path.
Why it matters: Static build and HTTP smoke confirm compilation, route serving, API behavior, and the local simulated-agent state machine, not actual in-browser layout, button flow, triageSource visibility after clicks, or fallback/OpenClaw copy clarity for the A/C/D demo.
Next action: Open `http://127.0.0.1:3010/dashboard` in a browser and manually click State A, State C, and State D before claiming the dashboard flow is demo-ready.
Owner: Both
```

## Resolved / Historical Notes

### 2026-04-30 - Dashboard Focused Vitest Retry Blocked By Local EPERM (Resolved 2026-05-01)

```txt
Area: Dashboard / Verification
Status: RISK
What happened: A focused Vitest run previously failed before test collection with `Error: spawn EPERM` while Vite/esbuild loaded the config.
Why it matters: It temporarily blocked rerunning the latest dashboard-focused tests.
Update: On 2026-05-01, `pnpm.cmd run verify:arka-openclaw` and the package tests completed successfully in an unrestricted environment, so EPERM is no longer blocking verification for this slice.
Next action: If EPERM returns on another machine, investigate Windows policy/AV/process-spawn restrictions around esbuild.
Owner: Human / Agent
```
