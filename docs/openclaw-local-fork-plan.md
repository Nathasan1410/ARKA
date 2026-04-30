# OpenClaw Local Fork Plan

Date: 2026-05-01

Status:

```txt
OpenClaw source fork in repo: YES
OpenClaw local install: VERIFIED
OpenClaw local build: PARTIAL / STRICT-SMOKE VERIFIED
OpenClaw local CLI smoke: VERIFIED through direct source entrypoint
OpenClaw gateway smoke: VERIFIED for local dev gateway connectivity
ARKA OpenClaw workspace draft: CREATED
ARKA OpenClaw skill loaded by runtime: VERIFIED
MiniMax model configured/discovered: VERIFIED
Model-backed ARKA inference turn: VERIFIED through local `infer model run`
Full ARKA agent session turn: NOT VERIFIED
ARKA OpenClaw plugin skeleton: IMPLEMENTED / STATIC-SMOKE VERIFIED
ARKA OpenClaw plugin gateway load: NOT VERIFIED
ARKA packages/agent integration with OpenClaw: NOT IMPLEMENTED
ARKA/OpenClaw cross-layer verification test: VERIFIED
```

## 1. Local Fork Path

ARKA now contains a repo-local OpenClaw source fork/copy at:

```txt
openclaw/
```

This is source code for later OpenClaw-side runtime/plugin/skill work. It does not make `packages/agent` a real OpenClaw runtime.

## 2. Source Origin And Commit

Source inspected and copied from:

```txt
D:\Projekan\Macam2Hackathon\ARKA\_research\openclaw
```

Upstream:

```txt
https://github.com/openclaw/openclaw
```

Observed upstream commit:

```txt
e27fe55a
```

Package metadata:

```txt
name: openclaw
version: 2026.4.27
description: Multi-channel AI gateway with extensible messaging integrations
packageManager: pnpm@10.33.0
node engine: >=22.14.0
license: MIT
```

License file present:

```txt
openclaw/LICENSE
```

License summary:

```txt
MIT License, Copyright (c) 2025 Peter Steinberger.
```

## 3. What Was Copied And Excluded

Copied:

```txt
OpenClaw source files
README
LICENSE
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
docs
skills
scripts
packages
extensions
apps
ui
test/test-fixture source
templates/examples present in upstream tree
```

Excluded during copy:

```txt
.git/
node_modules/
dist/
build/
coverage/
.tmp/
logs/
.artifacts/
.cache/
.env
.env.*
```

Post-copy verification:

```txt
openclaw/.git: absent
openclaw/node_modules: absent after cleanup
openclaw/dist: absent
openclaw/LICENSE: present
openclaw/package.json: present
openclaw/pnpm-lock.yaml: present
```

Note:

```txt
An attempted local install created partial openclaw/node_modules content before completion. The install processes were stopped and openclaw/node_modules was removed so the committed fork remains source-only.
```

## 4. Install Command Used

Attempted local-only install:

```powershell
pnpm.cmd --dir openclaw install --reporter append-only
```

Original session result:

```txt
NOT VERIFIED during the Codex-run session. The install was still running slowly on the HDD/laptop environment after extended monitoring. It was stopped by operator direction to leave manual instructions instead of continuing to wait.
```

Observed progress before stopping:

```txt
pnpm used OpenClaw's declared pnpm 10.33.0 tool.
node_modules entries increased over time, so the process was not idle.
No openclaw/node_modules/.modules.yaml completion marker existed before stopping.
```

Manual retry command:

```powershell
pnpm.cmd --dir openclaw install --reporter append-only
```

Manual result reported by repo owner:

```txt
Done in 49m 30.6s using pnpm v10.33.0.
```

Verification after manual install:

```powershell
Test-Path openclaw\node_modules\.modules.yaml
pnpm.cmd --dir openclaw --version
```

Observed:

```txt
openclaw/node_modules/.modules.yaml exists.
pnpm version from openclaw dir: 10.33.0.
OpenClaw local install is verified.
```

## 5. Build Command Used

Full build was attempted manually:

```powershell
pnpm.cmd --dir openclaw run build
```

Result:

```txt
NOT VERIFIED. Full build reached runtime-postbuild and appeared to stall for a long time on the HDD/laptop environment. It was stopped manually.
```

Upstream package script inspected:

```txt
build = node scripts/build-all.mjs
```

Manual build command after install succeeds:

```powershell
pnpm.cmd --dir openclaw run build
```

Targeted strict smoke build was then run:

```powershell
pnpm.cmd --dir openclaw run build:strict-smoke
```

Result:

```txt
VERIFIED for strict-smoke build. The command completed successfully, generated build stamps, and verified plugin SDK exports.
```

