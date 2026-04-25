"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rowPalette } from "@/db/schema";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function reorderPaletteRow(
	rowId: number,
	direction: "up" | "down",
) {
	await redirectIfNotAdmin();

	const currentRow = await db.query.rowPalette.findFirst({
		where: (r, { eq }) => eq(r.id, rowId),
	});

	if (!currentRow || currentRow.paletteId == null) return null;

	const currentPosition = currentRow.position ?? 0;
	const targetPosition =
		direction === "up" ? currentPosition - 1 : currentPosition + 1;

	const adjacentRow = await db.query.rowPalette.findFirst({
		where: (r, { and, eq }) =>
			and(
				eq(r.paletteId, currentRow.paletteId!),
				eq(r.position, targetPosition),
			),
	});

	if (!adjacentRow) return null;

	await db
		.update(rowPalette)
		.set({ position: targetPosition })
		.where(eq(rowPalette.id, rowId));

	await db
		.update(rowPalette)
		.set({ position: currentPosition })
		.where(eq(rowPalette.id, adjacentRow.id));

	return await getPalettes();
}


