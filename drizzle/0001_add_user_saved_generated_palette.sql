CREATE TABLE "user_palette_saved" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"primaryColor" text NOT NULL,
	"secondaryColor" text NOT NULL,
	"accentColor" text NOT NULL,
	"neutralColor" text NOT NULL,
	"createdAt" text DEFAULT 'now' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_palette_saved" ADD CONSTRAINT "user_palette_saved_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;