import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	role: text("role", { enum: ["user", "admin"] })
		.notNull()
		.default("user"),
	banned: boolean("banned").notNull().default(false),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expiresAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	idToken: text("idToken"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const colorPalette = pgTable("color_palettes", {
	id: serial("id").primaryKey(),
	slug: text("slug"),
	name: text("name").notNull(),
	description: text("description"),
	category: text("category").notNull(),
	createdAt: text("createdAt").notNull().default("now"),
	updatedAt: text("updatedAt").notNull().default("now"),
});

export const rowPalette = pgTable("row_palettes", {
	id: serial("id").primaryKey(),
	paletteId: integer("paletteId").references(() => colorPalette.id),
	name: text("name"),
	position: integer("position").default(0),
	createdAt: text("createdAt").notNull().default("now"),
});

export const color = pgTable("colors", {
	id: serial("id").primaryKey(),
	rowPaletteId: integer("rowPaletteId").references(() => rowPalette.id),
	position: integer("position").notNull(),
	name: text("name").notNull(),
	color: text("color").notNull(),
	createdAt: text("createdAt").notNull().default("now"),
});

export const websiteColor = pgTable("website_colors", {
	id: serial("id").primaryKey(),
	websiteName: text("websiteName").notNull(),
	logo: text("logo"),
	description: text("description"),
	primaryColor: text("primaryColor").notNull(),
	secondaryColor: text("secondaryColor"),
	accentColor: text("accentColor"),
	createdAt: text("createdAt").notNull().default("now"),
	updatedAt: text("updatedAt").notNull().default("now"),
});

export const gradient = pgTable("gradients", {
	id: serial("id").primaryKey(),
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

export const userFavorite = pgTable(
	"user_favorites",
	{
		id: serial("id").primaryKey(),
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
			unq: unique().on(
				table.userId,
				table.colorId,
				table.gradientId,
				table.websiteColorId,
			),
		};
	},
);

export const userPaletteSaved = pgTable("user_palette_saved", {
	id: serial("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	name: text("name").notNull().unique(),
	primaryColor: text("primaryColor").notNull(),
	secondaryColor: text("secondaryColor").notNull(),
	accentColor: text("accentColor").notNull(),
	neutralColor: text("neutralColor").notNull(),
	createdAt: text("createdAt").notNull().default("now"),
});

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
