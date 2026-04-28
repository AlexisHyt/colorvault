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
