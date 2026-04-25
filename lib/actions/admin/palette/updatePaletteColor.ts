"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { color as colorTable } from "@/db/schema";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function updatePaletteColor(
	id: number,
	name: string,
	color: string,
) {
	await redirectIfNotAdmin();

	await db
		.update(colorTable)
		.set({
			name: name,
			color: color,
		})
		.where(eq(colorTable.id, id));

	return await getPalettes();
}
