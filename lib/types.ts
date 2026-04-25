import type {
	color,
	colorPalette,
	rowPalette,
	websiteColor,
} from "@/db/schema";

export type ColorPalette = typeof colorPalette.$inferSelect;
export type RowPalette = typeof rowPalette.$inferSelect;
export type Color = typeof color.$inferSelect;

export type WebsiteColor = typeof websiteColor.$inferSelect;

export type ColorPaletteWithColors = ColorPalette & {
	rows: (RowPalette & { colors: Color[] })[];
};

export type PaletteRowWithColors = (RowPalette & { colors: Color[] })[];
