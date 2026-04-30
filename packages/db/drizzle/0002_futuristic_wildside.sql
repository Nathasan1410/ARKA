CREATE TABLE "dashboard_demo_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" text NOT NULL,
	"scenario_key" "scenario_key" NOT NULL,
	"run_payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_demo_runs_case_id_unique" ON "dashboard_demo_runs" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "dashboard_demo_runs_scenario_idx" ON "dashboard_demo_runs" USING btree ("scenario_key");