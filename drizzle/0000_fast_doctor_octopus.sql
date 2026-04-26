CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "colors" (
	"id" serial PRIMARY KEY NOT NULL,
	"rowPaletteId" integer,
	"position" integer NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"createdAt" text DEFAULT 'now' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "color_palettes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"createdAt" text DEFAULT 'now' NOT NULL,
	"updatedAt" text DEFAULT 'now' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gradients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"colorStart" text NOT NULL,
	"colorMid" text,
	"colorEnd" text NOT NULL,
	"angle" integer NOT NULL,
	"gradientString" text NOT NULL,
	"createdAt" text DEFAULT 'now' NOT NULL,
	"updatedAt" text DEFAULT 'now' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "row_palettes" (
	"id" serial PRIMARY KEY NOT NULL,
	"paletteId" integer,
	"name" text,
	"position" integer DEFAULT 0,
	"createdAt" text DEFAULT 'now' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"colorId" integer,
	"gradientId" integer,
	"websiteColorId" integer,
	"createdAt" text DEFAULT 'now' NOT NULL,
	CONSTRAINT "user_favorites_userId_colorId_gradientId_websiteColorId_unique" UNIQUE("userId","colorId","gradientId","websiteColorId")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_colors" (
	"id" serial PRIMARY KEY NOT NULL,
	"websiteName" text NOT NULL,
	"logo" text,
	"description" text,
	"primaryColor" text NOT NULL,
	"secondaryColor" text,
	"accentColor" text,
	"createdAt" text DEFAULT 'now' NOT NULL,
	"updatedAt" text DEFAULT 'now' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colors" ADD CONSTRAINT "colors_rowPaletteId_row_palettes_id_fk" FOREIGN KEY ("rowPaletteId") REFERENCES "public"."row_palettes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "row_palettes" ADD CONSTRAINT "row_palettes_paletteId_color_palettes_id_fk" FOREIGN KEY ("paletteId") REFERENCES "public"."color_palettes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_colorId_colors_id_fk" FOREIGN KEY ("colorId") REFERENCES "public"."colors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_gradientId_gradients_id_fk" FOREIGN KEY ("gradientId") REFERENCES "public"."gradients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_websiteColorId_website_colors_id_fk" FOREIGN KEY ("websiteColorId") REFERENCES "public"."website_colors"("id") ON DELETE no action ON UPDATE no action;