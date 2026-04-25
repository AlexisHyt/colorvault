CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`idToken` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `colors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rowPaletteId` integer,
	`position` integer NOT NULL,
	`name` text NOT NULL,
	`hex` text NOT NULL,
	`createdAt` text DEFAULT 'now' NOT NULL,
	FOREIGN KEY (`rowPaletteId`) REFERENCES `row_palettes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `color_palettes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`createdAt` text DEFAULT 'now' NOT NULL,
	`updatedAt` text DEFAULT 'now' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gradients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`colorStart` text NOT NULL,
	`colorEnd` text NOT NULL,
	`angle` integer NOT NULL,
	`gradientString` text NOT NULL,
	`createdAt` text DEFAULT 'now' NOT NULL,
	`updatedAt` text DEFAULT 'now' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `row_palettes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`paletteId` integer,
	`position` integer DEFAULT 0,
	`createdAt` text DEFAULT 'now' NOT NULL,
	FOREIGN KEY (`paletteId`) REFERENCES `color_palettes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer NOT NULL,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`banned` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `user_favorites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`colorId` integer,
	`gradientId` integer,
	`websiteColorId` integer,
	`createdAt` text DEFAULT 'now' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`colorId`) REFERENCES `colors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gradientId`) REFERENCES `gradients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`websiteColorId`) REFERENCES `website_colors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_favorites_userId_colorId_gradientId_websiteColorId_unique` ON `user_favorites` (`userId`,`colorId`,`gradientId`,`websiteColorId`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `website_colors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`websiteName` text NOT NULL,
	`logoUrl` text,
	`description` text,
	`primaryColor` text NOT NULL,
	`secondaryColor` text,
	`accentColor` text,
	`createdAt` text DEFAULT 'now' NOT NULL,
	`updatedAt` text DEFAULT 'now' NOT NULL
);
