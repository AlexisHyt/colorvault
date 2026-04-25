"use server";

import { db } from "@/db";
import { color as colorTable } from "@/db/schema";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function addPaletteColor(
	rowPaletteId: number,
	name: string,
	color: string,
) {
	await redirectIfNotAdmin();

	const highestColor = await db.query.color.findFirst({
		where: (color, { eq }) => eq(color.rowPaletteId, rowPaletteId),
		orderBy: (color, { desc }) => desc(color.position),
	});

	const newPosition = highestColor?.position ? highestColor?.position + 1 : 1;

	await db.insert(colorTable).values({
		rowPaletteId: rowPaletteId,
		name: name,
		color: color,
		position: newPosition,
	});

	return await getPalettes();
}