Build stamps verified:

```txt
openclaw/dist/.buildstamp: present
openclaw/dist/.runtime-postbuildstamp: present
```

Do not claim full production build is verified until `pnpm.cmd --dir openclaw run build` exits successfully.

## 6. CLI And Gateway Smoke Result

The package-script form below is not valid for this local source checkout because it passes a literal `--` through `scripts/run-node.mjs` and falls into the interactive Crestodian path:

```powershell
pnpm.cmd --dir openclaw run openclaw -- --help
pnpm.cmd --dir openclaw run openclaw -- --version
pnpm.cmd --dir openclaw run openclaw -- gateway --help
```

Observed error:

```txt
Crestodian needs an interactive TTY. Use `openclaw crestodian --message "status"` for one command.
```

Working local CLI source entrypoint:

```powershell
node openclaw\openclaw.mjs --help
node openclaw\openclaw.mjs --version
node openclaw\openclaw.mjs gateway --help
```

Observed:

```txt
node openclaw\openclaw.mjs --help: passed and printed CLI command list.
node openclaw\openclaw.mjs --version: OpenClaw 2026.4.27.
node openclaw\openclaw.mjs gateway --help: passed and printed gateway help.
```

`pnpm.cmd --dir openclaw exec openclaw --help` did not work because `openclaw` is not installed as a package bin inside this source checkout:

```txt
Command "openclaw" not found.
```

Gateway status check with isolated state/config:

```powershell
$env:OPENCLAW_STATE_DIR='C:\Dev\_openclaw-smoke\state'
$env:OPENCLAW_CONFIG_PATH='C:\Dev\_openclaw-smoke\openclaw.json'
node openclaw\openclaw.mjs --dev gateway status
```

Observed:

```txt
Command executed.
Gateway not running.
Connectivity probe failed with ECONNREFUSED on 127.0.0.1:19001.
```

Controlled gateway startup attempt:

```powershell
node openclaw\openclaw.mjs --dev gateway run --port 19001 --verbose --allow-unconfigured
```

Initial controlled startup observation:

```txt
Process started and wrote dev config.
Dev config ready: C:\Dev\_openclaw-smoke\openclaw.json.
Startup log reported Control UI assets are missing and recommended `pnpm build && pnpm ui:build`.
Gateway did not bind within the short smoke window.
Status still reported ECONNREFUSED.
Process was stopped cleanly by the test harness.
```

Manual follow-up:

```powershell
pnpm.cmd --dir openclaw run ui:build
node openclaw\openclaw.mjs --dev gateway run --port 19001 --verbose --allow-unconfigured
node openclaw\openclaw.mjs --dev gateway status
```

Observed from repo owner:

```txt
ui:build completed in 17.48s.
Gateway started, registered plugin commands, mounted canvas host, started HTTP server, started browser control, accepted a CLI probe, and logged `ready`.
Gateway status reported:
  Connectivity probe: ok
  Capability: connected-no-operator-scope
  Listening: 127.0.0.1:19001
```

Truthful gateway result:

```txt
Local dev gateway connectivity is verified.
Operator-scope authenticated control is not verified.
One bounded local model-backed inference turn is verified; full agent session turns are not verified.
```

## 7. ARKA Workspace And Skill Files Created

Created under the local OpenClaw source fork:

```txt
openclaw/workspaces/arka/AGENTS.md
openclaw/workspaces/arka/SOUL.md
openclaw/workspaces/arka/TOOLS.md
openclaw/workspaces/arka/skills/arka-audit/SKILL.md
```

Purpose:

```txt
Prepare an ARKA-specific OpenClaw workspace and skill instruction layer.
Teach AuditEvent-first triage.
Prevent mutation of reconciliation facts.
Keep owner-facing language safe.
Define allowed output/action boundaries.
```

Important status:

```txt
These files are source/workspace instructions.
They have been loaded by the local OpenClaw dev setup; `arka-audit` appears ready from `openclaw-workspace`.
They have not been exercised by a successful full OpenClaw ARKA agent session turn.
They do not create a real ARKA app integration by themselves.
```

To load manually after OpenClaw setup, point OpenClaw config to the workspace path:

```json5
{
  agents: {
    defaults: {
      workspace: "D:/Projekan/Macam2Hackathon/ARKA/ARKA-github/openclaw/workspaces/arka"
    }
  }
}
```

Then restart or start the gateway and verify:

```powershell
node openclaw\openclaw.mjs --dev skills list
```

Manual skill-list smoke result before ARKA workspace config:

