import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/sqlite-core";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
	id: t.text("id").primaryKey(),
	name: t.text("name").notNull(),
	email: t.text("email").notNull().unique(),
	emailVerified: t.integer("emailVerified").notNull(),
	image: t.text("image"),
	role: text("role", { enum: ["user", "admin"] })
		.notNull()
		.default("user"),
	banned: t.integer("banned").notNull().default(0),
	createdAt: t.integer("createdAt", { mode: "timestamp_ms" }).notNull(),
	updatedAt: t.integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
});

export const session = sqliteTable("session", {
	id: t.text("id").primaryKey(),
	userId: t
		.text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	token: t.text("token").notNull().unique(),
	expiresAt: t.integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
	ipAddress: t.text("ipAddress"),
	userAgent: t.text("userAgent"),
	createdAt: t.integer("createdAt", { mode: "timestamp_ms" }).notNull(),
	updatedAt: t.integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
});

export const account = sqliteTable("account", {
	id: t.text("id").primaryKey(),
	userId: t
		.text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accountId: t.text("accountId").notNull(),
	providerId: t.text("providerId").notNull(),
	accessToken: t.text("accessToken"),
	refreshToken: t.text("refreshToken"),
	accessTokenExpiresAt: t.integer("accessTokenExpiresAt", {
		mode: "timestamp_ms",
	}),
	refreshTokenExpiresAt: t.integer("refreshTokenExpiresAt", {
		mode: "timestamp_ms",
	}),
	scope: t.text("scope"),
	idToken: t.text("idToken"),
	password: t.text("password"),
	createdAt: t.integer("createdAt", { mode: "timestamp_ms" }).notNull(),
	updatedAt: t.integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: t.text("id").primaryKey(),
	identifier: t.text("identifier").notNull(),
	value: t.text("value").notNull(),
	expiresAt: t.integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
	createdAt: t.integer("createdAt", { mode: "timestamp_ms" }).notNull(),
	updatedAt: t.integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
});

export const colorPalette = sqliteTable("color_palettes", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	slug: text("slug"),
	name: text("name").notNull(),
	description: text("description"),
	category: text("category").notNull(),
	createdAt: text("createdAt").notNull().default("now"),
	updatedAt: text("updatedAt").notNull().default("now"),
});

export const rowPalette = sqliteTable("row_palettes", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	paletteId: integer("paletteId").references(() => colorPalette.id),
	name: text("name"),
	position: integer("position").default(0),
	createdAt: text("createdAt").notNull().default("now"),
});

export const color = sqliteTable("colors", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	rowPaletteId: integer("rowPaletteId").references(() => rowPalette.id),
	position: integer("position").notNull(),
	name: text("name").notNull(),
	color: text("color").notNull(),
	createdAt: text("createdAt").notNull().default("now"),
});

export const websiteColor = sqliteTable("website_colors", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	websiteName: text("websiteName").notNull(),
	logo: text("logo"),
	description: text("description"),
	primaryColor: text("primaryColor").notNull(),
	secondaryColor: text("secondaryColor"),
	accentColor: text("accentColor"),
	createdAt: text("createdAt").notNull().default("now"),
	updatedAt: text("updatedAt").notNull().default("now"),
});

export const gradient = sqliteTable("gradients", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	description: text("description"),
	category: text("category").notNull(),
	colorStart: text("colorStart").notNull(),
	colorMid: text("colorMid"),
	colorEnd: text("colorEnd").notNull(),
	angle: integer("angle").notNull(),
	gradientString: text("gradientString").notNull(),
	createdAt: text("createdAt").notNull().default("now"),
	updatedAt: text("updatedAt").notNull().default("now"),
});

export const userFavorite = sqliteTable(
	"user_favorites",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
		colorId: integer("colorId").references(() => color.id),
		gradientId: integer("gradientId").references(() => gradient.id),
		websiteColorId: integer("websiteColorId").references(() => websiteColor.id),
		createdAt: text("createdAt").notNull().default("now"),
	},
	(table) => {
		return {
			// Ensure only one favorite type is set per user
			unq: unique().on(
				table.userId,
				table.colorId,
				table.gradientId,
				table.websiteColorId,
			),
		};
	},
);

/*Relations*/
export const colorPaletteRelations = relations(colorPalette, ({ many }) => ({
	rows: many(rowPalette),
}));

export const rowPaletteRelations = relations(rowPalette, ({ one, many }) => ({
	palette: one(colorPalette, {
		fields: [rowPalette.paletteId],
		references: [colorPalette.id],
	}),
	colors: many(color),
}));

export const colorRelations = relations(color, ({ one }) => ({
	row: one(rowPalette, {
		fields: [color.rowPaletteId],
		references: [rowPalette.id],
	}),
}));
