"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { colorPalette } from "@/db/schema";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function editPalette(paletteId: number, newName: string) {
	await redirectIfNotAdmin();

	await db
		.update(colorPalette)
		.set({ name: newName })
		.where(eq(colorPalette.id, paletteId))
		.returning();

	return await getPalettes();
}