```txt
`node openclaw\openclaw.mjs --dev skills list` works and listed bundled/extra skills.
The active dev config still points to `C:\Users\Lenovo\.openclaw\workspace-dev`, not `openclaw/workspaces/arka`.
At this point in the sequence, ARKA `arka-audit` skill loading was not verified yet. That was resolved by the follow-up ARKA workspace config below.
```

Follow-up ARKA workspace config:

```txt
The isolated smoke config at C:\Dev\_openclaw-smoke\openclaw.json was updated outside the repo to point both agents.defaults.workspace and agents.list[0].workspace at openclaw/workspaces/arka.
```

Verified ARKA skill-list result:

```txt
node openclaw\openclaw.mjs --dev skills list
```

Observed:

```txt
Skills (12/57 ready)
arka-audit: ready
Source: openclaw-workspace
Description: Triage ARKA AuditEvents with immutable reconciliation facts and owner-safe audit language.
```

Truthful result:

```txt
ARKA OpenClaw workspace skill loading is verified.
The skill is instruction-only. A read-only ARKA plugin skeleton is implemented separately under `openclaw/extensions/arka-audit/`; gateway discovery/load of that plugin is not verified yet.
```

## 7A. MiniMax Smoke Configuration

MiniMax configuration was applied only to the isolated smoke environment outside the repo:

```txt
C:\Dev\_openclaw-smoke\.env.local
C:\Dev\_openclaw-smoke\openclaw.json
C:\Dev\_openclaw-smoke\run-arka-openclaw-gateway.ps1
```

Repo policy:

```txt
No MiniMax API key is stored in ARKA-github.
The smoke config references ${MINIMAX_API_KEY}.
The actual key is local-only in _openclaw-smoke/.env.local and must not be committed.
```

Provider config:

```txt
Provider id: minimax
Model ref: minimax/MiniMax-M2.7
Base URL: https://api.minimax.io/anthropic
API mode: anthropic-messages
```

Verified model discovery:

```powershell
node openclaw\openclaw.mjs --dev models list --provider minimax
```

Observed:

```txt
minimax/MiniMax-M2.7
Input: text
Context: 200k
Auth: yes
Tags: default
```

Full OpenClaw ARKA agent session attempt:

```powershell
node openclaw\openclaw.mjs --dev agent --message "<small ARKA State C prompt>"
```

Result:

```txt
NOT VERIFIED. The command timed out after system-prompt/session setup and left an agent CLI process running. The process was stopped. No successful full agent-session assistant response was captured.
```

Verified bounded model-backed inference command:

```powershell
node openclaw\openclaw.mjs --dev infer model run --local --model minimax/MiniMax-M2.7 --prompt <ARKA State C audit prompt> --json
```

Result:

```txt
VERIFIED. The command returned ok=true from provider minimax / model MiniMax-M2.7 and produced an owner-safe ARKA State C JSON response with triageOutcome REQUEST_EXPLANATION.
```

## 8. Plugin Skeleton Decision

Plugin skeleton is implemented as a read-only first pass. The implementation plan remains in:

```txt
docs/openclaw-plugin-skeleton-plan.md
```

Implemented local-fork location:

```txt
openclaw/extensions/arka-audit/
```

Reason:

```txt
The bundled OpenClaw extension layout already matches the upstream examples.
That keeps ARKA close to the native plugin loader and avoids inventing a separate package layout before the first read-only tool exists.
```

Implemented first-pass behavior:

```txt
Use openclaw/plugin-sdk/plugin-entry.
Keep openclaw.plugin.json minimal.
Set activation.onStartup intentionally.
Register a single read-only get_audit_event tool.
Return status=unavailable until an ARKA backend/API read path exists.
State that no AuditEvent facts were read or mutated.
List non-goals: database writes, Telegram delivery, 0G Storage upload, 0G Chain registration, fact recalculation.
```

Static smoke verification:

```powershell
node --import tsx -e "<import arka-audit entrypoint and assert id/register>"
node --import tsx -e "<register plugin against fake API and execute get_audit_event>"
pnpm.cmd --dir openclaw run test:extension arka-audit
```

Observed:

```txt
Entrypoint imports successfully.
Plugin id is arka-audit.
register is a function.
One get_audit_event tool is registered.
Tool returns an unavailable read-only response for a sample AuditEvent id.
Extension-local tests pass for manifest shape, tool registration, unavailable read-only output, immutable fact policy, explicit non-goals, and missing AuditEvent id rejection.
```

Best-practice direction for the next implementation pass:

```txt
Verify OpenClaw gateway discovery/load of the plugin.
Wire get_audit_event to a real ARKA backend/API read path.
Keep the existing ARKA workspace skill separate from the plugin package.
Do not write DB records until ARKA API/DB contracts exist.
Do not send Telegram from plugin tools until owner approval and channel policy are verified.
```

