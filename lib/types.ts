import type {
	color,
	colorPalette,
	rowPalette,
	technologyColor,
	websiteColor,
} from "@/db/schema";

export type ColorPalette = typeof colorPalette.$inferSelect;
export type RowPalette = typeof rowPalette.$inferSelect;
export type Color = typeof color.$inferSelect;

export type WebsiteColor = typeof websiteColor.$inferSelect;
export type TechnologyColor = typeof technologyColor.$inferSelect;

export type ColorPaletteWithColors = ColorPalette & {
	rows: (RowPalette & { colors: Color[] })[];
};

export type PaletteRowWithColors = (RowPalette & { colors: Color[] })[];
