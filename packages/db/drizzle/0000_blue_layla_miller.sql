CREATE TYPE "public"."action_type" AS ENUM('AUDIT_EVENT_CREATED', 'TRIAGE_RECORDED', 'EXPLANATION_REQUESTED', 'OWNER_REVIEWED', 'PROOF_STATUS_UPDATED');--> statement-breakpoint
CREATE TYPE "public"."actor_role" AS ENUM('OWNER', 'CASHIER', 'STAFF', 'HANDLER', 'MANAGER', 'OPENCLAW_AGENT', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."audit_event_status" AS ENUM('CLEAR', 'REVIEW_NEEDED', 'UNMATCHED_MOVEMENT', 'OVER_EXPECTED_USAGE', 'UNDER_EXPECTED_USAGE', 'MISSING_MOVEMENT', 'APPROVED_EXCEPTION');--> statement-breakpoint
CREATE TYPE "public"."audit_proof_status" AS ENUM('LOCAL_ONLY', 'STORED_ON_0G', 'REGISTERED_ON_CHAIN', 'VERIFIED');--> statement-breakpoint
CREATE TYPE "public"."case_note_type" AS ENUM('OPENCLAW_NOTE', 'STAFF_EXPLANATION', 'OWNER_NOTE', 'SYSTEM_NOTE');--> statement-breakpoint
CREATE TYPE "public"."case_type" AS ENUM('ORDER_LINKED_AUDIT', 'MOVEMENT_ONLY_AUDIT');--> statement-breakpoint
CREATE TYPE "public"."chain_status" AS ENUM('NOT_REGISTERED', 'PENDING_REGISTRATION', 'REGISTERED', 'FAILED_TO_REGISTER', 'ANCHOR_CONFIRMED');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_mode" AS ENUM('DIRECT_OUT', 'SERVICE_WINDOW');--> statement-breakpoint
CREATE TYPE "public"."inventory_unit" AS ENUM('g', 'ml', 'pcs');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('OUT', 'RETURN', 'WASTE', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('CREATED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."proof_type" AS ENUM('AUDIT_EVENT_CREATED', 'FINAL_RESOLUTION', 'CORRECTION_APPENDED', 'STAFF_RESPONSE_SUBMITTED');--> statement-breakpoint
CREATE TYPE "public"."scenario_key" AS ENUM('STATE_A', 'STATE_C', 'STATE_D');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('NORMAL', 'MINOR_VARIANCE', 'MODERATE_VARIANCE', 'SIGNIFICANT_VARIANCE', 'CRITICAL_REVIEW');--> statement-breakpoint
CREATE TYPE "public"."storage_status" AS ENUM('NOT_STARTED', 'PENDING_UPLOAD', 'STORED', 'FAILED_TO_STORE', 'RETRY_PENDING');--> statement-breakpoint
CREATE TYPE "public"."tracking_mode" AS ENUM('CONSUMABLE', 'COUNTABLE');--> statement-breakpoint
CREATE TYPE "public"."triage_outcome" AS ENUM('AUTO_CLEAR', 'SILENT_LOG', 'REQUEST_EXPLANATION', 'ESCALATE');--> statement-breakpoint
CREATE TYPE "public"."value_category" AS ENUM('LOW_VALUE', 'HIGH_VALUE');--> statement-breakpoint
CREATE TABLE "action_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_event_id" uuid NOT NULL,
	"actor_id" uuid,
	"action_type" "action_type" NOT NULL,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" "actor_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_event_key" text NOT NULL,
	"case_id" text NOT NULL,
	"scenario_key" "scenario_key" NOT NULL,
	"case_type" "case_type" NOT NULL,
	"order_id" uuid,
	"inventory_movement_id" uuid,
	"product_id" uuid NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"usage_rule_id" uuid,
	"handler_actor_id" uuid NOT NULL,
	"cashier_actor_id" uuid NOT NULL,
	"owner_actor_id" uuid NOT NULL,
	"container_id" text,
	"order_quantity" integer NOT NULL,
	"usage_rule_quantity_per_unit" integer NOT NULL,
	"expected_usage_quantity" integer NOT NULL,
	"actual_movement_quantity" integer NOT NULL,
	"net_movement_quantity" integer NOT NULL,
	"variance_percent" numeric(7, 2) NOT NULL,
	"status" "audit_event_status" NOT NULL,
	"severity" "severity" NOT NULL,
	"triage_outcome" "triage_outcome",
	"proof_type" "proof_type" DEFAULT 'AUDIT_EVENT_CREATED' NOT NULL,
	"audit_proof_status" "audit_proof_status" DEFAULT 'LOCAL_ONLY' NOT NULL,
	"storage_status" "storage_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"chain_status" "chain_status" DEFAULT 'NOT_REGISTERED' NOT NULL,
	"evidence_window_start_at" timestamp with time zone,
	"evidence_window_end_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_event_id" uuid NOT NULL,
	"author_actor_id" uuid NOT NULL,
	"note_type" "case_note_type" NOT NULL,
	"note_body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"unit" "inventory_unit" NOT NULL,
	"tracking_mode" "tracking_mode" NOT NULL,
	"value_category" "value_category" DEFAULT 'LOW_VALUE' NOT NULL,
	"current_stock_quantity" integer,
	"container_id" text,
	"sensor_id" text,
	"unit_weight_grams" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"inventory_item_id" uuid NOT NULL,
	"handler_actor_id" uuid NOT NULL,
	"movement_type" "movement_type" NOT NULL,
	"quantity_before" integer,
	"quantity_after" integer,
	"movement_quantity" integer NOT NULL,
	"container_id" text,
	"sensor_id" text,
	"evidence_window_start_at" timestamp with time zone,
	"evidence_window_end_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_order_id" text,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"cashier_actor_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'CREATED' NOT NULL,
	"fulfillment_mode" "fulfillment_mode" DEFAULT 'DIRECT_OUT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "owner_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_key" text DEFAULT 'default-owner-policy' NOT NULL,
	"owner_actor_id" uuid,
	"require_owner_approval_before_staff_message" boolean DEFAULT true NOT NULL,
	"auto_clear_enabled" boolean DEFAULT true NOT NULL,
	"moderate_variance_triage_outcome" "triage_outcome" DEFAULT 'REQUEST_EXPLANATION' NOT NULL,
	"critical_variance_triage_outcome" "triage_outcome" DEFAULT 'ESCALATE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proof_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_event_id" uuid NOT NULL,
	"actor_id" uuid,
	"previous_proof_record_id" uuid,
	"proof_type" "proof_type" NOT NULL,
	"audit_proof_status" "audit_proof_status" DEFAULT 'LOCAL_ONLY' NOT NULL,
	"storage_status" "storage_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"chain_status" "chain_status" DEFAULT 'NOT_REGISTERED' NOT NULL,
	"proof_hash" text,
	"storage_uri" text,
	"chain_transaction_hash" text,
	"anchored_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"last_error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"expected_usage_quantity" integer NOT NULL,
	"usage_unit" "inventory_unit" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_audit_event_id_audit_events_id_fk" FOREIGN KEY ("audit_event_id") REFERENCES "public"."audit_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_inventory_movement_id_inventory_movements_id_fk" FOREIGN KEY ("inventory_movement_id") REFERENCES "public"."inventory_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_usage_rule_id_usage_rules_id_fk" FOREIGN KEY ("usage_rule_id") REFERENCES "public"."usage_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_handler_actor_id_actors_id_fk" FOREIGN KEY ("handler_actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_cashier_actor_id_actors_id_fk" FOREIGN KEY ("cashier_actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_owner_actor_id_actors_id_fk" FOREIGN KEY ("owner_actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_audit_event_id_audit_events_id_fk" FOREIGN KEY ("audit_event_id") REFERENCES "public"."audit_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_author_actor_id_actors_id_fk" FOREIGN KEY ("author_actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_handler_actor_id_actors_id_fk" FOREIGN KEY ("handler_actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cashier_actor_id_actors_id_fk" FOREIGN KEY ("cashier_actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_policies" ADD CONSTRAINT "owner_policies_owner_actor_id_actors_id_fk" FOREIGN KEY ("owner_actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_records" ADD CONSTRAINT "proof_records_audit_event_id_audit_events_id_fk" FOREIGN KEY ("audit_event_id") REFERENCES "public"."audit_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_records" ADD CONSTRAINT "proof_records_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_records" ADD CONSTRAINT "proof_records_previous_proof_record_id_proof_records_id_fk" FOREIGN KEY ("previous_proof_record_id") REFERENCES "public"."proof_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_rules" ADD CONSTRAINT "usage_rules_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_rules" ADD CONSTRAINT "usage_rules_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "action_logs_audit_event_idx" ON "action_logs" USING btree ("audit_event_id");--> statement-breakpoint
CREATE INDEX "actors_role_idx" ON "actors" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "audit_events_audit_event_key_unique" ON "audit_events" USING btree ("audit_event_key");--> statement-breakpoint
CREATE UNIQUE INDEX "audit_events_case_id_unique" ON "audit_events" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "audit_events_status_idx" ON "audit_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_events_scenario_idx" ON "audit_events" USING btree ("scenario_key");--> statement-breakpoint
CREATE INDEX "case_notes_audit_event_idx" ON "case_notes" USING btree ("audit_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_items_name_unique" ON "inventory_items" USING btree ("name");--> statement-breakpoint
CREATE INDEX "inventory_items_container_idx" ON "inventory_items" USING btree ("container_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_item_idx" ON "inventory_movements" USING btree ("inventory_item_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_order_idx" ON "inventory_movements" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_external_order_id_unique" ON "orders" USING btree ("external_order_id");--> statement-breakpoint
CREATE INDEX "orders_product_idx" ON "orders" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "owner_policies_policy_key_unique" ON "owner_policies" USING btree ("policy_key");--> statement-breakpoint
CREATE UNIQUE INDEX "products_name_unique" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "proof_records_audit_event_idx" ON "proof_records" USING btree ("audit_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_rules_product_item_unique" ON "usage_rules" USING btree ("product_id","inventory_item_id");