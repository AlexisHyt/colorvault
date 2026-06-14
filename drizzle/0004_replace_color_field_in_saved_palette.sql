ALTER TABLE "user_palette_saved" ADD COLUMN "colors" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_palette_saved" DROP COLUMN "primaryColor";--> statement-breakpoint
ALTER TABLE "user_palette_saved" DROP COLUMN "secondaryColor";--> statement-breakpoint
ALTER TABLE "user_palette_saved" DROP COLUMN "accentColor";--> statement-breakpoint
ALTER TABLE "user_palette_saved" DROP COLUMN "neutralColor";