Alternative if ARKA later wants a separately versioned plugin package:

```txt
external or workspace package for arka-audit OpenClaw plugin
```

Current canonical location is `openclaw/extensions/arka-audit/`. Do not switch to the alternative package shape until the bundled extension skeleton is proven through gateway load or the product needs external publishing.

## 9. What Is Verified

Verified:

```txt
OpenClaw source fork exists at openclaw/.
Source origin and commit were recorded.
MIT license is present.
Excluded generated/dependency/secret folders were not copied.
ARKA workspace/skill draft files exist under openclaw/workspaces/arka/.
No OpenClaw global install was performed.
OpenClaw local install completed with pnpm 10.33.0.
Strict-smoke build completed and build stamps exist.
Direct local source CLI help/version/gateway-help commands work.
Local dev gateway connectivity works on 127.0.0.1:19001.
ARKA arka-audit workspace skill loads as ready from openclaw-workspace.
MiniMax provider discovery lists minimax/MiniMax-M2.7 with auth=yes.
ARKA OpenClaw plugin skeleton exists under openclaw/extensions/arka-audit/.
ARKA plugin entrypoint and read-only get_audit_event registration pass static smoke checks.
ARKA plugin extension-local tests pass: pnpm.cmd --dir openclaw run test:extension arka-audit.
Repo verification command passes: pnpm.cmd run verify:arka-openclaw.
```

The cross-layer verification command covers:

```txt
OpenClaw source fork attribution and license
local secret-file guardrails
ARKA OpenClaw workspace and arka-audit skill files
backend/core AuditEvent creation for State A/C/D
AuditEvent proof status defaults remaining local/not-started
agent deterministic fallback triage for State A/C/D
triage non-mutation of reconciliation facts
fallback behavior when OpenClaw runtime adapter is unavailable
shared/core/agent package tests
shared/core/agent/db typecheck
```

Run:

```powershell
pnpm.cmd run verify:arka-openclaw
```

## 10. What Remains Unverified

Unverified:

```txt
OpenClaw full production build
OpenClaw strict-smoke build after adding arka-audit plugin skeleton
OpenClaw plugin-contract suite after adding arka-audit plugin skeleton
OpenClaw workspace lockfile refresh after adding arka-audit plugin skeleton
Operator-scope gateway auth/control beyond status probe
Full OpenClaw ARKA agent session turn
OpenClaw gateway discovery/load of the arka-audit plugin
OpenClaw Telegram channel
ARKA packages/agent calling OpenClaw gateway/plugin
0G Storage upload
0G Chain registration
```

## 11. Next Implementation Task

Recommended next task: verify OpenClaw gateway discovery/load of the existing `arka-audit` plugin skeleton and debug one full OpenClaw ARKA agent session turn.
Updated recommendation: do not build more plugin tools until the current read-only skeleton is loaded by the gateway and can be called through the intended OpenClaw path.

Scope:

```txt
openclaw/
docs/openclaw-local-fork-plan.md
docs/openclaw-plugin-skeleton-plan.md
technical-debt.md
docs/real-vs-simulated.md only if status changes
```

Model-turn debugging commands:

```powershell
node openclaw\openclaw.mjs --dev gateway status
node openclaw\openclaw.mjs --dev models list --provider minimax
node openclaw\openclaw.mjs --dev agent --message "Reply with OK only."
```

Current blocker discovered in local smoke:

```txt
`openclaw agent` requires one of `--to`, `--session-id`, or `--agent`.
The bare `--dev agent --message "Reply with OK only."` invocation does not reach a real model turn.
The agent gateway path also uses a long default timeout, so stalled runs can look hung unless you pass a shorter `--timeout`.
```

If a simple agent turn works, run the ARKA prompt:

```powershell
node openclaw\openclaw.mjs --dev agent --message "Using the ARKA audit skill, explain the safe triage rule for State C in two sentences. Do not send staff messages."
```

Preferred next retry:

```powershell
node openclaw\openclaw.mjs --dev agent --session-id <existing-or-smoke-session> --message "Reply with OK only." --timeout 15
```

Expected success signal:

```txt
The command returns an assistant response and gateway logs show an agent lifecycle end.
```

Completion criteria:

```txt
Install success = already verified.
Strict-smoke build success = already verified.
CLI success = already verified through node openclaw\openclaw.mjs.
Gateway success = already verified for local dev connectivity.
ARKA workspace success = already verified; skills list includes arka-audit.
Model-backed ARKA inference turn success = verified once through local `infer model run`.
Full OpenClaw ARKA agent session success = not verified yet.
```
