import chroma from "chroma-js";

export type ColorRole = "primary" | "secondary" | "accent" | "other";

export const SHADES = [
	50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;
export type Shade = (typeof SHADES)[number];

export type PaletteScale = Record<Shade, string>;
export type WebPalette = Record<ColorRole, PaletteScale>;

/** Generates a shade scale (50→950) from a base hex color */
export function generateScale(hex: string): PaletteScale {
	const base = chroma(hex);

	// Interpolation : blanc → couleur → noir dans l'espace HSL
	const light = chroma.mix("white", base, 0.15, "hsl").hex();
	const dark = chroma.mix("black", base, 0.15, "hsl").hex();

	const lightScale = chroma.scale([light, hex]).mode("hsl").colors(6); // 50..500
	const darkScale = chroma.scale([hex, dark]).mode("hsl").colors(6); // 500..950

	const all = [...lightScale.slice(0, 5), hex, ...darkScale.slice(1)];

	return {
		50: all[0],
		100: all[1],
		200: all[2],
		300: all[3],
		400: all[4],
		500: all[5],
		600: all[6],
		700: all[7],
		800: all[8],
		900: all[9],
		950: all[10],
	} as PaletteScale;
}

/** Derives Secondary, Accent and Other from Primary via HSL rotation */
export function deriveHarmonies(
	primaryHex: string,
): Record<Exclude<ColorRole, "primary">, string> {
	const base = chroma(primaryHex);
	const [h, s, l] = base.hsl();

	const rotate = (deg: number) => chroma.hsl((h + deg) % 360, s, l).hex();

	return {
		secondary: rotate(150),
		accent: rotate(210),
		other: chroma.hsl(h, Math.max(0, s * 0.25), l).hex(), // désaturé/neutre
	};
}

// ── Color Harmonies ────────────────────────────────────────────────────────

export type HarmonyMode =
	| "complementary"
	| "triadic"
	| "analogous"
	| "split-complementary"
	| "tetradic"
	| "square";

export interface HarmonyColor {
	label: string;
	hex: string;
	angleDeg: number;
}

/**
 * Returns the list of harmony colors (including the base) for a given mode.
 * Angles are the HSL hue values used to position markers on the color wheel.
 */
export function computeHarmony(
	primaryHex: string,
	mode: HarmonyMode,
): HarmonyColor[] {
	const base = chroma(primaryHex);
	const [h, s, l] = base.hsl();
	const hue = Number.isNaN(h) ? 0 : h;

	const make = (label: string, deg: number): HarmonyColor => ({
		label,
		hex: chroma.hsl(deg % 360, s, l).hex(),
		angleDeg: deg % 360,
	});

	const base0: HarmonyColor = { label: "Base", hex: primaryHex, angleDeg: hue };

	switch (mode) {
		case "complementary":
			return [base0, make("Complement", hue + 180)];
		case "triadic":
			return [base0, make("Triad 2", hue + 120), make("Triad 3", hue + 240)];
		case "analogous":
			return [
				make("Analogous −", hue - 30),
				base0,
				make("Analogous +", hue + 30),
			];
		case "split-complementary":
			return [base0, make("Split 1", hue + 150), make("Split 2", hue + 210)];
		case "tetradic":
			return [
				base0,
				make("Tetrad 2", hue + 90),
				make("Tetrad 3", hue + 180),
				make("Tetrad 4", hue + 270),
			];
		case "square":
			return [
				base0,
				make("Square 2", hue + 90),
				make("Square 3", hue + 180),
				make("Square 4", hue + 270),
			];
	}
}

/** Generates the full palette from base colors */
export function generateWebPalette(
	colors: Record<ColorRole, string>,
): WebPalette {
	return {
		primary: generateScale(colors.primary),
		secondary: generateScale(colors.secondary),
		accent: generateScale(colors.accent),
		other: generateScale(colors.other),
	};
}

// ─── Export formats ───────────────────────────────────────────────────────────

export function exportAsCSSVariables(palette: WebPalette): string {
	const lines = [":root {"];
	for (const [role, scale] of Object.entries(palette) as [
		ColorRole,
		PaletteScale,
	][]) {
		lines.push(`  /* ${role} */`);
		for (const shade of SHADES) {
			lines.push(`  --color-${role}-${shade}: ${scale[shade]};`);
		}
		lines.push("");
	}
	lines.push("}");
	return lines.join("\n");
}

export function exportAsSCSSVariables(palette: WebPalette): string {
	const lines: string[] = [];
	for (const [role, scale] of Object.entries(palette) as [
		ColorRole,
		PaletteScale,
	][]) {
		lines.push(`// ${role}`);
		for (const shade of SHADES) {
			lines.push(`$color-${role}-${shade}: ${scale[shade]};`);
		}
		lines.push("");
	}
	return lines.join("\n");
}

export function exportAsTailwindConfig(palette: WebPalette): string {
	const colors: Record<string, Record<number, string>> = {};
	for (const [role, scale] of Object.entries(palette) as [
		ColorRole,
		PaletteScale,
	][]) {
		colors[role] = {};
		for (const shade of SHADES) {
			colors[role][shade] = scale[shade];
		}
	}
	const config = {
		theme: {
			extend: {
				colors,
			},
		},
	};
	return `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(config, null, 2)}`;
}

export function exportAsTailwindV4CSS(palette: WebPalette): string {
	const lines = ["@theme {"];
	for (const [role, scale] of Object.entries(palette) as [
		ColorRole,
		PaletteScale,
	][]) {
		lines.push(`  /* ${role} */`);
		for (const shade of SHADES) {
			lines.push(`  --color-${role}-${shade}: ${scale[shade]};`);
		}
		lines.push("");
	}
	lines.push("}");
	return lines.join("\n");
}

export function exportAsFigmaTokens(palette: WebPalette): string {
	const tokens: Record<string, unknown> = {};
	for (const [role, scale] of Object.entries(palette) as [
		ColorRole,
		PaletteScale,
	][]) {
		tokens[role] = {};
		for (const shade of SHADES) {
			(tokens[role] as Record<string, unknown>)[shade] = {
				$value: scale[shade],
				$type: "color",
			};
		}
	}
	return JSON.stringify(tokens, null, 2);
}
