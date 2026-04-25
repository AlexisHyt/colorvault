"use server";

import { db } from "@/db";
import { rowPalette } from "@/db/schema";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function addPaletteRow(paletteId: number, name: string) {
	await redirectIfNotAdmin();

	const highestRow = await db.query.rowPalette.findFirst({
		orderBy: (rowPalette, { desc }) => desc(rowPalette.position),
	});

	const newPosition = highestRow?.position ? highestRow?.position + 1 : 1;

	await db.insert(rowPalette).values({
		paletteId: paletteId,
    name: name,
		position: newPosition,
	});

	return await getPalettes();
}
