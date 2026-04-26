"use server";

import { db } from "@/db";
import type { ColorPaletteWithColors, PaletteRowWithColors } from "@/lib/types";

export async function getPalettes(): Promise<ColorPaletteWithColors[]> {
	return db.query.colorPalette.findMany({
		with: {
			rows: {
				orderBy: (row, { asc }) => asc(row.position),
				with: {
					colors: {
						orderBy: (color, { asc }) => asc(color.position),
					},
				},
			},
		},
	}) as unknown as ColorPaletteWithColors[];
}

export async function getColorsByPaletteId(paletteId: number) {
	return db.query.rowPalette.findMany({
		where: (row, { eq }) => eq(row.paletteId, paletteId),
		orderBy: (row, { asc }) => asc(row.position),
		with: {
			colors: {
				orderBy: (color, { asc }) => asc(color.position),
			},
		},
	}) as unknown as PaletteRowWithColors[];
}
