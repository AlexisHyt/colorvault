CREATE TABLE "technology_colors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"color" text NOT NULL,
	"createdAt" text DEFAULT 'now' NOT NULL,
	"updatedAt" text DEFAULT 'now' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_favorites" ADD COLUMN "technologyColorId" integer;
--> statement-breakpoint
ALTER TABLE "user_favorites" DROP CONSTRAINT "user_favorites_userId_colorId_gradientId_websiteColorId_unique";
--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_userId_colorId_gradientId_websiteColorId_technologyColorId_unique" UNIQUE("userId","colorId","gradientId","websiteColorId","technologyColorId");
--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_technologyColorId_technology_colors_id_fk" FOREIGN KEY ("technologyColorId") REFERENCES "public"."technology_colors"("id") ON DELETE no action ON UPDATE no action;

