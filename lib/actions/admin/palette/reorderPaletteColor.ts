"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { color as colorTable } from "@/db/schema";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function reorderPaletteColor(
	colorId: number,
	direction: "left" | "right",
) {
	await redirectIfNotAdmin();

	const currentColor = await db.query.color.findFirst({
		where: (c, { eq }) => eq(c.id, colorId),
	});

	if (!currentColor || currentColor.rowPaletteId == null) return null;

	const currentPosition = currentColor.position;
	const targetPosition =
		direction === "left" ? currentPosition - 1 : currentPosition + 1;

	const adjacentColor = await db.query.color.findFirst({
		where: (c, { and, eq }) =>
			and(
				eq(c.rowPaletteId, currentColor.rowPaletteId!),
				eq(c.position, targetPosition),
			),
	});

	if (!adjacentColor) return null;

	await db
		.update(colorTable)
		.set({ position: targetPosition })
		.where(eq(colorTable.id, colorId));

	await db
		.update(colorTable)
		.set({ position: currentPosition })
		.where(eq(colorTable.id, adjacentColor.id));

	return await getPalettes();
}
