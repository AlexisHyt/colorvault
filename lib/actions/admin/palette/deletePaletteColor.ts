"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { color as colorTable } from "@/db/schema";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function deletePaletteColor(id: number) {
	await redirectIfNotAdmin();

	await db.delete(colorTable).where(eq(colorTable.id, id));

	return await getPalettes();
}
