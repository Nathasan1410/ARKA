-- Run this in your Supabase SQL Editor to create the necessary table for the MVP dashboard.
-- Because the direct IPv4 Postgres connection failed, we are using the Supabase HTTPS REST API.

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

-- Important: Since we are connecting using the ANON key for the backend in this hackathon MVP,
-- we must temporarily disable Row Level Security (RLS) on this table so the backend can insert data freely.
-- In a real production environment, you would use a Service Role Key or configure RLS policies.
ALTER TABLE "dashboard_demo_runs" DISABLE ROW LEVEL SECURITY;
