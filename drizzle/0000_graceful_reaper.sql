CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE TABLE "bus_terminal_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bus_terminal_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" text DEFAULT '내 개발환경' NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "bus_terminal_snapshots_user_updated_idx" ON "bus_terminal_snapshots" USING btree ("user_id","updated_at");
--> statement-breakpoint
ALTER TABLE "bus_terminal_profiles" ADD CONSTRAINT "bus_terminal_profiles_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE "bus_terminal_snapshots" ADD CONSTRAINT "bus_terminal_snapshots_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE cascade;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.bus_terminal_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER bus_terminal_profiles_touch_updated_at
BEFORE UPDATE ON "bus_terminal_profiles"
FOR EACH ROW EXECUTE FUNCTION public.bus_terminal_touch_updated_at();
--> statement-breakpoint
CREATE TRIGGER bus_terminal_snapshots_touch_updated_at
BEFORE UPDATE ON "bus_terminal_snapshots"
FOR EACH ROW EXECUTE FUNCTION public.bus_terminal_touch_updated_at();
--> statement-breakpoint
ALTER TABLE "bus_terminal_profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "bus_terminal_snapshots" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "profiles are visible to owner"
ON "bus_terminal_profiles"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
--> statement-breakpoint
CREATE POLICY "profiles are inserted by owner"
ON "bus_terminal_profiles"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
CREATE POLICY "profiles are updated by owner"
ON "bus_terminal_profiles"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
CREATE POLICY "snapshots are visible to owner"
ON "bus_terminal_snapshots"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
--> statement-breakpoint
CREATE POLICY "snapshots are inserted by owner"
ON "bus_terminal_snapshots"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
CREATE POLICY "snapshots are updated by owner"
ON "bus_terminal_snapshots"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
CREATE POLICY "snapshots are deleted by owner"
ON "bus_terminal_snapshots"
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
