# Run Postgres Locally (Docker)

This repo’s Drizzle migration runner (`pnpm.cmd --filter @arka/db run migrate`) reads `DATABASE_URL` from the process environment (it does not auto-load `.env`).

## 1. Prereqs

- Docker Desktop (or Docker Engine) running
- `pnpm` installed

## 2. Start Postgres

1. (Recommended) Create a local `.env` in the repo root (it is gitignored) to override defaults:

```txt
POSTGRES_DB=arka
POSTGRES_USER=arka
POSTGRES_PASSWORD=choose_a_local_password
POSTGRES_PORT=5432
```

2. Start the container:

```powershell
docker compose up -d postgres
docker compose ps
```

Wait until the `postgres` service reports healthy.

Troubleshooting:
- Docker Compose auto-reads `.env`. If it errors while reading `.env`, ensure the file is plain `KEY=VALUE` lines saved as UTF-8 (no unusual encoding/BOM). As a workaround you can also run compose with an explicit env file: `docker compose --env-file .env.example up -d postgres`.

## 3. Run DB Migrations

Set `DATABASE_URL` for your current shell session, then run the migration script:

```powershell
$env:DATABASE_URL = "postgresql://arka:<password>@localhost:5432/arka"
pnpm.cmd --filter @arka/db run migrate
```

Notes:
- Use the same user/password/db/port you configured for Docker Compose.
- The repo’s `.env.example` shows the expected shape for `DATABASE_URL`.

## 4. Restart Verification Steps (Required Before Claiming REAL Persistence)

These steps are what make “local Postgres persistence” a verified claim rather than “configured”.

1. Restart Postgres and confirm it becomes healthy again:

```powershell
docker compose restart postgres
docker compose ps
```

2. (Optional demo persistence check) Enable Postgres-backed demo history, restart the web app, and confirm history persists across a Next.js server restart:

```powershell
$env:ARKA_DEMO_REPOSITORY = "postgres"
$env:DATABASE_URL = "postgresql://arka:<password>@localhost:5432/arka"
pnpm.cmd --filter @arka/web dev
```

Then:
- Open `/dashboard`, run any demo scenario, confirm it appears in history.
- Stop the server and start it again (`pnpm.cmd --filter @arka/web dev`).
- Reload `/dashboard` and confirm the history is still present and the persistence status indicates Postgres is active.

Automation option (process restart simulation):

```powershell
$env:ARKA_DEMO_REPOSITORY = "postgres"
$env:DATABASE_URL = "postgresql://arka:<password>@localhost:5432/arka"
pnpm.cmd run verify:postgres-demo
```

## 5. Stop / Reset

```powershell
docker compose down
```

To wipe the local DB volume (destructive):

```powershell
docker compose down -v
```
