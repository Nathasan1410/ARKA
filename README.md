# ARKA (Hackathon MVP)

ARKA is an **AuditEvent-first** system for comparing business intent (orders) with physical inventory movement, then surfacing review workflows and proof metadata in a single operator dashboard.

This repo intentionally prioritizes **hackathon demo reliability** first. OpenClaw runtime integration and Telegram remain deferred, while the dashboard proof flow now has verified live `0G Storage` upload and `0G Chain` anchoring. Current truthfulness status stays tracked in `docs/real-vs-simulated.md`.

## Run The Dashboard

1. Install deps:

```sh
pnpm install
```

2. Start the web app:

```sh
pnpm --dir apps/web dev
```

3. Open:

```txt
http://localhost:3010/dashboard
```

## Optional: Postgres Demo Persistence (Not “REAL” Until Verified)

1. Set `DATABASE_URL` in your local environment (do not commit secrets).
2. Apply migrations:

```sh
pnpm --filter @arka/db run migrate
```

3. Enable Postgres demo repository:

```txt
ARKA_DEMO_REPOSITORY=postgres
```

4. Restart the server and verify history survives a restart before claiming persistence as REAL.

## Docs

- Truthfulness status: `docs/real-vs-simulated.md`
- MVP interaction brief: `docs/mvp-demo-interaction-brief.md`
- Implementation plan: `docs/implementation-plan.md`
- Code ownership map: `docs/code-map.md`

