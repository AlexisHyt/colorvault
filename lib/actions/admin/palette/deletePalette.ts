"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { colorPalette } from "@/db/schema";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function deletePalette(paletteId: number) {
	await redirectIfNotAdmin();

	await db.delete(colorPalette).where(eq(colorPalette.id, paletteId));

	return true;
}
