CREATE TYPE "public"."staff_clarification_request_status" AS ENUM('REQUESTED', 'REMINDED', 'RESPONDED', 'TIMEOUT', 'ESCALATED');--> statement-breakpoint
CREATE TYPE "public"."triage_source" AS ENUM('DETERMINISTIC_FALLBACK', 'OPENCLAW_RUNTIME');--> statement-breakpoint
CREATE TABLE "staff_clarification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_event_id" uuid NOT NULL,
	"target_actor_id" uuid NOT NULL,
	"requested_by_actor_id" uuid,
	"approved_by_actor_id" uuid,
	"status" "staff_clarification_request_status" DEFAULT 'REQUESTED' NOT NULL,
	"request_message" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" timestamp with time zone,
	"responded_at" timestamp with time zone,
	"response_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "triage_source" "triage_source";--> statement-breakpoint
ALTER TABLE "staff_clarification_requests" ADD CONSTRAINT "staff_clarification_requests_audit_event_id_audit_events_id_fk" FOREIGN KEY ("audit_event_id") REFERENCES "public"."audit_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_clarification_requests" ADD CONSTRAINT "staff_clarification_requests_target_actor_id_actors_id_fk" FOREIGN KEY ("target_actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_clarification_requests" ADD CONSTRAINT "staff_clarification_requests_requested_by_actor_id_actors_id_fk" FOREIGN KEY ("requested_by_actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_clarification_requests" ADD CONSTRAINT "staff_clarification_requests_approved_by_actor_id_actors_id_fk" FOREIGN KEY ("approved_by_actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "staff_clarification_requests_audit_event_idx" ON "staff_clarification_requests" USING btree ("audit_event_id");--> statement-breakpoint
CREATE INDEX "staff_clarification_requests_status_idx" ON "staff_clarification_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "staff_clarification_requests_target_actor_idx" ON "staff_clarification_requests" USING btree ("target_actor_id");--> statement-breakpoint
CREATE INDEX "audit_events_triage_source_idx" ON "audit_events" USING btree ("triage_source");