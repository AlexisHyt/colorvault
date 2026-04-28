"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { userPaletteSaved } from "@/db/schema";
import { getVerifiedSession } from "@/lib/auth-utils";
import { hexToOklchaStr } from "@/lib/utils";

export type SavedPalette = typeof userPaletteSaved.$inferSelect;

export async function getSavedPalettes(
	userId: string,
): Promise<SavedPalette[]> {
	return db
		.select()
		.from(userPaletteSaved)
		.where(eq(userPaletteSaved.userId, userId))
		.orderBy(userPaletteSaved.createdAt);
}

export async function savePalette(data: {
	name: string;
	primary: string;
	secondary: string;
	accent: string;
	neutral: string;
}): Promise<{ palette: SavedPalette } | { error: string }> {
	const session = await getVerifiedSession();
	if (!session?.user) return { error: "Not authenticated" };

	try {
		const [inserted] = await db
			.insert(userPaletteSaved)
			.values({
				userId: session.user.id,
				name: data.name.trim(),
				primaryColor: hexToOklchaStr(data.primary),
				secondaryColor: hexToOklchaStr(data.secondary),
				accentColor: hexToOklchaStr(data.accent),
				neutralColor: hexToOklchaStr(data.neutral),
				createdAt: new Date().toISOString(),
			})
			.returning();
		return { palette: inserted };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		if (message.includes("unique") || message.includes("duplicate")) {
			return { error: "A palette with this name already exists." };
		}
		return { error: "Failed to save palette." };
	}
}

export async function deleteSavedPalette(
	name: string,
): Promise<{ success: true } | { error: string }> {
	const session = await getVerifiedSession();
	if (!session?.user) return { error: "Not authenticated" };

	await db
		.delete(userPaletteSaved)
		.where(
			and(
				eq(userPaletteSaved.userId, session.user.id),
				eq(userPaletteSaved.name, name),
			),
		);
	return { success: true };
}
