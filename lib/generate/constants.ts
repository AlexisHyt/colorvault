import type { ColorRole } from "@/lib/generate-palette";

export const ROLE_LABELS: Record<ColorRole, string> = {
	primary: "Primary",
	secondary: "Secondary",
	accent: "Accent",
	other: "Other / Neutral",
};
export const ROLE_DESCRIPTIONS: Record<ColorRole, string> = {
	primary: "Main brand color",
	secondary: "Complementary color (±150°)",
	accent: "Accent / highlight color (±210°)",
	other: "Neutral / desaturated gray",
};
export const DEFAULT_PRIMARY = "#6366f1";
