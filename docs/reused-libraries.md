# Reused Libraries / Templates

Track reused libraries, starter kits, templates, and copied public examples.

## Current List (2026-05-02)

```txt
Next.js (declared in apps/web package manifest; installed through pnpm lockfile)
React / React DOM (declared in apps/web package manifest; installed through pnpm lockfile)
TypeScript (declared for packages; root typecheck verified)
Hardhat (declared in contracts package manifest; contract implementation not started)
ethers (declared in contracts package manifest; final 0G Chain transaction client still needs implementation-time confirmation against current 0G examples)
eslint / eslint-config-next (declared in apps/web package manifest; installed, lint not verified yet)
drizzle-orm / drizzle-kit (declared for packages/db schema + migration generation)
pg (declared for the Postgres DB package)
Vitest (declared at the workspace root for shared/core unit testing)
@supabase/ssr (declared in apps/web package manifest for Supabase SSR/browser helpers used by the web app utilities)
viem (declared in apps/web package manifest for 0G Chain proof registration from the dashboard backend route)
@0gfoundation/0g-storage-ts-sdk (declared in apps/web package manifest for real 0G Storage uploads from the dashboard backend route)
ethers (declared in apps/web package manifest as the official peer dependency used by the 0G Storage TypeScript SDK)
OpenClaw (MIT-licensed upstream source copied as a local fork under openclaw/ from https://github.com/openclaw/openclaw at commit e27fe55a; ARKA added workspace/skill draft files and a read-only arka-audit plugin skeleton)
```

## Copied / Forked Source

### OpenClaw

```txt
Source type: copied public source / local fork
Upstream repo: https://github.com/openclaw/openclaw
Local path: openclaw/
Observed upstream commit: e27fe55a
License: MIT, Copyright (c) 2025 Peter Steinberger
Copied by ARKA: source tree, docs, package manifests, lockfile, skills, scripts, packages, extensions, apps, UI, test/source fixtures
Excluded by ARKA: .git, node_modules, dist, build, coverage, .tmp, logs, .artifacts, .cache, .env, .env.*
ARKA changes so far: added openclaw/workspaces/arka/ workspace instructions, arka-audit skill draft, and openclaw/extensions/arka-audit/ read-only plugin skeleton
Status: source fork present; local install, strict-smoke build, direct source CLI help/version/gateway-help, local dev gateway connectivity, ARKA skill loading, MiniMax model discovery, one local `infer model run` ARKA State C response, read-only plugin static smoke/extension tests, and gateway discovery/load of the `arka-audit` plugin verified; full production build, full OpenClaw ARKA agent session, and packages/agent gateway calls not verified yet
```

ARKA does not claim OpenClaw was written from scratch. OpenClaw remains public reused source with attribution above.
