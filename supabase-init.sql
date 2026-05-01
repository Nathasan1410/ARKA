-- Optional helper: run this in your Supabase SQL Editor if you choose to host the
-- MVP dashboard demo-run history in Supabase Postgres.
--
-- This file only creates the `dashboard_demo_runs` table used by the ARKA demo loop.
-- It does not change ARKA truthfulness status by itself. Treat Supabase as PLANNED
-- until the app is wired + verified end-to-end.

CREATE TABLE IF NOT EXISTS "dashboard_demo_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" text NOT NULL,
	"scenario_key" text NOT NULL,
	"run_payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dashboard_demo_runs_case_id_unique" UNIQUE("case_id")
);

CREATE INDEX IF NOT EXISTS "dashboard_demo_runs_scenario_idx" ON "dashboard_demo_runs" ("scenario_key");

-- NOTE (security): Do NOT disable RLS by default. If you plan to write/read this table
-- from the app, decide on an auth model and then create appropriate policies.
