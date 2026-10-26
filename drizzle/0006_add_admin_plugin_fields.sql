ALTER TABLE "user" ADD COLUMN "banReason" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banExpires" timestamp;
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonatedBy" text;
