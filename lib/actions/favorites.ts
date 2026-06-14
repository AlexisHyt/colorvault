"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
	color,
	gradient,
	technologyColor,
	userFavorite,
	websiteColor,
} from "@/db/schema";
import { getVerifiedSession } from "@/lib/auth-utils";

export type FavoriteColor = {
	favoriteId: number;
	type: "color";
	id: number;
	name: string;
	color: string; // oklcha value
};

export type FavoriteGradient = {
	favoriteId: number;
	type: "gradient";
	id: number;
	name: string;
	gradientString: string;
	colorStart: string;
	colorMid: string | null;
	colorEnd: string;
};

export type FavoriteWebsite = {
	favoriteId: number;
	type: "website";
	id: number;
	websiteName: string;
	logo: string | null;
	description: string | null;
	primaryColor: string;
	secondaryColor: string | null;
	accentColor: string | null;
};

export type FavoriteTechnology = {
	favoriteId: number;
	type: "technology";
	id: number;
	name: string;
	slug: string;
	category: string;
	color: string;
};

export type FavoriteItem =
	| FavoriteColor
	| FavoriteGradient
	| FavoriteWebsite
	| FavoriteTechnology;

export type RawFavorite = typeof userFavorite.$inferSelect;

export async function getFavorites(userId: string): Promise<RawFavorite[]> {
	return db
		.select()
		.from(userFavorite)
		.where(eq(userFavorite.userId, userId))
		.orderBy(userFavorite.createdAt);
}

export async function getFavoritesWithDetails(
	userId: string,
): Promise<FavoriteItem[]> {
	const rows = await db
		.select()
		.from(userFavorite)
		.leftJoin(color, eq(userFavorite.colorId, color.id))
		.leftJoin(gradient, eq(userFavorite.gradientId, gradient.id))
		.leftJoin(websiteColor, eq(userFavorite.websiteColorId, websiteColor.id))
		.leftJoin(
			technologyColor,
			eq(userFavorite.technologyColorId, technologyColor.id),
		)
		.where(eq(userFavorite.userId, userId))
		.orderBy(userFavorite.createdAt);

	const items: FavoriteItem[] = [];

	for (const row of rows) {
		const fav = row.user_favorites;
		if (fav.colorId && row.colors) {
			items.push({
				favoriteId: fav.id,
				type: "color",
				id: row.colors.id,
				name: row.colors.name,
				color: row.colors.color,
			});
		} else if (fav.gradientId && row.gradients) {
			items.push({
				favoriteId: fav.id,
				type: "gradient",
				id: row.gradients.id,
				name: row.gradients.name,
				gradientString: row.gradients.gradientString,
				colorStart: row.gradients.colorStart,
				colorMid: row.gradients.colorMid,
				colorEnd: row.gradients.colorEnd,
			});
		} else if (fav.websiteColorId && row.website_colors) {
			items.push({
				favoriteId: fav.id,
				type: "website",
				id: row.website_colors.id,
				websiteName: row.website_colors.websiteName,
				logo: row.website_colors.logo,
				description: row.website_colors.description,
				primaryColor: row.website_colors.primaryColor,
				secondaryColor: row.website_colors.secondaryColor,
				accentColor: row.website_colors.accentColor,
			});
		} else if (fav.technologyColorId && row.technology_colors) {
			items.push({
				favoriteId: fav.id,
				type: "technology",
				id: row.technology_colors.id,
				name: row.technology_colors.name,
				slug: row.technology_colors.slug,
				category: row.technology_colors.category,
				color: row.technology_colors.color,
			});
		}
	}

	return items;
}

async function getAuthenticatedUserId(): Promise<string> {
	const session = await getVerifiedSession();
	if (!session?.user?.id) throw new Error("Unauthorized");
	return session.user.id;
}

export async function addFavorite({
	colorId,
	gradientId,
	websiteColorId,
	technologyColorId,
}: {
	colorId?: number;
	gradientId?: number;
	websiteColorId?: number;
	technologyColorId?: number;
}): Promise<RawFavorite> {
	const userId = await getAuthenticatedUserId();

	const result = await db
		.insert(userFavorite)
		.values({
			userId,
			colorId: colorId ?? null,
			gradientId: gradientId ?? null,
			websiteColorId: websiteColorId ?? null,
			technologyColorId: technologyColorId ?? null,
		})
		.returning();

	return result[0];
}

export async function removeFavorite(favoriteId: number): Promise<void> {
	const userId = await getAuthenticatedUserId();

	const [existing] = await db
		.select()
		.from(userFavorite)
		.where(
			and(eq(userFavorite.id, favoriteId), eq(userFavorite.userId, userId)),
		);

	if (!existing) throw new Error("Favorite not found");

	await db
		.delete(userFavorite)
		.where(
			and(eq(userFavorite.id, favoriteId), eq(userFavorite.userId, userId)),
		);
}
